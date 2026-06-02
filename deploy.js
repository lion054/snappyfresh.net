#!/usr/bin/env node

/**
 * Snappy Fresh - Automated cPanel Deployment Script
 * Run: node deploy.js --help for usage
 */

const fs = require('fs');
const path = require('path');
const Client = require('basic-ftp').Client;

const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
Snappy Fresh - cPanel FTP Deployment

Usage: node deploy.js [options]

Options:
  --host HOST        FTP host (default: cp69-jhb.za-dns.com)
  --user USER        FTP username (default: snappyfr)
  --pass PASS        FTP password (required)
  --path PATH        Remote path (default: /public_html)
  --file FILE        Local tar file (default: deployment-src.tar.gz)
  --help, -h         Show this help message

Environment Variables (alternative to --pass):
  FTP_PASS           FTP password

Example:
  node deploy.js --pass "yourpassword"
  FTP_PASS="..." node deploy.js
`);
  process.exit(0);
}

// Parse arguments
const getArg = (name, defaultVal = null) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : defaultVal;
};

const host = getArg('--host', 'cp69-jhb.za-dns.com');
const user = getArg('--user', 'snappyfr');
const pass = getArg('--pass', process.env.FTP_PASS);
const remotePath = getArg('--path', '/public_html');
const localFile = getArg('--file', 'deployment-src.tar.gz');

if (!pass) {
  console.error('❌ Error: FTP password required');
  console.error('Provide with: node deploy.js --pass "password"');
  console.error('Or set FTP_PASS environment variable');
  process.exit(1);
}

if (!fs.existsSync(localFile)) {
  console.error(`❌ Error: File not found: ${localFile}`);
  process.exit(1);
}

const fileSize = fs.statSync(localFile).size;
const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

console.log(`
📦 Snappy Fresh - cPanel Deployment
───────────────────────────────────
Host:       ${host}
User:       ${user}
Remote:     ${remotePath}
File:       ${localFile}
Size:       ${fileSizeMB} MB
`);

async function deploy() {
  const client = new Client();

  try {
    console.log('🔌 Connecting to FTP server...');
    await client.access({
      host,
      user,
      password: pass,
      secure: false,
    });

    console.log('✓ Connected');
    console.log('📤 Uploading file...');

    const uploadStream = fs.createReadStream(localFile);
    await client.uploadFrom(uploadStream, `${remotePath}/${path.basename(localFile)}`);

    console.log('✓ Upload complete');
    console.log(`
⚠️  Next Steps (via cPanel Terminal):
   cd ~/public_html
   tar -xzf ${path.basename(localFile)}
   rm ${path.basename(localFile)}
   npm install --legacy-peer-deps
   npm run build
   npm start
    `);
  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

deploy();
