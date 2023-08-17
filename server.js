"use strict";
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const app = require("./app");

mongoose.set("strictQuery", false);

const DB = process.env.DATABASE_URI;
mongoose.connect(DB).then(() => console.log("Database connected..."));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}...`));
