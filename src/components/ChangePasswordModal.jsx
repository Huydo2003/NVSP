import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { changePassword } from '../services/users';

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

  const handleClose = () => {
    // If user must change password (first-login non-admin), prevent closing
    if (user && user.mustChangePassword) {
      toast.error('Bạn phải đổi mật khẩu trước khi tiếp tục');
      return;
    }
    onClose && onClose();
  };

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
      await changePassword(user.id || user.Id, form.currentPassword, form.newPassword);

      // Notify parent to refresh user info
      if (onPasswordChanged) await onPasswordChanged();

      toast.success('Đổi mật khẩu thành công');
      // close modal if allowed
      if (!(user && user.mustChangePassword)) {
        onClose && onClose();
      }
    } catch (err) {
      console.error('Change password error', err);
      const msg = err && err.body && err.body.message ? err.body.message : (err && err.message ? err.message : 'Có lỗi khi đổi mật khẩu');
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yêu cầu đổi mật khẩu" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{user && user.mustChangePassword ? 'Tài khoản của bạn được tạo bởi quản trị viên. Bạn phải đổi mật khẩu lần đầu để tiếp tục.' : 'Hệ thống yêu cầu bạn đổi mật khẩu. Bạn có thể đóng form và tiếp tục nếu không muốn đổi ngay.'}</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập mật khẩu hiện tại (nếu có)"
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={loading || (user && user.mustChangePassword)}
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
