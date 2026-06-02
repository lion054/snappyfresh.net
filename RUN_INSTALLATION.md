# How to Complete Installation via cPanel

## Method 1: cPanel Terminal (Easiest)

1. **Log into cPanel**: https://cp69-jhb.za-dns.com:2083
   - Username: `snappyfr`
   - Password: (your cPanel password)

2. **Open Terminal**:
   - Go to **Advanced** → **Terminal**
   - Or search for "Terminal" in cPanel

3. **Run These Commands** (copy & paste):

```bash
cd ~/public_html
tar -xzf deployment-src.tar.gz
rm deployment-src.tar.gz
npm install --legacy-peer-deps
npm run build
npm start
```

4. **Wait for completion** - you should see:
   ```
   > snappy-fresh@7.0.0 start
   ▲ Next.js 15.5.14
   - Local: http://localhost:3000
   ```

Done! Your app is now running.

---

## Method 2: File Manager (Manual)

1. Log into cPanel
2. **File Manager** → navigate to `public_html`
3. Right-click `deployment-src.tar.gz` → **Extract**
4. Delete the `.tar.gz` file
5. Open **Terminal** and run:
   ```bash
   cd ~/public_html
   npm install --legacy-peer-deps
   npm run build
   npm start
   ```

---

## Method 3: FTP + Remote Commands

If you have SSH access on a different port, you can SSH and run the commands above.

---

## Troubleshooting

**"npm: command not found"**
- Node.js not enabled in cPanel
- Contact your hosting provider

**Build fails with errors**
- Run: `npm install --force`
- Then: `npm run build`

**Port 3000 already in use**
- Run on different port: `PORT=8080 npm start`

---

## After Starting

Your app will be at:
- http://localhost:3000 (on the server)
- https://snappyfresh.net (publicly)

Keep the terminal running or use PM2 to daemonize:
```bash
npm install -g pm2
pm2 start npm --name "snappyfresh" -- start
pm2 startup
pm2 save
```
