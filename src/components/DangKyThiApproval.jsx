/**
 * DangKyThiApproval.jsx - BTC/Admin approval for exam/activity registrations
 * Chức năng:
 * - Xem danh sách hoạt động thi
 * - Xem danh sách các đơn đăng ký (nhóm/cá nhân)
 * - Duyệt/Từ chối các đơn đăng ký
 */

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { useApp } from '../hooks/useApp';
import { fetchHoatDongThi } from '../services/hoat-dong-thi';
import { fetchHoatDong } from '../services/hoat-dong';
import {
  fetchAllDangKyThiBtc,
  updateDangKyThiStatus,
  fetchThanhVienNhom
} from '../services/dang-ky-thi';

export default function DangKyThiApproval() {
  const [hdtList, setHdtList] = useState([]);
  const [hdList, setHdList] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [showRegListModal, setShowRegListModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityRegs, setActivityRegs] = useState([]);
  const [regLoading, setRegLoading] = useState(false);

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);

  const { state } = useApp();
  const { config } = state;

  const refreshData = async () => {
    try {
      const [hdtData, hdData, regData] = await Promise.all([
        fetchHoatDongThi(),
        fetchHoatDong(),
        fetchAllDangKyThiBtc()
      ]);
      setHdtList(Array.isArray(hdtData) ? hdtData : []);
      setHdList(Array.isArray(hdData) ? hdData : []);
      setRegistrations(Array.isArray(regData) ? regData : []);
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

  const handleViewRegistrations = async (hdt) => {
    try {
      setRegLoading(true);
      // Get registrations for this activity
      const regs = registrations.filter(r => r.id_hd === hdt.id_hd);
      setActivityRegs(regs);
      setSelectedActivity(hdt);
      setShowRegListModal(true);
    } catch (err) {
      console.error('Error viewing registrations:', err);
      toast.error('Không thể tải danh sách đăng ký');
    } finally {
      setRegLoading(false);
    }
  };

  const handleViewGroupMembers = async (reg) => {
    if (reg.hinh_thuc !== 'Nhóm') {
      toast.error('Chỉ có thể xem thành viên của đơn nhóm');
      return;
    }

    try {
      const members = await fetchThanhVienNhom(reg.id);
      setGroupMembers(Array.isArray(members) ? members : []);
      setSelectedReg(reg);
      setShowMembersModal(true);
    } catch (err) {
      console.error('Error fetching group members:', err);
      toast.error('Không thể tải danh sách thành viên');
    }
  };

  const handleApprove = async (reg) => {
    try {
      // Nếu là nhóm, kiểm tra thành viên đủ số lượng
      if (reg.hinh_thuc === 'Nhóm') {
        const members = await fetchThanhVienNhom(reg.id);
        const memberCount = Array.isArray(members) ? members.length : 0;
        const activity = hdtList.find(h => h.id_hd === reg.id_hd);
        const requiredCount = activity?.so_luong_tv || 0;
        
        if (memberCount < requiredCount) {
          toast.error(`Nhóm chưa đủ thành viên (${memberCount}/${requiredCount})`);
          return;
        }
      }

      await updateDangKyThiStatus(reg.id, 1); // 1 = approved
      toast.success('Duyệt thành công');
      const regData = await fetchAllDangKyThiBtc();
      const newRegs = Array.isArray(regData) ? regData : [];
      setRegistrations(newRegs);
      const newActivityRegs = newRegs.filter(r => r.id_hd === selectedActivity.id_hd);
      setActivityRegs(newActivityRegs);
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi duyệt');
    }
  };

  const handleReject = async (reg) => {
    try {
      await updateDangKyThiStatus(reg.id, -1); // -1 = rejected
      toast.success('Từ chối thành công');
      const regData = await fetchAllDangKyThiBtc();
      const newRegs = Array.isArray(regData) ? regData : [];
      setRegistrations(newRegs);
      const newActivityRegs = newRegs.filter(r => r.id_hd === selectedActivity.id_hd);
      setActivityRegs(newActivityRegs);
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi từ chối');
    }
  };

  const totalPages = Math.max(1, Math.ceil(hdtList.length / itemsPerPage));
  const displayedList = hdtList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

  const getRegCountByStatus = (hdt, status) => {
    return registrations.filter(r => r.id_hd === hdt.id_hd && r.trang_thai === status).length;
  };

  return (
    <div className="space-y-6 fade-in">

      <div>
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Duyệt Đăng Ký Hoạt Động Thi</h1>
      </div>

      {/* Danh sách hoạt động thi - Card grid (3 columns) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {hdtList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Chưa có hoạt động thi nào</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayedList.map((hdt) => {
                const hd = getHoatDongInfo(hdt.id_hd);
                const totalRegs = registrations.filter(r => r.id_hd === hdt.id_hd).length;
                const approvedCount = getRegCountByStatus(hdt, 1);
                const rejectedCount = getRegCountByStatus(hdt, -1);
                const pendingCount = getRegCountByStatus(hdt, 0);

                return (
                  <div key={hdt.id_hd} className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{hd.ten_hd}</h3>
                      <div className="text-xs text-gray-500 mb-2">ID: {hdt.id_hd}</div>
                      <div className="text-sm text-gray-600 mb-2">Hình thức: {hdt.hinh_thuc || 'N/A'}</div>
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
                        onClick={() => handleViewRegistrations(hdt)}
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
        title={`Danh sách đăng ký: ${getHoatDongInfo(selectedActivity?.id_hd)?.ten_hd || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {regLoading ? (
            <div className="text-center py-4 text-gray-500">Đang tải...</div>
          ) : activityRegs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Không có đơn đăng ký nào</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityRegs.map((reg) => (
                <div key={reg.id} className="bg-white border rounded p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    {reg.hinh_thuc === 'Nhóm' ? (
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">Nhóm</span>
                          {reg.ten_nhom}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Mã tham gia: {reg.ma_tham_gia}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Cá nhân</span>
                          {reg.ho_ten || reg.ma_sv}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          MSSV: {reg.ma_sv}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getTrangThaiColor(reg.trang_thai)}`}>
                      {getTrangThaiText(reg.trang_thai)}
                    </span>

                    {reg.hinh_thuc === 'Nhóm' && (
                      <button
                        onClick={() => handleViewGroupMembers(reg)}
                        className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                      >
                        Thành viên
                      </button>
                    )}

                    {reg.trang_thai === 0 && (
                      <>
                        <button
                          onClick={() => handleApprove(reg)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(reg)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
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

      {/* Group Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={`Thành viên nhóm: ${selectedReg?.ten_nhom || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Mã tham gia:</strong> {selectedReg?.ma_tham_gia}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Danh sách thành viên ({groupMembers.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {groupMembers.length > 0 ? (
                groupMembers.map((member) => (
                  <div key={member.ma_sv} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.ho_ten}</div>
                      <div className="text-xs text-gray-500">{member.ma_sv}</div>
                    </div>
                    {member.email && <div className="text-xs text-gray-500">{member.email}</div>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Chưa có thành viên</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => setShowMembersModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Đóng</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
