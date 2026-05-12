import { useState, useEffect } from 'react';
import { X, Clock, PlayCircle, PauseCircle, RotateCcw, Eye } from 'lucide-react';

const QuestionModal = ({ question, teams, currentTeam, timeLimit, onAwardPoints, onClose, lastMessage, sendMessage }) => {
  const initialTime = Math.floor(timeLimit * (question.timeModifier || 1));
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lockedTeam, setLockedTeam] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleCorrectAnswer = (teamId) => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setShowAnswer(true);
    setIsRunning(false);
    setTimeout(() => {
      onAwardPoints(teamId, question.value);
    }, 4000);
  };

  const handleIncorrectAnswer = () => {
    if (isEvaluating) return;
    if (lockedTeam) {
      setIsEvaluating(true);
      setShowAnswer(true);
      setIsRunning(false);
      setTimeout(() => {
        onClose();
      }, 4000);
    } else {
      sendMessage('ENABLE_STEAL');
    }
  };

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
    } else if (lastMessage && lastMessage.type === 'ANSWER_CORRECT') {
      const targetTeam = lockedTeam || currentTeam;
      if (targetTeam && lastMessage.teamId === targetTeam.id) {
        handleCorrectAnswer(targetTeam.id);
      }
    } else if (lastMessage && lastMessage.type === 'ANSWER_INCORRECT') {
      const targetTeam = lockedTeam || currentTeam;
      if (targetTeam && lastMessage.teamId === targetTeam.id) {
        handleIncorrectAnswer();
      }
    }
  }, [lastMessage, teams, timeLimit, currentTeam, lockedTeam, question.value, onAwardPoints, onClose, sendMessage, isEvaluating]);

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
        width: '100%', maxWidth: '1200px', height: '95%', maxHeight: '95vh',
        display: 'flex', flexDirection: 'column', background: 'var(--modal-bg)',
        overflow: 'hidden'
      }}>
        
        {/* Header (Timer & Close) */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
            {currentTeam && !lockedTeam && <span style={{ fontSize: '1rem', color: currentTeam.color, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>Turn: {currentTeam.name}</span>}
            {lockedTeam && <span style={{ fontSize: '1rem', color: lockedTeam.color, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>{lockedTeam.name} Stealing!</span>}
            {question.doubleChance && <span style={{ fontSize: '1rem', color: 'var(--bg-color)', background: 'var(--warning)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>DOUBLE CHANCE ACTIVE</span>}
            {question.clue && <span style={{ fontSize: '1rem', color: 'var(--bg-color)', background: 'var(--accent)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>CLUE: GIVE A CLUE</span>}
            {question.activeEffects && question.activeEffects.map((effect, idx) => {
              const team = teams.find(t => t.id === effect.team_id);
              return (
                <span key={idx} style={{ fontSize: '1rem', color: '#ffffff', background: effect.type === 'trap' ? 'var(--danger)' : 'var(--accent)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px', textTransform: 'uppercase' }}>
                  {team ? team.name : 'Team'} USED: {effect.name.replace('_', ' ')}
                </span>
              );
            })}
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

          {question.options && question.options.some(opt => opt && opt.trim() !== '') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', maxWidth: '800px', marginBottom: '2rem' }}>
              {question.options.map((opt, i) => {
                if (!opt || !opt.trim()) return null;
                return (
                  <div key={i} className="glass-panel" style={{ padding: '1.5rem', fontSize: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: '2px solid var(--glass-border)' }}>
                    <strong style={{ color: 'var(--accent)', marginRight: '10px' }}>{String.fromCharCode(65 + i)}.</strong> {opt}
                  </div>
                );
              })}
            </div>
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
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              disabled={isEvaluating}
              onClick={() => {
                const targetTeam = lockedTeam || currentTeam;
                if (targetTeam) handleCorrectAnswer(targetTeam.id);
              }}
              style={{ flex: '1 1 200px', maxWidth: '300px', fontSize: '1.5rem', padding: '20px', background: 'var(--accent)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: isEvaluating ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isEvaluating ? 0.5 : 1 }}
            >
              ✔️ Correct
            </button>
            <button 
              disabled={isEvaluating}
              onClick={() => {
                handleIncorrectAnswer();
              }}
              className="danger"
              style={{ flex: '1 1 200px', maxWidth: '300px', fontSize: '1.5rem', padding: '20px', border: 'none', borderRadius: '8px', cursor: isEvaluating ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isEvaluating ? 0.5 : 1 }}
            >
              ✖️ Incorrect
            </button>
            <button 
              disabled={isEvaluating}
              onClick={() => onClose()}
              style={{ flex: '1 1 200px', maxWidth: '300px', fontSize: '1.5rem', padding: '20px', background: 'var(--text-secondary)', color: 'white', border: 'none', borderRadius: '8px', cursor: isEvaluating ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isEvaluating ? 0.5 : 1 }}
            >
              Skip (Nobody)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestionModal;
