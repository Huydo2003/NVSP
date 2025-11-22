/**
 * HoatDongThiManagement.jsx - Quản lý Hoạt Động Thi
 * * Chức năng:
 * - Xem danh sách Hoạt Động Thi
 * - Thêm Hoạt Động Thi mới
 * - Sửa thông tin Hoạt Động Thi
 * - Xóa Hoạt Động Thi
 */
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { fetchHoatDongThi, createHoatDongThi, updateHoatDongThi, deleteHoatDongThi } from '../services/hoat-dong-thi';
import { fetchHoatDong } from '../services/hoat-dong';
import { fetchRubric } from '../services/rubric';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
import { useApp } from '../hooks/useApp';
import { apiFetch } from '../services/api';

export default function HoatDongThiManagement() {
    // ----------------- STATES -----------------
    const [list, setList] = useState([]);
    const [hoatdongList, setHoatDongList] = useState([]);
    const [rubricList, setRubricList] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Modal chính (Thêm/Sửa Hoạt Động Thi)
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // Hoạt Động Thi đang được sửa
    const [loading, setLoading] = useState(false);
    const [isBtc, setIsBtc] = useState(false);

    const [formData, setFormData] = useState({
        id_hd: '',
        id_rubric: '',
        hinh_thuc: '', // Sẽ là 'Cá nhân' hoặc 'Nhóm'
        so_luong_tv: ''
    });

    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Đồng ý', cancelText: 'Hủy' });

    const { state } = useApp();
    const { config } = state;
    // ----------------- END STATES -----------------

    // ----------------- DATA FETCHING -----------------
    const refreshData = async () => {
        try {
            const [hdList, rubricData, hoatDongData] = await Promise.all([
                fetchHoatDongThi(),
                fetchRubric(),
                fetchHoatDong()
            ]);

            setList(Array.isArray(hdList) ? hdList : []);
            setRubricList(Array.isArray(rubricData) ? rubricData : []);
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
                console.error('[HoatDongThiManagement] Check BTC error', err);
                if (mounted) {
                    setIsBtc(false);
                }
            }
        })();
        return () => { mounted = false; };
    }, []);
    // ----------------- END DATA FETCHING -----------------

    // ----------------- HANDLERS HOẠT ĐỘNG THI (CRUD) -----------------
    async function handleSubmit(e) {
        e?.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.hinh_thuc) return toast.error('Hình thức không được để trống');
            if (!formData.so_luong_tv) return toast.error('Số lượng thành viên không được để trống');

            const payload = {
                ...formData,
                id_rubric: formData.id_rubric || null,
                id_hd: formData.id_hd || null
            };

            if (editing) {
                await updateHoatDongThi(editing.id_hd, payload);
                toast.success('Cập nhật hoạt động thi thành công');
            } else {
                await createHoatDongThi(payload);
                toast.success('Tạo hoạt động thi thành công');
            }

            setShowModal(false);
            setEditing(null);
            setFormData({ id_hd: '', id_rubric: '', hinh_thuc: '', so_luong_tv: '' });
            await refreshData();
        } catch (err) {
            console.error('Submit error:', err);
            if (err.status === 400 && err.body?.message?.includes('Hoạt động')) {
                toast.error('Hoạt động đã tồn tại. Vui lòng sử dụng Hoạt động khác');
            } else {
                toast.error(editing ? 'Cập nhật hoạt động thất bại' : 'Tạo hoạt động thất bại');
            }
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = (item) => {
        setEditing(item);

        setFormData({
            id_hd: item.id_hd || '',
            id_rubric: item.id_rubric || '',
            hinh_thuc: item.hinh_thuc || '',
            so_luong_tv: item.so_luong_tv || ''
        });
        setShowModal(true);
    };

    const handleDelete = (item) => {
        setConfirm({
            isOpen: true,
            title: 'Xóa Hoạt Động Thi',
            message: `Bạn có chắc chắn muốn xóa hoạt động thi "${item.ten_hd}"? Đây là thao tác không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await deleteHoatDongThi(item.id_hd);
                    toast.success('Đã xóa hoạt động thi');
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
    // ----------------- END HANDLERS HOẠT ĐỘNG THI -----------------

    // ----------------- HELPERS & RENDER LOGIC -----------------
    const totalPages = Math.ceil(list.length / itemsPerPage);
    const displayedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getRubricName = (id) => {
        return rubricList.find(r => r.id_rubric === id)?.ten_rubric || 'N/A';
    };

    const getHoatDonggName = (id) => {
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

            {!isBtc && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-yellow-700 font-medium">⚠️ **Bạn không có quyền truy cập phần này**</p>
                    <p className="text-yellow-600 text-sm">Chỉ **Ban Tổ Chức (BTC)** mới có thể quản lý Hoạt động thi</p>
                </div>
            )}

            {/* ------------------- BẢNG DANH SÁCH HOẠT ĐỘNG THI ------------------- */}
            {isBtc && (
                <>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Quản lý Hoạt Động Thi</h1>
                        <button
                            onClick={() => {
                                setShowModal(true);
                                setEditing(null);
                                setFormData({
                                    id_hd: '',
                                    id_rubric: '',
                                    hinh_thuc: '',
                                    so_luong_tv: ''
                                });
                            }}
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: config.accent_color }}
                        >
                            <span className="font-semibold">+ Thêm Hoạt Động Thi</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Hoạt Động Thi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rubric Đánh Giá</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình Thức</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Lượng Thành Viên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {displayedList.map((item, idx) => (
                                        <tr key={item.id_hd} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(page - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{getHoatDonggName(item.id_hd)}</div>
                                                <div className="text-xs text-gray-500">ID: {item.id_hd}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{getRubricName(item.id_rubric)}</div>
                                                <div className="text-xs text-gray-500">ID: {item.id_rubric}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.hinh_thuc}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.so_luong_tv}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                                                <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {list.length === 0 && (
                                <div className="text-center py-8 text-gray-500">Chưa có Hoạt Động Thi nào</div>
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

            {/* ------------------- MODAL THÊM/SỬA HOẠT ĐỘNG THI ------------------- */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditing(null);
                    setFormData({ id_hd: '', id_rubric: '', hinh_thuc: '', so_luong_tv: '' });
                }}
                title={editing ? 'Sửa Hoạt Động Thi' : 'Thêm Hoạt Động Thi Mới'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Hoạt Động & Rubric */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt Động *</label>
                            <select
                                required
                                value={formData.id_hd}
                                onChange={(e) => setFormData({ ...formData, id_hd: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">-- Chọn Hoạt Động --</option>
                                {hoatdongList.map(sk => (
                                    <option key={sk.id_hd} value={sk.id_hd}>{sk.ten_hd}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rubric Đánh Giá</label>
                            <select
                                value={formData.id_rubric}
                                onChange={(e) => setFormData({ ...formData, id_rubric: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">-- Không chọn Rubric --</option>
                                {rubricList.map(rb => (
                                    <option key={rb.id_rubric} value={rb.id_rubric}>{rb.ten_rubric}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Hình Thức & Số lượng thành viên */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hình Thức *</label>
                            <select
                                required
                                value={formData.hinh_thuc}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    setFormData(prev => ({
                                        ...prev,
                                        hinh_thuc: val,
                                        // Nếu chọn Cá nhân thì auto đặt 1 thành viên
                                        so_luong_tv: val === "Cá nhân" ? 1 : prev.so_luong_tv
                                    }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">-- Chọn hình thức --</option>
                                <option value="Cá nhân">Cá nhân</option>
                                <option value="Nhóm">Nhóm</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng thành viên *</label>
                            <input
                                type="number"
                                min={formData.hinh_thuc === 'Nhóm' ? 2 : 1}
                                value={formData.so_luong_tv}
                                onChange={(e) => setFormData({ ...formData, so_luong_tv: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                                disabled={formData.hinh_thuc === 'Cá nhân'}
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
                            {loading ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm Hoạt Động Thi')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}