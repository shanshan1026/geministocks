import React, { useEffect } from 'react';
import { XIcon } from './icons/Icons';
import { useI18n } from '../hooks/useI18n';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        className="glass-refined bg-white/80 p-8 max-w-sm w-full text-center relative animate-reveal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 transition-colors"
          aria-label={t('controls.close')}
        >
          <XIcon className="w-6 h-6" />
        </button>

        <h2 id="support-modal-title" className="text-2xl font-bold text-slate-800 mb-2">
          {t('support.supportAuthor')}
        </h2>
        <p className="text-slate-600 mb-6">
          {t('support.description')}
        </p>

        <div className="p-2 border-4 border-slate-100/80 rounded-lg inline-block">
          <img
            src="https://youke1.picui.cn/s1/2025/09/28/68d93e5e927e6.jpg"
            alt={t('support.supportAuthor')}
            className="w-64 h-64 object-contain rounded-md"
          />
        </div>

        <p className="text-xs text-slate-400 mt-4">
          {t('support.description2')}
        </p>
      </div>
    </div>
  );
};

export default SupportModal;
