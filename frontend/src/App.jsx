import { useState } from 'react';
import HostApp from './HostApp';
import MobileApp from './MobileApp';
import { Monitor, Smartphone } from 'lucide-react';
import './index.css';

function App() {
  const [mode, setMode] = useState(null); // 'host' | 'team'

  if (mode === 'host') {
    return <HostApp />;
  }

  if (mode === 'team') {
    return <MobileApp />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Bio Jeopardy</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>Select your role to continue</p>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div 
          onClick={() => setMode('host')}
          className="glass-panel" 
          style={{ width: '250px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Monitor size={64} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: 0 }}>Host Game</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Run the game board on this screen.</p>
        </div>

        <div 
          onClick={() => setMode('team')}
          className="glass-panel" 
          style={{ width: '250px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Smartphone size={64} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: 0 }}>Join as Team</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Use this device as your buzzer.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
