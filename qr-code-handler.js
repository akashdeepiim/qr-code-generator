const QRCode = require("qrcode");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const generateQRCode = async (url, color, logoPath) => {
  const outputPath = path.resolve(`./tmp`) + `/qr-${Date.now()}.png`; // Unique file name for QR code
  const PADDING_PERCENTAGE = 0.03; // 10% padding around the logo

  try {
    // Step 1: Generate a basic QR code as a buffer
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      color: {
        dark: color || "#000000", // Custom dark color, defaults to black
        light: "#FFFFFF", // Light color stays white
      },
      width: 1000, // High resolution
    });

    // Step 2: Load the QR code image into Jimp
    const qrCodeImage = await Jimp.read(qrCodeBuffer);

    // If no logo is provided, return the plain QR code as is
    if (!logoPath) {
      await qrCodeImage.writeAsync(outputPath);
      return outputPath;
    }

    // Step 3: Load and scale the logo image
    const logoImage = await Jimp.read(logoPath);

    // Determine the logo size as a percentage of the QR code size
    const qrWidth = qrCodeImage.bitmap.width;
    const maxLogoWidth = qrWidth * 0.2; // Maximum 20% of the QR code width
    const maxLogoHeight = qrWidth * 0.2; // Maximum 20% of the QR code height

    // Scale the logo while maintaining its aspect ratio
    logoImage.scaleToFit(maxLogoWidth, maxLogoHeight);

    // Step 4: Recolor the Logo
    // Apply a tint with the user's selected QR code color
    const rgbColor = hexToRgb(color || "#000000"); // Convert HEX to RGB
    logoImage.scan(0, 0, logoImage.bitmap.width, logoImage.bitmap.height, (x, y, idx) => {
      // Get original pixel color
      const red = logoImage.bitmap.data[idx];
      const green = logoImage.bitmap.data[idx + 1];
      const blue = logoImage.bitmap.data[idx + 2];
      const alpha = logoImage.bitmap.data[idx + 3]; // Preserve alpha (transparency)

      // Mix the original colors with the RGB of the QR code color
      logoImage.bitmap.data[idx] = (red * 0.3 + rgbColor.r * 0.7) & 0xff; // Blend red
      logoImage.bitmap.data[idx + 1] = (green * 0.3 + rgbColor.g * 0.7) & 0xff; // Blend green
      logoImage.bitmap.data[idx + 2] = (blue * 0.3 + rgbColor.b * 0.7) & 0xff; // Blend blue
      logoImage.bitmap.data[idx + 3] = alpha; // Keep alpha unchanged
    });

    // Step 5: Add padding to the logo
    const padding = Math.ceil(qrWidth * PADDING_PERCENTAGE);
    const paddedLogoWidth = logoImage.bitmap.width + padding;
    const paddedLogoHeight = logoImage.bitmap.height + padding;

    // Create a new image with padding
    const logoWithPadding = new Jimp(
        paddedLogoWidth,
        paddedLogoHeight,
        0xFFFFFFFF // White background
    );
    logoWithPadding.composite(logoImage, padding / 2, padding / 2, {
      mode: Jimp.BLEND_SOURCE_OVER,
    });

    // Step 6: Center the padded logo on the QR code
    const xPos = (qrWidth - logoWithPadding.bitmap.width) / 2;
    const yPos = (qrWidth - logoWithPadding.bitmap.height) / 2;

    qrCodeImage.composite(logoWithPadding, xPos, yPos, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
    });

    // Step 7: Save the final QR code
    await qrCodeImage.writeAsync(outputPath);

    // Step 8: Clean up temporary uploaded logo files
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    return outputPath;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error; // Re-throw the error to handle it in the caller
  }
};

// Helper function to convert HEX to RGB
const hexToRgb = (hex) => {
  const normalizedHex = hex.replace(/^#/, ""); // Remove leading '#'
  const bigint = parseInt(normalizedHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

module.exports = { generateQRCode };