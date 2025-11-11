import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { updateUser } from '../services/users';
import { fetchMe } from '../services/auth';

export default function ChangePasswordModal({ isOpen, onClose, user, onPasswordChanged }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.newPassword || form.newPassword.length < 6) {
      toast.error('Mật khẩu mới cần ít nhất 6 ký tự');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      // call updateUser; include currentPassword to allow server-side verification if implemented
      await updateUser(user.id || user.Id, { password: form.newPassword, currentPassword: form.currentPassword });

      // refresh user info
      try {
        const me = await fetchMe();
        if (me) {
          localStorage.setItem('nvsp_user', JSON.stringify(me));
          if (onPasswordChanged) onPasswordChanged(me);
        }
      } catch (err) {
        // ignore
      }

      toast.success('Đổi mật khẩu thành công');
      onClose();
    } catch (err) {
      console.error('Change password error', err);
      toast.error((err && err.body && err.body.message) ? err.body.message : 'Có lỗi khi đổi mật khẩu');
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yêu cầu đổi mật khẩu" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Hệ thống yêu cầu bạn đổi mật khẩu ngay sau khi đăng nhập (trừ tài khoản admin). Bạn có thể đóng form và tiếp tục nếu không muốn đổi ngay.</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập mật khẩu hiện tại (tùy chọn)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập mật khẩu mới"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            Đóng và tiếp tục
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-white rounded-md disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent-color, #4F46E5)' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
