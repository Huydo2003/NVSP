/**
 * HoatDongManagement.jsx - Quản lý Hoạt Động
 * * Chức năng:
 * - Xem danh sách Hoạt Động
 * - Thêm Hoạt Động mới
 * - Sửa thông tin Hoạt Động
 * - Xóa Hoạt Động
 */
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { fetchHoatDong, createHoatDong, updateHoatDong, deleteHoatDong } from '../services/hoat-dong';
import { fetchSuKien } from '../services/su-kien';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
import { useApp } from '../hooks/useApp';
import { apiFetch } from '../services/api';

export default function HoatDongManagement() {
    // ----------------- STATES -----------------
    const [list, setList] = useState([]);
    const [suKienList, setSuKienList] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Modal chính (Thêm/Sửa Hoạt Động)
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // Hoạt Động đang được sửa
    const [loading, setLoading] = useState(false);
    const [isBtc, setIsBtc] = useState(false);

    const [formData, setFormData] = useState({
        id_hd: '',
        ten_hd: '',
        loai_hd: '',
        tg_bat_dau: '',
        tg_ket_thuc: '',
        dia_diem: '',
        id_sk: ''
    });

    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Đồng ý', cancelText: 'Hủy' });

    const { state } = useApp();
    const { config } = state;
    // ----------------- END STATES -----------------

    // ----------------- DATA FETCHING -----------------
    const refreshData = async () => {
        try {
            const [hdList, suKienData] = await Promise.all([
                fetchHoatDong(),
                fetchSuKien()
            ]);

            setList(Array.isArray(hdList) ? hdList : []);
            setSuKienList(Array.isArray(suKienData) ? suKienData : []);
        } catch (err) {
            console.error('refreshData error:', err);
            toast.error('Không thể tải dữ liệu');
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Check if user is BTC
                const res = await apiFetch('/api/me/is_btc');
                if (mounted) {
                    const btcStatus = res?.isBtc || false;
                    setIsBtc(btcStatus);

                    if (btcStatus) {
                        await refreshData();
                    }
                }
            } catch (err) {
                console.error('[HoatDongManagement] Check BTC error', err);
                if (mounted) {
                    setIsBtc(false);
                }
            }
        })();
        return () => { mounted = false; };
    }, []);
    // ----------------- END DATA FETCHING -----------------

    // ----------------- HANDLERS HOẠT ĐỘNG (CRUD) -----------------
    async function handleSubmit(e) {
        e?.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.ten_hd) return toast.error('Tên hoạt động không được để trống');
            if (!formData.id_sk) return toast.error('Sự kiện không được để trống');
            if (!formData.loai_hd) return toast.error('Loại hoạt động không được để trống');
            if (!formData.tg_bat_dau) return toast.error('Thời gian bắt đầu không được để trống');
            if (!formData.tg_ket_thuc) return toast.error('Thời gian kết thúc không được để trống');
            if (!formData.dia_diem) return toast.error('Địa điểm không được để trống');

            const payload = {
                ...formData,
            };

            if (editing) {
                await updateHoatDong(editing.id_hd, payload);
                toast.success('Cập nhật hoạt động thành công');
            } else {
                await createHoatDong(payload);
                toast.success('Tạo hoạt động thành công');
            }

            setShowModal(false);
            setEditing(null);
            setFormData({ id_hd: '', ten_hd: '', loai_hd: '', tg_bat_dau: '', tg_ket_thuc: '', dia_diem: '', id_sk: '' });
            await refreshData();
        } catch (err) {
            console.error(err);
            if (err.status === 400 && err.body?.message?.includes('Tên hoạt động')) {
                toast.error('Tên hoạt động đã tồn tại trong sự kiện này. Vui lòng sử dụng Tên hoạt động khác hoặc chọn sự kiện khác');
            } else {
                toast.error(editing ? 'Cập nhật hoạt động thất bại' : 'Tạo hoạt động thất bại');
            }
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = (item) => {
        setEditing(item);
        // Format datetime-local input YYYY-MM-DDTHH:mm
        const formatDateTime = (dateString) => dateString ? dateString.slice(0, 16) : '';

        setFormData({
            id_hd: item.id_hd || '',
            ten_hd: item.ten_hd || '',
            loai_hd: item.loai_hd || '',
            tg_bat_dau: formatDateTime(item.tg_bat_dau),
            tg_ket_thuc: formatDateTime(item.tg_ket_thuc),
            dia_diem: item.dia_diem || '',
            id_sk: item.id_sk || ''
        });
        setShowModal(true);
    };

    const handleDelete = (item) => {
        setConfirm({
            isOpen: true,
            title: 'Xóa Hoạt Động',
            message: `Bạn có chắc chắn muốn xóa hoạt động "${item.ten_hd}"? Đây là thao tác không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await deleteHoatDong(item.id_hd);
                    toast.success('Đã xóa hoạt động');
                    await refreshData();
                } catch (err) {
                    console.error('Delete error:', err);
                    toast.error((err && err.message) || 'Có lỗi xảy ra khi xóa!');
                } finally {
                    setLoading(false);
                    setConfirm({ ...confirm, isOpen: false, onConfirm: null });
                }
            }
        });
    };
    // ----------------- END HANDLERS HOẠT ĐỘNG -----------------

    // ----------------- HELPERS & RENDER LOGIC -----------------
    const totalPages = Math.ceil(list.length / itemsPerPage);
    const displayedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getSuKienName = (id) => {
        return suKienList.find(s => s.id_sk === id)?.ten_sk || 'N/A';
    };

    const formatDateTime = (isoDate) => {
        if (!isoDate) return '-';
        try {
            return new Date(isoDate).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (e) {
            return isoDate;
        }
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

            {!isBtc && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-yellow-700 font-medium">⚠️ **Bạn không có quyền truy cập phần này**</p>
                    <p className="text-yellow-600 text-sm">Chỉ **Ban Tổ Chức (BTC)** mới có thể quản lý Hoạt động</p>
                </div>
            )}

            {/* ------------------- BẢNG DANH SÁCH HOẠT ĐỘNG ------------------- */}
            {isBtc && (
                <>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Quản lý Hoạt Động</h1>
                        <button
                            onClick={() => {
                                setShowModal(true);
                                setEditing(null);
                                setFormData({
                                    id_hd: '',
                                    ten_hd: '',
                                    loai_hd: '',
                                    tg_bat_dau: '',
                                    tg_ket_thuc: '',
                                    dia_diem: '',
                                    id_sk: ''
                                });
                            }}
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: config.accent_color }}
                        >
                            <span className="font-semibold">+ Thêm Hoạt Động</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Hoạt Động</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại Hoạt Động</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bắt Đầu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết Thúc</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa Điểm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sự Kiện</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {displayedList.map((item, idx) => (
                                        <tr key={item.id_hd} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(page - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.ten_hd}</div>
                                                <div className="text-xs text-gray-500">ID: {item.id_hd}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.loai_hd}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(item.tg_bat_dau)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(item.tg_ket_thuc)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dia_diem}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getSuKienName(item.id_sk)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                                                <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {list.length === 0 && (
                                <div className="text-center py-8 text-gray-500">Chưa có Hoạt Động nào</div>
                            )}

                            {/* Pagination controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center space-x-3 py-4">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                                    {Array.from({ length: totalPages }).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPage(idx + 1)}
                                            className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                            style={page === idx + 1 ? { backgroundColor: config.accent_color } : {}}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ------------------- MODAL THÊM/SỬA HOẠT ĐỘNG ------------------- */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditing(null);
                    setFormData({ id_hd: '', ten_hd: '', loai_hd: '', tg_bat_dau: '', tg_ket_thuc: '', dia_diem: '', id_sk: '' });
                }}
                title={editing ? 'Sửa Hoạt Động' : 'Thêm Hoạt Động Mới'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Tên Hoạt Động */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Hoạt Động *</label>
                        <input
                            type="text"
                            required
                            value={formData.ten_hd}
                            onChange={(e) => setFormData({ ...formData, ten_hd: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập tên Hoạt động"
                        />
                    </div>

                    {/* Sự Kiện & Rubric */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sự Kiện *</label>
                            <select
                                required
                                value={formData.id_sk}
                                onChange={(e) => setFormData({ ...formData, id_sk: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">-- Chọn Sự kiện --</option>
                                {suKienList.map(sk => (
                                    <option key={sk.id_sk} value={sk.id_sk}>{sk.ten_sk}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Hình Thức (Đã thay đổi thành SELECT) & Địa Điểm */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* TRƯỜNG HÌNH THỨC ĐÃ THAY ĐỔI */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hình Thức *</label>
                            <select
                                required
                                value={formData.loai_hd}
                                onChange={(e) => setFormData({ ...formData, loai_hd: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">-- Chọn hình thức --</option>
                                <option value="Thi">Thi</option>
                                <option value="Tọa Đàm">Tọa Đàm</option>
                            </select>
                        </div>
                        {/* KẾT THÚC TRƯỜNG HÌNH THỨC */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa Điểm *</label>
                            <input
                                type="text"
                                required
                                value={formData.dia_diem}
                                onChange={(e) => setFormData({ ...formData, dia_diem: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Nhập địa điểm"
                            />
                        </div>
                    </div>

                    {/* Thời Gian Bắt Đầu & Kết Thúc */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian Bắt Đầu *</label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.tg_bat_dau}
                                onChange={(e) => setFormData({ ...formData, tg_bat_dau: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian Kết Thúc *</label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.tg_ket_thuc}
                                onChange={(e) => setFormData({ ...formData, tg_ket_thuc: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Nút Submit */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-white rounded-md disabled:opacity-50 hover:opacity-90"
                            style={{ backgroundColor: config.accent_color }}
                        >
                            {loading ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm Hoạt Động')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}