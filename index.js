import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import cron from "node-cron";
import fetchListings from "./fetchListings.js";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Then schedule fetchListings to be called every 15 minutes - adjust accordingly
cron.schedule("*/15 * * * *", fetchListings);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/listings", async (req, res) => {
  console.log("Hit endpoint /listings");
  fs.readFile("listings.json", "utf8", async (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred while reading the file.");
    }

    const listings = JSON.parse(data);

    for (const listing of listings) {
      const imagePath = path.join(__dirname, listing.imagePath);
      const image = await fs.promises.readFile(imagePath);
      const imageBase64 = image.toString("base64");
      listing.imageBase64 = imageBase64;
    }

    res.json(listings);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
