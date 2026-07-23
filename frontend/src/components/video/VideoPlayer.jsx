import { useRef, useState, useEffect } from 'react'

export default function VideoPlayer({ src, poster, captions }) {
  const videoRef = useRef(null)

  const [captionsUrl, setCaptionsUrl] = useState(null);

  useEffect(() => {
    if (!captions) return;

    // Bulletproof VTT formatting for all previously uploaded videos
    let cleanCaptions = captions.replace(/^.*WEBVTT[\s\n]*/si, '');
    cleanCaptions = "WEBVTT\n\n" + cleanCaptions;

    // Fix invalid timestamps from AI (e.g. 00:00.0 instead of 00:00.000)
    // WebVTT strictly requires 3 decimal places for milliseconds
    cleanCaptions = cleanCaptions.replace(/(\d{2}:\d{2}(?::\d{2})?)\.(\d{1,2})(?!\d)/g, (match, time, ms) => {
      return `${time}.${ms.padEnd(3, '0')}`;
    });

    // Fix invalid separator from AI (e.g. -> instead of -->)
    cleanCaptions = cleanCaptions.replace(/\s+->\s+/g, ' --> ');

    const blob = new Blob([cleanCaptions], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    setCaptionsUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [captions]);

  // Forcefully enable the captions track since browsers sometimes ignore the 'default' attribute
  useEffect(() => {
    if (videoRef.current && captionsUrl) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'captions') {
          tracks[i].mode = 'showing';
        }
      }
    }
  }, [captionsUrl]);
  
  return (
    <div className="relative w-full bg-black aspect-video rounded-xl overflow-hidden group">
      <video
        key={captionsUrl || 'no-cc'}
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        crossOrigin="anonymous"
        controlsList="nodownload"
        className="w-full h-full object-contain"
        autoPlay
      >
        {captionsUrl && (
          <track
            kind="captions"
            src={captionsUrl}
            srcLang="en"
            label="English (Auto-Generated)"
            default
          />
        )}
      </video>
    </div>
  )
}
