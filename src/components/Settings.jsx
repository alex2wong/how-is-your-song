import { useState, useEffect } from 'react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [promptVersion, setPromptVersion] = useState('v1.0.0');
  const [modelName, setModelName] = useState('gemini-2.0-pro-exp-02-05');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_key');
    const savedVersion = localStorage.getItem('prompt_version');
    const savedModel = localStorage.getItem('model_name');
    
    if (savedKey) {
      setApiKey(savedKey);
    }
    
    if (savedVersion) {
      setPromptVersion(savedVersion);
    }

    if (savedModel) {
      setModelName(savedModel);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_key', apiKey);
    localStorage.setItem('prompt_version', promptVersion);
    localStorage.setItem('model_name', modelName);
    setIsOpen(false);
  };

  return (
    <div className="settings-container" style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: 14 }}>
      <button style={{ outline: 'none' }} onClick={() => setIsOpen(!isOpen)}> 设置... </button>
      
      {isOpen && (
        <div className="settings-modal" style={{ 
          position: 'absolute', 
          right: 0,
          backgroundColor: 'white',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px',
          width: '300px',
          zIndex: 1000,
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Gemini API Key（<a href='https://aistudio.google.com/apikey' target='_blank' rel="noreferrer">申请地址</a>）:
            </label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ 
                display: 'block', 
                width: '100%', 
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              提示词版本选择:
            </label>
            <select 
              value={promptVersion}
              onChange={(e) => setPromptVersion(e.target.value)}
              style={{ 
                display: 'block', 
                width: '100%', 
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxSizing: 'border-box'
              }}
            >
              <option value="v1.0.0">v1.0.0</option>
              <option value="v1.0.0-english">v1.0.0-english</option>
              <option value="v1.1.0-beta">v1.1.0-beta</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              模型选择:
            </label>
            <select 
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              style={{ 
                display: 'block', 
                width: '100%', 
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxSizing: 'border-box'
              }}
            >
              <option value="gemini-2.0-pro-exp-02-05">gemini-2.0-pro-exp-02-05</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
            </select>
          </div>
          
          <button 
            onClick={handleSave}
            style={{
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              float: 'right'
            }}
          >
            保存
          </button>
        </div>
      )}
    </div>
  );
}