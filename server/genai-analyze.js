const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require('path');
const JSON5 = require('json5');

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

const promptConfigs = {
  'v1.0.0': {
    systemInstruction: "你是一个专业且优秀的音乐评论员。当你收到一个音乐文件，可以首先从整体印象（音乐风格和氛围），然后简要分析编曲配器质量、人声质量和旋律、歌词内容故事性等几个方面，分别简要评价并且打分，分项满分 10分，汇总一个总分数。并且给出一个额外字段是歌曲在各维度的标签，例如 #Cinematic #电子音乐 #合成器 #贝斯 #Dreaming Vocal 。 注意打分差距拉大一些，优秀的作品的分数要比一般的作品高很多，例如优秀作品大于 8 分，一般的作品小于 8 分",
    history: (mimeType, fileUri) => [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType,
              fileUri,
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
    message: "提取音乐的歌词及时间戳、歌曲结构，结合歌词内容和歌曲结构的理解，从流行音乐专业角度评价下这个音乐的编曲配器、人声质量和旋律、歌曲结构、歌词内容寓意等几个方面，并且在标签中返回 细分曲风、乐器等重要标签；注意打分差距拉大一些，有一些亮点的作品就大胆地大于8分，没有太多亮点的就6-8分之间。在给出评分时，如果分数小于8分，要具体说明各维度有哪些明显的不足之处，给出优化建议",
  },
  'v1.0.0-english': {
    systemInstruction: "You are an experienced music commenter. When you receive a music file, you first analyze the overall impression (music style and atmosphere), then briefly analyze the composer's quality, voice quality, rhythm, lyric content, and story tone of the music. You evaluate each of these aspects separately and give a score out of 10, totaling a total score. You also provide a field called 'tags' that includes #Cinematic, #Electronic Music, #Synthesizer, #Bass, and #Dreaming Vocal. Note that the score difference can be large, and the good work gets a score higher than 8, while most other works get scores between 6 and 8. When giving a score, if the score is less than 8, you must explain what aspects of the work are missing and provide suggestions for improvement",
    history: (mimeType, fileUri) => [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType,
              fileUri,
            },
          },
          {text: "Extract the lyrics and timestamps of the music, analyze the song structure, and based on your understanding of the lyrics content and song structure, evaluate this music from a professional pop music perspective in terms of arrangement, vocal quality and melody, song structure, lyrical content and meaning, and include important tags for sub-genres, instruments, etc. in the tags section. Note that the scoring difference should be significant - works with some highlights should boldly score above 8, while those without many highlights should be between 6-8. When giving a score, if the score is less than 8, you must specifically explain what aspects are lacking and provide optimization suggestions. The output format is:\n{\nsong_name: string,\noverall_score: number,\ncomments: string, // Overall evaluation\narrangement: {score: number, comments: string}, // Arrangement evaluation\nvocal: {score: number, comments: string}, // Vocal quality evaluation\nstructure: { score: number, comments: string }, // Lyrics timestamp data and song structure, in two paragraphs\nlyrics: {score: number, comments: string}, // Lyrics content evaluation\ntags: string[],\n}"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n\n{\n  \"song_name\": \"Unknown Song Title\",\n  \"overall_score\": 7.9,\n  \"comments\": \"This is a folk song filled with genuine emotion. The song creates a warm yet slightly melancholic atmosphere through its simple arrangement, clear female vocals, and poetic lyrics, which resonates with listeners. The overall performance is good, but there is room for improvement in the richness and layering of the arrangement.\",\n  \"arrangement\": {\n    \"score\": 7.3,\n    \"comments\": \"The arrangement primarily centers around acoustic guitar, creating a simple, sincere atmosphere. The guitar solo during the interlude is a highlight with its beautiful melody. However, the overall instrumentation is somewhat monotonous, lacking variation and layering. Suggestion: Consider adding other instruments such as strings, piano, or soft percussion to enrich the musical colors and emotional expression. Additionally, try experimenting more with guitar playing techniques, such as using different chord progressions, rhythmic patterns, or incorporating techniques like slides and percussive elements to increase the music's interest and expressiveness.\"\n  },\n  \"vocal\": {\n    \"score\": 8.3,\n    \"comments\": \"The female vocals are clear and clean with a sweet timbre. The emotional delivery is sincere and natural, perfectly matching the song's atmosphere. The voice has a certain distinctiveness and effectively conveys the emotions expressed in the song. Some details in the performance, such as breathing and handling of ending notes, could be more refined.\"\n  },\n  \"structure\": {\n    \"score\": 8.0,\n     \"comments\": \"The song structure is well-organized, following a standard pop song format: intro - verse1 - pre-chorus - chorus - interlude - verse2 - pre-chorus - chorus - outro. This structure allows the song's emotions to progress sequentially, with the chorus having strong memorable elements. \\n\\nLyrics and timestamps:\\n[00:07.12] You say the beauty of growing up must face wind and rain\\n[00:11.01] Even the old willow trees only last about ten years\\n[00:15.23] The seasons' winds and passersby can't spare an extra glance\\n[00:19.12] If there's a beam of light in your heart illuminating your face\\n[00:22.98] You say dreams and love are bound to lose to time\\n[00:26.82] A lifetime of longing and memories only lasts about ten years\\n[00:30.74] Those memories and tender moments are just passing clouds\\n[00:34.45] If possible, I wish it would slow down a bit\"\n\n  },\n  \"lyrics\": {\n    \"score\": 8.6,\n    \"comments\": \"The lyrics tell a story about growth, love, dreams, and the passage of time in a narrative style, with a certain depth and philosophy. The language is simple yet poetic, evoking resonance and reflection from listeners. The lyrics and melody are tightly integrated, together creating the song's artistic conception and atmosphere.\"\n  },\n  \"tags\": [\n    \"#FolkMusic\",\n    \"#IndependentFolk\",\n    \"#AcousticGuitar\",\n    \"#FemaleVocal\",\n    \"#Narrative\",\n    \"#Growth\",\n    \"#Love\",\n    \"#Dreams\",\n    \"#Time\",\n    \"#Chinese\"\n  ]\n}\n```"},
        ],
      }
    ],
    message: "Extract the lyrics and timestamps of the music, analyze the song structure, and based on your understanding of the lyrics content and song structure, evaluate this music from a professional pop music perspective in terms of arrangement, vocal quality and melody, song structure, lyrical content and meaning, and include important tags for sub-genres, instruments, etc. in the tags section. Note that the scoring difference should be significant - works with some highlights should boldly score above 8, while those without many highlights should be between 6-8. When giving a score, if the score is less than 8, you must specifically explain what aspects are lacking and provide optimization suggestions",
  },
  'v1.1.0-beta': {
    systemInstruction: "你是一个专业且优秀的音乐评论员。当你收到一个音乐文件，可以首先从整体印象（音乐风格和氛围），然后简要分析编曲配器质量、人声质量和旋律、歌词内容故事性等几个方面，分别简要评价并且打分，分项满分 10分，汇总一个总分数。并且给出一个额外字段是歌曲在各维度的标签，例如 #Cinematic #电子音乐 #合成器 #贝斯 #Dreaming Vocal 。 注意打分差距拉大一些，优秀的作品的分数要比一般的作品高很多，例如优秀作品大于 8 分，一般的作品小于 8 分，很差的作品小于 6 分",
    history: (mimeType, fileUri) => [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType,
              fileUri,
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
    message: "提取音乐的歌词及时间戳、歌曲结构，结合歌词内容和歌曲结构的理解，从流行音乐专业角度评价下这个音乐的编曲配器、人声质量和旋律、歌曲结构、歌词内容寓意等几个方面，并且在标签中返回 细分曲风、乐器等重要标签；注意打分差距拉大一些，有一些亮点的作品就大胆地大于8分，没有太多亮点的就6-8分之间，有明显错误的小于6分。在给出评分时，如果分数小于8分，要具体说明各维度有哪些明显的不足之处，给出优化建议",
  }
}

const lyricConfigs = {
  systemInstruction: "你是一个专业的歌词提取员。当你收到一个音乐文件，可以提取出歌词和时间戳，返回LRC格式的歌词",
  history: (mimeType, fileUri) => [
    {
      role: "user",
      parts: [
        {
          fileData: {
            mimeType,
            fileUri,
          },
        },
        {text: "提取音乐的歌词及时间戳，返回LRC格式的歌词,输出格式是：\n\n[分:秒.毫秒]歌词行1\n[分:秒.毫秒]歌词行2\n..."},
      ],
    },
    {
      role: "model",
      parts: [
        {text: `[00:15.10]风从萧山吹过，拥紧凉角冻结成雾海\n[00:22.26]世人善也叹倾诉心中之音少人能懂\n[00:29.28]月亮从云海走来，洒下碧血更有伤的白\n[00:36.35]就算心动也暗藏汹涌，不可说谁人能懂\n[00:44.88]寺中飞动花开花落，荒唐不懂真实的寂寞\n[00:52.02]有话堪折直须折，莫待无花空所过\n[00:59.15]一时梦懂悟如因果，盛唐不懂南唐的失落\n[01:06.09]令我谢了太匆匆，人生长恨水长东`},
      ],
    }
  ],
  message: "提取音乐的歌词及时间戳，返回LRC格式的歌词。",
}

async function analyzeMusic(audioPath, apiKey, promptVersion, modelName) {
  console.log('analyzeMusic:',{audioPath, apiKey: apiKey.slice(0,4)+'...'+apiKey.slice(-4), promptVersion, modelName});
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: promptConfigs[promptVersion].systemInstruction,
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
    history: promptConfigs[promptVersion].history(files[0].file.mimeType, files[0].file.uri),
  });

  const result = await chatSession.sendMessage(promptConfigs[promptVersion].message);
  let resultTxt = result.response.text();
  console.log('return length:', resultTxt.length);
  console.log(resultTxt);
  resultTxt = resultTxt.replace('```json', '').replace('```', '').replace('ny', '');
  // console.log(typeof resultTxt);
  // const resultObj = await result.response.json();
  return JSON5.parse(resultTxt);
}

async function getLyrics(audioPath, apiKey, modelName) {
  console.log('getLyrics:', { audioPath, apiKey: apiKey.slice(0, 4) + '...' + apiKey.slice(-4), modelName });
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: lyricConfigs.systemInstruction,
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
    history: lyricConfigs.history(files[0].file.mimeType, files[0].file.uri),
  });

  const result = await chatSession.sendMessage(lyricConfigs.message);
  let resultTxt = result.response.text();
  console.log('return length:', resultTxt.length, typeof resultTxt);
  console.log(resultTxt);
  return resultTxt;
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

module.exports = { analyzeMusic, getLyrics };