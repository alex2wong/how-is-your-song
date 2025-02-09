import { useState, useEffect } from 'react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_key', apiKey);
    setIsOpen(false);
  };

  return (
    <div className="settings-container" style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: 14 }}>
      <button style={{ outline: 'none' }} onClick={() => setIsOpen(!isOpen)}> 设置 </button>
      
      {isOpen && (
        <div className="settings-modal" style={{ 
          position: 'absolute', 
          right: 0,
          backgroundColor: 'white',
          padding: '1rem',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          borderRadius: '4px',
        }}>
          <div>
            <span>Gemini API Key:</span>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ display: 'block', margin: '0.5rem 0' }}
            />
          </div>
          <button onClick={handleSave}>保存</button>
        </div>
      )}
    </div>
  );
} 