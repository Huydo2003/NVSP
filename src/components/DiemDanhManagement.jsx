import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import {
  fetchDiemDanh,
  exportApprovedDiemDanh,
  fetchDiemDanhByActivity,
  fetchDiemDanhStats
} from '../services/diem-danh';
import { fetchHoatDongThamDu } from '../services/hoat-dong-tham-du';
import { apiFetch } from '../services/api';
import { useApp } from '../hooks/useApp';

export default function DiemDanhManagement() {
  const [activities, setActivities] = useState([]);
  const [registrations, setRegistrations] = useState([]); // full list
  const [loading, setLoading] = useState(true);

  // stats map: { [id_hd_tham_du]: { pending, approved, rejected, total } }
  const [statsByActivity, setStatsByActivity] = useState({});

  // track IDs that have an in-flight request to prevent double requests / double-click
  const [pendingRequests, setPendingRequests] = useState(new Set());

  // export pending state
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityRecords, setActivityRecords] = useState([]);

  const [exportModal, setExportModal] = useState(false);
  const [exportFilename, setExportFilename] = useState('diem_danh_duyet_v2.csv');
  const availableFields = ['id', 'ma_sv', 'id_hd', 'ten_hd', 'thoi_gian', 'trang_thai'];
  const [exportFields, setExportFields] = useState([...availableFields]);
  const [exportTargetId, setExportTargetId] = useState(null);

  const { state } = useApp();
  const { config } = state;

  // Normalize helpers: ensure each record/activity has id_hd_tham_du string
  const normalizeRecord = (r) => {
    const rawId = r?.id_hd ?? r?.id_hd_tham_du ?? r?.id_hd_thamdu ?? r?.id_hdthamdu;
    return { ...r, id_hd_tham_du: rawId != null ? String(rawId) : undefined };
  };

  const normalizeActivity = (a) => {
    const rawId = a?.id_hd_tham_du ?? a?.id_hd ?? a?.id_hd_thamdu ?? a?.id_hdthamdu;
    return { ...a, id_hd_tham_du: rawId != null ? String(rawId) : undefined };
  };

  // Build stats map from registrations array (single source of truth on client)
  const buildStatsMap = (regs) => {
    return (regs || []).reduce((acc, r) => {
      const id = String(r?.id_hd_tham_du ?? r?.id_hd ?? '');
      if (!id) return acc;
      if (!acc[id]) acc[id] = { pending: 0, approved: 0, rejected: 0, total: 0 };
      const st = Number(r.trang_thai ?? 0);
      if (st === 1) acc[id].approved += 1;
      else if (st === -1) acc[id].rejected += 1;
      else acc[id].pending += 1;
      acc[id].total += 1;
      return acc;
    }, {});
  };

  // Load activities + all diem danh + aggregated stats from backend (if available)
  const loadData = async () => {
    setLoading(true);
    try {
      const [hdtd, dd, stats] = await Promise.all([
        fetchHoatDongThamDu(),
        fetchDiemDanh(),
        fetchDiemDanhStats().catch(() => null) // stats endpoint optional
      ]);

      const normalizedActivities = Array.isArray(hdtd) ? hdtd.map(normalizeActivity) : [];
      setActivities(normalizedActivities);

      const normalizedRegs = Array.isArray(dd) ? dd.map(normalizeRecord) : [];
      setRegistrations(normalizedRegs);

      // If backend stats provided, use it as initial map; otherwise derive from registrations
      if (Array.isArray(stats)) {
        const map = {};
        stats.forEach(s => {
          const id = String(s.id_hd_tham_du ?? s.id_hd ?? '');
          map[id] = {
            pending: Number(s.pending ?? 0),
            approved: Number(s.approved ?? 0),
            rejected: Number(s.rejected ?? 0),
            total: Number(s.total ?? 0)
          };
        });
        setStatsByActivity(map);
      } else {
        setStatsByActivity(buildStatsMap(normalizedRegs));
      }
    } catch (err) {
      console.error('loadData error:', err);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // When computing counts prefer backend stats map; fallback to build from registrations
  const getRegCountByStatus = (hdtd, status) => {
    const hdId = String(hdtd?.id_hd_tham_du ?? hdtd?.id_hd ?? '');
    const s = statsByActivity[hdId];
    if (s) {
      if (status === 1) return s.approved;
      if (status === -1) return s.rejected;
      return s.pending;
    }
    // fallback
    return registrations.filter(r => String(r?.id_hd_tham_du ?? r?.id_hd ?? '') === hdId && r.trang_thai === status).length;
  };

  const convertBufferToBase64 = (blob) => {
    if (!blob) return null;
    if (blob?.data && Array.isArray(blob.data)) {
      try {
        const uint8 = new Uint8Array(blob.data);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
        return `data:image/jpeg;base64,${btoa(binary)}`;
      } catch (e) { return null; }
    }
    if (typeof blob === 'string') {
      if (blob.startsWith('data:image')) return blob;
      if (/^[A-Za-z0-9+/=]+$/.test(blob)) return `data:image/jpeg;base64,${blob}`;
    }
    return null;
  };

  // Fetch records for a single activity
  const handleViewRecords = async (activity) => {
    try {
      const activityId = activity?.id_hd_tham_du ?? activity?.id_hd;
      const rows = await fetchDiemDanhByActivity(activityId);
      const newActivityRecords = (Array.isArray(rows) ? rows : []).map(r => {
        const normalized = normalizeRecord(r);
        return {
          ...normalized,
          anh_preview: convertBufferToBase64(r.anh_minh_chung),
          id_hd_tham_du: String(normalized.id_hd_tham_du ?? activityId)
        };
      });
      setActivityRecords(newActivityRecords);
      setSelectedActivity(normalizeActivity(activity));
      setShowRegModal(true);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách điểm danh');
    }
  };

  // Helper to mark a request pending for a specific record id
  const addPending = (id) => setPendingRequests(prev => {
    const s = new Set(prev);
    s.add(id);
    return s;
  });
  const removePending = (id) => setPendingRequests(prev => {
    const s = new Set(prev);
    s.delete(id);
    return s;
  });

  // Update registrations for a specific activity by fetching activity records and merging
  const refreshRegistrationsForActivity = async (activityId) => {
    try {
      const rows = await fetchDiemDanhByActivity(activityId);
      const normalizedRows = (Array.isArray(rows) ? rows : []).map(normalizeRecord);
      setRegistrations(prev => {
        // remove existing regs for this activityId and append fresh ones
        const filtered = prev.filter(r => String(r?.id_hd_tham_du ?? r?.id_hd ?? '') !== String(activityId));
        return [...filtered, ...normalizedRows];
      });
    } catch (err) {
      console.error('refreshRegistrationsForActivity error:', err);
      // ignore; stats will be refreshed below
    }
  };

  // Update trạng thái and then refresh authoritative stats & registrations for affected activity
  const updateRecordStatusFromServerOrFallback = async (updatedRecordObjectOrFallback, newStatus) => {
    let updatedRecord = null;
    let recordId = null;
    let activityId = null;

    if (updatedRecordObjectOrFallback && typeof updatedRecordObjectOrFallback === 'object' && updatedRecordObjectOrFallback.id) {
      updatedRecord = normalizeRecord(updatedRecordObjectOrFallback);
      recordId = String(updatedRecord.id);
      activityId = String(updatedRecord.id_hd_tham_du ?? updatedRecord.id_hd ?? updatedRecord.id_hd_thamdu ?? '');
    } else {
      recordId = String(updatedRecordObjectOrFallback);
      // try to find activityId from modal or existing registrations
      const fromModal = activityRecords.find(r => String(r.id) === recordId);
      const fromAll = registrations.find(r => String(r.id) === recordId);
      activityId = String(fromModal?.id_hd_tham_du ?? fromModal?.id_hd ?? fromAll?.id_hd_tham_du ?? fromAll?.id_hd ?? selectedActivity?.id_hd_tham_du ?? selectedActivity?.id_hd ?? '');
    }

    // Update activityRecords (modal) immediately
    setActivityRecords(prev => prev.map(r => String(r.id) === recordId ? { ...(updatedRecord || r), trang_thai: newStatus } : r));

    // Update registrations locally (best-effort)
    setRegistrations(prev => {
      const foundIdx = prev.findIndex(r => String(r.id) === recordId);
      if (updatedRecord) {
        if (foundIdx >= 0) return prev.map(r => String(r.id) === recordId ? updatedRecord : r);
        return [...prev, updatedRecord];
      }
      if (foundIdx >= 0) {
        return prev.map(r => String(r.id) === recordId ? { ...r, trang_thai: newStatus } : r);
      }
      // if not found, try to take from modal
      const modalRecord = activityRecords.find(r => String(r.id) === recordId);
      if (modalRecord) {
        return [...prev, normalizeRecord({ ...modalRecord, trang_thai: newStatus })];
      }
      // last resort: append minimal so stats change (will be overwritten by server fetch)
      if (activityId) {
        return [...prev, { id: recordId, id_hd_tham_du: String(activityId), trang_thai: newStatus }];
      }
      return prev;
    });

    // Refresh authoritative stats from server
    try {
      const stats = await fetchDiemDanhStats().catch(() => null);
      if (Array.isArray(stats)) {
        const map = {};
        stats.forEach(s => {
          const id = String(s.id_hd_tham_du ?? s.id_hd ?? '');
          map[id] = {
            pending: Number(s.pending ?? 0),
            approved: Number(s.approved ?? 0),
            rejected: Number(s.rejected ?? 0),
            total: Number(s.total ?? 0)
          };
        });
        setStatsByActivity(map);
      } else {
        // fallback: rebuild from current registrations if stats endpoint unavailable
        setStatsByActivity(buildStatsMap(registrations));
      }
    } catch (err) {
      console.error('Error refreshing stats after update:', err);
      setStatsByActivity(buildStatsMap(registrations));
    }

    // Refresh registrations for this activity so local registrations become complete for that activity
    if (activityId) {
      await refreshRegistrationsForActivity(activityId);
      // Rebuild stats again to reflect the fresh registrations
      setStatsByActivity(prev => {
        const newMap = buildStatsMap(registrations);
        // Also merge with prev if needed (prev comes from server)
        return { ...prev, ...newMap };
      });
    }
  };

  // Generic update helper that prevents double-requests and uses server response if available
  const performStatusUpdate = async (record, newStatus) => {
    const id = String(record?.id);
    if (!id) {
      toast.error('Record không hợp lệ');
      return;
    }

    // Prevent double requests for same record
    if (pendingRequests.has(id)) return;
    addPending(id);

    try {
      const res = await apiFetch(`/api/diem-danh/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ trang_thai: newStatus })
      });

      // If backend returns the updated record object, use it to update client state
      if (res && typeof res === 'object' && res.id) {
        await updateRecordStatusFromServerOrFallback(res, newStatus);
      } else {
        // Server didn't return record; fallback to optimistic local update using id
        await updateRecordStatusFromServerOrFallback(id, newStatus);
      }

      toast.success(newStatus === 1 ? 'Đã duyệt' : 'Đã từ chối');
    } catch (err) {
      console.error('performStatusUpdate error:', err);
      toast.error(newStatus === 1 ? 'Duyệt thất bại' : 'Từ chối thất bại');
    } finally {
      removePending(id);
    }
  };

  const handleApprove = (record) => performStatusUpdate(record, 1);
  const handleReject = (record) => performStatusUpdate(record, -1);

  // EXPORT CSV: use exportApprovedDiemDanh which now returns { blob, filename }
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const opts = { filename: exportFilename, fields: exportFields, id_hd: exportTargetId };
      const result = await exportApprovedDiemDanh(opts);
      const blob = result?.blob || result;
      const filename = result?.filename || exportFilename || 'diem_danh_duyet.csv';

      // download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Đã xuất file CSV');
      setExportModal(false);
      setExportTargetId(null);
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err?.message || 'Không thể xuất file');
    } finally {
      setExporting(false);
    }
  };

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

  if (loading) return <div className="p-6">Đang tải...</div>;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(activities.length / itemsPerPage));
  const displayedActivities = activities.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Map key -> label hiển thị đẹp
  const fieldLabels = {
    ho_ten: "Tên sinh viên",
    ma_sv: "Mã sinh viên",
    ten_hd: "Tên hoạt động",
    thoi_gian: "Thời gian điểm danh",
    trang_thai: "Trạng thái",
    id: "ID",
    id_hd: "ID Hoạt động",
    id_hd_tham_du: "ID Hoạt động tham dự"
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>Quản lý Điểm Danh</h1>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Chưa có hoạt động tham dự</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {displayedActivities.map((hdtd) => {
            const approvedCount = getRegCountByStatus(hdtd, 1);
            const rejectedCount = getRegCountByStatus(hdtd, -1);
            const pendingCount = getRegCountByStatus(hdtd, 0);
            const hdId = String(hdtd?.id_hd_tham_du ?? hdtd?.id_hd ?? '');
            const totalRegs = statsByActivity[hdId]?.total ?? registrations.filter(r => String(r?.id_hd_tham_du ?? r?.id_hd ?? '') === hdId).length;

            return (
              <div key={hdId} className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{hdtd.ten_hd}</h3>
                  <div className="text-xs text-gray-500 mb-2">ID: {hdId}</div>
                  <div className="text-sm text-gray-600 mb-3">Thời gian: {hdtd.tg_bat_dau ? new Date(hdtd.tg_bat_dau).toLocaleString('vi-VN') : '—'}</div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-yellow-50 p-2 rounded text-center border border-yellow-200">
                      <div className="font-semibold text-yellow-700">{pendingCount}</div>
                      <div className="text-yellow-600">Chờ duyệt</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center border border-green-200">
                      <div className="font-semibold text-green-700">{approvedCount}</div>
                      <div className="text-green-600">Đã duyệt</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center border border-red-200">
                      <div className="font-semibold text-red-700">{rejectedCount}</div>
                      <div className="text-red-600">Từ chối</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleViewRecords(hdtd)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Xem danh sách ({totalRegs})
                  </button>

                  <button
                    onClick={() => { setExportTargetId(hdId); setExportModal(true); }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Xuất CSV
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3 py-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-3 py-1 rounded ${page === idx + 1 ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
              style={page === idx + 1 ? { backgroundColor: config?.accent_color } : {}}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
        </div>
      )}

      {/* Modal danh sách điểm danh */}
      <Modal isOpen={showRegModal} onClose={() => setShowRegModal(false)} title={`Danh sách điểm danh: ${selectedActivity?.ten_hd || ''}`} size="lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activityRecords.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Chưa có sinh viên nào điểm danh</div>
          ) : activityRecords.map(r => {
            const isPending = pendingRequests.has(String(r.id));
            return (
              <div key={r.id} className="bg-white border rounded p-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="text-sm font-semibold">{r.ho_ten} ({r.ma_sv})</div>
                  <div className="text-xs text-gray-500">{r.thoi_gian ? new Date(r.thoi_gian).toLocaleString('vi-VN') : ''}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getTrangThaiColor(r.trang_thai)}`}>{getTrangThaiText(r.trang_thai)}</span>
                  {r.trang_thai === 0 && (
                    <>
                      <button
                        onClick={() => handleApprove(r)}
                        disabled={isPending}
                        className={`px-3 py-1 text-xs rounded ${isPending ? 'bg-green-300 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      >
                        {isPending ? 'Đang...' : 'Duyệt'}
                      </button>
                      <button
                        onClick={() => handleReject(r)}
                        disabled={isPending}
                        className={`px-3 py-1 text-xs rounded ${isPending ? 'bg-red-300 text-white cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                      >
                        {isPending ? 'Đang...' : 'Từ chối'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Modal xuất CSV */}
      <Modal isOpen={exportModal} onClose={() => { setExportModal(false); setExportTargetId(null); }} title="Tùy chọn xuất CSV" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên file</label>
            <input value={exportFilename} onChange={e => setExportFilename(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn cột</label>
            <div className="grid grid-cols-2 gap-2">
              {availableFields.map(f => (
                <label key={f} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.includes(f)}
                    onChange={() => {
                      setExportFields(prev => (
                        prev.includes(f)
                          ? prev.filter(x => x !== f)
                          : [...prev, f]
                      ));
                    }}
                  />
                  <span className="text-sm">{fieldLabels[f] || f}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button onClick={() => { setExportModal(false); setExportTargetId(null); }} className="px-3 py-2 bg-gray-200 rounded">Hủy</button>
            <button onClick={handleExport} disabled={exporting} className={`px-3 py-2 ${exporting ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-green-600 text-white'} rounded`}>
              {exporting ? 'Đang xuất...' : 'Xuất'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}