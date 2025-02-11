import axios from 'axios'

const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';

export const analyzeMusic = async (file) => {
  const geminiKey = localStorage.getItem('gemini_key');
  if (!geminiKey) {
    alert('请先设置 Gemini API Key');
    return null;
  }

//   const response = await axios.post('http://localhost:3000/api/upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   })

  const formData = new FormData()
  formData.append('audio', file)
  formData.append('file_name', file.name)

  const response = await axios.post(`${apiBase}/analyze?gemini_key=${geminiKey}&file_name=${file.name}`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
    }
  })

//   if (!response.ok) {
//     throw new Error('分析失败');
//   }

  return response;
}; 