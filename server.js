const express = require("express");
const multer = require("multer");
const path = require("path");
const { generateQRCode } = require("./qr-code-handler");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique file names
  },
});
const upload = multer({ storage });

// Route for generating the QR code
app.post("/generate", upload.single("logo"), async (req, res) => {
  const { url, color, style, label, margin, errorCorrection } = req.body;
  const logoPath = req.file ? req.file.path : null;

  try {
    const qrCodePath = await generateQRCode(url, color, logoPath, {
      style,
      label,
      margin: parseInt(margin) || 1,
      errorCorrection
    });
    res.download(qrCodePath); // Download the QR code file
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).send("Error generating QR code.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});