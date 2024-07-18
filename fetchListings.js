import puppeteer from "puppeteer";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { pipeline } from "stream";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);

dotenv.config();

const websiteURL = process.env.WEBSITE_URL;
const pricePoint = process.env.PRICE_POINT;

async function fetchListings() {
  let i = 1;
  let listings = [];
  do {
    console.log("Launching puppeteer");
    const browser = await puppeteer.launch({ headless: false });
    console.log("Browser launched", browser);

    const page = await browser.newPage();
    console.log("New page opened", page);

    const url = `${websiteURL}/page/${i}`;
    await page.goto(url); // Navigate to the page
    console.log(`Navigated to ${url}`);

    await page.waitForSelector(".displaypanel-wrapper", { timeout: 60000 }); // Wait for up to 60 seconds

    // Fetch the listings from the current page
    const currentPageListings = await page.$$eval(
      ".displaypanel-wrapper",
      (listings) =>
        listings.map((listing) => {
          const price = listing.querySelector(".displaypanel-price").innerText;
          const address = listing.querySelector(
            ".displaypanel-section"
          ).innerText;
          // Select all <li> elements within the <ul> with class "inlinelist"
          const inlinelistItems = Array.from(
            listing.querySelectorAll(".displaypanel-section .inlinelist li")
          );
          // Map through each <li> and extract the innerText
          const inlinelistTexts = inlinelistItems.map((li) => li.innerText);
          const imageUrl = listing.querySelector(".displaypanel-photo img").src;
          console.log(imageUrl);
          return {
            price: parseInt(price.replace(/[^0-9.-]+/g, "")),
            address: address,
            details: inlinelistTexts,
            imageUrl: imageUrl,
          };
        })
    );

    const downloadImage = async (listing) => {
      const filename = `photos/${listing.address
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.jpg`;

      if (!fs.existsSync(filename)) {
        const response = await fetch(listing.imageUrl);

        if (!response.ok)
          throw new Error(`unexpected response ${response.statusText}`);

        await streamPipeline(response.body, fs.createWriteStream(filename));
      }

      listing.imagePath = filename; // Add the image path to the listing object
    };

    // Use Promise.all to download all images in parallel
    await Promise.all(currentPageListings.map(downloadImage));

    listings = listings.concat(currentPageListings);
    console.log(
      `Fetched ${currentPageListings.length} listings from page ${i}`
    );

    const isLastPage = await page.evaluate(() => {
      const activePageElement = document.querySelector(
        ".paginator-page.is-active"
      );
      const nextElement = activePageElement.nextElementSibling;
      return nextElement.className !== "paginator-page";
    });

    console.log("is last page", isLastPage);

    if (isLastPage || currentPageListings.length < 20) {
      console.log("Reached the last page");
      await browser.close();
      console.log("Browser closed");
      break;
    } else {
      await browser.close();
      console.log("Browser closed");
    }

    i++;
  } while (listings.length >= 20);

  console.log(`Fetched a total of ${listings.length} listings`);

  // Read the existing listings from listings.json
  let existingListings;
  try {
    existingListings = JSON.parse(fs.readFileSync("listings.json"));
  } catch (err) {
    existingListings = [];
  }

  const newListings = listings.filter((listing) => listing.price < pricePoint);
  console.log(`Found ${newListings.length} listings less than $${pricePoint}`);

  // Find the listings that are new
  const addedListings = newListings.filter(
    (newListing) =>
      !existingListings.some(
        (existingListing) =>
          existingListing.address === newListing.address &&
          existingListing.price === newListing.price
      )
  );

  // Find the listings that have been removed
  const removedListings = existingListings.filter(
    (existingListing) =>
      !newListings.some(
        (newListing) =>
          newListing.address === existingListing.address &&
          newListing.price === existingListing.price
      )
  );

  console.log(`Added ${addedListings.length} new listings`);
  console.log(`Removed ${removedListings.length} listings`);

  if (newListings.length > 0) {
    fs.writeFile(
      "listings.json",
      JSON.stringify([...existingListings, ...addedListings], null, 2),
      (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Listings saved to listings.json");
        }
      }
    );
  }
}

export default fetchListings;
