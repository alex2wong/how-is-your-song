import axios from 'axios';

export const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';
console.log('apiBase', apiBase);
export const analyzeMusic = async (file, authorName, onProgress, privacyMode) => {
  const formData = new FormData();
  formData.append('audio', file);

  const geminiKey = localStorage.getItem('gemini_key');
  const promptVersion = localStorage.getItem('prompt_version') || 'v1.0.0';
  const modelName = localStorage.getItem('model_name') || 'gemini-2.0-pro-exp-02-05';

  const response = await axios.post(`${apiBase}/analyze?prompt_version=${promptVersion}&model_name=${modelName}&file_name=${encodeURIComponent(file.name)}${geminiKey ? `&gemini_key=${geminiKey}` : ''}${authorName ? `&author_name=${encodeURIComponent(authorName)}` : ''}&privacy_mode=${privacyMode ? '1' : '0'}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
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