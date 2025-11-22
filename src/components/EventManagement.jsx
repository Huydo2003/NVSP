import { useEffect, useState } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';
import { useApp } from '../hooks/useApp';
import { fetchSuKien, createSuKien, updateSuKienStatus, updateSuKien, deleteSuKien } from '../services/su-kien';
import { apiFetch } from '../services/api';

export default function EventManagement() {
    const { state } = useApp();
    const { config } = state;
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isBtc, setIsBtc] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [form, setForm] = useState({ ten_sk: '', nam_hoc: new Date().getFullYear(), id_sk: null });
    const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null, text: '' });

    // Check BTC role
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const r = await apiFetch('/api/me/is_btc');
                const btc = !!(r && r.isBtc);
                if (mounted) setIsBtc(btc);
            } catch (err) {
                console.error('[EventManagement] error checking BTC', err);
                if (mounted) setIsBtc(false);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Load events
    const loadEvents = async () => {
        try {
            setLoading(true);
            const events = await fetchSuKien();
            setEvents(events || []);
        } catch (err) {
            console.error('[EventManagement] fetch error', err);
            toast.error('Không thể lấy danh sách sự kiện');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadEvents(); }, []);

    // Tạo sự kiện
    async function handleCreate(e) {
        e?.preventDefault();
        try {
            setLoading(true);
            if (!form.ten_sk) return toast.error('Tên sự kiện bắt buộc');
            if (!form.nam_hoc) return toast.error('Năm học bắt buộc');

            await createSuKien({ ten_sk: form.ten_sk, nam_hoc: Number(form.nam_hoc) });
            toast.success('Đã tạo sự kiện');
            setShowCreate(false);
            setForm({ ten_sk: '', nam_hoc: new Date().getFullYear() });
            loadEvents();
        } catch (err) {
            console.error('[EventManagement] create error', err);
            const msg = (err?.body?.message) || err?.message || 'Lỗi khi tạo sự kiện';
            toast.error(msg);
        } finally { setLoading(false); }
    }

    // Mở/đóng đăng ký
    function openToggleConfirm(ev) {
        setConfirm({
            isOpen: true,
            text: ev.trang_thai ? `Đóng đăng ký cho sự kiện '${ev.ten_sk}'?` : `Mở lại đăng ký cho sự kiện '${ev.ten_sk}'?`,
            onConfirm: () => toggleStatus(ev),
        });
    }

    async function toggleStatus(ev) {
        try {
            setConfirm({ isOpen: false, onConfirm: null, text: '' });
            setLoading(true);
            await updateSuKienStatus(ev.id_sk, !ev.trang_thai);
            toast.success('Đã cập nhật trạng thái');
            loadEvents();
        } catch (err) {
            console.error('[EventManagement] update status error', err);
            const msg = (err?.body?.message) || err?.message || 'Lỗi khi cập nhật trạng thái';
            toast.error(msg);
        } finally { setLoading(false); }
    }

    // Sửa sự kiện
    function handleEdit(ev) {
        setForm({ id_sk: ev.id_sk, ten_sk: ev.ten_sk, nam_hoc: ev.nam_hoc });
        setShowEdit(true);
    }

    async function handleUpdate(e) {
        e?.preventDefault();
        try {
            setLoading(true);
            if (!form.ten_sk) return toast.error('Tên sự kiện bắt buộc');
            if (!form.nam_hoc) return toast.error('Năm học bắt buộc');

            await updateSuKien(form.id_sk, { ten_sk: form.ten_sk, nam_hoc: Number(form.nam_hoc) });
            toast.success('Đã cập nhật sự kiện');
            setShowEdit(false);
            setForm({ ten_sk: '', nam_hoc: new Date().getFullYear(), id_sk: null });
            loadEvents();
        } catch (err) {
            console.error('[EventManagement] update error', err);
            const msg = (err?.body?.message) || err?.message || 'Lỗi khi cập nhật sự kiện';
            toast.error(msg);
        } finally { setLoading(false); }
    }

    // Xóa sự kiện
    function handleDelete(ev) {
        setConfirm({
            isOpen: true,
            text: `Xóa sự kiện '${ev.ten_sk}'?`,
            onConfirm: async () => {
                try {
                    setConfirm({ isOpen: false, onConfirm: null, text: '' });
                    setLoading(true);
                    await deleteSuKien(ev.id_sk);
                    toast.success('Đã xóa sự kiện');
                    loadEvents();
                } catch (err) {
                    console.error('[EventManagement] delete error', err);
                    const msg = (err?.body?.message) || err?.message || 'Lỗi khi xóa sự kiện';
                    toast.error(msg);
                } finally { setLoading(false); }
            }
        });
    }

    return (
        <div className="space-y-6 fade-in p-4">
            <ConfirmDialog
                isOpen={confirm.isOpen}
                text={confirm.text}
                onCancel={() => setConfirm({ isOpen: false, onConfirm: null, text: '' })}
                onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }}
            />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>
                    Quản lý Sự kiện
                </h1>
                {(isBtc || (state.user && state.user.role === 'admin')) && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: config.accent_color }}
                    >
                        Tạo sự kiện
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sự kiện</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm học</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BTC</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {events.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((ev, idx) => (
                                <tr key={ev.id_sk} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="text-sm font-medium text-gray-900">{ev.ten_sk}</div>
                                        <div className="text-sm text-gray-500">ID: {ev.id_sk}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ev.nam_hoc}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ev.ma_btc || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ev.trang_thai ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {ev.trang_thai ? 'Mở' : 'Đóng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => openToggleConfirm(ev)}>{ev.trang_thai ? 'Đóng đăng ký' : 'Mở đăng ký'}</button>
                                        <button onClick={() => handleEdit(ev)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                                        <button onClick={() => handleDelete(ev)} className="text-red-600 hover:text-red-900">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {events.length === 0 && (
                        <div className="text-center py-8 text-gray-500">Chưa có Rubric nào</div>
                    )}

                    {events.length > itemsPerPage && (
                        <div className="flex items-center justify-center space-x-3 py-4">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                            {Array.from({ length: Math.ceil(events.length / itemsPerPage) }).map((_, idx) => (
                                <button key={idx} onClick={() => setPage(idx + 1)} className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{idx + 1}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(Math.ceil(events.length / itemsPerPage), p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal tạo sự kiện */}
            <Modal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                title="Tạo sự kiện"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện *</label>
                        <input
                            type="text"
                            required
                            value={form.ten_sk}
                            onChange={e => setForm({ ...form, ten_sk: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập tên sự kiện"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Năm học *</label>
                        <input
                            type="number"
                            required
                            value={form.nam_hoc}
                            onChange={e => setForm({ ...form, nam_hoc: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowCreate(false)}
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
                            {loading ? 'Đang xử lý...' : 'Tạo sự kiện'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal sửa sự kiện */}
            <Modal
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                title="Sửa sự kiện"
                size="md"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện *</label>
                        <input
                            type="text"
                            required
                            value={form.ten_sk}
                            onChange={e => setForm({ ...form, ten_sk: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Năm học *</label>
                        <input
                            type="number"
                            required
                            value={form.nam_hoc}
                            onChange={e => setForm({ ...form, nam_hoc: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowEdit(false)}
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
                            {loading ? 'Đang xử lý...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
