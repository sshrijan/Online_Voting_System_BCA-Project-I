const { connect } = require("mongoose");

let isConnected;

const connectDatabase = async () => {
  if (isConnected) return;

  console.log("DATABASE_URI:", process.env.DATABASE_URI);

  try {
    await connect(`${process.env.DATABASE_URI}/${process.env.DB_NAME}`).then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    });

    isConnected = true;
  } catch (error) {
    console.error("database not connected:", error && error.message);
    console.error(error && error.stack);
    process.exit(1); // STOP SERVER
  }
};

module.exports = connectDatabase;
