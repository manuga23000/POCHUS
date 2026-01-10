'use client';

import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Button from './Button';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: AlertModalProps) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle size={48} className="text-green-500" />,
    error: <XCircle size={48} className="text-red-500" />,
    info: <AlertCircle size={48} className="text-sky-500" />
  };

  const titles = {
    success: title || 'Éxito',
    error: title || 'Error',
    info: title || 'Información'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-700">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {icons[type]}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-100 text-center mb-2">
          {titles[type]}
        </h3>

        {/* Message */}
        <p className="text-gray-300 text-center mb-6">
          {message}
        </p>

        {/* Button */}
        <Button onClick={onClose} fullWidth size="lg">
          Aceptar
        </Button>
      </div>
    </div>
  );
}
