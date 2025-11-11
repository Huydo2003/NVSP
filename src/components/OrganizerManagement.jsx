import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import Modal from './Modal';
import { fetchOrganizers, createOrganizer, updateOrganizer, deleteOrganizer } from '../services/organizers';
import { fetchOrganizerLevels } from '../services/organizerLevels';

export default function OrganizerManagement() {
  const { state } = useApp();
  const { data, config } = state;
  const [organizers, setOrganizers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ Id_BanToChuc: '', tenBanToChuc: '', Id_CapBan: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apiOrgs, lvls] = await Promise.all([fetchOrganizers(), fetchOrganizerLevels()]);

      // Chuyển dữ liệu API sang format component
      let orgs = apiOrgs && apiOrgs.length
        ? apiOrgs.map(o => ({ Id_BanToChuc: o.id, tenBanToChuc: o.name, Id_CapBan: o.Id_CapBan || '' }))
        : [];

      if (orgs.length === 0) {
        const fromData = data.filter(item => item.type === 'bantochuc' || item.type === 'btc_group' || item.type === 'organization');
        if (fromData.length > 0) {
          orgs = fromData.map(d => ({
            Id_BanToChuc: d.id,
            tenBanToChuc: d.title || d.tenBanToChuc || d.name || '',
            Id_CapBan: d.Id_CapBan || d.cap || ''
          }));
        }
      }

      setOrganizers(orgs || []);
      setLevels(lvls || []);
    } catch (err) {
      console.error('Lỗi tải ban tổ chức hoặc cấp ban:', err);
      alert('Không thể tải dữ liệu ban tổ chức');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ Id_BanToChuc: '', tenBanToChuc: '', Id_CapBan: '' });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ Id_BanToChuc: t.Id_BanToChuc || '', tenBanToChuc: t.tenBanToChuc || '', Id_CapBan: t.Id_CapBan || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        const res = await updateOrganizer(editing.Id_BanToChuc, { tenBanToChuc: form.tenBanToChuc, Id_CapBan: form.Id_CapBan });
        if (res) {
          setOrganizers(prev => prev.map(p => p.Id_BanToChuc === editing.Id_BanToChuc ? { ...p, tenBanToChuc: form.tenBanToChuc, Id_CapBan: form.Id_CapBan } : p));
          alert('Cập nhật ban tổ chức thành công');
        } else {
          const updated = { id: editing.Id_BanToChuc, type: 'bantochuc', tenBanToChuc: form.tenBanToChuc, Id_CapBan: form.Id_CapBan };
          const r = await window.dataSdk.update(updated);
          if (!r.isOk) throw new Error('dataSdk update failed');
          setOrganizers(prev => prev.map(p => p.Id_BanToChuc === updated.id ? { ...p, tenBanToChuc: form.tenBanToChuc, Id_CapBan: form.Id_CapBan } : p));
          alert('Cập nhật ban tổ chức thành công (local)');
        }
      } else {
        const res = await createOrganizer({ tenBanToChuc: form.tenBanToChuc, Id_CapBan: form.Id_CapBan });
        if (res) {
          setOrganizers(prev => [{ Id_BanToChuc: res.id || res.Id_BanToChuc, tenBanToChuc: res.name || res.tenBanToChuc || form.tenBanToChuc, Id_CapBan: res.Id_CapBan || form.Id_CapBan }, ...prev]);
          alert('Tạo ban tổ chức thành công');
        } else {
          const newItem = { id: Date.now().toString(), type: 'bantochuc', tenBanToChuc: form.tenBanToChuc, Id_CapBan: form.Id_CapBan };
          const r = await window.dataSdk.create(newItem);
          if (!r.isOk) throw new Error('dataSdk create failed');
          setOrganizers(prev => [{ Id_BanToChuc: newItem.id, tenBanToChuc: newItem.tenBanToChuc, Id_CapBan: newItem.Id_CapBan }, ...prev]);
          alert('Tạo ban tổ chức thành công (local)');
        }
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa ban tổ chức này?')) return;
    try {
      setLoading(true);
      const res = await deleteOrganizer(t.Id_BanToChuc);
      if (res) {
        setOrganizers(prev => prev.filter(p => p.Id_BanToChuc !== t.Id_BanToChuc));
        alert('Xóa ban tổ chức thành công');
      } else {
        const r = await window.dataSdk.delete({ id: t.Id_BanToChuc, type: 'bantochuc' });
        if (!r.isOk) throw new Error('dataSdk delete failed');
        setOrganizers(prev => prev.filter(p => p.Id_BanToChuc !== t.Id_BanToChuc));
        alert('Xóa ban tổ chức thành công (local)');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa');
    } finally {
      setLoading(false);
    }
  };

  const getLevelName = (id) => {
    const lvl = levels.find(l => String(l.Id_CapBan) === String(id));
    return lvl ? lvl.tenCapBan : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: config.text_color }}>
          Ban Tổ Chức
        </h1>
        <button onClick={openCreate} className="px-4 py-2 text-white rounded-md hover:opacity-90" style={{ backgroundColor: config.primary_color }}>
          + Thêm ban tổ chức
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Ban Tổ Chức</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cấp</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Đang tải...</td></tr>
              ) : organizers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Chưa có ban tổ chức nào</td></tr>
              ) : (
                organizers.map((t, idx) => (
                  <tr key={t.Id_BanToChuc} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.Id_BanToChuc}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.tenBanToChuc}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getLevelName(t.Id_CapBan)}</td>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Chỉnh sửa ban tổ chức' : 'Thêm ban tổ chức mới'}>
        <form onSubmit={handleSave} className="space-y-4">
          {editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Ban Tổ Chức</label>
              <input type="text" disabled value={form.Id_BanToChuc} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Ban Tổ Chức *</label>
            <input required value={form.tenBanToChuc} onChange={e => setForm({ ...form, tenBanToChuc: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nhập tên ban tổ chức" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cấp</label>
            <select value={form.Id_CapBan || ''} onChange={e => setForm({ ...form, Id_CapBan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Chọn cấp</option>
              {levels.map(l => <option key={l.Id_CapBan} value={l.Id_CapBan}>{l.tenCapBan}</option>)}
            </select>
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
