import AudioFile from './assets/audio.mp3';
import obiWanKenobiVoiceLines from './assets/obiWanKenobiVoiceLines.mp3';
import AudioPlayer from './components/AudioPlayer';

import './App.css';

function App() {
  return (
    <>
      <AudioPlayer audioFile={obiWanKenobiVoiceLines} />
    </>
  );
}

export default App;
