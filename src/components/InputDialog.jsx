import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function InputDialog({
  isOpen,
  title = 'Nhập thông tin',
  label = '',
  defaultValue = '',
  placeholder = '',
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  multiline = false
}) {
  const [value, setValue] = useState(defaultValue || '');

  useEffect(() => {
    if (isOpen) setValue(defaultValue || '');
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm(value);
    if (onCancel) onCancel();
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div>
        {label && <div className="text-sm text-gray-700 mb-2">{label}</div>}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={onCancel} className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">{cancelText}</button>
          <button onClick={handleConfirm} className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:opacity-90">{confirmText}</button>
        </div>
      </div>
    </Modal>
  );
}
