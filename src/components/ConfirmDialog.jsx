import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  title = 'Xác nhận',
  message = '',
  onConfirm,
  onCancel,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    try {
      if (onConfirm) onConfirm();
    } finally {
      if (onCancel) onCancel();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div>
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:opacity-90"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
