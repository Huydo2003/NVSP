import { useState, useEffect } from 'react';
import Modal from './Modal';
import { fetchRubric, createRubric, updateRubric, deleteRubric, fetchRubricDetails, createRubricDetail, updateRubricDetail, deleteRubricDetail } from '../services/rubrics';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
import { useApp } from '../hooks/useApp';
import { apiFetch } from '../services/api';

export default function RubricManagement() {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id_rubric: '', ten_rubric: '' });
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null });
  const [isBtc, setIsBtc] = useState(false);

  // detail modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRubric, setDetailRubric] = useState(null); // rubric item
  const [details, setDetails] = useState([]);
  const [detailForm, setDetailForm] = useState({ tieu_chi: '', diem_toi_da: '' });
  const [detailEditing, setDetailEditing] = useState(null);

  const { state } = useApp();
  const { config } = state;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Check if user is BTC
        const res = await apiFetch('/api/me/is_btc');
        console.log('BTC check response:', res);
        if (mounted) {
          setIsBtc(res?.isBtc || false);
          console.log('Set isBtc to:', res?.isBtc || false);
          
          if (res?.isBtc) {
            const rubrics = await fetchRubric();
            if (mounted) {
              setList(rubrics || []);
            }
          }
        }
      } catch (err) {
        console.error('Check BTC error', err);
        if (mounted) {
          setIsBtc(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    try {
      const cb = await fetchRubric();
      setList(cb || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openDetails = async (rubric) => {
    setDetailRubric(rubric);
    setDetailOpen(true);
    setDetailEditing(null);
    setDetailForm({ tieu_chi: '', diem_toi_da: '' });
    try {
      const res = await fetchRubricDetails(rubric.id_rubric);
      setDetails(res || []);
    } catch (err) {
      console.error('Load details error', err);
      toast.error('Không thể tải chi tiết rubric');
    }
  };

  const refreshDetails = async () => {
    if (!detailRubric) return;
    try {
      const res = await fetchRubricDetails(detailRubric.id_rubric);
      setDetails(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        id_rubric: detailRubric.id_rubric,
        tieu_chi: detailForm.tieu_chi,
        diem_toi_da: Number(detailForm.diem_toi_da) || 0
      };

      if (detailEditing) {
        await updateRubricDetail(detailRubric.id_rubric, detailEditing.tieu_chi, payload);
        toast.success('Cập nhật chi tiết Rubric thành công');
      } else {
        await createRubricDetail(payload);
        toast.success('Thêm chi tiết Rubric thành công');
      }

      await refreshDetails();
      setDetailEditing(null);
      setDetailForm({ tieu_chi: '', diem_toi_da: '' });
    } catch (err) {
      console.error(err);
      toast.error(err?.body?.message || 'Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const handleDetailEdit = (item) => {
    setDetailEditing(item);
    setDetailForm({ tieu_chi: item.tieu_chi, diem_toi_da: item.diem_toi_da });
  };

  const handleDetailDelete = (item) => {
    setDetailOpen(false); // Close detail modal to show confirm dialog on top
    setConfirm({
      isOpen: true,
      title: 'Xóa chi tiết Rubric',
      message: `Bạn chắc chắn muốn xóa tiêu chí ${item.tieu_chi}?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteRubricDetail(detailRubric.id_rubric, item.tieu_chi);
          await refreshDetails();
          toast.success('Xóa chi tiết thành công');
          setDetailOpen(true); // Reopen detail modal
        } catch (err) {
          console.error(err);
          toast.error('Xóa thất bại');
          setDetailOpen(true); // Reopen detail modal even on error
        } finally { setLoading(false); }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        id_rubric: form.id_rubric,
        ten_rubric: form.ten_rubric || null
      };
      if (editing) {
        await updateRubric(editing.id_rubric, payload);
        toast.success('Cập nhật Rubric thành công');
      } else {
        await createRubric(payload);
        toast.success('Thêm Rubric thành công');
      }
      await refresh();
      setShowModal(false);
      setEditing(null);
      setForm({ id_rubric: '', ten_rubric: '' });
    } catch (err) {
      console.error(err);
      if (err.status === 400 && err.body?.message?.includes('Tên Rubric')) {
        toast.error('Tên Rubric đã tồn tại. Vui lòng sử dụng tên rubric khác');
      } else {
        toast.error(err?.body?.message || 'Có lỗi xảy ra');
      }
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      id_rubric: item.id_rubric,
      ten_rubric: item.ten_rubric || ''
    });
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setConfirm({
      isOpen: true,
      title: 'Xóa Rubric',
      message: `Bạn chắc chắn muốn xóa Rubric ${item.ten_rubric}?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteRubric(item.id_rubric);
          await refresh();
          toast.success('Xóa Rubric thành công');
        } catch (err) {
          console.error(err);
          toast.error('Xóa thất bại');
        } finally { setLoading(false); }
      }
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ ...confirm, isOpen: false, onConfirm: null })}
      />

      {!isBtc && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-700 font-medium">⚠️ Bạn không có quyền truy cập phần này</p>
          <p className="text-yellow-600 text-sm">Chỉ Ban Tổ Chức (BTC) mới có thể quản lý Rubric</p>
        </div>
      )}

      {isBtc && (
        <>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Quản lý Rubric</h1>
            <button
              onClick={() => { setShowModal(true); setEditing(null); setForm({ id_rubric: '', ten_rubric: '' }); }}
              className="px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: config.accent_color }}
            >
              Thêm Rubric
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Rubric</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {list.map((it, idx) => (
                <tr key={it.id_rubric} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{it.ten_rubric}</div>
                    <div className="text-xs text-gray-500">ID: {it.id_rubric}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(it)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                    <button onClick={() => handleDelete(it)} className="text-red-600 hover:text-red-900">Xóa</button>
                    <button onClick={() => openDetails(it)} className="text-green-600 hover:text-green-900">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Sửa Rubric' : 'Thêm Rubric'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Rubric *
            </label>
            <input
              type="text"
              required
              value={form.ten_rubric}
              onChange={(e) => setForm({ ...form, ten_rubric: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập tên Rubric"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-white rounded-md" style={{ backgroundColor: config.accent_color }}>
              {loading ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm Rubric')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={detailRubric ? `Chi tiết ${detailRubric.ten_rubric}` : 'Chi tiết Rubric'} size="lg">
        <div className="space-y-4">
          <form onSubmit={handleDetailSubmit} className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Tiêu chí *</label>
              <input required type="text" value={detailForm.tieu_chi} onChange={(e) => setDetailForm({ ...detailForm, tieu_chi: e.target.value })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Điểm tối đa</label>
              <input type="number" value={detailForm.diem_toi_da} onChange={(e) => setDetailForm({ ...detailForm, diem_toi_da: e.target.value })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="col-span-3 flex justify-end space-x-2">
              {detailEditing && <button type="button" onClick={() => { setDetailEditing(null); setDetailForm({ tieu_chi: '', diem_toi_da: '' }); }} className="px-3 py-2 bg-gray-200 rounded">Hủy</button>}
              <button type="submit" disabled={loading} className="px-4 py-2 text-white rounded" style={{ backgroundColor: config.accent_color }}>{detailEditing ? 'Cập nhật' : 'Thêm'}</button>
            </div>
          </form>

          <div className="overflow-x-auto bg-white rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu chí</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm tối đa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {details.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500 italic"
                    >
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  details.map((d, i) => (
                    <tr key={`${d.tieu_chi}-${i}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{d.tieu_chi}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{d.diem_toi_da}</td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleDetailEdit(d)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDetailDelete(d)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
