import React from 'react';
import { XIcon } from './icons/Icons';

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void; title: string }> = ({ imageUrl, onClose, title }) => (
  <div
    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="image-modal-title"
  >
    <div
      className="bg-white p-6 max-w-sm w-full text-center relative animate-reveal-scale"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="关闭"
      >
        <XIcon className="w-6 h-6" />
      </button>
      <h2 id="image-modal-title" className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="p-2 border-4 border-gray-100 rounded-lg inline-block">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="公众号二维码"
          className="w-64 h-64 object-contain rounded-md"
        />
      </div>
    </div>
  </div>
);

export default ImageModal;
