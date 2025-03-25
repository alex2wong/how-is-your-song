const { connectToDb } = require('./db');
const { ObjectId } = require('mongodb');

async function recalcPercentilesInDb() {
    const db = await connectToDb();
    const allSongs = await db.collection('songs').find({}).toArray();
    const totalSongs = allSongs.length;

    for (const song of allSongs) {
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

        console.log('Updating percentiles for song:', song._id, song.song_name, percentiles);

        // 更新歌曲文档中的百分位数信息
        await db.collection('songs').updateOne(
            { _id: song._id },
            { $set: { percentiles } }
        );
    }

    return { message: 'All songs percentiles have been recalculated' };
}


recalcPercentilesInDb().then(console.log).catch(console.error);