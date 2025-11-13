import { useState, useEffect } from 'react';
import Modal from './Modal';
import { fetchCanBoLop, createCanBoLop, updateCanBoLop, deleteCanBoLop } from '../services/can-bo-lop';
import { fetchSinhVien } from '../services/sinh-vien';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
import { useApp } from '../hooks/useApp';

export default function CanBoLopManagement() {
  const [list, setList] = useState([]);
  const [sinhVienList, setSinhVienList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ma_sinh_vien: '', bat_dau_nk: '', ket_thuc_nk: '', trang_thai: true });
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null });

  const { state } = useApp();
  const { config } = state;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cb, sv] = await Promise.all([fetchCanBoLop(), fetchSinhVien()]);
        if (mounted) {
          setList(cb || []);
          setSinhVienList(sv || []);
        }
      } catch (err) {
        console.error('Load CBL error', err);
        toast.error('Không thể tải dữ liệu');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    try {
      const cb = await fetchCanBoLop();
      setList(cb || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ma_sinh_vien: form.ma_sinh_vien,
        bat_dau_nk: form.bat_dau_nk || null,
        ket_thuc_nk: form.ket_thuc_nk || null,
        trang_thai: form.trang_thai ? 1 : 0
      };
      if (editing) {
        await updateCanBoLop(editing.ma_sinh_vien, payload);
        toast.success('Cập nhật CBL thành công');
      } else {
        await createCanBoLop(payload);
        toast.success('Thêm CBL thành công');
      }
      await refresh();
      setShowModal(false);
      setEditing(null);
      setForm({ ma_sinh_vien: '', bat_dau_nk: '', ket_thuc_nk: '', trang_thai: true });
    } catch (err) {
      console.error(err);
      if (err.status === 400 && err.body?.message?.includes('Mã giảng viên')) {
        toast.error('Mã giảng viên đã tồn tại. Vui lòng sử dụng mã giảng viên khác');
      } else {
        toast.error(err?.body?.message || 'Có lỗi xảy ra');
      }
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      ma_sinh_vien: item.ma_sinh_vien,
      bat_dau_nk: item.bat_dau_nk ? item.bat_dau_nk.split('T')[0] : '',
      ket_thuc_nk: item.ket_thuc_nk ? item.ket_thuc_nk.split('T')[0] : '',
      trang_thai: item.trang_thai === 1 || item.trang_thai === true
    });
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setConfirm({
      isOpen: true,
      title: 'Xóa CBL',
      message: `Bạn chắc chắn muốn xóa CBL ${item.ma_sinh_vien}?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteCanBoLop(item.ma_sinh_vien);
          await refresh();
          toast.success('Xóa CBL thành công');
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

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Quản lý Cán bộ lớp</h1>
        <button
          onClick={() => { setShowModal(true); setEditing(null); setForm({ ma_sinh_vien: '', bat_dau_nk: '', ket_thuc_nk: '', trang_thai: true }); }}
          className="px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: config.accent_color }}
        >
          Thêm CBL
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinh viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bắt đầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết thúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {list.map((it, idx) => (
                <tr key={it.ma_sinh_vien} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{(sinhVienList.find(s => s.ma_sinh_vien === it.ma_sinh_vien) || {}).ho_ten || it.ma_sinh_vien}</div>
                    <div className="text-xs text-gray-500">ID: {it.ma_sinh_vien}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.bat_dau_nk ? new Date(it.bat_dau_nk).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.ket_thuc_nk ? new Date(it.ket_thuc_nk).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${it.trang_thai === 1 || it.trang_thai === true ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {it.trang_thai === 1 || it.trang_thai === true ? 'Đang nhiệm' : 'Tiền nhiệm'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(it)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                    <button onClick={() => handleDelete(it)} className="text-red-600 hover:text-red-900">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Sửa CBL' : 'Thêm CBL'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sinh viên *</label>
            <select required value={form.ma_sinh_vien} onChange={(e) => setForm({ ...form, ma_sinh_vien: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Chọn sinh viên</option>
              {sinhVienList.map(sv => <option key={sv.ma_sinh_vien} value={sv.ma_sinh_vien}>{sv.ho_ten} ({sv.ma_sinh_vien})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu nhiệm kỳ *</label>
            <input required type="date" value={form.bat_dau_nk} onChange={(e) => setForm({ ...form, bat_dau_nk: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc nhiệm kỳ</label>
            <input type="date" value={form.ket_thuc_nk} onChange={(e) => setForm({ ...form, ket_thuc_nk: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select value={form.trang_thai ? 'true' : 'false'} onChange={(e) => setForm({ ...form, trang_thai: e.target.value === 'true' })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="true">Đang nhiệm</option>
              <option value="false">Tiền nhiệm</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-white rounded-md" style={{ backgroundColor: config.accent_color }}>
              {loading ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm CBL')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
