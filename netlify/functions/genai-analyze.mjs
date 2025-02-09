import {
    GoogleGenerativeAI,
  } from "@google/generative-ai";
  import { GoogleAIFileManager } from "@google/generative-ai/server";
  import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import os from 'os';

  // const apiKey = process.env.GEMINI_API_KEY;
  
  /**
   * Uploads the given file to Gemini.
   *
   * See https://ai.google.dev/gemini-api/docs/prompting_with_media
   */
  async function uploadToGemini(path, mimeType, apiKey) {
    const fileManager = new GoogleAIFileManager(apiKey);
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;    
    return file;
  }

  async function uploadFileToGemini(file, mimeType, apiKey) {
    const fileManager = new GoogleAIFileManager(apiKey);
    try {
      // 获取文件数据
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 创建临时文件
      const tempDir = os.tmpdir();
      const tempFilePath = join(tempDir, `temp-${Date.now()}.wav`);
      
      try {
        // 写入临时文件
        writeFileSync(tempFilePath, buffer);
        
        // 上传文件
        const result = await fileManager.uploadFile(tempFilePath,{
          // data: tempFilePath,  // 传递文件路径而不是buffer
          mimeType: file.type
        });
        
        return result.file;
      } finally {
        // 清理临时文件
        try {
          unlinkSync(tempFilePath);
        } catch (e) {
          console.error('清理临时文件失败:', e);
        }
      }
    } catch (error) {
      console.error('上传文件到 Gemini 时出错:', error);
      throw error;
    }
     
    // return file;
  }
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  };
  
export async function analyzeMusic(audioPath, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-pro-exp-02-05",
    systemInstruction: "你是一个专业且优秀的音乐评论员。当你收到一个音乐文件，可以首先从整体印象（音乐风格和氛围），然后简要分析编曲配器质量、人声质量和旋律、歌词内容故事性等几个方面，分别简要评价并且打分，分项满分 10分，汇总一个总分数。并且给出一个额外字段是歌曲在各维度的标签，例如 #Cinematic #电子音乐 #合成器 #贝斯 #Dreaming Vocal 。 注意打分差距拉大一些，优秀的作品的分数要比一般的高很多，例如优秀作品大于 8 分，一般的作品小于 8 分",
  });

    // TODO Make these files available on the local file system
    // You may need to update the file paths
    const files = [
      // await uploadToGemini(audioPath, "audio/wav", apiKey),
      await uploadFileToGemini(audioPath, 'audio/wav', apiKey)
    ];
    
// file uri example: https://generativelanguage.googleapis.com/v1beta/files/cnqym46w30lc, use FileManager.listfiles to get download url by apiKey
    console.log(`Uploaded file ${files[0].uri}, ${files[0].downloadUri} `);
  
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: files[0].mimeType,
                fileUri: files[0].uri,
              },
            },
            {text: "可以从流行音乐专业角度评价下这个音乐的编曲质量、人声质量和旋律、歌词内容故事性等方面吗"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "好的，针对这段新的音乐片段，我将再次从编曲质量、人声质量和旋律三个方面，以流行音乐的专业视角进行评价：\n\n**1. 编曲质量 (Arrangement Quality):**\n\n*   **优点 (Strengths):**\n    *   **电子舞曲风格 (EDM Style):** 编曲采用了典型的电子舞曲 (EDM) 元素，包括强劲的四四拍底鼓、合成器音色、以及 build-up 和 drop 的结构，营造出一种充满活力和动感的氛围。\n    *   **音色选择 (Sound Selection):** 使用的合成器音色较为现代，符合当前流行电子音乐的潮流。\n    *   **Build-up 和 Drop (Build-up and Drop):** 成功地运用了 EDM 中常见的 build-up（渐强）和 drop（爆发）手法，在 0:07 左右和之后制造了明显的能量释放，增强了音乐的冲击力。\n    *   **人声采样 (Vocal Samples):** 在没有人声主旋律的部分，使用了经过处理的人声采样（vocal chops），增加了音乐的趣味性和节奏感。\n\n*   **潜在提升空间 (Potential Improvements):**\n    *   **变化 (Variation):** 虽然有 build-up 和 drop，但整体的编曲结构和音色变化略显单一。可以考虑在不同的段落加入更多不同的合成器音色、节奏型变化、或者效果器处理，来增加音乐的丰富度和层次感。\n    *   **过渡 (Transitions):** 在某些段落之间的过渡可以更平滑一些。例如，可以利用滤波器扫频、白噪音上升等效果，来连接不同的段落。\n    *   **混音 (Mixing):** 在专业的制作中，可以对各个音轨进行更精细的 EQ、压缩、声像调整等处理，来提升整体的清晰度和冲击力。 特别是低频部分 (bass and kick drum) 可以做更细致的处理，让低音更扎实有力。\n\n*   **总体评价 (Overall):** 编曲质量良好，达到了 EDM 风格的基本要求。它成功地营造了动感、活力的氛围，并运用了 build-up 和 drop 等 EDM 常用手法。在变化、过渡和混音方面还有提升空间，但这取决于具体的制作目标和预算。\n\n**2. 人声质量 (Vocal Quality):**\n\n*   **优点 (Strengths):**\n    *   **音色 (Timbre):** 男声的音色较为浑厚，有一定磁性，适合演唱这种带有力量感的歌曲。\n    *   **音准 (Pitch):** 音准控制较好，没有明显的跑调。\n    *   **节奏感 (Rhythmic Sense):** 歌手的节奏感不错，能够与伴奏的节奏很好地配合。\n    * **和声**: 在副歌部分加入和声, 增强了音乐的层次感.\n\n*   **潜在提升空间 (Potential Improvements):**\n    *   **情感表达 (Emotional Expression):** 虽然音色和节奏感不错，但人声的情感表达可以更丰富一些。可以尝试在不同的段落运用不同的演唱技巧和力度变化，来更好地诠释歌曲的情感。\n    *   **混响和效果 (Reverb and Effects):** 可以对人声进行更精细的混响、延迟等效果处理，来增加人声的空间感和氛围感。\n    * **咬字:** 如果考虑国际化, 可以增加英文咬字.\n\n*   **总体评价 (Overall):** 人声质量合格。歌手的音色、音准和节奏感都达到了基本要求。在情感表达和后期处理方面还有提升空间。\n\n**3. 旋律 (Melody):**\n\n*   **优点 (Strengths):**\n    *   **上口 (Catchy):** 副歌部分的旋律较为上口，有一定的记忆点。\n    *   **与和弦的配合 (Fit with Chords):** 旋律与和弦的配合较为和谐。\n\n*   **潜在提升空间 (Potential Improvements):**\n    *   **独创性 (Originality):** 旋律的独创性略显不足，有些“套路化”。可以尝试加入一些更具个性的旋律进行，或者在节奏上做一些变化，来提升旋律的独特性。\n    *   **变化 (Variation):** 主歌部分的旋律可以做更多变化，避免过于单调。\n    *   **与编曲的互动 (Interaction with Arrangement):** 可以让旋律与编曲之间有更多的互动，例如，让旋律的某些音符与合成器的节奏同步，或者在编曲的 build-up 过程中，旋律也逐渐升高。\n\n*   **总体评价 (Overall):** 旋律基本合格，副歌部分较为上口。但在独创性、变化以及与编曲的互动方面，还有较大的提升空间。\n\n**总结 (Conclusion):**\n\n这段音乐片段展现出了一首具有潜力的中文 EDM 歌曲。编曲质量良好，营造了动感的氛围；人声质量合格，具备基本的演唱技巧；旋律有一定上口性，但还可以更具特色。如果能在编曲的变化、人声的情感表达和旋律的独创性方面进一步打磨，这首歌曲有望成为一首更具吸引力的作品。 整体制作水平比上一个片段要高。\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "可以再简要评价并对 渴望去闯这首歌做打分吗"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n\n{\n  \"song_name\": \"渴望去闯\",\n  \"overall_score\": 7.8,\n  \"comments\": \"综合来看，这是一首完成度较高的中文EDM流行歌曲。它成功地将电子舞曲元素与中文流行歌曲的特点相结合。编曲富有动感，人声表现合格，副歌旋律具有一定的上口性。歌曲在保持商业性的同时，也展现出了一定的制作水准。虽然在原创性和深度方面还有提升空间，但作为一首面向大众的流行歌曲，它是成功的。情感表达直接, 有一定感染力.\",\n  \"arrangement\": {\n    \"score\": 8.0,\n    \"comments\": \"编曲采用了典型的EDM风格，四四拍底鼓、合成器音色、build-up和drop等元素运用得当，营造了充满活力的氛围。音色选择较为现代，符合流行趋势。但在结构变化和过渡方面可以更丰富，混音上也有提升空间。\"\n  },\n  \"vocal\": {\n    \"score\": 7.5,\n    \"comments\": \"男声音色浑厚有磁性，音准和节奏感良好，副歌部分有和声。但在情感表达的细腻程度和后期效果处理上可以进一步加强。如果面向更广阔市场，可以考虑英文咬字。\"\n  },\n  \"melody\": {\n    \"score\": 7.2,\n    \"comments\": \"副歌旋律较为上口，有一定的记忆点，与和弦配合和谐。但在原创性和变化方面略显不足，主歌部分旋律可以更具特色，整体旋律与编曲的互动也可以更紧密。\"\n  }\n}\n```"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "评价一下这首歌"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n\n{\n  \"song_name\": \"落叶与漫长季节的回忆\",\n  \"overall_score\": 9.0,\n  \"comments\": \"这是一首极具艺术性和感染力的中文独立音乐作品。它以诗意的歌词、空灵的编曲、深情的女声，营造出一种浓郁的怀旧氛围和淡淡的忧伤情绪。歌曲的制作精良，每一个细节都体现出音乐人的用心和才华。这不仅仅是一首歌曲，更像是一首散文诗，一幅水墨画，引人入胜，回味无穷。\",\n  \"arrangement\": {\n    \"score\": 9.2,\n    \"comments\": \"编曲极具特色，以钢琴为主导，弦乐、环境音效（如风声、雨声）为辅，营造出一种空灵、梦幻的氛围。乐器音色选择考究，演奏细腻，与人声完美融合。编曲的层次感和空间感极佳，给人以无限的遐想空间。\",\n    \"sub_categories\": {\n      \"instrumentation\": {\n        \"score\": 9.5,\n        \"comment\": \"钢琴、弦乐、环境音效的运用堪称完美，音色选择极具艺术性，营造出独特的氛围。\"\n      },\n      \"dynamics_and_space\": {\n        \"score\": 9.3,\n        \"comment\": \"动态控制精湛，音乐的起伏变化与情感表达完美契合。空间感营造出色，仿佛将听众带入了一个梦幻般的场景。\"\n      },\n      \"atmosphere\": {\n        \"score\": 9.5,\n        \"comment\": \"成功营造出一种空灵、怀旧、略带忧伤的氛围，极具感染力。\"\n      }\n\n    }\n  },\n  \"vocal\": {\n    \"score\": 8.8,\n    \"comments\": \"女声音色空灵、纯净，具有极高的辨识度。演唱技巧精湛，气息控制、情感表达、咬字吐字都无可挑剔。人声与编曲完美融合，共同营造出歌曲的意境。\",\n    \"sub_categories\": {\n      \"timbre\": {\n        \"score\": 9.2,\n        \"comment\": \"音色空灵、纯净、富有磁性，具有很强的辨识度和吸引力。\"\n      },\n      \"pitch_and_rhythm\": {\n        \"score\": 9.0,\n        \"comment\": \"音准和节奏感无可挑剔，展现出扎实的演唱功底。\"\n      },\n      \"emotional_expression\": {\n        \"score\": 8.5,\n        \"comment\": \"情感表达细腻、真挚，能够准确地传递歌曲的情感内涵，引发听众的共鸣。\"\n      },\n       \"vocal_processing\":{\n        \"score\": 8.6,\n        \"comment\": \"人声处理很出色, 混响和EQ恰当好处, 让人声更加空灵.\"\n      }\n    }\n  },\n  \"melody\": {\n    \"score\": 8.6,\n    \"comments\": \"旋律优美、动人，具有较强的记忆点。旋律线条流畅自然，与歌词和编曲完美契合。虽然旋律并非大起大落，但其内在的张力和情感深度足以打动人心。\",\n    \"sub_categories\": {\n      \"catchiness\": {\n        \"score\": 8.0,\n        \"comment\": \"旋律优美动听，具有一定的记忆点，但并非那种洗脑式的上口。\"\n      },\n      \"originality\": {\n        \"score\": 8.8,\n        \"comment\": \"旋律具有较高的原创性，展现出独特的音乐风格。\"\n      },\n      \"melody_arrangement_fit\": {\n        \"score\": 9.0,\n        \"comment\": \"旋律与歌词、和弦、编曲的配合堪称完美，共同营造出歌曲的意境。\"\n      }\n    }\n  },\n  \"lyrics\": {\n    \"score\": 9.3,\n    \"comments\": \"歌词极具诗意和文学性，运用了丰富的意象和修辞手法，营造出一种朦胧、唯美的意境。歌词的主题深刻，探讨了时间、记忆、等待、寻觅等人生哲理，引发听众的思考和感悟。\",\n     \"sub_categories\":{\n       \"theme_and_message\":{\n          \"score\": 9.2,\n          \"comment\": \"歌词主题深刻，富有人生哲理和诗意。\"\n       },\n       \"imagery_and_metaphor\":{\n          \"score\": 9.5,\n          \"comment\": \"运用了大量生动的意象和隐喻，如“时光像一条无声的河”、“落叶飘零”、“漫长的季节”等，极具画面感和表现力。\"\n       },\n        \"story_telling\":{\n          \"score\": 9.0,\n          \"comment\": \"虽然不是传统意义上的叙事性歌词，但通过意象的堆叠和情感的递进，营造出一种诗意的叙事感。\"\n        }\n     }\n  },\n  \"tags\": [\n    \"#Indie Pop\",\n    \"#Dream Pop\",\n    \"#Ambient Pop\",\n    \"#Chinese Indie\",\n    \"#Female Vocal\",\n    \"#Piano\",\n    \"#Strings\",\n    \"#Ambient\",\n    \"#Reverb\",\n    \"#Atmospheric\",\n    \"#Poetic Lyrics\",\n    \"#Nostalgic\"\n  ]\n}\n```"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage("从流行音乐专业角度评价下这个音乐的编曲配器质量、人声质量和旋律、歌词内容故事性等几个方面，并且在标签中返回 细分曲风、乐器等重要标签；注意打分差距拉大一些，有一些亮点的作品就大胆地大于8分，没有太多亮点的就6-8分之间；对于各维度的评价，要求不要那么高，避免每个维度都有负向评价的情况。");
    const resultTxt = result.response.text();
    console.log(resultTxt);
    // console.log(typeof resultTxt);
    // const resultObj = await result.response.json();
    return JSON.parse(resultTxt);
  }

  // module.exports = { analyzeMusic };