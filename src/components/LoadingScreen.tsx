import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const loadingText = 'CONNECTING TO CHAT SERVER...';
  const connectingText = 'CONNECTING...';
  const secureText = '* ESTABLISHING SECURE CONNECTION *';

  useEffect(() => {
    // Progress bar effect
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          onLoadingComplete();
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Typewriter effect
    let index = 0;
    const typeInterval = setInterval(() => {
      setText(loadingText.slice(0, index));
      index++;
      if (index > loadingText.length) {
        index = 0;
      }
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(typeInterval);
    };
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-black crt scanlines flex flex-col items-center justify-center font-mono text-green-500">
      <div className="mb-8 text-4xl animate-pulse">{connectingText}</div>
      <div className="w-80 h-6 border-2 border-green-500 relative overflow-hidden bg-black/50">
        <div 
          className="h-full bg-green-500/50 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 text-xl">{progress}%</div>
      <div className="mt-8 text-sm animate-blink">
        {text}
      </div>
      <div className="mt-4 text-xs opacity-50">
        {secureText}
      </div>
    </div>
  );
};

export default LoadingScreen; 