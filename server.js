const express = require("express");
const PORT = process.env.PORT || 3000;

const app = express();

// Serve static files from 'public'
app.use(express.static("public"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});