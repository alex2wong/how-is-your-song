require('dotenv').config();

const MONGO_URI = process.env.DB_URL || 'mongodb://localhost:27017/how-is-your-song';

const { MongoClient, ObjectId } = require('mongodb');

let _db;

async function connectToDb() {
    if (!_db) {
        const dbClient = new MongoClient(MONGO_URI);
        await dbClient.connect();
        _db = dbClient.db('how-is-your-song');
    }
    return _db;
}

async function insertTags(tags) {
    if (!tags) return;
    const db = await connectToDb();
    const operations = tags.map(tag => ({
        updateOne: {
            filter: { tag },
            update: { $set: { tag } },
            upsert: true
        }
    }));
    return db.collection('tags').bulkWrite(operations);
}

async function getTags() {
    const db = await connectToDb();
    return db.collection('tags').find().toArray();
}

async function insertSong(songJson) {
    await insertTags(songJson.tags ? songJson.tags : (songJson.arrangement?.tags ? songJson.arrangement.tags : []));
    const db = await connectToDb();
    songJson.createAt = Date.now();
    return db.collection('songs').insertOne(songJson);
}

async function getSongById(songId) {
    console.log('getSongById', songId);
    const id = new ObjectId(songId);
    const db = await connectToDb();
    return db.collection('songs').find({ _id: id }).toArray();
}

async function getSongsByName(name) {
    const db = await connectToDb();
    return db.collection('songs').find({ song_name: { $regex: name, $options: 'i' } }).toArray();
}

/*
 {
   "song_name": "未知歌曲名",
   "overall_score": 7.6,
   "comments": "整首歌曲呈现出一种淡淡的怀旧氛围，像是对过去时光的回忆和感叹。音乐风格偏向于民谣，带有一些轻柔的流行元素。整体听感舒适，但缺乏一些令人眼前一亮的亮点。",
   "arrangement": {
     "score": 7.2,
     "comments": "编曲以木吉他扫弦为主要伴奏，间奏部分加入了口风琴，营造出一种温暖、怀旧的氛围。配器相对简单，层次感不够丰富。建议在副歌部分可以考虑加入一些弦乐或者钢>琴等乐器，以增强音乐的厚度和情感张力。此外，可以尝试在节奏上做一些变化，避免过于平淡。"
   },
   "vocal": {
     "score": 7.8,
     "comments": "女声嗓音清澈、甜美，演唱技巧较为成熟，能够较好地表达歌曲的情感。但在情感的投入上可以更加饱满一些，尤其是在副歌部分，可以尝试加入一些气声或者轻微的颤>音，以增强歌曲的感染力。"
   },
   "structure": {
     "score": 7.5,
     "comments": "歌曲结构较为传统，为典型的AABA结构。歌曲部分时间轴和歌词如下：\n\n[00:19.92] 我们曾相约\n[00:22.81] 要飞向南方\n[00:24.99] 在暖春三月启航\n[00:30.74] 度过了凛冽\n[00:32.66] 也穿越了户长\n[00:35.58] 却又在深秋间两相\n[00:40.41] 框或许是时光太快太匆忙\n[00:45.89] 才让我们追逐着不停歇的流浪\n[00:50.76] 若能够让岁月缓缓流淌\n[00:55.96] 会
不会有更美的风景在前方\n[01:20.96] 我们曾相约\n[01:24.08] 要飞向南方\n[01:26.84] 在暖春三月启航\n[01:32.02] 度过了凛冽\n[01:33.61] 也穿越了户长\n[01:36.47] 却又在秋冬之际停下回望\n[01:41.99] 也许生活就该是这样\n[01:46.21] 有欢聚就会有散场\n[01:51.99] 当我们适应了这种变化\n[01:57.48] 才会明白成长的分量\n[02:02.73] 也许生活就该是这样\n[02:08.48] 有欢聚就会有散场\n[02:13.28] 当我们适应了这种变化\n[02:17.48] 才会明白成长的分量\n\n歌曲结构缺乏新意，可以在bridge部分做一些特别的设计，比如加入一段人声吟唱或者乐器solo，以增加歌曲的记忆点。",
     "lyrics": {
      "score": 8.2,
       "comments": "歌词以“我们”的口吻，讲述了一段关于成长、相遇和离别的故事。歌词中使用了“南方”、“暖春”、“深秋”等意象，营造出一种季节更替、时光流逝的氛围。歌词内容较
为真挚，能够引起听众的共鸣，但深度和意境上还可以进一步挖掘。"
      }
     },
     "tags": [
       "#民谣",
       "#流行",
       "#FolkPop", 
       "#女声",
       "#木吉他",
       "#口风琴",
       "#怀旧",
       "#成长",
       "#中文" 
     ]
   }
*/

async function getSongRank(tagName, timestamp) {
    console.log('getSongRank', tagName, timestamp);
    const db = await connectToDb();
    // 查找 song tags 中包含tagName的歌曲并排行，取前100名。如果tagName为空，则为全局排行，按overall_score分数进行排行
    // 如果timestamp不为空，则只返回timestamp之后的歌曲
    const songs = await db.collection('songs').find({
        "tags": { $regex: tagName ? `.*${tagName}.*` : '' },
        ...(timestamp ? { "createAt": { $gte: Number(timestamp) } } : {})
    }, {
        projection: {
            song_name: 1,
            overall_score: 1,
            authorName: 1,
            likes: 1,
            _id: 1
        }
    }).sort({ "overall_score": -1 }).limit(300).toArray();
    return songs;
}

async function getSongRankReverse() {
    const db = await connectToDb();
    // 最低分数排行，取前100名
    const songs = await db.collection('songs').find({}, {
        projection: {
            song_name: 1,
            overall_score: 1,
            authorName: 1,
            likes: 1,
            _id: 1
        }
    }).sort({ "overall_score": 1 }).limit(300).toArray();
    return songs;
}

async function addLike(songId) {
    const id = new ObjectId(songId);
    const db = await connectToDb();
    // If likes field doesn't exist, it will be created with value 1
    // If it exists, it will be incremented by 1
    await db.collection('songs').updateOne(
        { _id: id }, 
        { $inc: { likes: 1 } },
        { upsert: false } // Don't create new document if song doesn't exist
    );
}

async function removeLike(songId) {
    const id = new ObjectId(songId);
    const db = await connectToDb();
    
    // First get the current likes count
    const song = await db.collection('songs').findOne({ _id: id });
    
    // Only decrement if likes is greater than 0
    if (song && song.likes > 0) {
        await db.collection('songs').updateOne({ _id: id }, { $inc: { likes: -1 } });
    }
}

async function getRankByLike() {
    const db = await connectToDb();
    const songs = await db.collection('songs').find(
        { likes: { $gt: 0 } },
        {
            projection: {
                song_name: 1,
                overall_score: 1,
                authorName: 1,
                likes: 1,
                _id: 1
            }
        }
    ).sort({ "likes": -1 }).limit(300).toArray();
    return songs;
}

async function calculateSongPercentiles(songId) {
    const db = await connectToDb();
    const id = new ObjectId(songId);
    const song = await db.collection('songs').findOne({ _id: id });
    if (!song) return null;

    // 获取所有歌曲的分数
    const allSongs = await db.collection('songs').find({}).toArray();
    const totalSongs = allSongs.length;

    // 计算各维度的百分位数
    const percentiles = {};

    // 计算总分的百分位数
    const overallScores = allSongs.map(s => s.overall_score || 0).sort((a, b) => a - b);
    const overallRank = overallScores.findIndex(score => score > (song.overall_score || 0));
    percentiles.overall = Number((overallRank === -1 ? 1 : overallRank / totalSongs).toFixed(2));

    // 计算编曲分数的百分位数
    if (song.arrangement?.score) {
        const arrangementScores = allSongs
            .map(s => s.arrangement?.score || 0)
            .sort((a, b) => a - b);
        const arrangementRank = arrangementScores.findIndex(score => score > song.arrangement.score);
        percentiles.arrangement = Number((arrangementRank === -1 ? 1 : arrangementRank / totalSongs).toFixed(2));
    }

    // 计算演唱分数的百分位数
    if (song.vocal?.score) {
        const vocalScores = allSongs
            .map(s => s.vocal?.score || 0)
            .sort((a, b) => a - b);
        const vocalRank = vocalScores.findIndex(score => score > song.vocal.score);
        percentiles.vocal = Number((vocalRank === -1 ? 1 : vocalRank / totalSongs).toFixed(2));
    }

    // 计算结构分数的百分位数
    if (song.structure?.score) {
        const structureScores = allSongs
            .map(s => s.structure?.score || 0)
            .sort((a, b) => a - b);
        const structureRank = structureScores.findIndex(score => score > song.structure.score);
        percentiles.structure = Number((structureRank === -1 ? 1 : structureRank / totalSongs).toFixed(2));
    }

    // 计算歌词分数的百分位数
    if (song.lyrics?.score) {
        const lyricsScores = allSongs
            .map(s => s.lyrics?.score || 0)
            .sort((a, b) => a - b);
        const lyricsRank = lyricsScores.findIndex(score => score > song.lyrics.score);
        percentiles.lyrics = Number((lyricsRank === -1 ? 1 : lyricsRank / totalSongs).toFixed(2));
    }

    console.log('song score percentiles for songId ', songId, percentiles); // debug print percentiles

    // 更新歌曲文档中的百分位数信息
    await db.collection('songs').updateOne(
        { _id: id },
        { $set: { percentiles } }
    );

    return percentiles;
}

async function getSongRankByIds(songIds) {
    const db = await connectToDb();
    // 将字符串ID转换为ObjectId对象
    const objectIds = songIds.map(id => new ObjectId(id));
    
    const songs = await db.collection('songs').find({ _id: { $in: objectIds } },{
        projection: {
            song_name: 1,
            overall_score: 1,
            authorName: 1,
            likes: 1,
            _id: 1
        }
    }).sort({ "timestamp": -1 }).toArray();
    return songs;
}

module.exports = { connectToDb, insertTags, getTags, insertSong, calculateSongPercentiles, getSongRank, getSongRankReverse, getSongById, getSongsByName, addLike, removeLike, getRankByLike, getSongRankByIds };