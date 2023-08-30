const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.on('connected', () => {
  console.log('mongodb connected succesfullyz');
});

db.on('error', (err) => {
  console.log(`Error in mongodb connection ${err}`);
});

module.exports = db;