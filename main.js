const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const fs = require("fs");

// Load service account key
const serviceAccount = require("./atomic-vault-425506-s3-66413ff4b7c0.json");

const app = express();
app.use(bodyParser.json());

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Replace with your Google Sheet ID and range
const SPREADSHEET_ID = "1g_F1G9ENEAlCkn7wnYbWjf0v4FgBuqQiJBGUmEIfs4A";
const RANGE = "Sheet1!A:B"; // Assuming A for latitude, B for longitude

// Endpoint to store location
app.post("/save-location", async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .send({ error: "Latitude and longitude are required." });
  }

  try {
    // Append data to the Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      resource: {
        values: [[latitude, longitude, new Date().toISOString()]], // Add timestamp
      },
    });

    res.status(200).send({ message: "Location saved successfully!" });
  } catch (err) {
    console.error("Error saving location:", err);
    res.status(500).send({ error: "Failed to save location." });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
