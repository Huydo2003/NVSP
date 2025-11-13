import { useState } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import Modal from './Modal';

export default function ImportUsersModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'results'

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Try to preview the file using FileReader
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(new Uint8Array(event.target.result), { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(sheet);
          
          // Show first 5 rows as preview
          setPreview(data.slice(0, 5));
          setStep('preview');
        } catch (err) {
          console.error('Error parsing file for preview:', err);
          toast.error('Không thể đọc file Excel');
          setFile(null);
          setPreview([]);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      console.error('Error reading file:', err);
      toast.error('Lỗi khi đọc file');
      setFile(null);
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Chưa chọn file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('nvsp_token');
      const response = await fetch('http://localhost:4000/api/users/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Lỗi khi import');
        return;
      }

      setResults(data);
      setStep('results');

      // Refresh user list after successful import
      if (data.success && data.success.length > 0 && onImportSuccess) {
        onImportSuccess();
      }

      // Show summary
      if (data.success && data.success.length > 0) {
        toast.success(`Import thành công ${data.success.length} người dùng`);
      }
      if (data.errors && data.errors.length > 0) {
        toast.error(`Có ${data.errors.length} lỗi khi import`);
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Lỗi khi gửi request import');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setFile(null);
    setPreview([]);
    setResults(null);
    setStep('upload');
    onClose();
  };

  const handleRetry = () => {
    setFile(null);
    setPreview([]);
    setResults(null);
    setStep('upload');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import người dùng từ Excel"
      size="lg"
    >
      {step === 'upload' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Hướng dẫn:</strong> File Excel phải có các cột: ma_ca_nhan, ho_ten, loai_tk, mat_khau (tuỳ chọn), email (tuỳ chọn), nien_khoa, lop và nganh (cho sinh viên), khoa (cho giảng viên)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                ✓ Đã chọn: {file.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Đang import...' : 'Import'}
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Xem trước dữ liệu (5 dòng đầu tiên):
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {preview.length > 0 && Object.keys(preview[0]).map(key => (
                      <th key={key} className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      {Object.values(row).map((val, cidx) => (
                        <td key={cidx} className="px-3 py-2 text-gray-900">
                          {String(val || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Chọn file khác
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Đang import...' : 'Tiếp tục import'}
            </button>
          </div>
        </div>
      )}

      {step === 'results' && results && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-2xl font-bold text-green-700">
                {results.success?.length || 0}
              </div>
              <div className="text-sm text-green-600">Thêm thành công</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="text-2xl font-bold text-red-700">
                {results.errors?.length || 0}
              </div>
              <div className="text-sm text-red-600">Có lỗi</div>
            </div>
          </div>

          {results.success && results.success.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Các bản ghi thêm thành công:</h3>
              <div className="overflow-y-auto max-h-48 border border-green-200 rounded bg-green-50">
                <table className="w-full text-xs">
                  <thead className="bg-green-100 sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left">Dòng</th>
                      <th className="px-2 py-1 text-left">Mã</th>
                      <th className="px-2 py-1 text-left">Tên</th>
                      <th className="px-2 py-1 text-left">Loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.success.map((item, idx) => (
                      <tr key={idx} className="border-t border-green-200 hover:bg-green-100">
                        <td className="px-2 py-1">{item.rowNum}</td>
                        <td className="px-2 py-1">{item.ma_ca_nhan}</td>
                        <td className="px-2 py-1">{item.ho_ten}</td>
                        <td className="px-2 py-1">{item.loai_tk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results.errors && results.errors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Các dòng có lỗi:</h3>
              <div className="overflow-y-auto max-h-48 border border-red-200 rounded bg-red-50">
                <table className="w-full text-xs">
                  <thead className="bg-red-100 sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left">Dòng</th>
                      <th className="px-2 py-1 text-left">Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.errors.map((item, idx) => (
                      <tr key={idx} className="border-t border-red-200 hover:bg-red-100">
                        <td className="px-2 py-1">{item.rowNum}</td>
                        <td className="px-2 py-1">{item.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Đóng
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Import file khác
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
