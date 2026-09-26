import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, HelpCircle } from 'lucide-react';

interface Soundscape {
  id: string;
  name: string;
  emoji: string;
  url: string;
  description: string;
  color: string;
}

const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'rain',
    name: 'Теплий дощ',
    emoji: '🌧️',
    url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    description: 'Змиває тривогу та розслабляє нервову систему',
    color: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-500/20 text-blue-600 dark:text-blue-400'
  },
  {
    id: 'ocean',
    name: 'Шум моря',
    emoji: '🌊',
    url: 'https://actions.google.com/sounds/v1/water/sea_waves.ogg',
    description: 'Ритмічні хвилі заспокоюють серцебиття',
    color: 'from-teal-500/10 to-cyan-500/10 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-500/20 text-teal-600 dark:text-teal-400'
  },
  {
    id: 'forest',
    name: 'Спів птахів у лісі',
    emoji: '🌲',
    url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    description: 'Знижує рівень кортизолу (гормону стресу)',
    color: 'from-emerald-500/10 to-green-500/10 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  }
];

export const SosSoundscapes: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTogglePlay = (sound: Soundscape) => {
    if (!audioRef.current) return;

    if (playingId === sound.id) {
      // Pause
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      // Play new
      audioRef.current.src = sound.url;
      audioRef.current.play().catch((err) => {
        console.warn('Audio play failed:', err);
      });
      setPlayingId(sound.id);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900/30 border border-slate-200/80 dark:border-zinc-800/80 text-left space-y-4 relative overflow-hidden transition-all shadow-xs">
      {/* Background ambient gradient */}
      <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center text-sm shadow-2xs">
            🎧
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-none">
              Звукотерапія спокою
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
              Ембієнт-звуки пригнічують імпульсивне бажання закурити
            </p>
          </div>
        </div>

        {/* Audio Equalizer animation when playing */}
        {playingId && (
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-sky-500 rounded-full animate-pulse" />
            <span className="w-0.5 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="w-0.5 h-1.5 bg-sky-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <span className="w-0.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.45s' }} />
          </div>
        )}
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 gap-2">
        {SOUNDSCAPES.map((sound) => {
          const isCurrent = playingId === sound.id;
          return (
            <button
              key={sound.id}
              type="button"
              onClick={() => handleTogglePlay(sound)}
              className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer active:scale-[0.99] group ${
                isCurrent
                  ? 'bg-sky-500/20 dark:bg-sky-950/30 border-sky-500/50 text-sky-800 dark:text-sky-300 font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border-slate-200/60 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0 filter drop-shadow-xs group-hover:scale-110 transition-transform">
                  {sound.emoji}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-bold leading-tight">
                    {sound.name}
                  </h4>
                  <p className="text-[9.5px] text-slate-500 dark:text-zinc-400 truncate mt-0.5 font-normal">
                    {sound.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 ml-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isCurrent 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 group-hover:bg-slate-300 dark:group-hover:bg-zinc-700'
                }`}>
                  {isCurrent ? <Pause className="w-3.5 h-3.5 fill-white stroke-[3]" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Volume Controls (Only visible if something is playing) */}
      {playingId && (
        <div className="flex items-center gap-2.5 pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 animate-fadeIn">
          <button
            type="button"
            onClick={handleToggleMute}
            className="text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            title={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="flex-1 h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          
          <span className="font-mono text-[9px] text-slate-400 dark:text-zinc-500 w-6 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
