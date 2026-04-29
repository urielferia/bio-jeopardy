import { useState, useEffect } from 'react';
import { X, Clock, PlayCircle, PauseCircle, RotateCcw, Eye } from 'lucide-react';

const QuestionModal = ({ question, teams, timeLimit, onAwardPoints, onClose, lastMessage, sendMessage }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lockedTeam, setLockedTeam] = useState(null);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (!lockedTeam) {
        sendMessage('ENABLE_STEAL');
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, sendMessage]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'STEAL_SUCCESS') {
      const stealingTeam = teams.find(t => t.id === lastMessage.teamId);
      if (stealingTeam) {
        setLockedTeam(stealingTeam);
        setTimeLeft(Math.floor(timeLimit / 2));
        setIsRunning(true);
      }
    }
  }, [lastMessage, teams, timeLimit]);

  const handleSteal = () => {
    sendMessage('ENABLE_STEAL');
    setIsRunning(false);
  };

  const isCritical = timeLeft <= 5 && timeLeft > 0;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 46, 22, 0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '2rem'
    }} className="animate-fade-in">
      
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '900px', height: '90%', maxHeight: '800px',
        display: 'flex', flexDirection: 'column', background: 'var(--modal-bg)',
        overflow: 'hidden'
      }}>
        
        {/* Header (Timer & Close) */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={isCritical ? 'timer-critical' : ''} style={{ fontSize: '2.5rem', fontWeight: '800', color: isCritical ? 'var(--danger)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace' }}>
              <Clock size={32} /> {timeLeft}s
            </div>
            
            {/* Timer Controls */}
            <button onClick={() => setIsRunning(!isRunning)} style={{ padding: '8px', background: isRunning ? 'var(--warning)' : 'var(--accent)' }}>
              {isRunning ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
            </button>
            <button onClick={handleSteal} className="warning" style={{ padding: '8px 16px' }}>
              <RotateCcw size={20} /> Steal (Reset)
            </button>
            <button onClick={() => setShowAnswer(!showAnswer)} style={{ padding: '8px 16px', background: '#3b82f6' }}>
              <Eye size={20} /> {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          </div>
          
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>{question.value} Points</span>
            {lockedTeam && <span style={{ fontSize: '1rem', color: lockedTeam.color, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>{lockedTeam.name} Stealing!</span>}
          </div>

          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-primary)', padding: '8px' }}>
            <X size={32} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
          
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem', lineHeight: '1.4' }}>
            {question.text || (question.type === 'text' ? 'No text provided' : '')}
          </h2>

          {(question.type === 'image' || question.type === 'gif') && question.mediaUrl && (
            <img 
              src={question.mediaUrl} 
              alt="Question Media" 
              style={{ maxWidth: '100%', maxHeight: '40vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', marginBottom: '2rem' }} 
            />
          )}

          {showAnswer && question.answer && (
            <div className="animate-fade-in" style={{ marginTop: 'auto', background: 'rgba(34, 197, 94, 0.1)', border: '2px solid var(--accent)', padding: '1.5rem', borderRadius: '12px', width: '100%', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem', margin: 0 }}>Answer:</h3>
              <p style={{ fontSize: '1.5rem', margin: 0 }}>{question.answer}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Award Points To:</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {teams.map(team => (
              <button 
                key={team.id} 
                onClick={() => onAwardPoints(team.id, question.value)}
                style={{ flex: '1 1 150px', maxWidth: '200px', fontSize: '1.2rem', padding: '15px', background: team.color, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {team.name}
              </button>
            ))}
            <button 
              onClick={() => onClose()}
              className="danger"
              style={{ flex: '1 1 150px', maxWidth: '200px', fontSize: '1.2rem', padding: '15px' }}
            >
              Nobody
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestionModal;
