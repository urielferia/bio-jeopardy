import { useState } from 'react';
import QuestionModal from './QuestionModal';
import ScoreBoard from './ScoreBoard';

const GameBoard = ({ config }) => {
  const [categories, setCategories] = useState(config.categories);
  const [teams, setTeams] = useState(config.teams);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const handleSquareClick = (catIndex, qIndex) => {
    const question = categories[catIndex].questions[qIndex];
    if (question.isAnswered) return;

    setActiveQuestion({
      ...question,
      catIndex,
      qIndex,
      value: (qIndex + 1) * config.multiplier
    });
  };

  const handleAwardPoints = (teamId, points) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, score: t.score + points } : t
    ));
    closeModalAndMarkAnswered();
  };

  const closeModalAndMarkAnswered = () => {
    if (activeQuestion) {
      const newCats = [...categories];
      newCats[activeQuestion.catIndex].questions[activeQuestion.qIndex].isAnswered = true;
      setCategories(newCats);
    }
    setActiveQuestion(null);
  };

  const handleCloseWithoutPoints = () => {
    closeModalAndMarkAnswered();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '1rem', overflow: 'hidden' }} className="animate-fade-in">
      
      {/* Header */}
      <h1 style={{ textAlign: 'center', margin: '0.5rem 0 1.5rem 0', fontSize: '2.5rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
        {config.gameTitle || 'Bio Jeopardy'}
      </h1>

      {/* Grid Container */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`, gap: '1rem', overflow: 'hidden', paddingBottom: '1rem' }}>
        {categories.map((cat, catIndex) => (
          <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            
            {/* Category Header */}
            <div className="glass-panel" style={{ padding: '1.5rem 1rem', textAlign: 'center', background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{cat.name}</h2>
            </div>

            {/* Question Squares */}
            {cat.questions.map((q, qIndex) => {
              const points = (qIndex + 1) * config.multiplier;
              return (
                <div 
                  key={q.id}
                  className="glass-panel"
                  onClick={() => handleSquareClick(catIndex, qIndex)}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: q.isAnswered ? 'default' : 'pointer',
                    opacity: q.isAnswered ? 0.2 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: q.isAnswered ? 'scale(0.95)' : 'scale(1)',
                    background: q.isAnswered ? 'transparent' : 'var(--card-bg)'
                  }}
                  onMouseEnter={(e) => {
                    if (!q.isAnswered) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(34, 197, 94, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!q.isAnswered) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                    }
                  }}
                >
                  <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent)', textShadow: '0 2px 10px rgba(34, 197, 94, 0.2)' }}>
                    {q.isAnswered ? '' : points}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Score Board */}
      <div style={{ marginTop: 'auto' }}>
        <ScoreBoard teams={teams} setTeams={setTeams} />
      </div>

      {/* Modal */}
      {activeQuestion && (
        <QuestionModal 
          question={activeQuestion}
          teams={teams}
          timeLimit={config.timeLimit}
          onAwardPoints={handleAwardPoints}
          onClose={handleCloseWithoutPoints}
        />
      )}
    </div>
  );
};

export default GameBoard;
