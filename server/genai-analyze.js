const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require('path');
const JSON5 = require('json5');
const { jsonrepair } = require('jsonrepair');

// const apiKey = process.env.GEMINI_API_KEY;

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType, apiKey) {
  const fileManager = new GoogleAIFileManager(apiKey);
  // 生成一个安全的文件名，只包含时间戳和扩展名
  const safeFileName = path.split('/')[1];
  console.log('upload to gemini:', path, mimeType, safeFileName);
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: safeFileName,
  });
  console.log('upload to gemini done:', path, mimeType, safeFileName, uploadResult);
  return uploadResult;
}

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 4096,
  responseMimeType: "application/json",
};

async function analyzeMusic(audioPath, apiKey) {
  console.log('analyzeMusic:',audioPath, apiKey.slice(0,4)+'...'+apiKey.slice(-4));
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-pro-exp-02-05",
    systemInstruction: "你是一个专业且优秀的音乐评论员。当你收到一个音乐文件，可以首先从整体印象（音乐风格和氛围），然后简要分析编曲配器质量、人声质量和旋律、歌词内容故事性等几个方面，分别简要评价并且打分，分项满分 10分，汇总一个总分数。并且给出一个额外字段是歌曲在各维度的标签，例如 #Cinematic #电子音乐 #合成器 #贝斯 #Dreaming Vocal 。 注意打分差距拉大一些，优秀的作品的分数要比一般的作品高很多，例如优秀作品大于 8 分，一般的作品小于 8 分",
  });

  // TODO Make these files available on the local file system
  // You may need to update the file paths
  const files = [
    await uploadToGemini(audioPath, "audio/wav", apiKey),
  ];

  console.log('files:', files);

  // file uri example: https://generativelanguage.googleapis.com/v1beta/files/cnqym46w30lc, use FileManager.listfiles to get download url by apiKey
  console.log(`Uploaded file ${files[0].file.uri}, ${files[0].file.uri} `);

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].file.mimeType,
              fileUri: files[0].file.uri,
            },
          },
          {text: "提取音乐的歌词及时间戳、歌曲结构，结合歌词内容和歌曲结构的理解，从流行音乐专业角度评价下这个音乐的编曲配器、人声质量和旋律、歌曲结构、歌词内容寓意等几个方面，并且在标签中返回 细分曲风、乐器等重要标签；注意打分差距拉大一些，有一些亮点的作品就大胆地大于8分，没有太多亮点的就6-8分之间。在给出评分时，如果分数小于8分，要具体说明各维度有哪些明显的不足之处，给出优化建议。输出格式是：\n{\nsong_name: string,\noverall_score: number,\ncomments: string, // 整体评价\narrangement: {score: number, comments: string}, // 编曲、配器评价\nvocal: {score: number, comments: string}, // 人声质量评价\nstructure: { score: number, comments: string }, // 歌词打轴数据和歌曲结构，分两个段落\nlyrics: {score: number, comments: string}, // 歌词内容评价\ntags: string[],\n}"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n\n{\n  \"song_name\": \"未知歌曲名\",\n  \"overall_score\": 7.9,\n  \"comments\": \"这是一首充满真挚情感的民谣作品。歌曲以简约的编曲、清澈的女声和富有诗意的歌词，营造出一种温暖而略带忧伤的氛围，能够引起听众的共鸣。整体表现良好，但在编曲的丰富度和层次感上还有提升空间。\",\n  \"arrangement\": {\n    \"score\": 7.3,\n    \"comments\": \"编曲主要以木吉他为核心，营造了朴素、真挚的氛围。间奏的吉他solo是一处亮点，旋律优美。但整体配器略显单一，缺乏变化和层次感。建议：可以适当增加一些其他乐器，如弦乐、钢琴或轻柔的打击乐，来丰富音乐的色彩和情感表达。同时，可以在吉他的演奏技巧上进行更多尝试，如使用不同的和弦、节奏型或加入一些滑音、打板等技巧，以增加音乐的趣味性和表现力。\"\n  },\n  \"vocal\": {\n    \"score\": 8.3,\n    \"comments\": \"女声清澈、干净，音色甜美，演唱情感真挚自然，与歌曲的氛围非常契合。声音具有一定的辨识度，能够很好地诠释歌曲所表达的情感。在一些细节的处理上，如换气、尾音的处理，可以更加精细。\"\n  },\n  \"structure\": {\n    \"score\": 8.0,\n     \"comments\": \"歌曲结构规整，采用了标准的流行歌曲式结构：intro - verse1 - pre-chorus - chorus - interlude - verse2 - pre-chorus - chorus - outro。这种结构使得歌曲的情感能够循序渐进地推进，副歌部分具有较强的记忆点。 \\n\\n歌词及时间戳：\\n[00:07.12] 你说长大的美 就要被吹雨打\\n[00:11.01] 装备都老杨柳树 也不过十年\\n[00:15.23] 四季的风路过的人不能多看一眼\\n[00:19.12] 如果心里有一束光照亮你的脸\\n[00:22.98] 你说梦想和爱情 都想输给时间\\n[00:26.82] 憧憬了一身回忆 也不过十年\\n[00:30.74] 那些回忆那些温柔 只是过往云烟\\n[00:34.45] 如果可以我想它再慢一点\"\n\n  },\n  \"lyrics\": {\n    \"score\": 8.6,\n    \"comments\": \"歌词以叙事的方式，讲述了关于成长、爱情、梦想和时间流逝的故事，具有一定的深度和哲理。语言朴实而富有诗意，能够引发听众的共鸣和思考。歌词与旋律的结合紧密，共同营造出歌曲的意境和氛围。\"\n  },\n  \"tags\": [\n    \"#民谣\",\n    \"#独立民谣\",\n    \"#木吉他\",\n    \"#女声\",\n    \"#叙事\",\n    \"#成长\",\n    \"#爱情\",\n    \"#梦想\",\n    \"#时间\",\n    \"#中文\"\n  ]\n}\n```"},
        ],
      }
    ],
  });

  const result = await chatSession.sendMessage("提取音乐的歌词及时间戳、歌曲结构，结合歌词内容和歌曲结构的理解，从流行音乐专业角度评价下这个音乐的编曲配器、人声质量和旋律、歌曲结构、歌词内容寓意等几个方面，并且在标签中返回 细分曲风、乐器等重要标签；注意打分差距拉大一些，有一些亮点的作品就大胆地大于8分，没有太多亮点的就6-8分之间。在给出评分时，如果分数小于8分，要具体说明各维度有哪些明显的不足之处，给出优化建议");
  const resultTxt = result.response.text();
  console.log(resultTxt);
  // console.log(typeof resultTxt);
  // const resultObj = await result.response.json();
  const repaired = jsonrepair(resultTxt);
  return JSON5.parse(repaired);
}

// 对 result.response.text() 进行解析
function parseResult(resultTxt) {
  const result = {};
  const lines = resultTxt.split('\n');
  console.log('# 分析结果，返回几行 ', lines.length);
  for (const line of lines) {
    if (line.startsWith('{')) {
      try {
        const json = JSON.parse(line);
        Object.assign(result, json);
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    }
  }
  return result;
}

module.exports = { analyzeMusic };