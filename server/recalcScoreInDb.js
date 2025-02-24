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

async function recalcScoreInDb() {
    const db = await connectToDb();
    const songs = await db.collection('songs').find().toArray();
    for (const song of songs) {
        console.log('before', song._id, song.song_name, song.overall_score);
        // re-calc overall_score
        let totalItem = 0;
        let totalScore = 0;
        if (song.arrangement?.score) {
            totalItem += 1;
            totalScore += song.arrangement.score;
        }
        if (song.vocal?.score) {
            totalItem += 1;
            totalScore += song.vocal.score;
        }
        if (song.structure?.score) {
            totalItem += 1;
            totalScore += song.structure.score;
        }
        if (song.lyrics?.score) {
            totalItem += 1;
            totalScore += song.lyrics.score;
        }
        song.overall_score = Number((totalItem > 0 ? totalScore / totalItem : 0).toFixed(1));
        console.log('after', song._id, song.song_name, song.overall_score);
        await db.collection('songs').updateOne({ _id: song._id }, { $set: { overall_score: song.overall_score } });
    }
}

recalcScoreInDb().then(console.log('Updated')).catch(console.error);