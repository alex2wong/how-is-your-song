

export const SongDetail = ({ selectedSong, scoreRender, onClose }) => {

    const parseLyrics = (structureComment) => {
        if (!structureComment) return [];
        const matches = structureComment.match(/\[\d{2}:\d{2}\.\d{2}\].*?(?=\n|$)/g);
        if (!matches) return [];
        return matches.map(line => {
          const timeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2})\]/);
          const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, '').trim();
          if (timeMatch) {
            const minutes = parseInt(timeMatch[1]);
            const seconds = parseFloat(timeMatch[2]);
            const time = minutes * 60 + seconds;
            return { time, text };
          }
          return null;
        }).filter(item => item !== null);
      }

    const handleScroll = (e) => {
        // stop event propagation
        e.stopPropagation();
    }

    return (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '0 24px 24px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '90%',
          width: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 1000
        }} onScroll={handleScroll}>
          <div style={{ position: 'sticky', top: 0, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: '#fff', }}>
            <h2 style={{ margin: 0 }}>{selectedSong.song_name}</h2>
            <button 
              onClick={onClose}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginTop: 50, marginBottom: '24px' }}>
            {scoreRender(selectedSong)}
            <p className='summary-quote' style={{ fontSize: '16px', lineHeight: '1.6' }}>{selectedSong.comments}</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {selectedSong.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  fontSize: '14px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="comments" style={{ marginBottom: '24px' }}>
            <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '8px', marginBottom: '16px' }}>详细解析</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {[
                { title: '编曲', data: selectedSong.arrangement },
                { title: '人声', data: selectedSong.vocal },
                { title: '结构', data: selectedSong.structure },
                { title: '歌词', data: selectedSong.lyrics }
              ].map(section => (
                <div key={section.title} style={{ 
                  padding: '16px', 
                  backgroundColor: '#f8f8f8', 
                  borderRadius: '8px',
                  border: '1px solid #eee'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{ margin: 0 }}>{section.title}</h4>
                    <span style={{ 
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '14px',
                    }}>
                      {section.data?.score}分
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', textAlign: 'left' }}>{section.data?.comments}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 歌词时间轴 */}
          {selectedSong.structure && selectedSong.structure.comments && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '8px', marginBottom: '16px' }}>歌词时间轴</h3>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                padding: '16px',
                backgroundColor: '#f8f8f8',
                borderRadius: '8px',
                border: '1px solid #eee'
              }}>
                {parseLyrics(selectedSong.structure.comments).map((lyric, index) => (
                  <div key={index} style={{ 
                    display: 'flex',
                    marginBottom: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    <span style={{ 
                      color: '#4CAF50',
                      marginRight: '16px',
                      fontFamily: 'monospace'
                    }}>
                      {Math.floor(lyric.time/60).toString().padStart(2, '0')}:
                      {(lyric.time%60).toFixed(2).padStart(5, '0')}
                    </span>
                    <span>{lyric.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
}