/**
 * DangKyThiManagement.jsx - Student Activity Registration
 * Chức năng:
 * - Xem danh sách hoạt động thi
 * - Đăng ký cá nhân hoặc tạo/tham gia nhóm
 * - Xem trạng thái đăng ký
 * - Chỉ cho phép sinh viên truy cập
 * - CHẶN đăng ký THI nếu đã đăng ký THAM DỰ cho cùng hoạt động (Đã fix logic so sánh ID)
 */

import React, { useState, useEffect, useMemo } from 'react'; // Bổ sung useMemo
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';
import { useApp } from '../hooks/useApp';
import { fetchHoatDongThi } from '../services/hoat-dong-thi';
import { fetchHoatDong } from '../services/hoat-dong';
import { fetchDkiThamDu } from '../services/dki-tham-du';
import { fetchHoatDongThamDu } from '../services/hoat-dong-tham-du';
import {
    fetchDangKyThi,
    registerIndividual,
    createGroupRegistration,
    joinGroup,
    cancelDangKyThi,
    fetchThanhVienNhom
} from '../services/dang-ky-thi';

export default function DangKyThiManagement({ user }) {
    const [hdtList, setHdtList] = useState([]);
    const [hdList, setHdList] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [dkiThamDuRegs, setDkiThamDuRegs] = useState([]);
    const [hdtdList, setHdtdList] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const [showRegModal, setShowRegModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [regType, setRegType] = useState(''); // **Khởi tạo là rỗng để bắt người dùng chọn**
    const [groupName, setGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);

    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedGroupReg, setSelectedGroupReg] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [groupCounts, setGroupCounts] = useState({});

    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const { state } = useApp();
    const { config } = state;

    // Check if user is student
    const isStudent = user && String(user.role || '').toLowerCase().includes('sinh');

    const refreshData = async () => {
        try {
            const [hdtData, hdData, regData, dkiData, hdtdData] = await Promise.all([
                fetchHoatDongThi(),
                fetchHoatDong(),
                fetchDangKyThi(),
                fetchDkiThamDu(),
                fetchHoatDongThamDu()
            ]);
            setHdtList(Array.isArray(hdtData) ? hdtData : []);
            setHdList(Array.isArray(hdData) ? hdData : []);
            setRegistrations(Array.isArray(regData) ? regData : []);
            setDkiThamDuRegs(Array.isArray(dkiData) ? dkiData : []);
            setHdtdList(Array.isArray(hdtdData) ? hdtdData : []);

            try {
                const groupRegs = Array.isArray(regData) ? regData.filter(r => r.hinh_thuc === 'Nhóm') : [];
                if (groupRegs.length > 0) {
                    const countsArr = await Promise.all(groupRegs.map(async (r) => {
                        try {
                            const members = await fetchThanhVienNhom(r.id);
                            return { id: r.id, count: Array.isArray(members) ? members.length : 0 };
                        } catch {
                            return { id: r.id, count: 0 };
                        }
                    }));
                    const map = {};
                    countsArr.forEach(c => { map[c.id] = c.count; });
                    setGroupCounts(map);
                } else {
                    setGroupCounts({});
                }
            } catch (err) {
                console.error('Error populating group counts:', err);
                setGroupCounts({});
            }
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

    const getHoatDongInfo = (id_hd) => {
        return hdList.find(h => h.id_hd === id_hd) || {};
    };

    // Helper: Kiểm tra xem sinh viên đã đăng ký tham dự cho cùng hoạt động chung chưa
    const hasConflictingDkiThamDu = (id_hd_hoat_dong_chung) => {
        return dkiThamDuRegs.some(dkiReg => {
            const id_hd_tham_du = dkiReg.id_hd;
            const hdtdInfo = hdtdList.find(hdtd => hdtd.id_hd_tham_du === id_hd_tham_du);

            if (hdtdInfo) {
                if (hdtdInfo.id_hd === id_hd_hoat_dong_chung) {
                    return dkiReg.trang_thai !== -1;
                }
            }
            return false;
        });
    };

    const handleRegister = async (e) => {
        e?.preventDefault();
        if (!selectedActivity) {
            toast.error('Vui lòng chọn hoạt động');
            return;
        }

        // Check for conflict with dki_tham_du
        if (hasConflictingDkiThamDu(selectedActivity.id_hd)) {
            toast.error('Bạn đã đăng ký tham dự cho hoạt động này. Không thể đăng ký thi.');
            return;
        }
        
        // **Thêm logic kiểm tra hình thức đăng ký đã chọn và thông tin nhập**
        if (selectedActivity.hinh_thuc === 'Nhóm' && regType === '') {
            // Trường hợp này đã được xử lý bằng nút disabled, nhưng thêm kiểm tra để an toàn.
            toast.error('Vui lòng chọn hình thức đăng ký (Tạo nhóm hoặc Tham gia nhóm)');
            return;
        }
        
        if (regType === 'createGroup' && !groupName.trim()) {
            toast.error('Vui lòng nhập tên nhóm');
            return;
        }

        if (regType === 'joinGroup' && !joinCode.trim()) {
            toast.error('Vui lòng nhập mã tham gia');
            return;
        }

        setLoading(true);
        try {
            let result;
            if (regType === 'individual') {
                result = await registerIndividual(selectedActivity.id_hd);
                toast.success('Đăng ký cá nhân thành công! Chờ duyệt từ BTC.');
            } else if (regType === 'createGroup') {
                result = await createGroupRegistration(selectedActivity.id_hd, groupName);
                toast.success(`Tạo nhóm thành công! Mã tham gia: ${result.ma_tham_gia}`);
            } else if (regType === 'joinGroup') {
                result = await joinGroup(selectedActivity.id_hd, parseInt(joinCode));
                toast.success(`Tham gia nhóm "${result.ten_nhom}" thành công!`);
            } else {
                // Nếu regType là rỗng (chưa chọn)
                toast.error('Vui lòng chọn hình thức đăng ký.');
                return;
            }

            setShowRegModal(false);
            setGroupName('');
            setJoinCode('');
            setRegType(''); // **Reset về rỗng**
            await refreshData();
        } catch (err) {
            console.error('Register error:', err);
            toast.error((err && err.message) || 'Lỗi khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    const handleViewGroupMembers = async (reg) => {
        try {
            if (reg.hinh_thuc === 'Nhóm' && reg.ten_nhom) {
                const members = await fetchThanhVienNhom(reg.id);
                setGroupMembers(Array.isArray(members) ? members : []);
                setSelectedGroupReg(reg);
                setShowGroupModal(true);
            }
        } catch (err) {
            console.error('Error fetching group members:', err);
            toast.error('Không thể tải danh sách thành viên');
        }
    };

    const handleCancelReg = (reg) => {
        setConfirm({
            isOpen: true,
            title: 'Hủy đăng ký',
            message: `Bạn có chắc muốn hủy đăng ký hoạt động này${reg.ten_nhom ? ` và rời khỏi nhóm "${reg.ten_nhom}"` : ''}?`,
            onConfirm: async () => {
                try {
                    await cancelDangKyThi(reg.id);
                    toast.success('Hủy đăng ký thành công');
                    await refreshData();
                } catch (err) {
                    toast.error((err && err.message) || 'Lỗi khi hủy');
                }
            }
        });
    };

    const totalPages = Math.max(1, Math.ceil(hdtList.length / itemsPerPage));
    const displayedList = hdtList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getTrangThaiColor = (trang_thai) => {
        if (trang_thai === 1) return 'text-green-600 bg-green-50';
        if (trang_thai === -1) return 'text-red-600 bg-red-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    const getTrangThaiText = (trang_thai) => {
        if (trang_thai === 1) return 'Đã duyệt';
        if (trang_thai === -1) return 'Từ chối';
        return 'Chưa duyệt';
    };

    // **Biến tính toán để kiểm soát nút Đăng ký trong Modal**
    const isRegisterButtonDisabled = useMemo(() => {
        if (loading) return true;
        if (!selectedActivity) return true;

        if (regType === 'individual') {
            return false;
        }

        if (regType === 'createGroup') {
            return !groupName.trim();
        }

        if (regType === 'joinGroup') {
            // Có thể thêm kiểm tra regex nếu mã tham gia có định dạng cố định
            return !joinCode.trim();
        }
        
        // Nếu là Nhóm (hoặc Cá nhân/Nhóm) mà chưa chọn hình thức nào
        if (selectedActivity.hinh_thuc === 'Nhóm' || selectedActivity.hinh_thuc === 'Cá nhân/Nhóm') {
             return regType === '';
        }

        return false;
    }, [loading, selectedActivity, regType, groupName, joinCode]);

    // Check if user is student - show error if not
    if (!isStudent) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 font-medium">⚠️ Chỉ sinh viên mới có thể truy cập trang này</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <ConfirmDialog
                isOpen={confirm.isOpen}
                title={confirm.title}
                message={confirm.message}
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={confirm.onConfirm}
                onCancel={() => setConfirm({ ...confirm, isOpen: false })}
            />

            <div>
                <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Đăng Ký Hoạt Động Thi</h1>
            </div>

            {/* Danh sách hoạt động thi - Card grid (3 columns) */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    {hdtList.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Chưa có hoạt động thi nào</div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {displayedList.map((hdt) => {
                                const hd = getHoatDongInfo(hdt.id_hd);
                                const userReg = registrations.find(r => r.id_hd === hdt.id_hd);
                                const isReg = !!userReg;
                                const hasConflict = hasConflictingDkiThamDu(hdt.id_hd);

                                return (
                                    <div key={hdt.id_hd} className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{hd.ten_hd}</h3>
                                            <div className="text-xs text-gray-500 mb-2">ID: {hdt.id_hd}</div>
                                            <div className="text-sm text-gray-600 mb-2">Hình thức: {hdt.hinh_thuc || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">Thời gian: {hd.tg_bat_dau ? new Date(hd.tg_bat_dau).toLocaleString('vi-VN') : '—'}</div>

                                            {hasConflict && !isReg && (
                                                <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                                                    ⚠ **Đã đăng ký tham dự - không thể đăng ký thi**
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div>
                                                {isReg ? (
                                                    <div>
                                                        <div className={`px-2 py-1 inline-flex text-xs font-semibold rounded ${getTrangThaiColor(userReg.trang_thai)}`}>
                                                            {getTrangThaiText(userReg.trang_thai)}
                                                        </div>
                                                        {userReg.hinh_thuc === 'Nhóm' && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {`${groupCounts[userReg.id] || 0}/${hdt.so_luong_tv || '–'} thành viên`}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-1 inline-flex text-xs font-semibold rounded bg-gray-100 text-gray-600">Chưa đăng ký</span>
                                                )}
                                            </div>

                                            <div className="space-x-2">
                                                {isReg ? (
                                                    <>
                                                        {userReg.hinh_thuc === 'Nhóm' && (
                                                            <button onClick={() => handleViewGroupMembers(userReg)} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded">Thành viên</button>
                                                        )}
                                                        <button onClick={() => handleCancelReg(userReg)} className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded">Hủy</button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (hasConflict) {
                                                                toast.error('Bạn đã đăng ký tham dự cho hoạt động này. Không thể đăng ký thi.');
                                                                return;
                                                            }

                                                            // If activity is configured as individual-only, register directly without modal
                                                            if (hdt.hinh_thuc === 'Cá nhân') {
                                                                (async () => {
                                                                    try {
                                                                        setLoading(true);
                                                                        await registerIndividual(hdt.id_hd);
                                                                        toast.success('Đăng ký cá nhân thành công! Chờ duyệt từ BTC.');
                                                                        await refreshData();
                                                                    } catch (err) {
                                                                        toast.error((err && err.message) || 'Lỗi khi đăng ký');
                                                                    } finally {
                                                                        setLoading(false);
                                                                    }
                                                                })();
                                                                return;
                                                            }

                                                            // Otherwise open modal
                                                            setSelectedActivity(hdt);
                                                            setShowRegModal(true);
                                                            // **Đặt regType là rỗng nếu là Nhóm để bắt buộc người dùng chọn**
                                                            setRegType(hdt.hinh_thuc === 'Nhóm' ? '' : 'individual');
                                                            setGroupName('');
                                                            setJoinCode('');
                                                        }}
                                                        disabled={hasConflict}
                                                        className={`px-4 py-2 rounded text-white ${
                                                            hasConflict
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                                                        }`}
                                                    >
                                                        Đăng Ký
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-3 py-4">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPage(idx + 1)}
                            className={`px-3 py-1 rounded ${page === idx + 1 ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                            style={page === idx + 1 ? { backgroundColor: config.accent_color } : {}}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
                </div>
            )}

            {/* Registration Modal */}
            <Modal
                isOpen={showRegModal}
                onClose={() => { setShowRegModal(false); setRegType(''); setGroupName(''); setJoinCode(''); }} // **Reset regType về rỗng**
                title={`Đăng Ký: ${getHoatDongInfo(selectedActivity?.id_hd).ten_hd || 'Hoạt động'}`}
                size="md"
            >
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-3">
                            <strong>Hoạt động:</strong> {selectedActivity?.hinh_thuc || 'Cá nhân/Nhóm'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Hình thức đăng ký *</label>
                        <div className="space-y-2">
                            {/* Cho phép Cá nhân nếu hoạt động KHÔNG chỉ định rõ là "Nhóm" */}
                            {selectedActivity?.hinh_thuc !== 'Nhóm' && (
                                <label className="flex items-center">
                                    <input type="radio" name="regType" value="individual" checked={regType === 'individual'} onChange={() => setRegType('individual')} className="mr-2" />
                                    <span className="text-sm">Đăng ký cá nhân</span>
                                </label>
                            )}
                            {/* Cho phép Tạo nhóm/Tham gia nhóm nếu hoạt động KHÔNG chỉ định rõ là "Cá nhân" */}
                            {selectedActivity?.hinh_thuc !== 'Cá nhân' && (
                                <>
                                    <label className="flex items-center">
                                        <input type="radio" name="regType" value="createGroup" checked={regType === 'createGroup'} onChange={() => setRegType('createGroup')} className="mr-2" />
                                        <span className="text-sm">Tạo nhóm</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="regType" value="joinGroup" checked={regType === 'joinGroup'} onChange={() => setRegType('joinGroup')} className="mr-2" />
                                        <span className="text-sm">Tham gia nhóm</span>
                                    </label>
                                </>
                            )}
                        </div>
                        {selectedActivity?.hinh_thuc === 'Nhóm' && regType === '' && (
                             <p className="text-xs text-red-500 mt-1">Vui lòng chọn Tạo nhóm hoặc Tham gia nhóm.</p>
                        )}
                        
                    </div>

                    {regType === 'createGroup' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm *</label>
                            <input
                                type="text"
                                required
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Nhập tên nhóm"
                            />
                        </div>
                    )}

                    {regType === 'joinGroup' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã tham gia *</label>
                            <input
                                type="text"
                                required
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Nhập mã tham gia 6 chữ số"
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setShowRegModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Hủy</button>
                        <button 
                            type="submit" 
                            disabled={isRegisterButtonDisabled} // **Sử dụng biến tính toán**
                            className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50" 
                            style={{ backgroundColor: config.accent_color }}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Group Members Modal (Giữ nguyên) */}
            <Modal
                isOpen={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                title={`Thành viên nhóm: ${selectedGroupReg?.ten_nhom || ''}`}
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Mã tham gia:</strong> {selectedGroupReg?.ma_tham_gia}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Danh sách thành viên ({groupMembers.length})</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {groupMembers.length > 0 ? (
                                groupMembers.map((member) => (
                                    <div key={member.ma_sv} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{member.ho_ten}</div>
                                            <div className="text-xs text-gray-500">{member.ma_sv}</div>
                                        </div>
                                        {member.email && <div className="text-xs text-gray-500">{member.email}</div>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Chưa có thành viên</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => setShowGroupModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Đóng</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}