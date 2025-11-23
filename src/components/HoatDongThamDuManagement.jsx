/**
 * HoatDongThamDuManagement.jsx - Quản lý Hoạt Động Tham Dự
 * * Chức năng:
 * - Xem danh sách Hoạt Động Tham Dự
 * - Thêm Hoạt Động Tham Dự mới
 * - Sửa thông tin Hoạt Động Tham Dự
 * - Xóa Hoạt Động Tham Dự
 */
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { fetchHoatDongThamDu, createHoatDongThamDu, updateHoatDongThamDu, deleteHoatDongThamDu } from '../services/hoat-dong-tham-du';
import { fetchHoatDong } from '../services/hoat-dong';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
import { useApp } from '../hooks/useApp';

export default function HoatDongThamDuManagement() {
    // ----------------- STATES -----------------
    const [list, setList] = useState([]);
    const [hoatdongList, setHoatDongList] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Modal chính (Thêm/Sửa Hoạt Động Tham Dự)
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // Hoạt Động Tham Dự đang được sửa
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id_hd_tham_du: '',
        id_hd: '',
        ten_hd: ''
    });

    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Đồng ý', cancelText: 'Hủy' });

    const { state } = useApp();
    const { config } = state;
    // ----------------- END STATES -----------------

    // ----------------- DATA FETCHING -----------------
    const refreshData = async () => {
        try {
            const [hdList, hoatDongData] = await Promise.all([
                fetchHoatDongThamDu(),
                fetchHoatDong()
            ]);

            setList(Array.isArray(hdList) ? hdList : []);
            setHoatDongList(Array.isArray(hoatDongData) ? hoatDongData : []);
        } catch (err) {
            console.error('refreshData error:', err);
            toast.error('Không thể tải dữ liệu');
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (mounted) {
                    await refreshData();
                }
            } catch (err) {
                console.error('[HoatDongThamDuManagement] refreshData error', err);
            }
        })();
        return () => { mounted = false; };
    }, []);
    // ----------------- END DATA FETCHING -----------------

    // ----------------- HANDLERS HOẠT ĐỘNG THam Dự (CRUD) -----------------
    async function handleSubmit(e) {
        e?.preventDefault();

        // Validation before setting loading to avoid stuck loading state
        if (!formData.ten_hd) {
            toast.error('Tên hoạt động tham dự không được để trống');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                id_hd_tham_du: formData.id_hd_tham_du || null,
                ten_hd: formData.ten_hd || null,
                id_hd: formData.id_hd || null
            };

            if (editing) {
                await updateHoatDongThamDu(editing.id_hd_tham_du, payload);
                toast.success('Cập nhật hoạt động tham dự thành công');
            } else {
                await createHoatDongThamDu(payload);
                toast.success('Tạo hoạt động tham dự thành công');
            }

            setShowModal(false);
            setEditing(null);
            setFormData({ id_hd_tham_du: '', id_hd: '', ten_hd: '' });
            await refreshData();
        } catch (err) {
            console.error('Submit error:', err);
            toast.error((err && err.message) || 'Có lỗi xảy ra khi lưu');
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = (item) => {
        setEditing(item);

        setFormData({
            id_hd_tham_du: item.id_hd_tham_du || '',
            id_hd: item.id_hd || '',
            ten_hd: item.ten_hd || ''
        });
        setShowModal(true);
    };

    const handleDelete = (item) => {
        setConfirm({
            isOpen: true,
            title: 'Xóa Hoạt Động Tham Dự',
            message: `Bạn có chắc chắn muốn xóa hoạt động tham Dự "${item.ten_hd}"? Đây là thao tác không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await deleteHoatDongThamDu(item.id_hd_tham_du);
                    toast.success('Đã xóa hoạt động tham Dự');
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
    // ----------------- END HANDLERS HOẠT ĐỘNG THam Dự -----------------

    // ----------------- HELPERS & RENDER LOGIC -----------------
    const totalPages = Math.ceil(list.length / itemsPerPage);
    const displayedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getHoatDongName = (id) => {
        return hoatdongList.find(s => s.id_hd === id)?.ten_hd || 'N/A';
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

            {/* ------------------- BẢNG DANH SÁCH HOẠT ĐỘNG THam Dự ------------------- */}
            <>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Quản lý Hoạt Động Tham Dự</h1>
                    <button
                        onClick={() => {
                            setShowModal(true);
                            setEditing(null);
                            setFormData({
                                id_hd_tham_du: '',
                                id_hd: '',
                                ten_hd: ''
                            });
                        }}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: config.accent_color }}
                    >
                        <span className="font-semibold">+ Thêm Hoạt Động Tham Dự</span>
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Hoạt Động</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Hoạt Động Tham Dự</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời Gian Bắt Đầu</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời Gian Kết Thúc</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa Điểm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedList.map((item, idx) => (
                                    <tr key={item.id_hd_tham_du} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(page - 1) * itemsPerPage + idx + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{getHoatDongName(item.id_hd)}</div>
                                            <div className="text-xs text-gray-500">ID: {item.id_hd}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ten_hd}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.tg_bat_dau ? new Date(item.tg_bat_dau).toLocaleString('vi-VN') : '—'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.tg_ket_thuc ? new Date(item.tg_ket_thuc).toLocaleString('vi-VN') : '—'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.dia_diem || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                                            <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {list.length === 0 && (
                            <div className="text-center py-8 text-gray-500">Chưa có Hoạt Động Tham Dự nào</div>
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

            {/* ------------------- MODAL THÊM/SỬA HOẠT ĐỘNG THam Dự ------------------- */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditing(null);
                    setFormData({ id_hd: '', ten_hd: '' });
                }}
                title={editing ? 'Sửa Hoạt Động Tham Dự' : 'Thêm Hoạt Động Tham Dự Mới'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Hoạt Động */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt Động *</label>
                        <select
                            required
                            value={formData.id_hd}
                            onChange={(e) => setFormData({ ...formData, id_hd: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">-- Chọn Hoạt Động --</option>
                            {hoatdongList.map(hd => (
                                <option key={hd.id_hd} value={hd.id_hd}>{hd.ten_hd}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên hoạt động tham dự *</label>
                        <input
                            type="text"
                            required
                            value={formData.ten_hd}
                            onChange={e => setFormData({ ...formData, ten_hd: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
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
                            {loading ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm Hoạt Động Tham Dự')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}