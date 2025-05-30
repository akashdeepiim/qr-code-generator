const sharp = require("sharp");

const inputPath = "./logo.png"; // Change this to an existing PNG image
const outputPath = "./output.png";

sharp(inputPath)
    .resize(100, 100)
    .toFile(outputPath)
    .then(() => {
        console.log("Image processed successfully.");
    })
    .catch((err) => {
        console.error("Error processing image:", err);
    });