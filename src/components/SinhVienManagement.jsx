import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import Modal from './Modal';
import { fetchSinhVien, createSinhVien, updateSinhVien, deleteSinhVien } from '../services/sinh-vien';
import { fetchUsers } from '../services/users';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

export default function SinhVienManagement({ user }) {
  const [sinhViens, setSinhViens] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingSinhVien, setEditingSinhVien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ma_sinh_vien: '',
    nien_khoa: '',
    lop: '',
    nganh: '',
    khoa: ''
  });
  const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Xóa', cancelText: 'Hủy' });

  const { state } = useApp();
  const { config } = state;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!user || String(user.role || '').toLowerCase() !== 'admin') {
          if (mounted) {
            setSinhViens([]);
            setUserAccounts([]);
          }
          return;
        }

        const [svList, userList] = await Promise.all([
          fetchSinhVien(),
          fetchUsers()
        ]);

        if (mounted) {
          setSinhViens(Array.isArray(svList) ? svList : []);
          setUserAccounts(Array.isArray(userList) ? userList : []);
        }
      } catch (err) {
        console.error('Failed to load sinh vien or users:', err);
        toast.error('Không thể tải danh sách sinh viên hoặc tài khoản');
        if (mounted) {
          setSinhViens([]);
          setUserAccounts([]);
        }
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  const refreshSinhViens = async () => {
    try {
      const svList = await fetchSinhVien();
      if (svList) setSinhViens(svList);
    } catch (err) {
      console.error('refreshSinhViens error:', err);
    }
  };

  const sinhCandidates = (userAccounts || []).filter(u => {
    const raw = String(u.loai_tk ?? u.role ?? '');
    const lower = raw.toLowerCase();
    return lower.includes('sinh') || lower.includes('sinh viên') || lower.includes('sinhvien');
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user && String(user.role || '').toLowerCase() === 'admin') {
        if (editingSinhVien) {
          const body = {};
          if (formData.nien_khoa !== undefined) body.nien_khoa = formData.nien_khoa || null;
          if (formData.lop !== undefined) body.lop = formData.lop || null;
          if (formData.nganh !== undefined) body.nganh = formData.nganh || null;
          if (formData.khoa !== undefined) body.khoa = formData.khoa || null;

          await updateSinhVien(editingSinhVien.ma_sinh_vien, body);
          await refreshSinhViens();
          toast.success('Cập nhật sinh viên thành công');
        } else {
          if (!formData.ma_sinh_vien) {
            toast.error('Vui lòng chọn sinh viên');
            setLoading(false);
            return;
          }

          const payload = {
            ma_sinh_vien: formData.ma_sinh_vien,
            nien_khoa: formData.nien_khoa || null,
            lop: formData.lop || null,
            nganh: formData.nganh || null,
            khoa: formData.khoa || null
          };

          await createSinhVien(payload);
          await refreshSinhViens();
          toast.success('Thêm sinh viên thành công');
        }
      } else {
        toast.error('Chỉ quản trị viên mới có thể quản lý sinh viên');
      }

      setShowModal(false);
      setEditingSinhVien(null);
      setFormData({ ma_sinh_vien: '', nien_khoa: '', lop: '', nganh: '', khoa: '' });
    } catch (err) {
      console.error('handleSubmit sinh vien error:', err);
      const msg = err?.body?.message || err?.message || 'Có lỗi xảy ra!';
      toast.error(msg);
    }
    setLoading(false);
  };

  const handleEdit = (sv) => {
    setEditingSinhVien(sv);
    setFormData({
      ma_sinh_vien: sv.ma_sinh_vien,
      nien_khoa: sv.nien_khoa || '',
      lop: sv.lop || '',
      nganh: sv.nganh || '',
      khoa: sv.khoa || ''
    });
    setShowModal(true);
  };

  const handleDelete = (sv) => {
    setConfirm({
      isOpen: true,
      title: 'Xóa sinh viên',
      message: `Bạn có chắc chắn muốn xóa sinh viên "${sv.ho_ten}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        setLoading(true);
        try {
          if (user && String(user.role || '').toLowerCase() === 'admin') {
            await deleteSinhVien(sv.ma_sinh_vien);
            await refreshSinhViens();
            toast.success('Đã xóa sinh viên');
          } else {
            toast.error('Chỉ quản trị viên mới có thể xóa sinh viên');
          }
        } catch (err) {
          console.error('Delete sinh vien error:', err);
          toast.error(err?.body?.message || err?.message || 'Có lỗi xảy ra khi xóa sinh viên');
        } finally {
          setLoading(false);
        }
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

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>
          Quản lý sinh viên
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setShowModal(true); setEditingSinhVien(null); setFormData({ ma_sinh_vien: '', nien_khoa: '', lop: '', nganh: '', khoa: '' }); }}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.accent_color }}
          >
            Thêm sinh viên
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niên khóa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngành</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sinhViens.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((sv, idx) => (
                <tr key={sv.ma_sinh_vien} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(page - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sv.ma_sinh_vien}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.ho_ten}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.nien_khoa || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.lop || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.nganh || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.khoa || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(sv)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                    <button onClick={() => handleDelete(sv)} className="text-red-600 hover:text-red-900">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sinhViens.length === 0 && (
            <div className="text-center py-8 text-gray-500">Chưa có sinh viên nào</div>
          )}

          {sinhViens.length > itemsPerPage && (
            <div className="flex items-center justify-center space-x-3 py-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
              {Array.from({ length: Math.ceil(sinhViens.length / itemsPerPage) }).map((_, idx) => (
                <button key={idx} onClick={() => setPage(idx + 1)} className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{idx + 1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(Math.ceil(sinhViens.length / itemsPerPage), p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingSinhVien(null); setFormData({ ma_sinh_vien: '', nien_khoa: '', lop: '', nganh: '', khoa: '' }); }}
        title={editingSinhVien ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sinh viên *</label>
            <select
              required={!editingSinhVien}
              value={formData.ma_sinh_vien}
              onChange={(e) => setFormData({ ...formData, ma_sinh_vien: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!!editingSinhVien}
            >
              <option value="">-- Chọn sinh viên --</option>
              {sinhCandidates.length > 0 ? (
                sinhCandidates.map(u => {
                  const alreadyExists = (sinhViens || []).some(sv => String(sv.ma_sinh_vien) === String(u.ma_ca_nhan));
                  return (
                    <option key={u.ma_ca_nhan} value={u.ma_ca_nhan} disabled={alreadyExists}>
                      {u.ho_ten} ({u.ma_ca_nhan}){alreadyExists ? ' — (Đã đăng ký)' : ''}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>Không có tài khoản Sinh viên khả dụng</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niên khóa</label>
              <input type="text" value={formData.nien_khoa} onChange={(e) => setFormData({ ...formData, nien_khoa: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ví dụ: 2021-2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
              <input type="text" value={formData.lop} onChange={(e) => setFormData({ ...formData, lop: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ví dụ: CNTT1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngành</label>
            <input type="text" value={formData.nganh} onChange={(e) => setFormData({ ...formData, nganh: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Nhập ngành" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoa</label>
            <input type="text" value={formData.khoa} onChange={(e) => setFormData({ ...formData, khoa: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Nhập khoa" />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: config.accent_color }}>{loading ? 'Đang xử lý...' : (editingSinhVien ? 'Cập nhật' : 'Thêm sinh viên')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
