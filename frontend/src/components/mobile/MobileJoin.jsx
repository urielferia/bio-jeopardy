import { useState } from 'react';

const MobileJoin = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6'); // default blue

  const colors = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Orange', value: '#f59e0b' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Pink', value: '#ec4899' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), color);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Join Game</h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '1.2rem' }}>Team Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter team name..."
              required
              style={{ fontSize: '1.2rem', padding: '15px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Team Color</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {colors.map(c => (
                <div 
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  style={{
                    width: '50px', height: '50px', borderRadius: '50%', background: c.value,
                    cursor: 'pointer', border: color === c.value ? '4px solid white' : '4px solid transparent',
                    boxShadow: color === c.value ? '0 0 15px rgba(255,255,255,0.5)' : 'none',
                    transform: color === c.value ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          <button type="submit" style={{ fontSize: '1.5rem', padding: '15px', marginTop: '1rem', background: color, color: 'white' }}>
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default MobileJoin;
