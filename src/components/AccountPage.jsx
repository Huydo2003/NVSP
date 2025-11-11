import { useState } from 'react';
import { updateUser } from '../services/users';
import { fetchMe } from '../services/auth';
import ChangePasswordModal from './ChangePasswordModal';
import toast from 'react-hot-toast';

export default function AccountPage({ user, onUserUpdate }) {
  const [form, setForm] = useState({
    username: user.username || user.name || '',
    email: user.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(user.id || user.Id, { username: form.username, email: form.email });
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

  const handlePasswordChanged = async (me) => {
    // update parent with refreshed user
    try {
      const fresh = me || await fetchMe();
      if (fresh) {
        localStorage.setItem('nvsp_user', JSON.stringify(fresh));
        if (onUserUpdate) onUserUpdate(fresh);
      }
    } catch {}
    setShowPwdModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Thông tin tài khoản</h2>
      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
          <input
            type="text"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">Vai trò: <span className="font-medium text-gray-800">{user.role || user.roleName || 'N/A'}</span></div>
            <div className="text-sm text-gray-500">Ngày tạo: <span className="font-medium text-gray-800">{user.createdAt || ''}</span></div>
          </div>
          <div className="space-x-3">
            <button type="button" onClick={() => setShowPwdModal(true)} className="px-4 py-2 bg-yellow-500 text-white rounded">Đổi mật khẩu</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Đang lưu...' : 'Lưu thông tin'}</button>
          </div>
        </div>
      </form>

      <ChangePasswordModal isOpen={showPwdModal} onClose={() => setShowPwdModal(false)} user={user} onPasswordChanged={handlePasswordChanged} />
    </div>
  );
}
