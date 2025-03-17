const mongoose = require("mongoose");
const initData = require("./data.js");

const listing = require("../models/listing.js");

const mongoUrl = "mongodb://127.0.0.1:27017/wonderlust";
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
    owner: "67a6127704457279908b4e96",
  }));
  await listing.insertMany(initData.data);
  console.log("Database was initialized");
};

initDb();
