import { useState } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';

const SetupScreen = ({ onStart }) => {
  const [gameTitle, setGameTitle] = useState('Bio Jeopardy');
  const [teams, setTeams] = useState([{ id: 1, name: 'Team 1', score: 0 }, { id: 2, name: 'Team 2', score: 0 }]);
  const [timeLimit, setTimeLimit] = useState(30);
  const [multiplier, setMultiplier] = useState(100);
  
  // Default to 3 columns, 3 rows for a quick setup
  const [categories, setCategories] = useState(
    Array.from({ length: 3 }, (_, i) => ({
      id: `cat-${i}`,
      name: `Category ${i + 1}`,
      questions: Array.from({ length: 3 }, (_, j) => ({
        id: `q-${i}-${j}`,
        text: '',
        answer: '',
        type: 'text', // text, image, gif
        mediaUrl: '',
        isAnswered: false,
      }))
    }))
  );

  const handleStart = () => {
    onStart({
      gameTitle,
      teams,
      timeLimit,
      multiplier,
      categories
    });
  };

  const updateCategoryName = (catIndex, name) => {
    const newCats = [...categories];
    newCats[catIndex].name = name;
    setCategories(newCats);
  };

  const updateQuestion = (catIndex, qIndex, field, value) => {
    const newCats = [...categories];
    newCats[catIndex].questions[qIndex][field] = value;
    setCategories(newCats);
  };

  const addCategory = () => {
    const rowCount = categories.length > 0 ? categories[0].questions.length : 3;
    setCategories([
      ...categories,
      {
        id: `cat-${Date.now()}`,
        name: `New Category`,
        questions: Array.from({ length: rowCount }, (_, j) => ({
          id: `q-${Date.now()}-${j}`,
          text: '',
          answer: '',
          type: 'text',
          mediaUrl: '',
          isAnswered: false,
        }))
      }
    ]);
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setCategories(categories.map(cat => ({
      ...cat,
      questions: [
        ...cat.questions,
        {
          id: `q-${Date.now()}-${cat.questions.length}`,
          text: '',
          answer: '',
          type: 'text',
          mediaUrl: '',
          isAnswered: false,
        }
      ]
    })));
  };

  const removeRow = () => {
    setCategories(categories.map(cat => ({
      ...cat,
      questions: cat.questions.slice(0, -1)
    })));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <label style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Game Title</label>
          <input 
            value={gameTitle} 
            onChange={(e) => setGameTitle(e.target.value)} 
            style={{ fontSize: '2rem', textAlign: 'center', fontWeight: 'bold', maxWidth: '600px', width: '100%' }}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label>Teams</label>
            {teams.map((team, idx) => (
              <div key={team.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  value={team.name} 
                  onChange={(e) => {
                    const newTeams = [...teams];
                    newTeams[idx].name = e.target.value;
                    setTeams(newTeams);
                  }}
                />
                <button 
                  className="danger" 
                  style={{ padding: '10px' }}
                  onClick={() => setTeams(teams.filter((_, i) => i !== idx))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => setTeams([...teams, { id: Date.now(), name: `Team ${teams.length + 1}`, score: 0 }])}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              <Plus size={16} /> Add Team
            </button>
          </div>

          <div>
            <label>Time to Answer (Seconds)</label>
            <input 
              type="number" 
              value={timeLimit} 
              onChange={(e) => setTimeLimit(Number(e.target.value))} 
              min="5" 
            />
          </div>

          <div>
            <label>Points Multiplier (Row 1 = 1x, Row 2 = 2x)</label>
            <input 
              type="number" 
              value={multiplier} 
              onChange={(e) => setMultiplier(Number(e.target.value))} 
              step="100" 
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Board Configuration</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={addCategory}><Plus size={16} /> Add Column</button>
              <button onClick={addRow}><Plus size={16} /> Add Row</button>
              <button onClick={removeRow} className="warning"><Trash2 size={16} /> Remove Row</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {categories.map((cat, catIndex) => (
              <div key={cat.id} className="glass-panel" style={{ minWidth: '300px', padding: '1.5rem', background: 'rgba(255,255,255,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <input 
                    value={cat.name} 
                    onChange={(e) => updateCategoryName(catIndex, e.target.value)} 
                    style={{ fontWeight: 'bold', fontSize: '1.2rem', padding: '8px' }}
                  />
                  <button onClick={() => removeCategory(catIndex)} className="danger" style={{ padding: '8px', marginLeft: '8px' }}><Trash2 size={16} /></button>
                </div>

                {cat.questions.map((q, qIndex) => (
                  <div key={q.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Row {qIndex + 1} ({(qIndex + 1) * multiplier} pts)</div>
                    <select 
                      value={q.type} 
                      onChange={(e) => updateQuestion(catIndex, qIndex, 'type', e.target.value)}
                      style={{ marginBottom: '0.5rem' }}
                    >
                      <option value="text">Text Question</option>
                      <option value="image">Image (URL)</option>
                      <option value="gif">GIF (URL)</option>
                    </select>

                    <textarea 
                      value={q.text} 
                      onChange={(e) => updateQuestion(catIndex, qIndex, 'text', e.target.value)}
                      placeholder="Enter question text..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', minHeight: '60px', fontFamily: 'inherit', marginBottom: '0.5rem' }}
                    />

                    <textarea 
                      value={q.answer} 
                      onChange={(e) => updateQuestion(catIndex, qIndex, 'answer', e.target.value)}
                      placeholder="Enter answer (optional)..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', minHeight: '40px', fontFamily: 'inherit', marginBottom: '0.5rem' }}
                    />

                    {(q.type === 'image' || q.type === 'gif') && (
                      <input 
                        type="url"
                        value={q.mediaUrl}
                        onChange={(e) => updateQuestion(catIndex, qIndex, 'mediaUrl', e.target.value)}
                        placeholder={`Paste ${q.type} URL here...`}
                        style={{ background: '#ffffff', color: '#000000' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <button onClick={handleStart} style={{ fontSize: '1.5rem', padding: '15px 40px', background: 'var(--accent)', color: '#ffffff' }}>
            <Play size={24} /> Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
