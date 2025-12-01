/**
 * Navigation.jsx - Menu điều hướng
 * 
 * Chức năng:
 * - Hiển thị menu theo vai trò
 * - Quản lý chuyển trang
 * - Hiển thị thông tin người dùng
 * - Xử lý đăng xuất
 */

import { useApp } from '../hooks/useApp';
import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

export default function Navigation({ activeTab, setActiveTab, user, onLogout }) {
  const { state } = useApp();
  const { config } = state;
  const [isBcn, setIsBcn] = useState(false);
  const [isBtc, setIsBtc] = useState(false);
  const [isCbl, setIsCbl] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!user) {
        if (mounted) {
          setIsBcn(false);
          setIsBtc(false);
        }
        return;
      }

      try {
        console.log('[Navigation] Checking roles for user:', user.ma_ca_nhan);
        
        // Gọi song song cả 3 API để kiểm tra vai trò BCN, BTC và CBL
        const [resBcn, resBtc, resCbl] = await Promise.all([
          apiFetch('/api/me/is_bcn'),
          apiFetch('/api/me/is_btc'),
          apiFetch('/api/me/is_cbl')
        ]);

        console.log('[Navigation] BCN response:', resBcn, 'BTC response:', resBtc, 'CBL response:', resCbl);

        if (mounted) {
          setIsBcn(!!resBcn?.isBcn);
          setIsBtc(!!resBtc?.isBtc);
          setIsCbl(!!resCbl?.isCbl);
        }
      } catch (err) {
        console.error('[Navigation] Error checking roles:', err);
        if (mounted) {
          setIsBcn(false);
          setIsBtc(false);
        }
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  const getMenuItems = () => {
    const items = [
      { id: 'account', label: 'Tài khoản' }
    ];

    const role = String(user.role || '').toLowerCase();

    if (role === 'admin') {
      // Admin sees all management sections
      items.push({ id: 'users', label: 'Quản lý người dùng' });
      items.push({ id: 'giang_vien', label: 'Quản lý giảng viên' });
      items.push({ id: 'sinh_vien', label: 'Quản lý sinh viên' });
      items.push({ id: 'bcn_khoa', label: 'Quản lý BCN Khoa' });
      return items;
    }

    // For lecturers, add items according to active roles
    if (role.includes('giang') || role.includes('giảng')) {
      if (isBcn) {
        items.push({ id: 'ban_to_chuc', label: 'Quản lý Ban tổ chức' });
        items.push({ id: 'can_bo_lop', label: 'Quản lý Cán bộ lớp' });
      }

      if (isBtc) {
        items.push({ id: 'ds_rubrics', label: 'Quản lý Rubric' });
        // sự kiện
        items.push({ id: 'su_kien', label: 'Quản lý Sự kiện' });
        items.push({ id: 'hoat_dong', label: 'Quản lý Hoạt Động' });
        items.push({ id: 'hoat_dong_thi', label: 'Quản lý Hoạt Động Thi' });
        items.push({ id: 'ban_giam_khao', label: 'Quản lý Ban Giám Khảo' });
        items.push({ id: 'hoat_dong_tham_du', label: 'Quản lý HĐ Tham Dự' });
        items.push({ id: 'hoat_dong_ho_tro', label: 'Quản lý HĐ Hỗ Trợ' });
      }
    }
    if (role.includes('sinh')  || role.includes('sinh viên')) {
      // If the student is a class representative (CBL), show the registration management tabs
      if (isCbl) {
        items.push({ id: 'dang_ky_thi_btc', label: 'Quản Lý Đăng Ký Thi' });
        items.push({ id: 'dki_tham_du_approval', label: 'Quản Lý Đăng Ký Tham Dự' });
      } else {
        items.push({ id: 'dang_ky_thi', label: 'Đăng Ký Thi' });
        items.push({ id: 'dki_tham_du', label: 'Đăng Ký Tham Dự' });
        items.push({ id: 'diem_danh', label: 'Điểm Danh' });
      }
    }

    return items;
  };

  return (
    <nav className="gradient-bg text-white w-64 min-h-full p-4 slide-in">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-2">{config.system_title}</h1>
        <div className="text-sm opacity-90">
          <p>{user?.username || user?.name || 'Người dùng'}</p>
          <p className="text-xs">{user?.email}</p>
        </div>
      </div>

      <ul className="space-y-2">
        {getMenuItems().map(item => (
          <li key={item.id}>
            <button
              onClick={() => setActiveTab(item.id)}
              className={`nav-item w-full text-left px-3 py-2 ${activeTab === item.id ? 'active' : ''
                }`}
            >
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-4 border-t border-white/20">
        <button
          onClick={onLogout}
          className="nav-item w-full text-left px-3 py-2 text-white bg-gray-800 hover:bg-black font-bold"
        >
          <span>Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}