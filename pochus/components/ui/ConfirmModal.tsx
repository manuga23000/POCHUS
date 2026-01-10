'use client';

import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const icons = {
    danger: <AlertTriangle size={48} className="text-red-500" />,
    warning: <AlertTriangle size={48} className="text-yellow-500" />,
    info: <AlertTriangle size={48} className="text-sky-500" />
  };

  const defaultTitles = {
    danger: '¿Estás segura?',
    warning: 'Confirmación',
    info: 'Confirmar acción'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-700">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {icons[type]}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-100 text-center mb-2">
          {title || defaultTitles[type]}
        </h3>

        {/* Message */}
        <p className="text-gray-300 text-center mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="secondary"
            fullWidth
            size="lg"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            fullWidth
            size="lg"
            className={type === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
