---
description: Build and sync the app to Android
---

To sync your latest changes to the Android app, follow these steps:

1. Rebuild the Next.js application to generate the static export.
// turbo
2. Sync the web assets and plugins to the native Android project.
// turbo
3. Run the app on your connected Android device or emulator.

```bash
npm run build
npx cap sync
npx cap run android
```
