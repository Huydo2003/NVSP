import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import Modal from './Modal';
import { fetchOrganizerLevels, createOrganizerLevel, updateOrganizerLevel, deleteOrganizerLevel } from '../services/organizerLevels';

export default function OrganizerLevelManagement() {
  const { state } = useApp();
  const { config } = state;
  const [levels, setLevels] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ Id_CapBan: '', tenCapBan: '' });

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const data = await fetchOrganizerLevels();
      setLevels(data || []);
    } catch (err) {
      console.error('Lỗi tải cấp ban tổ chức:', err);
      alert('Không thể tải danh sách cấp ban tổ chức');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ Id_CapBan: '', tenCapBan: '' });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ Id_CapBan: t.Id_CapBan || '', tenCapBan: t.tenCapBan || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        await updateOrganizerLevel(editing.Id_CapBan, { tenCapBan: form.tenCapBan });
        setLevels(prev => prev.map(p => p.Id_CapBan === editing.Id_CapBan ? { ...p, tenCapBan: form.tenCapBan } : p));
        alert('Cập nhật cấp ban tổ chức thành công');
      } else {
        const newLevel = await createOrganizerLevel({ tenCapBan: form.tenCapBan });
        setLevels(prev => [newLevel, ...prev]);
        alert('Tạo cấp ban tổ chức thành công');
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cấp ban tổ chức này?')) return;
    try {
      setLoading(true);
      await deleteOrganizerLevel(t.Id_CapBan);
      setLevels(prev => prev.filter(p => p.Id_CapBan !== t.Id_CapBan));
      alert('Xóa cấp ban tổ chức thành công');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: config.text_color }}>
          Cấp Ban Tổ Chức
        </h1>
        <button onClick={openCreate} className="px-4 py-2 text-white rounded-md hover:opacity-90" style={{ backgroundColor: config.primary_color }}>
          + Thêm cấp ban
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Cấp Ban</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Đang tải...</td></tr>
              ) : levels.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Chưa có cấp ban tổ chức nào</td></tr>
              ) : (
                levels.map((t, idx) => (
                  <tr key={t.Id_CapBan} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.Id_CapBan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.tenCapBan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => openEdit(t)} className="text-indigo-600 hover:text-indigo-900 hover:underline">Sửa</button>
                      <button onClick={() => handleDelete(t)} className="text-red-600 hover:text-red-900 hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Chỉnh sửa cấp ban' : 'Thêm cấp ban mới'}>
        <form onSubmit={handleSave} className="space-y-4">
          {editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Cấp Ban</label>
              <input type="text" disabled value={form.Id_CapBan} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Cấp Ban *</label>
            <input required value={form.tenCapBan} onChange={e => setForm({ ...form, tenCapBan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nhập tên cấp ban" />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading} style={{ backgroundColor: config.primary_color }} className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50">{loading ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
