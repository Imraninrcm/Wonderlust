require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");

const listing = require("../models/listing.js");

const mongoUrl = process.env.ATLUSURL;
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
    owner: "680cb2db11db6603d54c67ee",
  }));
  await listing.insertMany(initData.data);
  console.log("Database was initialized");
};

initDb();
