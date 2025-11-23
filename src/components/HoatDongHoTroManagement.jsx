import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';
import { useApp } from '../hooks/useApp';
import {
    fetchHoatDongHoTro,
    createHoatDongHoTro,
    updateHoatDongHoTro,
    deleteHoatDongHoTro,
} from '../services/hoat-dong-ho-tro';
import { fetchHoatDong } from '../services/hoat-dong';
import { fetchGiangVien } from '../services/giang-vien';

export default function HoatDongHoTroManagement() {
    const [list, setList] = useState([]);
    const [hoatdongList, setHoatDongList] = useState([]);
    const [giangVienList, setGiangVienList] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id_hd_ho_tro: '',
        ten_hd: '',
        loai_ho_tro: '',
        id_hd: '',
        ma_gv: '',
    });

    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Đồng ý', cancelText: 'Hủy' });

    const { state } = useApp();
    const { config } = state;

    const refreshData = async () => {
        try {
            const [hhtList, hdList, gvList] = await Promise.all([
                fetchHoatDongHoTro(),
                fetchHoatDong(),
                fetchGiangVien(),
            ]);

            setList(Array.isArray(hhtList) ? hhtList : []);
            setHoatDongList(Array.isArray(hdList) ? hdList : []);
            setGiangVienList(Array.isArray(gvList) ? gvList : []);
        } catch (err) {
            console.error('refreshData error:', err);
            toast.error('Không thể tải dữ liệu');
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            await refreshData();
        })();
        return () => { mounted = false; };
    }, []);

    const totalPages = Math.max(1, Math.ceil(list.length / itemsPerPage));
    const displayedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleEdit = (item) => {
        setEditing(item);
        setFormData({
            id_hd_ho_tro: item.id_hd_ho_tro || '',
            ten_hd: item.ten_hd || '',
            loai_ho_tro: item.loai_ho_tro || '',
            id_hd: item.id_hd || '',
            ma_gv: item.ma_gv || '',
        });
        setShowModal(true);
    };

    const handleDelete = (item) => {
        setConfirm({
            isOpen: true,
            title: 'Xóa hoạt động hỗ trợ',
            message: `Bạn có chắc chắn muốn xóa hoạt động hỗ trợ "${item.ten_hd}"?`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await deleteHoatDongHoTro(item.id_hd_ho_tro);
                    toast.success('Đã xóa hoạt động hỗ trợ');
                    await refreshData();
                } catch (err) {
                    console.error('Delete error:', err);
                    toast.error((err && err.message) || 'Có lỗi khi xóa');
                } finally {
                    setLoading(false);
                    setConfirm({ ...confirm, isOpen: false, onConfirm: null });
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();

        if (!formData.ten_hd || !formData.loai_ho_tro || !formData.id_hd || !formData.ma_gv) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ten_hd: formData.ten_hd,
                loai_ho_tro: formData.loai_ho_tro,
                id_hd: formData.id_hd,
                ma_gv: formData.ma_gv,
            };

            if (editing) {
                await updateHoatDongHoTro(editing.id_hd_ho_tro, payload);
                toast.success('Cập nhật thành công');
            } else {
                await createHoatDongHoTro(payload);
                toast.success('Tạo mới thành công');
            }

            setShowModal(false);
            setEditing(null);
            setFormData({ id_hd_ho_tro: '', ten_hd: '', loai_ho_tro: '', id_hd: '', ma_gv: '' });
            await refreshData();
        } catch (err) {
            console.error('Submit error:', err);
            toast.error((err && err.message) || 'Lỗi khi lưu');
        } finally {
            setLoading(false);
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

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Quản lý Hoạt Động Hỗ Trợ</h1>
                <div>
                    <button
                        onClick={() => {
                            setShowModal(true);
                            setEditing(null);
                            setFormData({ id_hd_ho_tro: '', ten_hd: '', loai_ho_tro: '', id_hd: '', ma_gv: '' });
                        }}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: config.accent_color }}
                    >
                        + Thêm Hoạt Động Hỗ Trợ
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Hoạt Động</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Hỗ Trợ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian Bắt đầu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian Kết thúc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa điểm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedList.map((item, idx) => (
                                <tr key={item.id_hd_ho_tro} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(page - 1) * itemsPerPage + idx + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{hoatdongList.find(h => h.id_hd === item.id_hd)?.ten_hd || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">ID: {item.id_hd}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ten_hd}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.loai_ho_tro}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="font-medium">{item.ho_ten || item.ma_gv}</div>
                                        <div className="text-xs text-gray-500">{item.ma_gv}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tg_bat_dau ? new Date(item.tg_bat_dau).toLocaleString('vi-VN') : '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tg_ket_thuc ? new Date(item.tg_ket_thuc).toLocaleString('vi-VN') : '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dia_diem || '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {list.length === 0 && (
                        <div className="text-center py-8 text-gray-500">Chưa có Hoạt Động Hỗ Trợ nào</div>
                    )}

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

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditing(null); setFormData({ id_hd_ho_tro: '', ten_hd: '', loai_ho_tro: '', id_hd: '', ma_gv: '' }); }}
                title={editing ? 'Sửa Hoạt Động Hỗ Trợ' : 'Thêm Hoạt Động Hỗ Trợ'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên hỗ trợ *</label>
                        <input
                            type="text"
                            required
                            value={formData.ten_hd}
                            onChange={e => setFormData({ ...formData, ten_hd: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại hỗ trợ *</label>
                        <select
                            required
                            value={formData.loai_ho_tro}
                            onChange={e => setFormData({ ...formData, loai_ho_tro: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">-- Chọn Loại Hỗ Trợ --</option>
                            <option value="Tập huấn">Tập huấn</option>
                            <option value="Phổ biến">Phổ biến</option>
                            <option value="Hướng dẫn hồ sơ">Hướng dẫn hồ sơ</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giảng viên *</label>
                        <select
                            required
                            value={formData.ma_gv}
                            onChange={e => setFormData({ ...formData, ma_gv: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">-- Chọn Giảng viên --</option>
                            {giangVienList.map(gv => (
                                <option key={gv.ma_giang_vien} value={gv.ma_giang_vien}>{gv.ho_ten} ({gv.ma_giang_vien})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: config.accent_color }}>
                            {loading ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm Hoạt Động Hỗ Trợ')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
