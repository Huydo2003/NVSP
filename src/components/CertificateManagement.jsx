/**
 * CertificateManagement.jsx - Quản lý chứng nhận
 * 
 * Chức năng:
 * - Yêu cầu cấp chứng nhận
 * - Xét duyệt chứng nhận
 * - Quản lý file đính kèm
 * - Theo dõi trạng thái cấp phát
 */

import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { generateId, formatDateTime } from '../utils/config';
import Modal from './Modal';
import toast from 'react-hot-toast';
import InputDialog from './InputDialog';
import { fetchCertificates } from '../services/certificates';

export default function CertificateManagement({ user }) {
  // Danh sách chứng nhận từ dataSdk
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  // Điều khiển form yêu cầu
  const [showRequestForm, setShowRequestForm] = useState(false);
  // Trạng thái loading khi thao tác
  const [loading, setLoading] = useState(false);
  // Dữ liệu form yêu cầu
  const [requestData, setRequestData] = useState({
    type: 'achievement',
    title: '',
    description: '',
    attachments: []
  });
  const [inputDialog, setInputDialog] = useState({ isOpen: false, title: '', label: '', defaultValue: '', onConfirm: null });

  const { state } = useApp();
  const { data, config } = state;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await fetchCertificates();
        if (!mounted) return;
        if (!rows || !Array.isArray(rows) || rows.length === 0) {
          setCertificates([]);
          return;
        }

        const mapped = rows.map(r => ({
          id: r.id,
          type: 'certificate',
          title: r.studentName ? `${r.studentName} — ${r.typeName || ''}` : (r.typeName || 'Chứng nhận'),
          description: r.eventName || '',
          category: r.typeName || '',
          status: r.status || 'issued',
          createdBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          data: JSON.stringify({})
        }));

        setCertificates(mapped);
      } catch (err) {
        console.warn('Failed to load certificates', err);
        toast('Không thể tải danh sách chứng nhận từ server', { icon: '⚠️' });
        setCertificates([]);
      }
    })();

    return () => { mounted = false; };
  }, []);

  /**
   * Xử lý yêu cầu cấp chứng nhận
   * @param {Event} e - Form submit event
   * - Lưu thông tin yêu cầu
   * - Xử lý file đính kèm
   * - Tự động gán trạng thái chờ duyệt
   */
  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (data.length >= 999) {
      toast.error('Đã đạt giới hạn tối đa 999 bản ghi. Vui lòng xóa một số dữ liệu trước!');
      setLoading(false);
      return;
    }

    const certificateData = {
      id: generateId(),
      type: 'certificate',
      title: requestData.title,
      description: requestData.description,
      category: requestData.type,
      status: 'pending',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: JSON.stringify({
        attachments: requestData.attachments,
        requestType: requestData.type
      })
    };

    const result = await window.dataSdk.create(certificateData);
    if (result.isOk) {
      setShowRequestForm(false);
      setRequestData({
        type: 'achievement',
        title: '',
        description: '',
        attachments: []
      });
      toast.success('Yêu cầu cấp chứng nhận đã được gửi! Chờ BTC xác nhận.');
    } else {
      toast.error('Có lỗi xảy ra khi gửi yêu cầu!');
    }
    
    setLoading(false);
  };

  /**
   * Duyệt yêu cầu chứng nhận
   * @param {Object} certificate - Chứng nhận cần duyệt
   * - Chuyển trạng thái thành đã duyệt
   * - Lưu thông tin người duyệt
   * - Cập nhật qua dataSdk
   */
  const handleApproveCertificate = async (certificate) => {
    setLoading(true);
    const updatedCertificate = {
      ...certificate,
      status: 'approved',
      updatedAt: new Date().toISOString(),
      data: JSON.stringify({
        ...JSON.parse(certificate.data || '{}'),
        approvedBy: user.id,
        approvedAt: new Date().toISOString()
      })
    };
    
    const result = await window.dataSdk.update(updatedCertificate);
    if (!result.isOk) {
      toast.error('Có lỗi xảy ra khi duyệt chứng nhận!');
    }
    setLoading(false);
  };

  /**
   * Từ chối yêu cầu chứng nhận
   * @param {Object} certificate - Chứng nhận cần từ chối
   * - Yêu cầu nhập lý do từ chối
   * - Lưu thông tin người từ chối
   * - Cập nhật trạng thái qua dataSdk
   */
  const handleRejectCertificate = async (certificate) => {
    setInputDialog({
      isOpen: true,
      title: 'Từ chối chứng nhận',
      label: 'Nhập lý do từ chối:',
      defaultValue: '',
      onConfirm: async (reason) => {
        if (!reason) return;
        setLoading(true);
        const updatedCertificate = {
          ...certificate,
          status: 'rejected',
          updatedAt: new Date().toISOString(),
          data: JSON.stringify({
            ...JSON.parse(certificate.data || '{}'),
            rejectedBy: user.id,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason
          })
        };
        
        const result = await window.dataSdk.update(updatedCertificate);
        if (!result.isOk) {
          toast.error('Có lỗi xảy ra khi từ chối chứng nhận!');
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
          Quản lý chứng nhận
        </h1>
        {user.role === 'student' && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.accent_color }}
          >
            Yêu cầu cấp chứng nhận
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Danh sách chứng nhận</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày yêu cầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    {(user.role === 'btc' || user.role === 'admin') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certificates.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(certificate => {
                    const data = JSON.parse(certificate.data || '{}');
                    return (
                      <tr key={certificate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {certificate.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {certificate.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.requestType === 'achievement' ? 'Thành tích' : 'Tham gia'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(certificate.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`status-badge status-${certificate.status}`}>
                            {certificate.status === 'pending' && 'Chờ duyệt'}
                            {certificate.status === 'approved' && 'Đã duyệt'}
                            {certificate.status === 'rejected' && 'Đã từ chối'}
                          </span>
                        </td>
                        {(user.role === 'btc' || user.role === 'admin') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {certificate.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveCertificate(certificate)}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => handleRejectCertificate(certificate)}
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
              {certificates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có yêu cầu chứng nhận nào
                </div>
              )}
              {certificates.length > itemsPerPage && (
                <div className="flex items-center justify-center space-x-3 py-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                  {Array.from({ length: Math.ceil(certificates.length / itemsPerPage) }).map((_, idx) => (
                    <button key={idx} onClick={() => setPage(idx + 1)} className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{idx + 1}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(Math.ceil(certificates.length / itemsPerPage), p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Thống kê chứng nhận</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tổng số:</span>
                <span className="font-semibold">{certificates.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Chờ duyệt:</span>
                <span className="font-semibold text-yellow-600">
                  {certificates.filter(c => c.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Đã duyệt:</span>
                <span className="font-semibold text-green-600">
                  {certificates.filter(c => c.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Đã từ chối:</span>
                <span className="font-semibold text-red-600">
                  {certificates.filter(c => c.status === 'rejected').length}
                </span>
              </div>
            </div>
          </div>

          {user.role === 'student' && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Hướng dẫn yêu cầu</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Chọn loại chứng nhận phù hợp</li>
                <li>• Điền đầy đủ thông tin yêu cầu</li>
                <li>• Đính kèm minh chứng nếu cần</li>
                <li>• Chờ BTC xác nhận và cấp chứng nhận</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        title="Yêu cầu cấp chứng nhận"
        size="md"
      >
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại chứng nhận *
            </label>
            <select
              value={requestData.type}
              onChange={(e) => setRequestData({...requestData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="achievement">Chứng nhận thành tích</option>
              <option value="participation">Chứng nhận tham gia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề *
            </label>
            <input
              type="text"
              required
              value={requestData.title}
              onChange={(e) => setRequestData({...requestData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: Chứng nhận thành tích xuất sắc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết *
            </label>
            <textarea
              required
              value={requestData.description}
              onChange={(e) => setRequestData({...requestData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Mô tả chi tiết về thành tích hoặc hoạt động tham gia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tệp đính kèm (tùy chọn)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setRequestData({
                ...requestData,
                attachments: Array.from(e.target.files || [])
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Đính kèm các tệp minh chứng nếu cần thiết
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowRequestForm(false)}
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
              {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}