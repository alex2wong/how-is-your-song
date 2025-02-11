import axios from 'axios';

const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';

export const analyzeMusic = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('audio', file);

  const geminiKey = localStorage.getItem('gemini_key');
  if (!geminiKey) {
    throw new Error('请先设置 Gemini API Key');
  }

  const response = await axios.post(`${apiBase}/analyze?gemini_key=${geminiKey}&file_name=${encodeURIComponent(file.name)}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });

  return response;
};