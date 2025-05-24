import axios from 'axios';

export const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';
console.log('apiBase', apiBase);
export const analyzeMusic = async (file, authorName, lyrics, onProgress, privacyMode, eventTag) => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('lyrics', lyrics || '');

  const geminiKey = localStorage.getItem('gemini_key');
  const promptVersion = localStorage.getItem('prompt_version') || 'v1.0.0';
  let modelName = localStorage.getItem('model_name') || 'gemini-2.5-flash-preview-04-17';

  const fobiddenModelNames = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-2.0-pro-exp-02-05', 'gemini-2.5-pro-exp-03-25'];

  if (fobiddenModelNames.includes(modelName)) {
    modelName = 'gemini-2.5-flash-preview-04-17';
  }

  // 从 localStorage 获取认证 token
  const token = localStorage.getItem('token');
  console.log('分析请求使用的token:', token ? '存在' : '不存在');
  
  const response = await axios.post(`${apiBase}/analyze?prompt_version=${promptVersion}&model_name=${modelName}&file_name=${encodeURIComponent(file.name)}${geminiKey ? `&gemini_key=${geminiKey}` : ''}${authorName ? `&author_name=${encodeURIComponent(authorName)}` : ''}&privacy_mode=${privacyMode ? '1' : '0'}${eventTag ? `&event_tag=${encodeURIComponent(eventTag)}` : ''}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    timeout: 600000, // 10 minutes in milliseconds
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });

  return response;
};