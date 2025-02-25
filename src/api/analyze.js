import axios from 'axios';

const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';
console.log('apiBase', apiBase);
export const analyzeMusic = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('audio', file);

  const geminiKey = localStorage.getItem('gemini_key');

  const response = await axios.post(`${apiBase}/analyze?file_name=${encodeURIComponent(file.name)}${geminiKey ? `&gemini_key=${geminiKey}` : ''}`, formData, {
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