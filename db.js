const { mongoose } = require('mongoose');
const UserModel = require('./userschema');

module.exports = {
    initDb: () => {
        mongoose.connect(process.env.MONGO_CONN_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(result => {
            console.log("Database connection successful.");
            // const modelInstance = new UserModel({
            //     username: "Test User",
            //     balance: 69420
            // });

            // modelInstance.save()
            // .then(result => {
            //     console.log(result);
            // })
            // .catch(e => {
            //     console.log(e);
            // });
        })
        .catch(e => {
            console.log(e);
        });

        // Create a MongoClient with a MongoClientOptions object to set the Stable API version
        // const client = new MongoClient(process.env.MONGO_CONN_STRING, {
        //     serverApi: {
        //         version: ServerApiVersion.v1,
        //         strict: true,
        //         deprecationErrors: true,
        //     }
        // });

        // async function run() {
        //     try {
        //         // Connect the client to the server	(optional starting in v4.7)
        //         console.log("Connecting to db...");
        //         await client.connect();
        //         console.log("Pinging db...");
        //         // Send a ping to confirm a successful connection
        //         await client.db("UBSR").command({ ping: 1 });
        //         console.log("Pinged your deployment. You successfully connected to MongoDB!");
        //     } finally {
        //         // Ensures that the client will close when you finish/error
        //         await client.close();
        //     }
        // }
        // run().catch(console.dir);
    },

    addUser: (usernameString) => {
        const newUser = new UserModel({
            username: usernameString,
            balance: 0
        });

        return newUser.save();
    },

    userExists: async (usernameString) => {
        const user = await UserModel.findOne({ username: usernameString});
        console.log(`User ${usernameString} exists: ${user !== null}`);
        return user !== null;
    },

    getUserBalance: async (usernameString) => {
        const data = await UserModel.findOne({ username: usernameString }, 'balance');
        console.log(`${usernameString} balance: ${data.balance}`);
        return data.balance;
    }
}