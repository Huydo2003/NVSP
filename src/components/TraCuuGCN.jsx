import React, { useState, useEffect } from 'react';
import {
  fetchGCNAll,
  fetchGCNById,
  searchGCN,
  fetchLogTraCuuByGcnId,
  addLogTraCuu
} from '../services/log-tra-cuu';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';

function TraCuuGCN() {
  const [gcnList, setGcnList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredGcn, setFilteredGcn] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedGcn, setSelectedGcn] = useState(null);
  const [gcnDetails, setGcnDetails] = useState(null);
  const [logHistory, setLogHistory] = useState([]);
  
  // Tìm kiếm
  const [searchLoai, setSearchLoai] = useState('');
  const [searchNoiDung, setSearchNoiDung] = useState('');
  const [searchTrangThai, setSearchTrangThai] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load toàn bộ GCN khi component mount
  useEffect(() => {
    loadAllGCN();
  }, []);

  const loadAllGCN = async () => {
    try {
      setLoading(true);
      const data = await fetchGCNAll();
      setGcnList(data || []);
      setFilteredGcn(data || []);
    } catch (err) {
      setMessage('Lỗi tải danh sách GCN: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      setCurrentPage(1);
      
      const searchParams = {};
      if (searchLoai) searchParams.loai_chung_nhan = searchLoai;
      if (searchNoiDung) searchParams.noi_dung = searchNoiDung;
      if (searchTrangThai !== '') searchParams.trang_thai = searchTrangThai;

      const results = await searchGCN(searchParams);
      setSearchResults(results || []);
      setFilteredGcn(results || []);
    } catch (err) {
      setMessage('Lỗi tìm kiếm: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchLoai('');
    setSearchNoiDung('');
    setSearchTrangThai('');
    setHasSearched(false);
    setFilteredGcn(gcnList);
    setCurrentPage(1);
    setMessage('');
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredGcn.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedGcn = filteredGcn.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const handleViewDetails = async (gcn) => {
    try {
      setLoading(true);
      const details = await fetchGCNById(gcn.id);
      setGcnDetails(details);
      setSelectedGcn(gcn);
      setShowDetailModal(true);

      // Lưu log tra cứu
      await addLogTraCuu({ id_gcn: gcn.id });
    } catch (err) {
      setMessage('Lỗi khi xem chi tiết: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (gcn) => {
    try {
      setLoading(true);
      const history = await fetchLogTraCuuByGcnId(gcn.id);
      setLogHistory(history || []);
      setSelectedGcn(gcn);
      setShowHistoryModal(true);
    } catch (err) {
      setMessage('Lỗi khi tải lịch sử: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setGcnDetails(null);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setLogHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tra Cứu Giấy Chứng Nhận
          </h1>
          <p className="text-gray-600">
            Tìm kiếm và xem chi tiết các giấy chứng nhận đã cấp
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {message}
            <button
              onClick={() => setMessage('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tìm Kiếm
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Loại chứng nhận */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại Chứng Nhận
              </label>
              <select
                value={searchLoai}
                onChange={(e) => setSearchLoai(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Tất cả --</option>
                <option value="Cá nhân">Cá nhân</option>
                <option value="Nhóm">Nhóm</option>
              </select>
            </div>

            {/* Nội dung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội Dung
              </label>
              <input
                type="text"
                value={searchNoiDung}
                onChange={(e) => setSearchNoiDung(e.target.value)}
                placeholder="Nhập từ khóa..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng Thái
              </label>
              <select
                value={searchTrangThai}
                onChange={(e) => setSearchTrangThai(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Tất cả --</option>
                <option value="1">Hoạt động</option>
                <option value="-1">Không hoạt động</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Đang tìm...' : 'Tìm Kiếm'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Đặt Lại
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {hasSearched ? `Kết quả tìm kiếm (${filteredGcn.length})` : `Danh sách Giấy Chứng Nhận (${filteredGcn.length})`}
            </h2>
          </div>

          {/* Table */}
          {filteredGcn.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nội Dung
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Người Cấp
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Giải Thưởng
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGcn.map((gcn) => (
                    <tr
                      key={gcn.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{gcn.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          gcn.loai_chung_nhan === 'Cá nhân'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {gcn.loai_chung_nhan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {gcn.noi_dung}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {gcn.ho_ten || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {gcn.giai_thuong || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          gcn.trang_thai === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {gcn.trang_thai === 1 ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(gcn)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs disabled:bg-gray-400"
                          >
                            Xem Chi Tiết
                          </button>
                          <button
                            onClick={() => handleViewHistory(gcn)}
                            disabled={loading}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs disabled:bg-gray-400"
                          >
                            Lịch Sử
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {hasSearched ? 'Không tìm thấy kết quả nào' : 'Chưa có dữ liệu'}
            </div>
          )}

          {/* Pagination */}
          {filteredGcn.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold">{startIndex + 1}</span> đến{' '}
                <span className="font-semibold">{Math.min(endIndex, filteredGcn.length)}</span> trong{' '}
                <span className="font-semibold">{filteredGcn.length}</span> kết quả
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 text-sm"
                >
                  ← Trước
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 text-sm"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        title="Chi Tiết Giấy Chứng Nhận"
        onClose={closeDetailModal}
      >
        {gcnDetails && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID
              </label>
              <p className="text-gray-900">{gcnDetails.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loại Chứng Nhận
              </label>
              <p className="text-gray-900">{gcnDetails.loai_chung_nhan}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nội Dung
              </label>
              <p className="text-gray-900 whitespace-pre-wrap">{gcnDetails.noi_dung}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Người Cấp
              </label>
              <p className="text-gray-900">{gcnDetails.ho_ten || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Giải Thưởng
              </label>
              <p className="text-gray-900">{gcnDetails.giai_thuong || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trạng Thái
              </label>
              <p className="text-gray-900">
                {gcnDetails.trang_thai === 1 ? 'Hoạt động' : 'Không hoạt động'}
              </p>
            </div>

            <button
              onClick={closeDetailModal}
              className="w-full mt-6 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Đóng
            </button>
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={showHistoryModal}
        title={`Lịch Sử Tra Cứu - ID ${selectedGcn?.id}`}
        onClose={closeHistoryModal}
      >
        <div className="space-y-4">
          {logHistory.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logHistory.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded"
                >
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Thời gian:</span>{' '}
                    {new Date(log.tg_tra_cuu).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Nội dung:</span> {log.noi_dung}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Loại:</span> {log.loai_chung_nhan}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Chưa có lịch sử tra cứu
            </p>
          )}

          <button
            onClick={closeHistoryModal}
            className="w-full mt-6 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Đóng
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default TraCuuGCN;
