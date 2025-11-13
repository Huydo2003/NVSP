import { useState } from 'react';
import { updateUser } from '../services/users';
import { fetchMe } from '../services/auth';
import ChangePasswordModal from './ChangePasswordModal';
import toast from 'react-hot-toast';

export default function AccountPage({ user, onUserUpdate }) {
  const [form, setForm] = useState({
    ho_ten: user.ho_ten || '',
    email: user.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(user.id, { ho_ten: form.ho_ten, email: form.email });
      // refresh user
      const me = await fetchMe();
      if (me) {
        localStorage.setItem('nvsp_user', JSON.stringify(me));
        if (onUserUpdate) onUserUpdate(me);
      }
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      console.error('Update account error', err);
      toast.error((err && err.body && err.body.message) ? err.body.message : 'Có lỗi khi cập nhật tài khoản');
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handlePasswordChanged = async (me) => {
    // update parent with refreshed user
    try {
      const fresh = me || await fetchMe();
      if (fresh) {
        localStorage.setItem('nvsp_user', JSON.stringify(fresh));
        if (onUserUpdate) onUserUpdate(fresh);
      }
    } catch (err) {
      console.error('Error refreshing user after password change', err);
    }
    setShowPwdModal(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Thông Tin Tài Khoản</h1>

      {/* Read-only Info Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cá nhân</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Mã cá nhân */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã cá nhân</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-900">
              {user.ma_ca_nhan || '—'}
            </div>
          </div>

          {/* Loại tài khoản */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài khoản</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-900">
              {user.role || '—'}
            </div>
          </div>

          {/* Ngày tạo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-900">
              {formatDate(user.created_at) || '—'}
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-900">
              ••••••••
            </div>
          </div>
        </div>
      </div>

      {/* Editable Form Section */}
      <form onSubmit={handleSave} className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Chỉnh sửa thông tin</h2>

        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input
            type="text"
            value={form.ho_ten}
            onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={() => setShowPwdModal(true)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Đổi mật khẩu
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>

      <ChangePasswordModal isOpen={showPwdModal} onClose={() => setShowPwdModal(false)} user={user} onPasswordChanged={handlePasswordChanged} />
    </div>
  );
}
