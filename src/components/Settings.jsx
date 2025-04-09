import { useState, useEffect } from 'react';

export default function Settings({ children }) {
  const [apiKey, setApiKey] = useState('');
  const [promptVersion, setPromptVersion] = useState('v1.0.0');
  const [modelName, setModelName] = useState('gemini-2.0-flash');
  const [isOpen, setIsOpen] = useState(false);
  
  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.settings-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    <div className="settings-container" style={{ position: 'relative' }}>
      <button 
        className="nav-button" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {children}
      </button>
      
      {isOpen && (
        <div className="settings-modal" style={{ 
          position: 'absolute', 
          right: 0,
          top: '100%',
          marginTop: '10px',
          backgroundColor: 'var(--card-bg)',
          padding: '1.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          borderRadius: 'var(--border-radius)',
          width: '320px',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          display: 'block',
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
              <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
              <option value="gemini-2.5-pro-exp-03-25">gemini-2.5-pro-exp-03-25</option>
            </select>
          </div>
          
          <button 
            onClick={handleSave}
            style={{
              background: 'var(--secondary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              padding: '10px 16px',
              cursor: 'pointer',
              float: 'right',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            保存
          </button>
        </div>
      )}
    </div>
  );
}