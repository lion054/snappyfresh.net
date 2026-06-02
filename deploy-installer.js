const fs = require('fs');
const path = require('path');
const Client = require('basic-ftp').Client;

async function uploadInstaller() {
  const client = new Client();

  try {
    console.log('🔌 Connecting to FTP server...');
    await client.access({
      host: 'cp69-jhb.za-dns.com',
      user: 'snappyfr',
      password: '-O85zk5SR5[hfX',
      secure: false,
    });

    console.log('✓ Connected');
    console.log('📤 Uploading installer.php...');

    const installerStream = fs.createReadStream('/tmp/installer.php');
    await client.uploadFrom(installerStream, '/public_html/installer.php');

    console.log('✓ Upload complete');
    console.log('\n✅ IMPORTANT - Access the installer:');
    console.log('   https://snappyfresh.net/installer.php');
    console.log('\n⏳ The installer will:');
    console.log('   1. Extract the deployment package');
    console.log('   2. Install npm dependencies');
    console.log('   3. Build your Next.js app');
    console.log('   (This may take 5-10 minutes)');
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

uploadInstaller();
