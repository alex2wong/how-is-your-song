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

async function updateSongTimestamp() {
    const db = await connectToDb();
    const songs = await db.collection('songs').find().toArray();
    for (const song of songs) {
        if (!song.createAt) {
            song.createAt = Date.now() - (24*3600*1000);
            await db.collection('songs').updateOne({ _id: song._id }, { $set: { createAt: song.createAt } });
            console.log('Updated', song._id);
        }
    }
}

updateSongTimestamp().then(console.log('Updated')).catch(console.error);