import { useApp } from '../hooks/useApp';
import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

export default function Navigation({ activeTab, setActiveTab, user, onLogout }) {
  const { state } = useApp();
  const { config } = state;

  const [isBcn, setIsBcn] = useState(false);
  const [isBtc, setIsBtc] = useState(false);
  const [isCbl, setIsCbl] = useState(false);
  const [isBgk, setIsBgk] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!user) return;

      try {
        const [resBcn, resBtc, resCbl, resBgk] = await Promise.all([
          apiFetch('/api/me/is_bcn'),
          apiFetch('/api/me/is_btc'),
          apiFetch('/api/me/is_cbl'),
          apiFetch('/api/me/is_bgk')
        ]);

        if (!mounted) return;

        setIsBcn(!!resBcn?.isBcn);
        setIsBtc(!!resBtc?.isBtc);
        setIsCbl(!!resCbl?.isCbl);
        setIsBgk(!!resBgk?.isBgk);

      } catch (err) {
        setIsBcn(false);
        setIsBtc(false);
        setIsCbl(false);
        setIsBgk(false);
      }
    })();

    return () => (mounted = false);
  }, [user]);

  // ---------------- MENU GROUPS -------------------
  const groupBox = (label, items = []) => {
    if (!items.length) return null;

    return (
      <div className="mb-4">
        <p className="font-bold text-sm mb-2 opacity-80">{label}</p>
        <ul className="ml-2 space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3 py-2 rounded transition 
                  ${activeTab === item.id
                    ? 'bg-green-900 text-white font-semibold'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const accountGroup = [
    { id: 'account', label: 'Tài khoản' }
  ];

  const adminGroup = [
    { id: 'users', label: 'Quản lý người dùng' },
    { id: 'giang_vien', label: 'Quản lý giảng viên' },
    { id: 'sinh_vien', label: 'Quản lý sinh viên' },
    { id: 'bcn_khoa', label: 'Quản lý BCN Khoa' }
  ];

  const bcnGroup = isBcn
    ? [
        { id: 'ban_to_chuc', label: 'Quản lý Ban tổ chức' },
        { id: 'can_bo_lop', label: 'Quản lý Cán bộ lớp' }
      ]
    : [];

  const btcGroup = isBtc
    ? [
        { id: 'ds_rubrics', label: 'Quản lý Rubric' },
        { id: 'su_kien', label: 'Quản lý Sự kiện' },
        { id: 'hoat_dong', label: 'Quản lý Hoạt Động' },
        { id: 'hoat_dong_thi', label: 'Quản lý Hoạt Động Thi' },
        { id: 'ban_giam_khao', label: 'Quản lý Ban Giám Khảo' },
        { id: 'hoat_dong_tham_du', label: 'Quản lý HĐ Tham Dự' },
        { id: 'hoat_dong_ho_tro', label: 'Quản lý HĐ Hỗ Trợ' },
        { id: 'quan_ly_diem_danh', label: 'Quản lý Điểm Danh' },
        { id: 'ket_qua', label: 'Quản lý Kết Quả' },
      ]
    : [];

  const bgkGroup = isBgk
    ? [{ id: 'cham_diem', label: 'Chấm Điểm' }]
    : [];

  const studentGroup =
    String(user?.role).toLowerCase().includes('sinh')
      ? isCbl
        ? [
            { id: 'dang_ky_thi_btc', label: 'Quản Lý Đăng Ký Thi' },
            { id: 'dki_tham_du_approval', label: 'Quản Lý Đăng Ký Tham Dự' }
          ]
        : [
            { id: 'dang_ky_thi', label: 'Đăng Ký Thi' },
            { id: 'dki_tham_du', label: 'Đăng Ký Tham Dự' },
            { id: 'diem_danh', label: 'Điểm Danh' }
          ]
      : [];

  return (
    <nav className="gradient-bg text-white w-64 min-h-full p-4 slide-in overflow-y-auto">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold mb-2">{config.system_title}</h1>
        <p className="text-sm opacity-90">{user?.username || user?.name}</p>
        <p className="text-xs">{user?.email}</p>
      </div>

      {/* Always visible menu groups */}
      {groupBox('Tài khoản', accountGroup)}

      {String(user?.role).toLowerCase() === 'admin' &&
        groupBox('Quản trị hệ thống', adminGroup)}

      {groupBox('Ban Chủ Nhiệm', bcnGroup)}
      {groupBox('Ban Tổ Chức', btcGroup)}
      {groupBox('Ban Giám Khảo', bgkGroup)}
      {groupBox('Sinh Viên', studentGroup)}

      <div className="mt-8 pt-4 border-t border-white/20">
        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded bg-red-600 hover:bg-red-800 font-bold"
        >
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
