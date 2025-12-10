const QRCode = require("qrcode");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const generateQRCode = async (url, color, logoPath, options = {}) => {
  const { style = 'square', label = '', margin = 1, errorCorrection = 'M' } = options;
  const outputPath = path.resolve(`./tmp`) + `/qr-${Date.now()}.png`;

  try {
    // 1. Generate QR Data Matrix
    const qrData = QRCode.create(url, {
      errorCorrectionLevel: errorCorrection
    });
    const moduleCount = qrData.modules.size;
    const cellSize = 40; // Pixels per module
    const dataSize = moduleCount * cellSize;

    // Calculate full canvas size including margin
    const marginSize = margin * cellSize;
    const canvasSize = dataSize + (marginSize * 2);

    // 2. Initialize Canvas (White Background)
    const image = new Jimp(canvasSize, canvasSize, 0xFFFFFFFF);

    // Load fonts if label is present
    let font = null;
    let labelHeight = 0;
    if (label) {
      font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      labelHeight = 60; // Extra space for text
      image.resize(canvasSize, canvasSize + labelHeight);
      // Refill white background for extended area
      image.scan(0, canvasSize, canvasSize, labelHeight, (x, y, idx) => {
        image.bitmap.data[idx] = 255;
        image.bitmap.data[idx + 1] = 255;
        image.bitmap.data[idx + 2] = 255;
        image.bitmap.data[idx + 3] = 255;
      });
    }

    // 3. Prepare Draw Colors/Sprites
    const fgColor = hexToRgb(color || "#000000");
    const fgHex = Jimp.rgbaToInt(fgColor.r, fgColor.g, fgColor.b, 255);

    // Create sprites for "Dots" and "Rounded"
    const dotSprite = new Jimp(cellSize, cellSize, 0x00000000);
    const circleMask = new Jimp(cellSize, cellSize, 0x00000000);

    // Draw circle on mask
    const center = cellSize / 2;
    const radius = (cellSize / 2) - 2; // Slight padding for isolated dots

    // Manual circle drawing for sprite (Jimp doesn't have drawCircle easily on images)
    // We'll scan and set pixels
    if (style === 'dots' || style === 'rounded') {
      dotSprite.scan(0, 0, cellSize, cellSize, (x, y, idx) => {
        const dx = x - center;
        const dy = y - center;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
          // Inside circle
          dotSprite.bitmap.data[idx] = fgColor.r;
          dotSprite.bitmap.data[idx + 1] = fgColor.g;
          dotSprite.bitmap.data[idx + 2] = fgColor.b;
          dotSprite.bitmap.data[idx + 3] = 255;
        }
      });
    }

    // 4. Render Modules
    const modules = qrData.modules.data;

    image.scan(0, 0, canvasSize, canvasSize, (x, y, idx) => {
      // Optimization: Don't scan blindly, iterate modules instead
    });

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrData.modules.get(row, col)) {
          const xPos = marginSize + (col * cellSize);
          const yPos = marginSize + (row * cellSize);

          // Check if it's a position probe (Corner Squares)
          // We usually want Position Patterns to be solid blocks or specific shapes
          // For simplicity, let's keep position patterns as Blocks always, or styled.
          // Let's apply style to EVERYTHING for now, or check bounds.
          const isPositionPattern = (row < 7 && col < 7) || (row < 7 && col >= moduleCount - 7) || (row >= moduleCount - 7 && col < 7);

          if (isPositionPattern) {
            // Squares for position patterns look better usually, but let's stick to requested style
            // Actually, standard QR readers expect squares. Let's force squares for Position Patterns
            // if it's "dots" style, to make it scannable? No, dots work too.
            // Let's use squares for "square" style, and dots for "dots".
            if (style === 'dots' || style === 'rounded') {
              image.composite(dotSprite, xPos, yPos);
            } else {
              // Square
              image.scan(xPos, yPos, cellSize, cellSize, (sx, sy, sidx) => {
                image.bitmap.data[sidx] = fgColor.r;
                image.bitmap.data[sidx + 1] = fgColor.g;
                image.bitmap.data[sidx + 2] = fgColor.b;
                image.bitmap.data[sidx + 3] = 255;
              });
            }
          } else {
            // Data Modules
            if (style === 'dots') {
              image.composite(dotSprite, xPos, yPos);
            } else if (style === 'rounded') {
              // Rounded Box (simplified to dot for now, or we can make a rect with rounded corners)
              // Let's use the dotSprite for rounded too as it's similar request usually
              image.composite(dotSprite, xPos, yPos);
            } else {
              // Square
              image.scan(xPos, yPos, cellSize, cellSize, (sx, sy, sidx) => {
                image.bitmap.data[sidx] = fgColor.r;
                image.bitmap.data[sidx + 1] = fgColor.g;
                image.bitmap.data[sidx + 2] = fgColor.b;
                image.bitmap.data[sidx + 3] = 255;
              });
            }
          }
        }
      }
    }

    // 5. Add Logo (Center)
    if (logoPath) {
      let logoImage = await Jimp.read(logoPath);
      const maxLogoSize = canvasSize * 0.2;
      logoImage.scaleToFit(maxLogoSize, maxLogoSize);

      // Center position
      const lx = (canvasSize - logoImage.bitmap.width) / 2;
      const ly = (canvasSize - logoImage.bitmap.height) / 2;

      // Remove QR modules behind logo for cleaner look?
      // Standard is just overlay. Let's overlay.
      image.composite(logoImage, lx, ly);
    }

    // 6. Add Label (Bottom)
    if (label && font) {
      const textWidth = Jimp.measureText(font, label);
      const lx = (canvasSize - textWidth) / 2;
      // Print text
      image.print(font, lx, canvasSize + 10, label);
    }

    await image.writeAsync(outputPath);

    // Clean up
    if (logoPath && fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    return outputPath;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

const hexToRgb = (hex) => {
  const normalizedHex = hex.replace(/^#/, "");
  const bigint = parseInt(normalizedHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

module.exports = { generateQRCode };