/**
 * BanGiamKhaoManagement.jsx - Quản lý Ban Giám Khảo
 * 
 * Chức năng:
 * - Xem danh sách BGK theo từng hoạt động
 * - Thêm giảng viên vào BGK
 * - Xóa giảng viên khỏi BGK
 */

import { useState, useEffect } from "react";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import toast from "react-hot-toast";
import { useApp } from "../hooks/useApp";
import { apiFetch } from "../services/api";
import { fetchBanGiamKhao, createBanGiamKhao, deleteBanGiamKhao } from "../services/ban-giam-khao";
import { fetchHoatDongThi } from "../services/hoat-dong-thi";
import { fetchGiangVien } from "../services/giang-vien";

export default function BanGiamKhaoManagement() {
    const { state } = useApp();
    const { config } = state;

    // Data states
    const [bgkData, setBgkData] = useState([]);
    const [hoatDongThiList, setHoatDongThiList] = useState([]);
    const [giangVienList, setGiangVienList] = useState([]);

    const [loading, setLoading] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({ id_hd: "", ma_giang_vien: "" });

    // Confirm dialog state
    const [confirm, setConfirm] = useState({
        isOpen: false,
        message: "",
        onConfirm: null,
    });

    const [isBtc, setIsBtc] = useState(false);

    // Load BTC status & initial data
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiFetch("/api/me/is_btc");
                if (!mounted) return;
                setIsBtc(res?.isBtc || false);
                if (res?.isBtc) await refreshData();
            } catch (err) {
                console.error("Check BTC error", err);
                if (mounted) setIsBtc(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Refresh all data
    const refreshData = async () => {
        try {
            const [bgkList, hdList, gvList] = await Promise.all([
                fetchBanGiamKhao(),
                fetchHoatDongThi(),
                fetchGiangVien(),
            ]);
            setBgkData(Array.isArray(bgkList) ? bgkList : []);
            setHoatDongThiList(Array.isArray(hdList) ? hdList : []);
            setGiangVienList(Array.isArray(gvList) ? gvList : []);
        } catch (err) {
            toast.error(err?.status === 403 ? "Bạn không có quyền truy cập!" : "Không thể tải dữ liệu");
            console.error("refreshData error:", err);
        }
    };

    // Handle add button (open modal)
    const handleAdd = (id_hd) => {
        setFormData({ id_hd, ma_giang_vien: "" });
        setShowModal(true);
    };

    // Handle delete
    const handleDelete = (item) => {
        setConfirm({
            isOpen: true,
            message: "Bạn có chắc muốn xóa?",
            onConfirm: async () => {
                setLoading(true);
                try {
                    await deleteBanGiamKhao(item.id_hd, item.ma_giang_vien);
                    toast.success("Đã xóa");
                    await refreshData();
                } catch (err) {
                    toast.error("Xóa thất bại");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // Handle modal submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.id_hd || !formData.ma_giang_vien) {
            toast.error("Vui lòng chọn đầy đủ thông tin");
            return;
        }

        const exists = bgkData.some(
            (x) => x.id_hd === formData.id_hd && x.ma_giang_vien === formData.ma_giang_vien
        );
        if (exists) {
            toast.error("Giảng viên đã có trong BGK của hoạt động này");
            return;
        }

        setModalLoading(true);
        try {
            await createBanGiamKhao(formData);
            toast.success("Đã thêm");
            setShowModal(false);
            await refreshData();
        } catch (err) {
            toast.error("Lỗi khi lưu");
        } finally {
            setModalLoading(false);
        }
    };

    // Group BGK by activity
    const grouped = hoatDongThiList.map((hd) => ({
        ...hd,
        members: bgkData.filter((x) => x.id_hd === hd.id_hd),
    }));

    return (
        <div className="space-y-6 fade-in p-4">
            <h1 className="text-2xl font-semibold">Quản lý Ban Giám Khảo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped.map((hd) => (
                    <div key={hd.id_hd} className="bg-white rounded-xl shadow-md p-5 border border-gray-200 flex flex-col">
                        <div className="text-lg font-semibold text-gray-800 mb-1">{hd.ten_hd}</div>
                        <div className="text-sm text-gray-500 mb-3">
                            Số lượng Ban Giám Khảo: <span className="font-medium ml-1">{hd.members.length}</span>
                        </div>

                        <div className="space-y-2 flex-1">
                            {hd.members.length === 0 && (
                                <div className="p-3 bg-gray-50 border rounded text-sm text-gray-500">Chưa có giảng viên nào</div>
                            )}
                            {hd.members.map((m) => {
                                const gv = giangVienList.find((g) => g.ma_giang_vien === m.ma_giang_vien);
                                return (
                                    <div key={m.ma_giang_vien} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                        <div>
                                            <div className="font-medium">{gv?.ho_ten}</div>
                                            <div className="text-sm text-gray-600">Mã GV: {m.ma_giang_vien}</div>
                                        </div>
                                        <button onClick={() => handleDelete(m)} className="text-red-500 hover:text-red-700 text-sm font-bold">Xóa</button>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handleAdd(hd.id_hd)}
                            className="mt-4 px-3 py-2 text-white rounded-lg shadow"
                            style={{ backgroundColor: config.accent_color }}
                        >
                            + Thêm giảng viên
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal thêm giảng viên */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <form className="space-y-4 p-4" onSubmit={handleSubmit}>
                    <h2 className="text-xl font-semibold mb-2">Thêm thành viên</h2>
                    <div>
                        <label className="block mb-1 font-medium">Hoạt động thi</label>
                        <select
                            value={formData.id_hd}
                            onChange={(e) => setFormData({ ...formData, id_hd: e.target.value })}
                            className="border p-2 rounded w-full"
                            disabled
                        >
                            <option value="">-- Chọn --</option>
                            {hoatDongThiList.map((x) => (
                                <option key={x.id_hd} value={x.id_hd}>{x.ten_hd}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Giảng viên</label>
                        <select
                            value={formData.ma_giang_vien}
                            onChange={(e) => setFormData({ ...formData, ma_giang_vien: e.target.value })}
                            className="border p-2 rounded w-full"
                            disabled={modalLoading}
                        >
                            <option value="">-- Chọn --</option>
                            {giangVienList.map((x) => (
                                <option key={x.ma_giang_vien} value={x.ma_giang_vien}>
                                    {x.ho_ten} ({x.ma_giang_vien})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: config.accent_color }}
                            disabled={modalLoading}
                        >
                            {modalLoading ? "Đang lưu..." : "Lưu"}
                        </button>

                    </div>
                </form>
            </Modal>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirm.isOpen}
                message={confirm.message}
                onClose={() => setConfirm({ ...confirm, isOpen: false })}
                onConfirm={() => {
                    confirm.onConfirm();
                    setConfirm({ ...confirm, isOpen: false });
                }}
            />
        </div>
    );
}
