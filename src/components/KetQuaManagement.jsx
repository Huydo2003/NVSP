// src/components/KetQuaManagement.jsx
import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { useApp } from '../hooks/useApp';
import { apiFetch } from '../services/api';
import { fetchKetQuaAll, upsertKetQua, deleteKetQua } from '../services/ket-qua';

export default function KetQuaManagement() {
  const { state } = useApp();
  const { config } = state;

  const [regs, setRegs] = useState([]);
  const [chamDiemList, setChamDiemList] = useState([]);
  const [ketQuaList, setKetQuaList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const [showModal, setShowModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [prize, setPrize] = useState('');
  const [status, setStatus] = useState(1);
  const [saving, setSaving] = useState(false);

  // =============================
  // LOAD DATA
  // =============================
  const refreshData = async () => {
    try {
      setLoading(true);
      let regsResp = [];
      try {
        regsResp = await apiFetch('/api/ket_qua/with-avg');
      } catch {
        const rRegs = await apiFetch('/api/dang-ky-thi/btc/all');
        const rKq = await apiFetch('/api/ket_qua');
        const rCd = await apiFetch('/api/cham_diem');

        setRegs(rRegs || []);
        setKetQuaList(rKq || []);
        setChamDiemList(rCd || []);
        setLoading(false);
        return;
      }

      setRegs(regsResp || []);
      const [rCd, rKq] = await Promise.all([
        apiFetch('/api/cham_diem'),
        apiFetch('/api/ket_qua')
      ]);
      setChamDiemList(rCd || []);
      setKetQuaList(rKq || []);
    } catch (err) {
      console.error('refreshData error', err);
      toast.error('Không thể tải dữ liệu kết quả');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  // =============================
  // HELPERS
  // =============================
  const getAvgScore = (id_dang_ky) => {
    const reg = regs.find(r => String(r.id) === String(id_dang_ky));
    if (reg && reg.avg_score != null) return Number(reg.avg_score).toFixed(2);

    const arr = chamDiemList.filter(cd => String(cd.id_dang_ky) === String(id_dang_ky));
    if (arr.length === 0) return null;

    const avg = arr.reduce((s, v) => s + Number(v.diem || 0), 0) / arr.length;
    return avg.toFixed(2);
  };

  const getKetQuaFor = (id_dang_ky) =>
    ketQuaList.find(k => String(k.id_dang_ky) === String(id_dang_ky)) || null;

  const getStatusBadge = (status) => {
    if (status === 1)
      return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-medium">Đã duyệt</span>;
    if (status === -1)
      return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-medium">Từ chối</span>;
    return <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 font-medium">Chưa duyệt</span>;
  };

  const getScoreBadge = (avg) => {
    if (avg === null) return <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">Chưa có</span>;
    return (
      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-semibold">
        {avg}
      </span>
    );
  };

  const getPrizeBadge = (prize) => {
    if (!prize) return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-500">—</span>;
    return (
      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 font-semibold">
        {prize}
      </span>
    );
  };

  // =============================
  // MODAL HANDLERS
  // =============================
  const openModal = (reg) => {
    setSelectedReg(reg);
    const existing = getKetQuaFor(reg.id);
    setPrize(existing?.giai_thuong || '');
    setStatus(existing?.trang_thai ?? 1);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!prize.trim()) return toast.error('Vui lòng nhập giải thưởng');

    try {
      setSaving(true);
      await upsertKetQua({
        id_dang_ky: selectedReg.id,
        giai_thuong: prize.trim(),
        trang_thai: Number(status)
      });
      toast.success("Đã lưu kết quả");
      setShowModal(false);
      refreshData();
    } catch (err) {
      toast.error("Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id_dang_ky) => {
    try {
      await deleteKetQua(id_dang_ky);
      toast.success("Đã xóa kết quả");
      refreshData();
    } catch (err) {
      toast.error("Xóa thất bại");
    }
  };

  // =============================
  // PAGINATION
  // =============================
  const totalPages = Math.max(1, Math.ceil(regs.length / itemsPerPage));
  const displayed = regs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // =============================
  // RENDER
  // =============================
  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>
        Kết quả - Ban Tổ Chức
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có đăng ký nào</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayed.map(reg => {
              const avg = getAvgScore(reg.id);
              const kq = getKetQuaFor(reg.id);

              const name =
                reg.hinh_thuc === 'Nhóm'
                  ? (reg.ten_nhom || `Nhóm #${reg.id}`)
                  : (reg.ho_ten || reg.ma_sv || reg.ten_ca_nhan || reg.ma_tham_gia);

              return (
                <div
                  key={reg.id}
                  className="bg-white border rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-lg transition"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">
                      Hoạt động: <span className="font-medium">{reg.ten_hd || ''}</span>
                    </p>

                    {/* Badge Điểm */}
                    <div className="text-sm">
                      Điểm TB: {getScoreBadge(avg)}
                    </div>

                    {/* Badge Giải */}
                    <div className="text-sm">
                      Giải thưởng: {getPrizeBadge(kq?.giai_thuong)}
                    </div>

                    {/* Badge Trạng thái */}
                    <div className="text-sm">
                      Trạng thái: {getStatusBadge(kq?.trang_thai)}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => avg !== null && openModal(reg)}
                      disabled={avg === null}
                      className={`px-3 py-1 text-xs rounded-md transition ${
                        avg === null
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      Trao giải
                    </button>

                    {kq && (
                      <button
                        onClick={() => handleDelete(reg.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-3 py-1 rounded ${
                page === idx + 1 ? 'text-white' : 'bg-gray-100 text-gray-700'
              }`}
              style={page === idx + 1 ? { backgroundColor: config.accent_color } : {}}
            >
              {idx + 1}
            </button>
          ))}

          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-100 rounded">
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Kết quả: ${
          selectedReg
            ? (selectedReg.hinh_thuc === 'Nhóm'
              ? selectedReg.ten_nhom
              : selectedReg.ho_ten || selectedReg.ma_sv)
            : ''
        }`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên giải thưởng</label>
            <input
              type="text"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              <option value={1}>Đã duyệt</option>
              <option value={0}>Chưa duyệt</option>
              <option value={-1}>Từ chối</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
