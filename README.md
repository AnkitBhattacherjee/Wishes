# 🎂 Make a Wish — Interactive Birthday & Celebration Gift App

An enchanting, highly personalized celebration web experience created to send unforgettable birthday surprises, heartfelt letters, memory scrapbooks, and interactive folk puppetry.

---

## ✨ Features

- **🎭 Putul Khela (Bengali Marionette Theatre)**: Full-width puppet theatre stage featuring 8 canonical folk puppets (Lantern Bearer, Story Maiden, Telescope Boy, Star Dancer, Dream Builder, Melody Maker, Moonbeam Boy, Memory Painter). Pull strings to reveal royal velvet scrolls!
- **📜 Royal Red Velvet & Gold Scroll**: Read secret love notes, dreams, and personal letters framed inside authentic gold filigree borders on deep crimson velvet.
- **🎵 In-App Dedicated Song Player**: Dedicate YouTube songs that stream directly on the stage without sending the receiver away or breaking the romantic flow.
- **🎂 3D Cake Cutting & Blow Candles Room**: Interactive room with multiple cake designs, candle blowing interactions, party ambient lighting, and customized background songs.
- **💌 Self-Contained Sharing**: Click **Share** to copy an instant gift link. Works anywhere with 0 backend dependencies — recipients can view your personalized surprise right on their phones!
- **📖 Memory Scrapbook**: Flip through custom scrapbook pages, photos, and nostalgic stickers.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```
The compiled, optimized static assets will be output in `dist/`.

---

## 🌐 How to Publish to GitHub & GitHub Pages

### Step 1: Initialize Git and Commit
```bash
git init
git add .
git commit -m "Initial commit: Make a Wish app ready for publish"
```

### Step 2: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) (e.g. `wish-me`).
2. Run:
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### Step 3: Enable GitHub Pages (Automatic!)
This repository includes a ready-to-run GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. In your GitHub repository, go to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. That's it! Every time you push to `main`, GitHub will automatically build and publish your site at `https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/`.

---

## 🛠 Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router (HashRouter for 100% static host compatibility)
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide Icons
- **Fonts**: Alex Brush, Caveat, Poppins, Outfit

