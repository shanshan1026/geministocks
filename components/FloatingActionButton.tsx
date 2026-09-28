import React, { useState, useCallback, useRef } from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const [plusOnes, setPlusOnes] = useState<{ id: number }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lazily initialize the Audio object on the first interaction
  const getAudio = () => {
    if (!audioRef.current) {
      // A reliable, short, and royalty-free UI pop sound
      const clickSoundUrl = 'https://assets.codepen.io/605876/pop.mp3';
      audioRef.current = new Audio(clickSoundUrl);
    }
    return audioRef.current;
  };

  const handleClick = useCallback(() => {
    onClick();
    
    // Play the click sound
    const audio = getAudio();
    audio.currentTime = 0; // Rewind to the start in case of rapid clicks
    audio.play().catch(error => console.error("Error playing audio:", error));

    const newPlusOne = { id: Date.now() };
    setPlusOnes(current => [...current, newPlusOne]);

    // Remove the "+1" element after the animation finishes
    setTimeout(() => {
      setPlusOnes(current => current.filter(p => p.id !== newPlusOne.id));
    }, 800); // Corresponds to animation duration in index.html
  }, [onClick]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        <button
          onClick={handleClick}
          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center transform transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          aria-label="Increment counter"
        >
          <img
            src="https://youke1.picui.cn/s1/2025/10/08/68e5f0e32b6ac.png"
            alt="Action Button"
            className="w-10 h-10 rounded-full object-cover"
          />
        </button>
        {plusOnes.map(p => (
          <span
            key={p.id}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-2xl font-bold text-cyan-500 pointer-events-none animate-plus-one"
            aria-hidden="true"
          >
            +1
          </span>
        ))}
      </div>
    </div>
  );
};

export default FloatingActionButton;