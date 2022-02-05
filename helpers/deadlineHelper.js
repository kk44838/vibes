const { MongoClient } = require("mongodb");
const moment = require('moment');

const uri = "mongodb://localhost:27017/";

async function connect() {

  const mongoDBClient = new MongoClient(uri)

  try {
    await mongoDBClient.connect();
    return mongoDBClient
  } catch(e){
    console.log('could not connect')
  } finally {
    console.log("connected")
  }
};

module.exports = {
	async addDeadline(name, dateTime) {
    console.log(`deadlinehelper args: ${name}, ${dateTime}`)

    let mongoDBClient;
    try {
      mongoDBClient = await connect();
      const database = mongoDBClient.db('vibes');
      const deadlinesCollection = database.collection('deadlines');
      deadlinesCollection.insertOne({ "name": name, "time": dateTime.valueOf()})
      const allDeadlines = await deadlinesCollection.find({}).toArray();
      console.log(allDeadlines);
    } finally {
      // Ensures that the client will close when you finish/error
      await mongoDBClient.close();
    }
  },

  async viewDeadlines() {

    let mongoDBClient;
    try {
      mongoDBClient = await connect();
      const database = mongoDBClient.db('vibes');
      const deadlines = database.collection('deadlines');
      // Query for a movie that has the title 'Back to the Future'
      const query = { title: 'Back to the Future' };
      const allDeadlines = await deadlines.find({}).toArray();
      console.log(allDeadlines);

      allDeadlines.forEach(deadline => {
        deadline.time = moment.unix(deadline.time).format('DD/MM/YYYY HH:mm')
      })
      
      console.log(allDeadlines);

      return allDeadlines;
    } finally {
      // Ensures that the client will close when you finish/error
      await mongoDBClient.close();
    }
  }

};
