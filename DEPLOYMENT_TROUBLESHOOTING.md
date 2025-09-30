# GitHub Pages Deployment Troubleshooting

## 🔍 Issue: Build Not Deploying

If your GitHub Actions workflow is stuck or the site isn't appearing, follow these steps:

---

## ✅ **Step 1: Enable GitHub Pages**

**This is the most common issue!** GitHub Pages must be enabled in settings.

### Go to Settings:
```
https://github.com/vibedatascience/football_transfers_visual_essay_svelte_test/settings/pages
```

### Configure the Source:

1. **Under "Build and deployment"**
2. **Click the "Source" dropdown**
3. **Select "GitHub Actions"**
4. **Click Save (if button appears)**

**Expected result:**
- You should see: "Your site is ready to be published"
- Or: "Your site is live at https://vibedatascience.github.io/football_transfers_visual_essay_svelte_test/"

---

## ✅ **Step 2: Check Workflow Status**

### View Actions:
```
https://github.com/vibedatascience/football_transfers_visual_essay_svelte_test/actions
```

### What to look for:

**If workflow is running:**
- ⏳ Yellow dot = In Progress (normal, wait 2-3 minutes)
- ✅ Green checkmark = Success (site should be live!)
- ❌ Red X = Failed (see error details below)

**Click on the workflow run to see details**

---

## ❌ **Step 3: If Workflow Failed**

### Common Errors & Fixes:

### Error: "npm ci failed"
**Cause:** Missing or corrupted package-lock.json

**Fix:**
```bash
cd /Users/rahulchaudhary/football_transfers_pudding
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Fix package-lock.json"
git push
```

### Error: "Build failed"
**Cause:** Build errors in code

**Fix:**
```bash
npm run build
# Fix any errors shown
git add .
git commit -m "Fix build errors"
git push
```

### Error: "Permission denied" or "Deploy failed"
**Cause:** GitHub Pages not enabled or wrong permissions

**Fix:**
1. Go to repository Settings → Pages
2. Select "GitHub Actions" as source
3. Re-run the workflow:
   - Go to Actions tab
   - Click on failed workflow
   - Click "Re-run all jobs"

---

## ✅ **Step 4: Verify Deployment**

### Once workflow succeeds:

**Check the deployment:**
```
https://vibedatascience.github.io/football_transfers_visual_essay_svelte_test/
```

**If you see 404:**
- Wait 1-2 minutes (GitHub Pages can be slow to update)
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Try incognito/private browsing

---

## 🔄 **Manual Deployment Test**

If automatic deployment isn't working, try manually triggering:

### Option 1: Re-run Workflow
1. Go to Actions tab
2. Click on most recent workflow
3. Click "Re-run all jobs"

### Option 2: Trigger with Empty Commit
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

### Option 3: Use workflow_dispatch
1. Go to Actions tab
2. Click "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
4. Select "main" branch
5. Click "Run workflow"

---

## 📋 **Checklist**

Before asking for help, verify:

- [ ] GitHub Pages is enabled in Settings → Pages
- [ ] Source is set to "GitHub Actions"
- [ ] Workflow file exists: `.github/workflows/deploy.yml`
- [ ] package-lock.json is committed
- [ ] Build succeeds locally: `npm run build`
- [ ] vite.config.js has correct base path
- [ ] CSV file is in public/ folder
- [ ] Workflow has completed (not stuck)

---

## 🛠️ **Current Configuration**

### Repository:
```
https://github.com/vibedatascience/football_transfers_visual_essay_svelte_test
```

### Expected Live URL:
```
https://vibedatascience.github.io/football_transfers_visual_essay_svelte_test/
```

### Base Path in vite.config.js:
```javascript
base: '/football_transfers_visual_essay_svelte_test/'
```

### Build Command:
```bash
npm run build
```

### Build Output:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── transfers.csv
```

---

## 🔍 **Debug Commands**

### Check git status:
```bash
git status
git log --oneline -5
```

### Verify build:
```bash
npm run build
ls -la dist/
```

### Check file sizes:
```bash
du -sh public/transfers.csv
du -sh dist/
```

### Preview production build locally:
```bash
npm run preview
# Visit http://localhost:4173/football_transfers_visual_essay_svelte_test/
```

---

## 📞 **Getting Help**

### Workflow Logs
1. Go to Actions tab
2. Click on workflow run
3. Click on "build" or "deploy" job
4. Read error messages
5. Copy relevant errors

### Share These Details:
- Workflow run URL
- Error messages from logs
- Screenshot of Settings → Pages
- Output of `npm run build`

---

## ✨ **Success Indicators**

When everything works, you should see:

### In GitHub:
- ✅ Green checkmark on workflow
- Settings → Pages shows "Your site is live"
- Green "Active" status with URL

### In Browser:
- Site loads at: https://vibedatascience.github.io/football_transfers_visual_essay_svelte_test/
- All charts render correctly
- CSV data loads (19,454 transfers)
- Club search works
- No console errors

---

## 🎯 **Most Likely Issue**

**90% of the time, the issue is:**
1. GitHub Pages not enabled in Settings
2. Source not set to "GitHub Actions"

**Go to Settings → Pages and select "GitHub Actions" as the source!**