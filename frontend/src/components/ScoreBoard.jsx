const ScoreBoard = ({ teams }) => {

  return (
    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', overflowX: 'auto', justifyContent: 'center' }}>
      {teams.map((team, idx) => {
        // Colors array to make teams look distinct
        const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];
        const teamColor = colors[idx % colors.length];

        return (
          <div key={team.id} style={{ 
            flex: '1', minWidth: '200px', maxWidth: '300px',
            background: 'var(--bg-color)', borderRadius: '12px', padding: '1rem',
            borderTop: `4px solid ${teamColor}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
              {team.name}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: teamColor, textShadow: '1px 1px 0 rgba(0,0,0,0.1)' }}>
              {team.score}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreBoard;
