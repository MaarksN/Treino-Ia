import React, { useState } from 'react';
import { Music, Maximize2, Minimize2, X, Plus } from 'lucide-react';
import { SafeMusicEmbed, createSafeMusicEmbed } from '../services/media/musicEmbedService';

export function MusicPlayer() {
  const [url, setUrl] = useState('');
  const [embed, setEmbed] = useState<SafeMusicEmbed | null>(null);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleLoad = () => {
    const result = createSafeMusicEmbed(url);

    if (!result.ok || !result.embed) {
      setEmbed(null);
      setError(result.error ?? 'URL de musica invalida.');
      return;
    }

    setError('');
    setEmbed(result.embed);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-brand-magenta text-brand-light border-brutal flex items-center justify-center shadow-brutal-magenta hover:scale-110 transition-transform z-50 group"
        title="Player de Música"
      >
        <Music className="w-8 h-8 group-hover:animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 left-6 z-50 bg-brand-dark border-4 border-brand-magenta shadow-brutal-magenta transition-all duration-300 ${isMinimized ? 'w-64 h-16' : 'w-80 md:w-96 p-4'}`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between ${isMinimized ? 'h-full px-4' : 'mb-4 border-b-2 border-brand-magenta/30 pb-2'}`}>
        <div className="flex items-center text-brand-magenta font-black uppercase tracking-widest text-sm">
          <Music className="w-5 h-5 mr-2" />
          {isMinimized ? 'Player' : 'Streaming Hub'}
        </div>
        <div className="flex items-center gap-2 text-brand-light/50">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-brand-magenta">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:text-brand-magenta">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="space-y-4">
          {!embed ? (
            <div className="space-y-3">
              <p className="text-xs text-brand-light font-mono font-bold uppercase">Conecte YouTube, Spotify ou SoundCloud</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError('');
                  }}
                  placeholder="Cole uma URL HTTPS..."
                  className="flex-1 bg-brand-gray border-2 border-brand-magenta/50 px-3 py-2 text-brand-light font-mono text-xs focus:outline-none focus:border-brand-magenta"
                />
                <button 
                  onClick={handleLoad}
                  className="bg-brand-magenta text-brand-light px-3 flex items-center justify-center font-black"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-300 font-mono font-bold" role="alert">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div>
              {/* Iframe wrapper */}
              <div className="w-full h-80 bg-brand-gray border-2 border-brand-light/20 flex items-center justify-center">
                <iframe
                  src={embed.src}
                  title={embed.title}
                  className="w-full h-full"
                  allow={embed.allow}
                  sandbox={embed.sandbox}
                  referrerPolicy={embed.referrerPolicy}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <button 
                onClick={() => setEmbed(null)}
                className="w-full text-center mt-3 text-xs text-brand-muted hover:text-brand-magenta font-mono font-bold uppercase transition-colors"
              >
                Trocar Playlist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
