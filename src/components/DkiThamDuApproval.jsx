/**
 * DkiThamDuApproval.jsx - CBL/Admin approval for participation registrations
 * Chức năng:
 * - Xem danh sách hoạt động tham dự
 * - Xem danh sách các đơn đăng ký tham dự (chỉ cá nhân)
 * - Duyệt/Từ chối các đơn đăng ký
 */

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { useApp } from '../hooks/useApp';
import { apiFetch } from '../services/api';
import { fetchHoatDongThamDu } from '../services/hoat-dong-tham-du';
import { fetchHoatDong } from '../services/hoat-dong';
import {
  fetchDkiThamDuClass,
  updateDkiThamDuStatus
} from '../services/dki-tham-du';

export default function DkiThamDuApproval() {
  const [hdtdList, setHdtdList] = useState([]);
  const [hdList, setHdList] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [showRegListModal, setShowRegListModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityRegs, setActivityRegs] = useState([]);
  const [regLoading, setRegLoading] = useState(false);

  const [cblLop, setCblLop] = useState(null);

  const { state } = useApp();
  const { config } = state;

  const refreshData = async () => {
    try {
      const [hdtdData, hdData, regData, cblData] = await Promise.all([
        fetchHoatDongThamDu(),
        fetchHoatDong(),
        fetchDkiThamDuClass(),
        apiFetch('/api/me/is_cbl')
      ]);
      setHdtdList(Array.isArray(hdtdData) ? hdtdData : []);
      setHdList(Array.isArray(hdData) ? hdData : []);
      setRegistrations(Array.isArray(regData) ? regData : []);
      if (cblData?.isCbl && cblData?.lop) {
        setCblLop(cblData.lop);
      }
    } catch (err) {
      console.error('refreshData error:', err);
      toast.error('Không thể tải dữ liệu');
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await refreshData();
    })();
    return () => { mounted = false; };
  }, []);

  const getHoatDongInfo = (id_hd) => {
    return hdList.find(h => h.id_hd === id_hd) || {};
  };

  // Helper: Kiểm tra sinh viên có cùng lớp với CBL không
  const isStudentInCblClass = (reg) => {
    if (!cblLop) return true; // Nếu không phải CBL, cho phép tất cả
    return reg.lop === cblLop;
  };

  // Helper: Sắp xếp danh sách đăng ký - cùng lớp lên trên, khác lớp xuống dưới
  const sortRegsByClass = (regs) => {
    if (!cblLop) return regs;
    
    return [...regs].sort((a, b) => {
      const aIsInClass = isStudentInCblClass(a);
      const bIsInClass = isStudentInCblClass(b);
      
      // Cùng lớp lên trước
      if (aIsInClass && !bIsInClass) return -1;
      if (!aIsInClass && bIsInClass) return 1;
      return 0;
    });
  };

  const handleViewRegistrations = async (hdtd) => {
    try {
      setRegLoading(true);
      // Get registrations for this activity
      let regs = registrations.filter(r => r.id_hd === hdtd.id_hd_tham_du);
      // Sắp xếp: cùng lớp lên trên, khác lớp xuống dưới
      regs = sortRegsByClass(regs);
      setActivityRegs(regs);
      setSelectedActivity(hdtd);
      setShowRegListModal(true);
    } catch (err) {
      console.error('Error viewing registrations:', err);
      toast.error('Không thể tải danh sách đăng ký');
    } finally {
      setRegLoading(false);
    }
  };

  const handleApprove = async (reg) => {
    try {
      await updateDkiThamDuStatus(reg.ma_sv, reg.id_hd, 1); // 1 = approved
      toast.success('Duyệt thành công');
      const regData = await fetchDkiThamDuClass();
      const newRegs = Array.isArray(regData) ? regData : [];
      setRegistrations(newRegs);
      const newActivityRegs = newRegs.filter(r => r.id_hd === selectedActivity.id_hd_tham_du);
      setActivityRegs(newActivityRegs);
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi duyệt');
    }
  };

  const handleReject = async (reg) => {
    try {
      await updateDkiThamDuStatus(reg.ma_sv, reg.id_hd, -1); // -1 = rejected
      toast.success('Từ chối thành công');
      const regData = await fetchDkiThamDuClass();
      const newRegs = Array.isArray(regData) ? regData : [];
      setRegistrations(newRegs);
      const newActivityRegs = newRegs.filter(r => r.id_hd === selectedActivity.id_hd_tham_du);
      setActivityRegs(newActivityRegs);
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi từ chối');
    }
  };

  const totalPages = Math.max(1, Math.ceil(hdtdList.length / itemsPerPage));
  const displayedList = hdtdList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getTrangThaiColor = (trang_thai) => {
    if (trang_thai === 1) return 'text-green-600 bg-green-50';
    if (trang_thai === -1) return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getTrangThaiText = (trang_thai) => {
    if (trang_thai === 1) return 'Đã duyệt';
    if (trang_thai === -1) return 'Từ chối';
    return 'Chưa duyệt';
  };

  const getRegCountByStatus = (hdtd, status) => {
    return registrations.filter(r => r.id_hd === hdtd.id_hd_tham_du && r.trang_thai === status).length;
  };

  return (
    <div className="space-y-6 fade-in">

      <div>
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Duyệt Đăng Ký Tham Dự</h1>
      </div>

      {/* Danh sách hoạt động tham dự - Card grid (3 columns) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {hdtdList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Chưa có hoạt động tham dự nào</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayedList.map((hdtd) => {
                const hd = getHoatDongInfo(hdtd.id_hd);
                const totalRegs = registrations.filter(r => r.id_hd === hdtd.id_hd_tham_du).length;
                const approvedCount = getRegCountByStatus(hdtd, 1);
                const rejectedCount = getRegCountByStatus(hdtd, -1);
                const pendingCount = getRegCountByStatus(hdtd, 0);

                return (
                  <div key={hdtd.id_hd_tham_du} className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{hdtd.ten_hd}</h3>
                      <div className="text-xs text-gray-500 mb-2">ID: {hdtd.id_hd_tham_du}</div>
                      <div className="text-sm text-gray-500 mb-3">Thời gian: {hd.tg_bat_dau ? new Date(hd.tg_bat_dau).toLocaleString('vi-VN') : '—'}</div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-yellow-50 p-2 rounded text-center border border-yellow-200">
                          <div className="font-semibold text-yellow-700">{pendingCount}</div>
                          <div className="text-yellow-600">Chờ duyệt</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center border border-green-200">
                          <div className="font-semibold text-green-700">{approvedCount}</div>
                          <div className="text-green-600">Đã duyệt</div>
                        </div>
                        <div className="bg-red-50 p-2 rounded text-center border border-red-200">
                          <div className="font-semibold text-red-700">{rejectedCount}</div>
                          <div className="text-red-600">Từ chối</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleViewRegistrations(hdtd)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Danh sách ({totalRegs})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3 py-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-3 py-1 rounded ${page === idx + 1 ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
              style={page === idx + 1 ? { backgroundColor: config.accent_color } : {}}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
        </div>
      )}

      {/* Registrations List Modal */}
      <Modal
        isOpen={showRegListModal}
        onClose={() => setShowRegListModal(false)}
        title={`Danh sách đăng ký tham dự: ${getHoatDongInfo(selectedActivity?.id_hd)?.ten_hd || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {regLoading ? (
            <div className="text-center py-4 text-gray-500">Đang tải...</div>
          ) : activityRegs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Không có đơn đăng ký nào</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityRegs.map((reg) => {
                const isInClass = isStudentInCblClass(reg);
                return (
                  <div key={`${reg.ma_sv}-${reg.id_hd}`} className={`bg-white border rounded p-4 flex items-center justify-between hover:bg-gray-50 ${!isInClass ? 'opacity-60' : ''}`}>
                    <div className="flex-1">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Cá nhân</span>
                          {reg.ho_ten || reg.ma_sv}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          MSSV: {reg.ma_sv}
                        </div>
                      </div>
                      {!isInClass && (
                        <div className="text-xs text-red-600 mt-1 font-medium">
                          ⚠ Không cùng lớp - Không thể duyệt
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getTrangThaiColor(reg.trang_thai)}`}>
                        {getTrangThaiText(reg.trang_thai)}
                      </span>

                      {reg.trang_thai === 0 && (
                        <>
                          <button
                            onClick={() => handleApprove(reg)}
                            disabled={!isInClass}
                            className={`px-3 py-1 text-xs rounded ${
                              isInClass
                                ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(reg)}
                            disabled={!isInClass}
                            className={`px-3 py-1 text-xs rounded ${
                              isInClass
                                ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setShowRegListModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
