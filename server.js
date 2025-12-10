const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3000;

const app = express();

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "public")));

// Explicitly serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});