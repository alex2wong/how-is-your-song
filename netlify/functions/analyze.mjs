
import { analyzeMusic }  from './genai-analyze.mjs';

export default async (req, context) => {
  const data = await req.formData()
  const fileName = data.get('file_name');
  const filePath = data.get('audio');
  // const filePath = file.path;
  console.log('# function: analyze with req file ', fileName, filePath);

  let apiKey = req.url.split('?')[1].split('=')[1];
  // get apiKey from Request.url search params

  if (!filePath) {
    // const resp = new Response();
    return new Response(JSON.stringify({ error: '未上传文件' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: '请提供 Gemini API Key' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // // 假设音频文件上传成功, 调用 analyzeMusic
  // const filePath = req.file.path;
  
  console.log('# upload as localfile done, path ', filePath);
  const result = await analyzeMusic(filePath, apiKey);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
};