import { useState, useEffect, useRef } from 'react';

const useAudio = (src) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(new Audio(src));

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => setPlaying(false);
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    audioRef.current.src = src;
    audioRef.current.load();
    setPlaying(false);
  }, [src]);

  useEffect(() => {
    if (playing) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  const play = () => setPlaying(true);
  const pause = () => setPlaying(false);
  const stop = () => {
    setPlaying(false);
    audioRef.current.currentTime = 0;
  };
  const replay = () => {
    stop();
    setTimeout(play, 100);
  };

  return {
    playing,
    play,
    pause,
    stop,
    replay
  };
};

export default useAudio;