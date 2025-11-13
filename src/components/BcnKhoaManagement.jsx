/**
 * BcnKhoaManagement.jsx - Quản lý BCN Khoa
 * 
 * Chức năng:
 * - Xem danh sách BCN Khoa
 * - Thêm/sửa/xóa BCN Khoa
 * - Quản lý thời hạn nhiệm kỳ
 */

import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import Modal from './Modal';
import { fetchBcnKhoa, fetchGiangVien, createBcnKhoa, updateBcnKhoa, deleteBcnKhoa } from '../services/bcn-khoa';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

export default function BcnKhoaManagement() {
    const [bcnList, setBcnList] = useState([]);
    const [giangVienList, setGiangVienList] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [showModal, setShowModal] = useState(false);
    const [editingBcn, setEditingBcn] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        ma_giang_vien: '',
        khoa: '',
        bat_dau_nk: '',
        ket_thuc_nk: '',
        trang_thai: true
    });
    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Đồng ý', cancelText: 'Hủy' });

    const { state } = useApp();
    const { config } = state;

    // Load data on mount
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const bcn = await fetchBcnKhoa();
                const gv = await fetchGiangVien();

                if (mounted) {
                    setBcnList(bcn || []);
                    setGiangVienList(gv || []);
                }
            } catch (err) {
                console.error('Load data error', err);
                toast.error('Không thể tải dữ liệu');
            }
        })();

        return () => { mounted = false; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.ma_giang_vien || !formData.khoa || !formData.bat_dau_nk) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ma_giang_vien: formData.ma_giang_vien,
                khoa: formData.khoa,
                bat_dau_nk: formData.bat_dau_nk,
                ket_thuc_nk: formData.ket_thuc_nk || null,
                trang_thai: formData.trang_thai ? 1 : 0
            };

            if (editingBcn) {
                await updateBcnKhoa(editingBcn.ma_giang_vien, payload);
                toast.success('Cập nhật BCN Khoa thành công');
            } else {
                await createBcnKhoa(payload);
                toast.success('Tạo BCN Khoa thành công');
            }

            // Reload list
            const bcn = await fetchBcnKhoa();
            setBcnList(bcn || []);

            setShowModal(false);
            setEditingBcn(null);
            setFormData({
                ma_giang_vien: '',
                khoa: '',
                bat_dau_nk: '',
                ket_thuc_nk: '',
                trang_thai: true
            });
        } catch (err) {
            if (err.status === 400 && err.body?.message?.includes('Mã giảng viên')) {
              toast.error('Mã giảng viên đã tồn tại. Vui lòng sử dụng mã giảng viên khác');
            } else if (err.status === 400 && err.body?.message?.includes('Khoa')) {
              toast.error('Khoa đã tồn tại. Vui lòng sử dụng khoa khác');
            } else {
              toast.error(err.body?.message || 'Có lỗi xảy ra khi tạo ban chủ nhiệm khoa');
            }
            return; // thoát không reset form
        }

        setLoading(false);
    };

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const handleEdit = (bcn) => {
        setEditingBcn(bcn);
        setFormData({
            ma_giang_vien: bcn.ma_giang_vien,
            khoa: bcn.khoa,
            bat_dau_nk: formatDateForInput(bcn.bat_dau_nk),
            ket_thuc_nk: formatDateForInput(bcn.ket_thuc_nk),
            trang_thai: bcn.trang_thai === 1 || bcn.trang_thai === true
        });
        setShowModal(true);
    };

    const handleDelete = (bcn) => {
        setConfirm({
            isOpen: true,
            title: 'Xóa BCN Khoa',
            message: `Bạn có chắc chắn muốn xóa BCN ${bcn.khoa}?`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await deleteBcnKhoa(bcn.ma_giang_vien);

                    // Reload list
                    const bcn_list = await fetchBcnKhoa();
                    setBcnList(bcn_list || []);

                    toast.success('Đã xóa BCN Khoa');
                } catch (err) {
                    console.error(err);
                    toast.error('Xóa thất bại');
                }
                setLoading(false);
            }
        });
    };

    const getGiangVienName = (maGv) => {
        const gv = giangVienList.find(g => g.ma_giang_vien === maGv);
        return gv ? gv.ho_ten || gv.ma_giang_vien : maGv;
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
                <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>
                    Quản lý BCN Khoa
                </h1>
                <button
                    onClick={() => {
                        setEditingBcn(null);
                        setFormData({
                            ma_giang_vien: '',
                            khoa: '',
                            bat_dau_nk: '',
                            ket_thuc_nk: '',
                            trang_thai: true
                        });
                        setShowModal(true);
                    }}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: config.accent_color }}
                >
                    Thêm BCN Khoa
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bắt đầu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết thúc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bcnList.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((bcn, idx) => (
                                <tr key={bcn.ma_giang_vien} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(page - 1) * itemsPerPage + idx + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">                                        
                                        <div className="text-sm font-medium text-gray-900">{getGiangVienName(bcn.ma_giang_vien)}</div>
                                        <div className="text-sm text-gray-500">ID: {bcn.ma_giang_vien}</div>                                        
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bcn.khoa}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(bcn.bat_dau_nk).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {bcn.ket_thuc_nk ? new Date(bcn.ket_thuc_nk).toLocaleDateString('vi-VN') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bcn.trang_thai === 1 || bcn.trang_thai === true ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {bcn.trang_thai === 1 || bcn.trang_thai === true ? 'Đương nhiệm' : 'Tiền nhiệm'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleEdit(bcn)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                                        <button onClick={() => handleDelete(bcn)} className="text-red-600 hover:text-red-900">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bcnList.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có BCN Khoa nào
                        </div>
                    )}
                    {/* Pagination */}
                    {bcnList.length > itemsPerPage && (
                        <div className="flex items-center justify-center space-x-3 py-4">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                            {Array.from({ length: Math.ceil(bcnList.length / itemsPerPage) }).map((_, idx) => (
                                <button key={idx} onClick={() => setPage(idx + 1)} className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{idx + 1}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(Math.ceil(bcnList.length / itemsPerPage), p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingBcn(null);
                    setFormData({
                        ma_giang_vien: '',
                        khoa: '',
                        bat_dau_nk: '',
                        ket_thuc_nk: '',
                        trang_thai: true
                    });
                }}
                title={editingBcn ? 'Sửa BCN Khoa' : 'Thêm BCN Khoa mới'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giảng viên *
                        </label>
                        <select
                            required
                            value={formData.ma_giang_vien}
                            onChange={(e) => setFormData({ ...formData, ma_giang_vien: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Chọn giảng viên</option>
                            {giangVienList.map(gv => (
                                <option key={gv.ma_giang_vien} value={gv.ma_giang_vien}>
                                    {gv.ho_ten} ({gv.ma_giang_vien})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Khoa *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.khoa}
                            onChange={(e) => setFormData({ ...formData, khoa: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập tên khoa"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bắt đầu nhiệm kỳ *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.bat_dau_nk}
                            onChange={(e) => setFormData({ ...formData, bat_dau_nk: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kết thúc nhiệm kỳ
                        </label>
                        <input
                            type="date"
                            value={formData.ket_thuc_nk}
                            onChange={(e) => setFormData({ ...formData, ket_thuc_nk: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            value={formData.trang_thai ? 'true' : 'false'}
                            onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value === 'true' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="true">Đương nhiệm</option>
                            <option value="false">Tiền nhiệm</option>
                        </select>
                    </div>

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
                            className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: config.accent_color }}
                        >
                            {loading ? 'Đang xử lý...' : (editingBcn ? 'Cập nhật' : 'Thêm BCN Khoa')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
