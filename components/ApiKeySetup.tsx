import React from 'react';

// FIX: Deprecated component to remove API key UI, as per security guidelines.
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string) => void;
  initialApiKey: string;
  initialModel: string;
  showApiKeyWarning?: boolean;
}

/**
 * This component has been deprecated to comply with security and API guidelines.
 * API key management is now handled via server-side environment variables and
 * this UI component should no longer be used. It returns null to prevent rendering.
 */
const SettingsModal: React.FC<SettingsModalProps> = () => {
  return null;
};

export default SettingsModal;
