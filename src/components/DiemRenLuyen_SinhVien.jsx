import React, { useState, useEffect } from 'react';
import { fetchDiemRenLuyenBySinhVien } from '../services/diem-ren-luyen';
import { useApp } from '../hooks/useApp';

function DiemRenLuyen_SinhVien() {
  const { user } = useApp();
  
  const [diemRenLuyen, setDiemRenLuyen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);

  // Load điểm rèn luyện khi component mount
  useEffect(() => {
    if (user?.ma_sv) {
      loadDiemRenLuyen();
    }
  }, [user?.ma_sv]);

  const loadDiemRenLuyen = async () => {
    try {
      setLoading(true);
      const data = await fetchDiemRenLuyenBySinhVien(user.ma_sv);
      setDiemRenLuyen(data);
      setSearched(true);
      
      if (!data) {
        setMessage('Chưa có điểm rèn luyện');
      } else {
        setMessage('');
      }
    } catch (err) {
      setMessage('Lỗi tải điểm rèn luyện: ' + (err.message || ''));
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDiemRenLuyen(null);
    setSearched(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Điểm Rèn Luyện
          </h1>
          <p className="text-gray-600">
            Xem điểm rèn luyện của bạn
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('Lỗi')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            {message}
            <button
              onClick={() => setMessage('')}
              className="ml-4 hover:text-opacity-70"
            >
              ✕
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông Tin
          </h2>
          
          <p className="text-gray-700 mb-4">
            <span className="font-semibold">Mã sinh viên:</span> {user?.ma_sv || 'N/A'}
          </p>
          <p className="text-gray-700 mb-6">
            <span className="font-semibold">Họ tên:</span> {user?.ho_ten || 'N/A'}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={loadDiemRenLuyen}
              disabled={loading || !user?.ma_sv}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Đang tải...' : 'Tải Lại'}
            </button>
            {searched && (
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {searched && diemRenLuyen && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Kết Quả Điểm Rèn Luyện
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* General Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông Tin Chung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã Sinh Viên
                    </label>
                    <p className="text-gray-900 font-semibold">{diemRenLuyen.ma_sv}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ Tên
                    </label>
                    <p className="text-gray-900">{diemRenLuyen.ho_ten || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm Học
                    </label>
                    <p className="text-gray-900">{diemRenLuyen.nam_hoc}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kỳ Học
                    </label>
                    <p className="text-gray-900">{diemRenLuyen.ky_hoc}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lớp
                    </label>
                    <p className="text-gray-900">{diemRenLuyen.lop}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khoa
                    </label>
                    <p className="text-gray-900">{diemRenLuyen.khoa}</p>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Điểm Chi Tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm Tham Dự Hoạt Động
                    </label>
                    <p className="text-3xl font-bold text-blue-600">
                      {diemRenLuyen.diem_tham_du_hoat_dong || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm Kết Quả Hoạt Động
                    </label>
                    <p className="text-3xl font-bold text-green-600">
                      {diemRenLuyen.diem_ket_qua_hoat_dong || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm Kiểm Điểm
                    </label>
                    <p className="text-3xl font-bold text-purple-600">
                      {diemRenLuyen.diem_kiem_diem || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm Rèn Luyện Cuối Kỳ
                    </label>
                    <p className="text-3xl font-bold text-orange-600">
                      {diemRenLuyen.diem_ren_luyen_cuoi_ky || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown Table */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống Kê Điểm</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Loại Điểm
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          Giá Trị
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">Điểm Tham Dự Hoạt Động</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">
                          {diemRenLuyen.diem_tham_du_hoat_dong || 0}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">Điểm Kết Quả Hoạt Động</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                          {diemRenLuyen.diem_ket_qua_hoat_dong || 0}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">Điểm Kiểm Điểm</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-purple-600">
                          {diemRenLuyen.diem_kiem_diem || 0}
                        </td>
                      </tr>
                      <tr className="bg-orange-50 border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          Điểm Rèn Luyện Cuối Kỳ (Tổng)
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-orange-600 text-lg">
                          {diemRenLuyen.diem_ren_luyen_cuoi_ky || 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Info */}
              {diemRenLuyen.ghi_chu && (
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi Chú
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{diemRenLuyen.ghi_chu}</p>
                  </div>
                </div>
              )}

              {diemRenLuyen.ngay_cap_nhat && (
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày Cập Nhật
                  </label>
                  <p className="text-gray-900">
                    {new Date(diemRenLuyen.ngay_cap_nhat).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {searched && !diemRenLuyen && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg font-medium">
              Chưa có điểm rèn luyện
            </p>
            <p className="text-gray-500 mt-2">
              Vui lòng quay lại sau để kiểm tra
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiemRenLuyen_SinhVien;
