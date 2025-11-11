/**
 * AttendanceManagement.jsx - Quản lý điểm danh
 * 
 * Chức năng:
 * - Điểm danh cho sinh viên
 * - Xác nhận điểm danh bởi CBL
 * - Quản lý ảnh minh chứng
 * - Thống kê tình hình điểm danh
 */

import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { generateId, formatDateTime } from '../utils/config';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { apiFetch } from '../services/api';
import InputDialog from './InputDialog';

export default function AttendanceManagement({ user }) {
  // Danh sách điểm danh từ dataSdk
  const [attendances, setAttendances] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  // Điều khiển form điểm danh
  const [showCheckIn, setShowCheckIn] = useState(false);
  // Trạng thái loading khi thao tác
  const [loading, setLoading] = useState(false);
  // Dữ liệu form điểm danh
  const [checkInData, setCheckInData] = useState({
    sessionCode: '',
    studentName: '',
    studentId: '',
    photo: null
  });
  const [inputDialog, setInputDialog] = useState({ isOpen: false, title: '', label: '', defaultValue: '', onConfirm: null });

  const { state } = useApp();
  const { data, config } = state;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await apiFetch('/api/attendances');
        if (!mounted) return;
        if (!rows || !Array.isArray(rows) || rows.length === 0) {
          setAttendances([]);
          return;
        }

        const mapped = rows.map(a => ({
          id: a.id,
          type: 'attendance',
          title: a.studentName || a.title || '',
          description: a.description || '',
          category: a.category || 'check-in',
          status: a.status || 'pending',
          createdBy: a.createdBy || null,
          createdAt: a.createdAt || new Date().toISOString(),
          updatedAt: a.updatedAt || new Date().toISOString(),
          data: JSON.stringify({
            sessionCode: a.sessionCode || (a.data && a.data.sessionCode) || '',
            studentId: a.studentId || (a.data && a.data.studentId) || '',
            checkInTime: a.checkInTime || (a.data && a.data.checkInTime) || new Date().toISOString()
          })
        }));

        setAttendances(mapped);
      } catch (err) {
        // If API not present, we'll show an empty list and keep existing dataSdk flows for writes
        console.warn('Could not load attendances from API:', err);
        toast('Không thể tải dữ liệu điểm danh từ server — hiển thị tạm thời trống', { icon: '⚠️' });
        setAttendances([]);
      }
    })();

    return () => { mounted = false; };
  }, []);

  /**
   * Xử lý điểm danh sinh viên
   * @param {Event} e - Form submit event
   * - Lưu thông tin điểm danh
   * - Xử lý ảnh minh chứng
   * - Tự động gán trạng thái chờ duyệt
   */
  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (data.length >= 999) {
      toast.error('Đã đạt giới hạn tối đa 999 bản ghi. Vui lòng xóa một số dữ liệu trước!');
      setLoading(false);
      return;
    }

    const attendanceData = {
      id: generateId(),
      type: 'attendance',
      title: checkInData.studentName,
      description: `Điểm danh phiên ${checkInData.sessionCode}`,
      category: 'check-in',
      status: 'pending',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: JSON.stringify({
        sessionCode: checkInData.sessionCode,
        studentId: checkInData.studentId,
        checkInTime: new Date().toISOString(),
        location: 'Tự động xác định',
        hasPhoto: !!checkInData.photo
      })
    };

    const result = await window.dataSdk.create(attendanceData);
    if (result.isOk) {
      setShowCheckIn(false);
      setCheckInData({
        sessionCode: '',
        studentName: '',
        studentId: '',
        photo: null
      });
      toast.success('Điểm danh thành công! Chờ CBL xác nhận.');
    } else {
      toast.error('Có lỗi xảy ra khi điểm danh!');
    }
    
    setLoading(false);
  };

  /**
   * Duyệt điểm danh
   * @param {Object} attendance - Điểm danh cần duyệt
   * - Chuyển trạng thái thành đã duyệt
   * - Lưu thông tin người duyệt
   * - Cập nhật qua dataSdk
   */
  const handleApproveAttendance = async (attendance) => {
    setLoading(true);
    const updatedAttendance = {
      ...attendance,
      status: 'approved',
      updatedAt: new Date().toISOString(),
      data: JSON.stringify({
        ...JSON.parse(attendance.data || '{}'),
        approvedBy: user.id,
        approvedAt: new Date().toISOString()
      })
    };
    
    const result = await window.dataSdk.update(updatedAttendance);
    if (!result.isOk) {
      toast.error('Có lỗi xảy ra khi duyệt điểm danh!');
    }
    setLoading(false);
  };

  /**
   * Từ chối điểm danh
   * @param {Object} attendance - Điểm danh cần từ chối
   * - Yêu cầu nhập lý do từ chối
   * - Lưu thông tin người từ chối
   * - Cập nhật trạng thái qua dataSdk
   */
  const handleRejectAttendance = async (attendance) => {
    // open input dialog instead of prompt
    setInputDialog({
      isOpen: true,
      title: 'Từ chối điểm danh',
      label: 'Nhập lý do từ chối:',
      defaultValue: '',
      onConfirm: async (reason) => {
        if (!reason) return;
        setLoading(true);
        const updatedAttendance = {
          ...attendance,
          status: 'rejected',
          updatedAt: new Date().toISOString(),
          data: JSON.stringify({
            ...JSON.parse(attendance.data || '{}'),
            rejectedBy: user.id,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason
          })
        };
        
        const result = await window.dataSdk.update(updatedAttendance);
        if (!result.isOk) {
          toast.error('Có lỗi xảy ra khi từ chối điểm danh!');
        }
        setLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <InputDialog
        isOpen={inputDialog.isOpen}
        title={inputDialog.title}
        label={inputDialog.label}
        defaultValue={inputDialog.defaultValue}
        onConfirm={inputDialog.onConfirm}
        onCancel={() => setInputDialog({ ...inputDialog, isOpen: false, onConfirm: null })}
        confirmText="Gửi"
        cancelText="Hủy"
        multiline={true}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>
          Quản lý điểm danh
        </h1>
        {user.role === 'student' && (
          <button
            onClick={() => setShowCheckIn(true)}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.accent_color }}
          >
            Điểm danh
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Danh sách điểm danh</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sinh viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phiên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    {(user.role === 'cbl' || user.role === 'btc' || user.role === 'admin') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(attendance => {
                    const data = JSON.parse(attendance.data || '{}');
                    return (
                      <tr key={attendance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {attendance.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {data.studentId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.sessionCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(data.checkInTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`status-badge status-${attendance.status}`}>
                            {attendance.status === 'pending' && 'Chờ duyệt'}
                            {attendance.status === 'approved' && 'Đã duyệt'}
                            {attendance.status === 'rejected' && 'Đã từ chối'}
                          </span>
                        </td>
                        {(user.role === 'cbl' || user.role === 'btc' || user.role === 'admin') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {attendance.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveAttendance(attendance)}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => handleRejectAttendance(attendance)}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {attendances.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có điểm danh nào
                </div>
              )}
              {attendances.length > itemsPerPage && (
                <div className="flex items-center justify-center space-x-3 py-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                  {Array.from({ length: Math.ceil(attendances.length / itemsPerPage) }).map((_, idx) => (
                    <button key={idx} onClick={() => setPage(idx + 1)} className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{idx + 1}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(Math.ceil(attendances.length / itemsPerPage), p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Thống kê điểm danh</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tổng số:</span>
                <span className="font-semibold">{attendances.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Chờ duyệt:</span>
                <span className="font-semibold text-yellow-600">
                  {attendances.filter(a => a.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Đã duyệt:</span>
                <span className="font-semibold text-green-600">
                  {attendances.filter(a => a.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Đã từ chối:</span>
                <span className="font-semibold text-red-600">
                  {attendances.filter(a => a.status === 'rejected').length}
                </span>
              </div>
            </div>
          </div>

          {user.role === 'student' && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Hướng dẫn điểm danh</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Quét mã QR hoặc nhập mã phiên</li>
                <li>• Chụp ảnh minh chứng nếu cần</li>
                <li>• Chờ CBL xác nhận</li>
                <li>• Kiểm tra trạng thái thường xuyên</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        title="Điểm danh tham dự"
        size="md"
      >
        <form onSubmit={handleCheckIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã phiên *
            </label>
            <input
              type="text"
              required
              value={checkInData.sessionCode}
              onChange={(e) => setCheckInData({...checkInData, sessionCode: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập mã phiên hoặc quét QR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ tên *
            </label>
            <input
              type="text"
              required
              value={checkInData.studentName}
              onChange={(e) => setCheckInData({...checkInData, studentName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập họ tên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã sinh viên *
            </label>
            <input
              type="text"
              required
              value={checkInData.studentId}
              onChange={(e) => setCheckInData({...checkInData, studentId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập mã sinh viên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh minh chứng (tùy chọn)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCheckInData({...checkInData, photo: e.target.files[0]})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Chụp ảnh nếu điểm danh muộn hoặc không đúng phiên
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCheckIn(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: config.accent_color }}
            >
              {loading ? 'Đang xử lý...' : 'Điểm danh'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}