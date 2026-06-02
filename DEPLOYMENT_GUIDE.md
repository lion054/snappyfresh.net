# Snappy Fresh - cPanel Deployment Guide

## Quick Deployment Steps

### Option 1: Upload via cPanel File Manager (Easiest)
1. Log in to cPanel: https://cp69-jhb.za-dns.com:2083/
2. Username: `snappyfr`
3. Password: (see password in your secure notes)
4. Go to **File Manager** → navigate to `public_html`
5. Upload the `deployment-src.tar.gz` file
6. Right-click on it → **Extract**
7. Delete the tar.gz file
8. Open **Terminal** (in cPanel) and run:
   ```bash
   cd ~/public_html
   npm install --legacy-peer-deps
   npm run build
   ```

### Option 2: Upload via FTP (Faster for large files)
1. Use an FTP client (FileZilla, WinSCP, etc.)
   - Host: `cp69-jhb.za-dns.com`
   - Username: `snappyfr`
   - Password: (your cPanel password)
   - Port: 21 (standard FTP)

2. Connect and navigate to `/public_html`

3. Upload files:
   - Upload `deployment-src.tar.gz`
   - Or upload individual folders: `pages/`, `lib/`, `public/`, `components/`, etc.

4. Extract and build (via cPanel Terminal):
   ```bash
   cd ~/public_html
   tar -xzf deployment-src.tar.gz
   npm install --legacy-peer-deps
   npm run build
   npm start
   ```

### Option 3: SSH Deployment (Advanced)
```bash
# On your local machine
scp deployment-src.tar.gz snappyfr@cp69-jhb.za-dns.com:~/public_html/
ssh snappyfr@cp69-jhb.za-dns.com

# On the server
cd ~/public_html
tar -xzf deployment-src.tar.gz
npm install --legacy-peer-deps
npm run build
npm start
```

## What's Included
- ✅ All source files (pages/, lib/, components/, etc.)
- ✅ Configuration files (next.config.js, tsconfig.json, etc.)
- ✅ Public assets (43MB compressed)
- ✅ package.json & package-lock.json

## Post-Deployment Checklist
After uploading and building:
- [ ] Verify Node.js is available on the server
- [ ] Check that `npm install` completes successfully
- [ ] Run `npm run build` to generate production files
- [ ] Start with `npm start` or configure as a service
- [ ] Test the application in browser: `https://snappyfresh.net`

## Notes
- The `.next` build directory is NOT included (will be generated during `npm run build`)
- node_modules NOT included (will be installed during deployment)
- This reduces upload size from 135MB → 43MB
- First deploy may take 5-10 minutes while dependencies install and build

## Environment Variables
If you need `.env.local`, create it in `public_html/` with your settings:
```
# Example
NEXT_PUBLIC_API_URL=https://your-api.com
```

## Troubleshooting
- **npm: command not found** → Node.js not installed/enabled on your cPanel account
- **Permission denied** → Check file permissions: `chmod -R 755 ~/public_html`
- **Build fails** → Run `npm audit fix` or `npm install --force`

## Need Help?
Refer to Next.js deployment docs: https://nextjs.org/docs/deployment
