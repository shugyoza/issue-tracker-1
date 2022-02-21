require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main(callback) {
    const URI = process.env.MONGO_URI
        , client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            // connect to MongoDB cluster
            await client.connect();

            // make the appropriate DB calls
            await callback(client);

        } catch (err) {
            // catch any error
            console.error(err);
            throw new Error('Unable to Connect to Database.')
        }
}

module.exports = main;
