/**
 * DkiThamDuRegister.jsx - Student Participation Activity Registration
 * Chức năng:
 * - Xem danh sách hoạt động tham dự
 * - Đăng ký tham dự (chỉ cá nhân)
 * - Xem trạng thái đăng ký
 * - Chỉ cho phép sinh viên truy cập
 * - Chặn đăng ký nếu đã đăng ký thi cho cùng hoạt động
 */

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';
import { useApp } from '../hooks/useApp';
import { fetchHoatDongThamDu } from '../services/hoat-dong-tham-du';
import { fetchHoatDong } from '../services/hoat-dong';
import { fetchDangKyThi } from '../services/dang-ky-thi';
import {
  fetchDkiThamDu,
  registerDkiThamDu,
  cancelDkiThamDu
} from '../services/dki-tham-du';

export default function DkiThamDuRegister({ user }) {
  const [hdtdList, setHdtdList] = useState([]);
  const [hdList, setHdList] = useState([]);
  const [dkiRegs, setDkiRegs] = useState([]);
  const [dangKyThiRegs, setDangKyThiRegs] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const { state } = useApp();
  const { config } = state;

  // Check if user is student
  const isStudent = user && String(user.role || '').toLowerCase().includes('sinh');

  const refreshData = async () => {
    try {
      const [hdtdData, hdData, dkiData, dangKyThiData] = await Promise.all([
        fetchHoatDongThamDu(),
        fetchHoatDong(),
        fetchDkiThamDu(),
        fetchDangKyThi()
      ]);
      setHdtdList(Array.isArray(hdtdData) ? hdtdData : []);
      setHdList(Array.isArray(hdData) ? hdData : []);
      setDkiRegs(Array.isArray(dkiData) ? dkiData : []);
      setDangKyThiRegs(Array.isArray(dangKyThiData) ? dangKyThiData : []);
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

  // Helper: Kiểm tra xem sinh viên đã đăng ký thi cho cùng hoạt động chưa
  const hasConflictingDangKyThi = (id_hd) => {
    return dangKyThiRegs.some(r => r.id_hd === id_hd);
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!selectedActivity) {
      toast.error('Vui lòng chọn hoạt động');
      return;
    }

    // Check for conflict with dang_ky_thi
    if (hasConflictingDangKyThi(selectedActivity.id_hd)) {
      toast.error('Bạn đã đăng ký thi cho hoạt động này. Không thể đăng ký tham dự');
      return;
    }

    setLoading(true);
    try {
      await registerDkiThamDu(selectedActivity.id_hd_tham_du);
      toast.success('Đăng ký tham dự thành công! Chờ duyệt từ cán bộ lớp.');
      setShowRegModal(false);
      await refreshData();
    } catch (err) {
      console.error('Register error:', err);
      toast.error((err && err.message) || 'Lỗi khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReg = (reg) => {
    setConfirm({
      isOpen: true,
      title: 'Hủy đăng ký',
      message: 'Bạn có chắc muốn hủy đăng ký tham dự hoạt động này?',
      onConfirm: async () => {
        try {
          await cancelDkiThamDu(reg.ma_sv, reg.id_hd);
          toast.success('Hủy đăng ký thành công');
          await refreshData();
        } catch (err) {
          toast.error((err && err.message) || 'Lỗi khi hủy');
        }
      }
    });
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

  // Check if user is student - show error if not
  if (!isStudent) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700 font-medium">⚠️ Chỉ sinh viên mới có thể truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ ...confirm, isOpen: false })}
      />

      <div>
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Đăng Ký Tham Dự</h1>
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
                const userReg = dkiRegs.find(r => r.id_hd === hdtd.id_hd_tham_du);
                const isReg = !!userReg;
                const hasConflict = hasConflictingDangKyThi(hdtd.id_hd);

                return (
                  <div key={hdtd.id_hd_tham_du} className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{hdtd.ten_hd}</h3>
                      <div className="flex gap-5 text-gray-500 my-2">
                        <div className="text-xs text-gray-500 mb-2">ID Hoạt động tham dự: {hdtd.id_hd_tham_du}</div>
                        <div className="text-xs text-gray-500 mb-2">Hoạt động: <strong> {hd.ten_hd} </strong></div>
                      </div>
                      <div className="text-sm text-gray-500">Thời gian: {hd.tg_bat_dau ? new Date(hd.tg_bat_dau).toLocaleString('vi-VN') : '—'}</div>

                      {hasConflict && (
                        <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                          ⚠ Đã đăng ký thi - không thể tham dự
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        {isReg ? (
                          <div className={`px-2 py-1 inline-flex text-xs font-semibold rounded ${getTrangThaiColor(userReg.trang_thai)}`}>
                            {getTrangThaiText(userReg.trang_thai)}
                          </div>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs font-semibold rounded bg-gray-100 text-gray-600">Chưa đăng ký</span>
                        )}
                      </div>

                      <div className="space-x-2">
                        {isReg ? (
                          <button onClick={() => handleCancelReg(userReg)} className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded">Hủy</button>
                        ) : (
                          <button
                            onClick={() => {
                              if (hasConflict) {
                                toast.error('Bạn đã đăng ký thi cho hoạt động này. Không thể đăng ký tham dự');
                                return;
                              }
                              setSelectedActivity(hdtd);
                              setShowRegModal(true);
                            }}
                            disabled={hasConflict}
                            className={`px-4 py-2 rounded text-white ${hasConflict
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                              }`}
                          >
                            Đăng Ký
                          </button>
                        )}
                      </div>
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

      {/* Registration Modal */}
      <Modal
        isOpen={showRegModal}
        onClose={() => { setShowRegModal(false); }}
        title="Xác Nhận Đăng Ký Tham Dự"
        size="md"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              <strong>Hoạt động:</strong> {selectedActivity && getHoatDongInfo(selectedActivity.id_hd).ten_hd}
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              ℹ️ Bạn sắp đăng ký tham dự hoạt động này. Sau khi đăng ký, sẽ chờ duyệt từ cán bộ lớp.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowRegModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: config.accent_color }}>
              {loading ? 'Đang xử lý...' : 'Đăng Ký'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
