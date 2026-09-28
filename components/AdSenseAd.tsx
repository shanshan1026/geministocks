import React, { useEffect } from 'react';

// Declaration for the adsbygoogle object on the window
declare global {
  interface Window {
    adsbygoogle: object[];
  }
}

/**
 * Renders a Google AdSense ad unit.
 */
const AdSenseAd: React.FC = () => {
  const adSlot = '2007848404'; // User's AdSense Slot ID

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Could not push AdSense ad:', e);
    }
  }, []); // Run only once when the component mounts

  return (
    <div className="my-8">
      <div className="bg-gray-200/50 p-4 rounded-lg w-full text-center min-h-[100px] flex flex-col justify-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Advertisement</span>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-3934801149292236"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
};

export default AdSenseAd;