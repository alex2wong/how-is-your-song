import axios from 'axios'

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

  const response = await axios.post(`http://localhost:3000/api/upload?gemini_key=${geminiKey}`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
  })

//   if (!response.ok) {
//     throw new Error('分析失败');
//   }

  return response;
}; 