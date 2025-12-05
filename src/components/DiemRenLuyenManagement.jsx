import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchDiemRenLuyenByNamHoc,
  getStatisticsByLop,
  processDiemRenLuyen,
  exportDiemRenLuyenExcel
} from '../services/diem-ren-luyen';

function DiemRenLuyenManagement() {
  const [diemList, setDiemList] = useState([]);
  const [statisticsByLop, setStatisticsByLop] = useState([]);
  const [selectedTab, setSelectedTab] = useState('list'); // 'list', 'statistics', 'process', 'export'
  
  const [namHoc, setNamHoc] = useState('2024-2025');
  const [kyHoc, setKyHoc] = useState('Học kỳ 1');
  const [lop, setLop] = useState('');
  const [khoa, setKhoa] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load dữ liệu khi component mount
  const loadDiemRenLuyen = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDiemRenLuyenByNamHoc(namHoc);
      setDiemList(data || []);
    } catch (err) {
      setMessage('Lỗi tải danh sách: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [namHoc]);

  useEffect(() => {
    loadDiemRenLuyen();
  }, [namHoc, loadDiemRenLuyen]);

  const loadStatisticsByLop = async () => {
    try {
      setLoading(true);
      const data = await getStatisticsByLop(namHoc);
      setStatisticsByLop(data || []);
    } catch (err) {
      setMessage('Lỗi tải thống kê: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDiem = async () => {
    try {
      setLoading(true);
      const result = await processDiemRenLuyen({ namHoc, kyHoc });
      setMessage(result.message || 'Xử lý điểm thành công');
      await loadDiemRenLuyen();
    } catch (err) {
      setMessage('Lỗi xử lý điểm: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const filters = {
        namHoc,
        ...(lop && { lop }),
        ...(khoa && { khoa })
      };
      
      // Gọi API và lấy Blob
      const blob = await exportDiemRenLuyenExcel(filters);
      
      // Tạo URL từ Blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diem_ren_luyen_${namHoc || 'all'}_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage('✅ Xuất file Excel thành công');
    } catch (err) {
      setMessage('❌ Lỗi xuất file: ' + (err.message || ''));
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setSelectedTab(tab);
    if (tab === 'statistics') {
      await loadStatisticsByLop();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Điểm Rèn Luyện
          </h1>
          <p className="text-gray-600">
            Xử lý, quản lý và xuất báo cáo điểm rèn luyện sinh viên
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            {message}
            <button
              onClick={() => setMessage('')}
              className="ml-4 text-blue-500 hover:text-blue-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('list')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              selectedTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Danh Sách Điểm
          </button>
          <button
            onClick={() => handleTabChange('statistics')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              selectedTab === 'statistics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Thống Kê
          </button>
          <button
            onClick={() => handleTabChange('process')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              selectedTab === 'process'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Xử Lý Điểm
          </button>
          <button
            onClick={() => handleTabChange('export')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              selectedTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Xuất Báo Cáo
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'list' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6 flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm Học
                </label>
                <select
                  value={namHoc}
                  onChange={(e) => setNamHoc(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp
                </label>
                <input
                  type="text"
                  value={lop}
                  onChange={(e) => setLop(e.target.value)}
                  placeholder="K61, K62..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            {diemList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Mã SV
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Họ Tên
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Lớp
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Khoa
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Điểm
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Xếp Loại
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Kỳ Học
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {diemList
                      .filter(d => !lop || d.lop === lop)
                      .map((d) => (
                        <tr
                          key={d.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">{d.ma_sv}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{d.ho_ten}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{d.lop}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{d.khoa}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                            {d.diem}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              d.xep_loai === 'Xuất sắc' ? 'bg-green-100 text-green-800' :
                              d.xep_loai === 'Tốt' ? 'bg-blue-100 text-blue-800' :
                              d.xep_loai === 'Khá' ? 'bg-yellow-100 text-yellow-800' :
                              d.xep_loai === 'Trung bình' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {d.xep_loai}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{d.ky_hoc}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        )}

        {selectedTab === 'statistics' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Thống Kê Theo Lớp - Năm Học {namHoc}
            </h2>

            {statisticsByLop.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Lớp
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Khoa
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Số SV
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Điểm TB
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Min
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Max
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Xuất Sắc
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Tốt
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Khá
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statisticsByLop.map((s, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {s.lop}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.khoa}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700">
                          {s.so_sinh_vien}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                          {parseFloat(s.diem_trung_binh).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700">
                          {s.diem_min}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700">
                          {s.diem_max}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-green-700 font-semibold">
                          {s.xuat_sac || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-blue-700 font-semibold">
                          {s.tot || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-yellow-700 font-semibold">
                          {s.kha || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Chưa có dữ liệu thống kê
              </div>
            )}
          </div>
        )}

        {selectedTab === 'process' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Xử Lý Điểm Rèn Luyện
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-900 text-sm">
                <span className="font-semibold">⚠️ Chú ý:</span> Mỗi lần xử lý sẽ <strong>cập nhật hoặc thêm mới</strong> điểm rèn luyện cho sinh viên trong kỳ học đó.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 text-sm mb-4">
                <span className="font-semibold">Quy tắc tính điểm:</span>
              </p>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Giải Nhất: +3 điểm</li>
                <li>• Giải Nhì: +2 điểm</li>
                <li>• Giải Ba: +1 điểm</li>
                <li>• Giải Khuyến khích: +0.5 điểm</li>
                <li>• Tham dự hoạt động: +0.25 điểm</li>
              </ul>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm Học <span className="text-red-500">*</span>
                </label>
                <select
                  value={namHoc}
                  onChange={(e) => setNamHoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kỳ Học <span className="text-red-500">*</span>
                </label>
                <select
                  value={kyHoc}
                  onChange={(e) => setKyHoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Học kỳ 1">Học kỳ 1</option>
                  <option value="Học kỳ 2">Học kỳ 2</option>
                  <option value="Học kỳ hè">Học kỳ hè</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleProcessDiem}
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'Đang xử lý...' : 'Xử Lý Điểm'}
            </button>
          </div>
        )}

        {selectedTab === 'export' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Xuất Báo Cáo Excel
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm Học
                </label>
                <select
                  value={namHoc}
                  onChange={(e) => setNamHoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={lop}
                  onChange={(e) => setLop(e.target.value)}
                  placeholder="K61, K62... (để trống để xuất tất cả)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoa (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={khoa}
                  onChange={(e) => setKhoa(e.target.value)}
                  placeholder="Khoa Toán, Khoa Lý... (để trống để xuất tất cả)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleExportExcel}
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'Đang xuất...' : 'Xuất File Excel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiemRenLuyenManagement;
