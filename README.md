# Free QR Code Generator (Pro)

> A high-performance, fully client-side QR code generator featuring live previews, advanced customization, and a mobile-first design.

![Project Preview](https://github.com/akashdeepiim/qr-code-generator/blob/main/public/logo.png?raw=true)

## 🚀 Features

- **⚡ Instant Live Preview**: QR codes regenerate instantly in the browser as you type or change settings. No server latency.
- **🎨 Advanced Customization**:
  - **Patterns**: Choose from Square, Dots, Rounded, Extra Rounded, Classy, etc.
  - **Colors**: Customize foreground and background colors.
  - **Logos**: Upload and embed custom brand logos directly into the center of the code.
  - **Labels**: Add custom text labels below the QR code.
- **📱 Mobile Optimized**:
  - **Smart Scaling**: Automatically adjusts preview size for small screens (200px on mobile vs 300px on desktop).
  - **Sticky Actions**: "Download" button stays within reach on mobile devices.
  - **Responsive Layout**: Fluid Grid layout that adapts from Desktop side-by-side to Mobile vertical stack.
- **💾 Export Options**:
  - **SVG**: For infinite scalability and print.
  - **PNG/JPG**: High-quality raster exports.
- **🌍 SEO Friendly**: Server-side rendering compatible structure for search engines.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Custom Responsive Grid/Flexbox), Vanilla JavaScript.
- **QR Engine**: [qr-code-styling](https://qr-code-styling.com/) (Client-side Vector generation).
- **Server**: Minimal Node.js Express server (Static file serving only).
- **Deployment**: Vercel (Serverless/Static).

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- NPM

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akashdeepiim/qr-code-generator.git
   cd qr-code-generator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the App**
   Open your browser and navigate to `http://localhost:3000`.

## ☁️ Deployment

### Vercel (Recommended)
This project includes a `vercel.json` configuration file optimized for Vercel deployment.

1. Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2. Import the project into Vercel.
3. Vercel will detect the settings and deploy automatically.
   - **Note**: The server listens on `process.env.PORT` automatically.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---
Designed & Built by **Akash Deep**
