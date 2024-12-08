const { google } = require("googleapis");
const fs = require("fs");
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL, // Extracted from the service account JSON
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Ensure proper formatting
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Google Sheet configuration
const SPREADSHEET_ID = "1g_F1G9ENEAlCkn7wnYbWjf0v4FgBuqQiJBGUmEIfs4A"; // Replace with your spreadsheet ID
const RANGE = "Sheet1!A:B"; // Adjust range as needed

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Only POST requests are allowed." });
  }

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
};
