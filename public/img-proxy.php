<?php
/**
 * Image Proxy — Bypass CORS blocking by fetching images server-side
 * Usage: /img-proxy.php?path=Attachments/OnaErp/ItemImages/...
 */

// Security: validate path (prevent directory traversal)
if (!isset($_GET['path']) || empty($_GET['path'])) {
    http_response_code(400);
    exit('Bad request');
}

$path = $_GET['path'];

// Prevent directory traversal attacks
if (strpos($path, '..') !== false || strpos($path, '//') !== false) {
    http_response_code(403);
    exit('Forbidden');
}

// Build source URL
$source_url = 'https://yomilk.erpona.com:3330/' . ltrim($path, '/');

// Fetch image with timeout
$context = stream_context_create([
    'http' => [
        'timeout' => 10,
        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false
    ]
]);

$image_data = @file_get_contents($source_url, false, $context);

if ($image_data === false) {
    http_response_code(404);
    exit('Image not found');
}

// Detect content type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_buffer($finfo, $image_data);
finfo_close($finfo);

if (!$mime_type || strpos($mime_type, 'image') === false) {
    $mime_type = 'image/jpeg';
}

// Set response headers
header('Content-Type: ' . $mime_type);
header('Cache-Control: public, max-age=2592000'); // 30 days
header('Expires: ' . gmdate('D, d M Y H:i:s T', time() + 2592000));
header('Access-Control-Allow-Origin: *');
header('X-Content-Type-Options: nosniff');

// Output image
echo $image_data;
exit;
?>
