require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");

const listing = require("../models/listing.js");

const mongoUrl = process.env.ATLUSURL;
let userId = process.env.USERID;
async function main() {
  await mongoose.connect(mongoUrl);
}

main()
  .then((res) => {
    console.log("Connection succesful");
    console.log(res);
  })
  .catch((err) => console.log(err));

const initDb = async () => {
  await listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: `${userId}`,
  }));
  await listing.insertMany(initData.data);
  console.log("Database was initialized");
};

initDb();
