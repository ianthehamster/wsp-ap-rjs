/* eslint-disable react/prop-types */
import { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
  faVolumeOff,
} from '@fortawesome/free-solid-svg-icons';

const formWaveSurferOptions = (ref) => ({
  // ref is reference to the DOM element where the waveform will be rendered
  container: ref, // DOM element where the waveform will be rendered
  waveColor: '#ccc',
  progressColor: '#0178ff',
  cursorColor: 'transparent',
  responsive: true,
  height: 80,
  normalize: true, // Normalize the waveform to fit the container -> peak amplitude reaches the height of the container
  backend: 'WebAudio', // Use WebAudio backend for better performance
  barWidth: 2,
  barGap: 3,
});

// Helper function to format time
function formatTime(seconds) {
  let date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
}

export default function AudioPlayer({ audioFile }) {
  const waveformRef = useRef(null); // useRef is used to create a mutable object that persists for the full lifetime of the component
  // waveformRef is a reference to the DOM element where the waveform will be rendered and does not cause re-renders when changed
  const wavesurfer = useRef(null); // wavesurfer is a reference to the WaveSurfer instance since wavesurer.js creates an object to control and manage audio waveform like play, pause, volume, etc.
  // allows for easter access to the WaveSurfer instance and its methods without needing to re-create the WaveSurfer instance on every render
  const [playing, setPlaying] = useState(false); // useState is used to create state variables and causes re-renders of the component when changed
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioFileName, setAudioFileName] = useState('');

  // Initialize WaveSurfer and set up event listeners
  useEffect(() => {
    // Create WaveSurfer instance with options
    const options = formWaveSurferOptions(waveformRef.current);
    wavesurfer.current = WaveSurfer.create(options);

    // Load the audio file
    wavesurfer.current.load(audioFile);

    // When WaveSurfer is ready
    wavesurfer.current.on('ready', () => {
      setVolume(wavesurfer.current.getVolume());
      setDuration(wavesurfer.current.getDuration());
      setAudioFileName(audioFile.split('/').pop());
    });

    // Update current time in state as audio plays
    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    // Clean up event listeners and destroy instance on unmount
    return () => {
      wavesurfer.current.un('audioprocess');
      wavesurfer.current.un('ready');
      wavesurfer.current.destroy();
    };
  }, [audioFile]);

  // Toggle playback of audio
  const handlePlayPause = () => {
    setPlaying(!playing);
    wavesurfer.current.playPause();
  };

  // Adjust audio volume
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    wavesurfer.current.setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  // Toggle mute/unmute audio
  const handleMute = () => {
    setMuted(!muted);
    wavesurfer.current.setVolume(muted ? volume : 0);
  };

  // Increase volume by 10%
  const handleVolumeUp = () => {
    handleVolumeChange(Math.min(volume + 0.1, 1));
  };

  // Decrease volume by 10%
  const handleVolumeDown = () => {
    handleVolumeChange(Math.max(volume - 0.1, 0));
  };

  return (
    <div>
      <div id="waveform" ref={waveformRef} style={{ width: '100%' }}></div>
      <div className="controls">
        {/* Play/Pause button */}
        <button onClick={handlePlayPause}>
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </button>
        {/* Mute/Unmute button */}
        <button onClick={handleMute}>
          <FontAwesomeIcon icon={muted ? faVolumeOff : faVolumeMute} />
        </button>
        {/* Volume slider */}
        <input
          type="range"
          id="volume"
          name="volume"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
        />
        {/* Volume Down button */}
        <button onClick={handleVolumeDown}>
          <FontAwesomeIcon icon={faVolumeDown} />
        </button>
        {/* Volume Up button */}
        <button onClick={handleVolumeUp}>
          <FontAwesomeIcon icon={faVolumeUp} />
        </button>
      </div>
      <div className="audio-info">
        {/* Audio file name and current play time */}
        <span>
          Playing: {audioFileName} <br />
        </span>
        <span>
          Duration: {formatTime(duration)} | Current Time:{' '}
          {formatTime(currentTime)} <br />
        </span>
        <span>Volume: {Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
