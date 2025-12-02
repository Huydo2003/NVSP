import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { useApp } from '../hooks/useApp';
import { fetchHoatDongThamDu } from '../services/hoat-dong-tham-du';
import { fetchDkiThamDu } from '../services/dki-tham-du';
import { fetchDiemDanh, registerDiemDanh, cancelDiemDanh } from '../services/diem-danh';

/* ---------------- FIX BLOB → BASE64 ------------------ */
const convertBufferToBase64 = (blob) => {
    if (!blob) return null;

    // Server trả về dạng buffer { type, data }
    if (blob?.data) {
        const base64String = btoa(
            new Uint8Array(blob.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
            )
        );
        return `data:image/jpeg;base64,${base64String}`;
    }

    // Nếu server trả string base64 sẵn
    if (typeof blob === 'string' && blob.startsWith('data:image')) {
        return blob;
    }

    return null;
};
/* ------------------------------------------------------ */

const getTrangThaiColor = (trang_thai) => {
    if (trang_thai === 1) return 'text-green-600 bg-green-50 border-green-200';
    if (trang_thai === -1) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
};

const getTrangThaiText = (trang_thai) => {
    if (trang_thai === 1) return 'Đã duyệt';
    if (trang_thai === -1) return 'Từ chối';
    return 'Chờ duyệt';
};

// AttendanceModal is defined at top-level so its identity is stable across parent renders.
function AttendanceModal({ isOpen, onClose, activity, config, user, refreshData }) {
    const [manualMaSv, setManualMaSv] = useState('');
    const [imageData, setImageData] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setManualMaSv('');
            setImageData(null);
            setFileError(null);
            setIsSubmitting(false);
        }
    }, [isOpen, activity]);

    const handleImageUpload = (e) => {
        setFileError(null);
        const file = e.target.files?.[0];
        if (!file) return setImageData(null);

        if (!file.type.startsWith('image/')) {
            setFileError("Vui lòng chọn tệp ảnh hợp lệ.");
            return setImageData(null);
        }

        if (file.size > 2 * 1024 * 1024) {
            setFileError("Kích thước ảnh không vượt quá 2MB.");
            return setImageData(null);
        }

        const reader = new FileReader();
        reader.onloadend = () => setImageData(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageData) return setFileError("Vui lòng tải lên ảnh minh chứng.");

        if (activity.expiredForAttendance) {
            return toast.error("Đã quá thời gian điểm danh.");
        }

        setIsSubmitting(true);
        try {
            const maSvPayload =
                manualMaSv?.trim() !== "" ? manualMaSv.trim() : undefined;

            await registerDiemDanh(activity.id_hd_tham_du, imageData, maSvPayload);
            toast.success("Điểm danh thành công!");
            onClose();
            await refreshData();
        } catch (err) {
            toast.error("Lỗi khi điểm danh.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Điểm danh: ${activity?.ten_hd || ""}`}
            width="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className="text-sm font-medium">Mã sinh viên (tùy chọn)</label>
                    <input
                        type="text"
                        value={manualMaSv}
                        onChange={(e) => setManualMaSv(e.target.value)}
                        placeholder={user?.ma_sv ? `Mặc định: ${user.ma_sv}` : "Nhập mã sinh viên"}
                        className="mt-1 w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Ảnh minh chứng *</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full" />

                    {fileError && <p className="text-red-600 text-sm mt-1">{fileError}</p>}

                    {imageData && (
                        <img src={imageData} alt="preview" className="mt-3 max-h-48 border rounded-md" />
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">
                        Hủy
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting || !imageData}
                        className="px-4 py-2 text-white rounded-md"
                        style={{ backgroundColor: config.accent_color }}
                    >
                        {isSubmitting ? "Đang gửi..." : "Xác nhận"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}


export default function DiemDanhStudent({ user: propUser = null }) {
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelTargetId, setCancelTargetId] = useState(null);

    const [hdtdList, setHdtdList] = useState([]);
    const [dkiRegs, setDkiRegs] = useState([]);
    const [diemDanhRegs, setDiemDanhRegs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showDiemDanhModal, setShowDiemDanhModal] = useState(false);
    const [selectedHdtd, setSelectedHdtd] = useState(null);

    let appCtx;
    try {
        appCtx = useApp();
    } catch (err) {
        appCtx = { state: { config: { accent_color: '#4f46e5', text_color: '#1e3a8a' } } };
    }

    const { state } = appCtx;
    const config = (state && state.config) ? state.config : { accent_color: '#4f46e5', text_color: '#1e3a8a' };
    const user = propUser || (state && state.user) || null;

    const activitiesForAttendance = useMemo(() => {
        if (!hdtdList.length) return [];

        return hdtdList
            .filter(hdtd => typeof hdtd.yeu_cau_diem_danh === 'undefined' ? true : hdtd.yeu_cau_diem_danh)
            .map(hdtd => {
                const registration = dkiRegs.find(d => String(d.id_hd) === String(hdtd.id_hd_tham_du) && Number(d.trang_thai) === 1);
                const attendance = diemDanhRegs.find(dd =>
                    String(dd.id_hd) === String(hdtd.id_hd_tham_du) ||
                    String(dd.id_hd_tham_du) === String(hdtd.id_hd_tham_du)
                );

                if (!registration) return null;

                // determine if attendance window expired: more than 20 minutes after tg_bat_dau
                let expiredForAttendance = false;
                try {
                    if (hdtd && hdtd.tg_bat_dau) {
                        const startTs = Date.parse(hdtd.tg_bat_dau);
                        if (!Number.isNaN(startTs)) {
                            const now = Date.now();
                            const allowedUntil = startTs + 20 * 60 * 1000; // 20 minutes
                            expiredForAttendance = now > allowedUntil;
                        }
                    }
                } catch (e) {
                    expiredForAttendance = false;
                }

                return {
                    ...hdtd,
                    isRegistered: !!registration,
                    attendance: attendance || null,
                    expiredForAttendance
                };
            })
            .filter(item => item !== null)
            .sort((a, b) => a.id_hd_tham_du - b.id_hd_tham_du);
    }, [hdtdList, dkiRegs, diemDanhRegs]);

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const [hdtdData, dkiData, diemDanhData] = await Promise.all([
                fetchHoatDongThamDu(),
                fetchDkiThamDu(),
                fetchDiemDanh(),
            ]);

            setHdtdList(hdtdData || []);
            setDkiRegs(dkiData || []);

            // Precompute image previews once (convert blob/buffer -> dataURL) to avoid heavy work on every render
            const processedDiemDanh = (diemDanhData || []).map(dd => ({
                ...dd,
                anh_minh_chung_preview: convertBufferToBase64(dd.anh_minh_chung)
            }));

            setDiemDanhRegs(processedDiemDanh);
        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
            toast.error('Không thể tải dữ liệu điểm danh.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleCancelDiemDanh = (attendanceId) => {
        setCancelTargetId(attendanceId);
        setShowCancelConfirm(true);
    };

    const confirmCancelDiemDanh = async () => {
        if (!cancelTargetId) return;

        try {
            await cancelDiemDanh(cancelTargetId);
            toast.success('Hủy điểm danh thành công.');
            await refreshData();
        } catch (err) {
            console.error('Lỗi hủy điểm danh:', err);
            toast.error((err && err.message) || 'Lỗi khi hủy điểm danh.');
        } finally {
            setShowCancelConfirm(false);
            setCancelTargetId(null);
        }
    };


    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full"></div>
                <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <>
            <ConfirmDialog
                isOpen={showCancelConfirm}
                title="Xác nhận hủy điểm danh"
                message="Bạn có chắc chắn muốn hủy điểm danh này không? Sau khi hủy, bạn cần điểm danh lại nếu còn thời gian."
                confirmText="Hủy điểm danh"
                cancelText="Đóng"
                onConfirm={confirmCancelDiemDanh}
                onCancel={() => {
                    setShowCancelConfirm(false);
                    setCancelTargetId(null);
                }}
            />

            <div className="space-y-6">
                <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Điểm Danh Hoạt Động Tham Dự</h1>
                <p className="text-gray-500">Chỉ hiển thị hoạt động đã đăng ký và yêu cầu điểm danh.</p>

                <div className="bg-white rounded-lg shadow-md p-6">
                    {activitiesForAttendance.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Không có hoạt động nào cần điểm danh.</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {activitiesForAttendance.map((hdtd) => {
                                const attendance = hdtd.attendance;
                                const isAttended = !!attendance;

                                return (
                                    <div key={hdtd.id_hd_tham_du} className="bg-white border rounded-lg shadow-lg p-5">
                                        <h3 className="text-xl font-bold">{hdtd.ten_hd}</h3>
                                        <div className="text-xs text-gray-500 mb-3">ID Hoạt động: {hdtd.id_hd_tham_du}</div>

                                        {hdtd.expiredForAttendance && !isAttended && (
                                            <div className="text-sm text-red-600 font-semibold mb-2">Đã quá thời gian cho phép điểm danh</div>
                                        )}

                                        {isAttended && (
                                            <>
                                                <div className={`mt-2 px-3 py-1 inline-flex text-sm font-semibold rounded-full border ${getTrangThaiColor(attendance.trang_thai)}`}>
                                                    {getTrangThaiText(attendance.trang_thai)}
                                                </div>

                                                {attendance.thoi_gian && (
                                                    <div className="text-xs text-gray-600 mt-2">Thời gian: {new Date(attendance.thoi_gian).toLocaleString('vi-VN')}</div>
                                                )}
                                            </>
                                        )}

                                        <div className="mt-4 flex justify-end space-x-2">
                                            {isAttended ? (
                                                <>
                                                    {attendance.trang_thai !== 1 && (
                                                        <button onClick={() => handleCancelDiemDanh(attendance.id)} className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md">Hủy Điểm danh</button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {hdtd.expiredForAttendance ? (
                                                        <span className="text-red-500 text-sm font-semibold">Đã hết thời gian điểm danh</span>
                                                    ) : (
                                                        <button onClick={() => { setSelectedHdtd(hdtd); setShowDiemDanhModal(true); }} className="px-4 py-2 text-white rounded-md" style={{ backgroundColor: config.accent_color }}>Điểm Danh</button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <AttendanceModal
                    isOpen={showDiemDanhModal}
                    onClose={() => setShowDiemDanhModal(false)}
                    activity={selectedHdtd}
                    config={config}
                    user={user}
                    refreshData={refreshData}
                />
            </div>
        </>
    );
}
