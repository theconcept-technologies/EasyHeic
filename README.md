# EasyHEIC

> **Simple, professional HEIC → JPEG/PNG converter**  
> by [theconcept technologies FlexKapG](https://www.theconcept-technologies.com)

[![Build EasyHEIC](https://github.com/theconcept-technologies/easyheic/actions/workflows/build.yml/badge.svg)](https://github.com/theconcept-technologies/easyheic/actions/workflows/build.yml)

---

## Overview

EasyHEIC converts HEIC/HEIF images (from iPhone/iPad) into standard JPEG or PNG files. It runs as a native Windows desktop application with a clean, step-by-step interface designed for non-technical users.

**Built with:** Electron + React + TypeScript + electron-builder  
**Conversion:** `heic-convert` (pure JavaScript, no native dependencies)

---

## Features

- 🖼️ **Drag & drop** HEIC files directly into the app
- 📁 Select individual files **or entire folders**
- 🔍 **Recursive subfolder** scanning
- 🎯 Choose output format: **JPEG** (with quality slider) or **PNG**
- 🛡️ **Never overwrites** existing files (auto-renames)
- 📊 Real-time **progress bar** with file name display
- 🌍 **German / English** interface (auto-detects OS language)
- 🌙 **Dark mode** support (follows OS preference)
- 💾 Remembers last output folder

---

## Getting Started (Development)

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
cd EasyHeic
npm install
```

### Start development server

```bash
npm run dev
```

This opens Electron with hot-reload enabled for all processes (main, preload, renderer).

### Type checking

```bash
npm run type-check
```

---

## Building

### ⚠️ Cross-Platform Build Limitations

You are developing on **macOS**. Here's what works:

| Command | Platform | Result |
|---|---|---|
| `npm run dev` | macOS | ✅ Full dev experience |
| `npm run build:mac` | macOS | ✅ macOS DMG |
| `npm run build:win` | macOS | ⚠️ May work for pure-JS apps (no code signing) |
| **GitHub Actions** | Windows runner | ✅ **Recommended** — full NSIS installer |

### Build for Windows (recommended via GitHub Actions)

1. Push to `main` or create a tag `v1.0.0`
2. The workflow at `.github/workflows/build.yml` runs on `windows-latest`
3. Downloads the installer artifact from the Actions tab

### Build locally on macOS (limited)

```bash
npm run build:win
```

Output: `dist/EasyHEIC-1.0.0-x64.exe` (portable) and `dist/EasyHEIC-Setup-1.0.0.exe`

### Create a GitHub Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will build the Windows installer and automatically attach it to the release.

---

## How to Replace the Logo

1. **App icon (Windows):** Replace `resources/icon.ico` (256×256 recommended, multi-size ICO)
2. **App icon (macOS):** Replace `resources/icon.icns`
3. **Taskbar/installer icon:** Same `resources/icon.ico`
4. **UI logo:** Edit `src/renderer/components/Header.tsx`:

```tsx
// Replace this:
<div className="header-logo">EH</div>

// With this:
<img src="./logo.png" width={36} height={36} alt="EasyHEIC Logo" />
```

Place `logo.png` in `src/renderer/assets/` and import it in the component.

---

## How to Change Company Metadata

All metadata is defined in two places:

### 1. `package.json`

```json
{
  "author": {
    "name": "Martin Weigl",
    "email": "office@theconcept-technologies.com",
    "url": "https://www.theconcept-technologies.com"
  }
}
```

### 2. `electron-builder.yml`

```yaml
appId: com.theconcept-technologies.easyheic
productName: EasyHEIC
copyright: © Martin Weigl / theconcept technologies FlexKapG

win:
  publisherName: theconcept technologies FlexKapG
```

---

## How to Change the App Name

1. Update `productName` in `electron-builder.yml`
2. Update `name` in `package.json`
3. Update the `<title>` in `src/renderer/index.html`
4. Update `appId` in `electron-builder.yml` (reverse domain: `com.yourcompany.appname`)

---

## How to Change the App Version

```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

This updates `package.json` and creates a git tag automatically.

---

## How to Enable Code Signing (Windows)

1. Obtain an **EV Code Signing Certificate** (Comodo, DigiCert, Sectigo)
2. Export as `.p12` / `.pfx` file
3. Base64-encode it: `base64 -i cert.pfx | pbcopy`
4. Add to GitHub Secrets:
   - `WIN_CSC_LINK` — base64 encoded `.pfx`
   - `WIN_CSC_KEY_PASSWORD` — certificate password
5. Uncomment the signing lines in `.github/workflows/build.yml`

---

## Project Structure

```
EasyHeic/
├── .github/workflows/build.yml   # CI/CD — Windows build
├── src/
│   ├── main/
│   │   ├── index.ts              # Electron main process
│   │   ├── ipc-handlers.ts       # IPC: dialogs, scanning, conversion
│   │   └── converter.ts          # HEIC → JPEG/PNG logic
│   ├── preload/
│   │   └── index.ts              # Context bridge (window.electronAPI)
│   └── renderer/
│       ├── App.tsx               # Root component + step logic
│       ├── main.tsx              # React entry point
│       ├── index.html            # HTML shell
│       ├── components/
│       │   ├── Header.tsx        # Logo + language switcher
│       │   └── steps/
│       │       ├── Step1FileSelect.tsx
│       │       ├── Step2OutputFolder.tsx
│       │       ├── Step3FormatSelect.tsx
│       │       └── Step4Convert.tsx
│       ├── hooks/
│       │   └── useConversion.ts  # Conversion lifecycle hook
│       ├── store/
│       │   └── appStore.ts       # Zustand state
│       ├── i18n/
│       │   ├── index.ts          # i18next setup
│       │   └── locales/
│       │       ├── de.json       # German strings
│       │       └── en.json       # English strings
│       └── styles/
│           └── globals.css       # Full design system
├── resources/
│   ├── icon.png                  # App icon (replace with real logo)
│   └── icon.ico                  # Windows icon
├── electron.vite.config.ts
├── electron-builder.yml
├── package.json
└── tsconfig.json
```

---

## License

© Martin Weigl / theconcept technologies FlexKapG  
All rights reserved.

---

## Contact

- **Website:** https://www.theconcept-technologies.com  
- **Email:** office@theconcept-technologies.com
