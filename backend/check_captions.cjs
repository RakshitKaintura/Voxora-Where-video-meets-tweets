const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://Rakshit:RK123qwe@cluster0.0rv5ras.mongodb.net/twitube');
  const videos = await mongoose.connection.db.collection('videos').find({ captions: { $exists: true, $ne: '' } }).sort({createdAt: -1}).limit(1).toArray();
  
  if (videos.length > 0) {
    console.log('RAW VTT CUES (first 1000 chars):');
    console.log(JSON.stringify(videos[0].captions.substring(0, 1000)));
  } else {
    console.log('NO CAPTIONS FIELD FOUND');
  }
  process.exit(0);
}

check().catch(console.error);
