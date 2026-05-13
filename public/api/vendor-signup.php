<?php
/**
 * Vendor/Supplier Signup - PHPMailer
 * Sends application to operations + confirmation to applicant
 */

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

// CORS - restrict to your domain in production
$allowedOrigins = ['https://snappyfresh.net', 'https://www.snappyfresh.net', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// --- SMTP Config (Mailtrap Live — domain verified: snappyfresh.net) ---
$smtpHost  = getenv('SMTP_HOST')  ?: 'live.smtp.mailtrap.io';
$smtpPort  = (int)(getenv('SMTP_PORT') ?: 587);
$smtpUser  = getenv('SMTP_USER')  ?: 'api';
$smtpPass  = getenv('SMTP_PASS')  ?: '7f50b9ede63fb745356535186049b825';
$fromEmail = getenv('SMTP_FROM')  ?: 'vendors@snappyfresh.net';
$toOps     = 'operations@snappyfresh.net';

// --- Collect & validate fields ---
$companyName   = trim($_POST['companyName'] ?? '');
$tradingName   = trim($_POST['tradingName'] ?? '');
$contactPerson = trim($_POST['contactPerson'] ?? '');
$contactEmail  = trim($_POST['contactEmail'] ?? '');
$contactPhone  = trim($_POST['contactPhone'] ?? '');
$street        = trim($_POST['street'] ?? '');
$city          = trim($_POST['city'] ?? '');
$suburb        = trim($_POST['suburb'] ?? '');
$countryCode   = trim($_POST['countryCode'] ?? '');
$productCats   = trim($_POST['productCategories'] ?? '');
$message       = trim($_POST['message'] ?? '');

if (!$companyName || !$contactPerson || !$contactEmail || !$contactPhone) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

if (!filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
    exit;
}

// --- Build HTML email to operations ---
$address = implode(', ', array_filter([$street, $suburb, $city, $countryCode]));
$opsHtml = <<<HTML
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0d6e3f, #3bb77e); padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h2 style="color: #fff; margin: 0; font-size: 1.3rem;">New Vendor Application</h2>
  </div>
  <div style="background: #fff; padding: 28px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Company</td><td style="padding: 8px 0; font-weight: 600;">{$companyName}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Trading Name</td><td style="padding: 8px 0;">{$tradingName}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Contact Person</td><td style="padding: 8px 0;">{$contactPerson}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:{$contactEmail}">{$contactEmail}</a></td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0;">{$contactPhone}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Address</td><td style="padding: 8px 0;">{$address}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Product Categories</td><td style="padding: 8px 0;">{$productCats}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
    <p style="color: #374151; font-size: 14px; white-space: pre-wrap;">{$message}</p>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Submitted via Snappy Fresh website</p>
  </div>
</div>
HTML;

$confirmHtml = <<<HTML
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0d6e3f, #3bb77e); padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h2 style="color: #fff; margin: 0; font-size: 1.3rem;">Application Received!</h2>
  </div>
  <div style="background: #fff; padding: 28px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 15px; color: #374151;">Dear {$contactPerson},</p>
    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
      Thank you for applying to sell on <strong>Snappy Fresh</strong>!
    </p>
    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
      We received your application for <strong>&ldquo;{$companyName}&rdquo;</strong> and will review it within <strong>2&ndash;3 business days</strong>.
    </p>
    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
      Questions? Reply to this email or reach us at
      <a href="mailto:operations@snappyfresh.net" style="color: #3bb77e;">operations@snappyfresh.net</a>.
    </p>
    <p style="font-size: 14px; color: #374151; margin-top: 24px;">
      Best regards,<br>
      <strong>Snappy Fresh Team</strong>
    </p>
  </div>
</div>
HTML;

// --- Helper: create configured PHPMailer instance ---
function createMailer(string $host, int $port, string $user, string $pass, string $from): PHPMailer {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $user;
    $mail->Password   = $pass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $port;
    $mail->setFrom($from, 'Snappy Fresh');
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    return $mail;
}

// --- Validate & collect file attachments ---
$maxFileSize = 10 * 1024 * 1024; // 10MB
$allowedTypes = [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'image/jpeg', 'image/png', 'application/zip',
];
$attachments = [];
if (!empty($_FILES['attachments'])) {
    $fileCount = is_array($_FILES['attachments']['name']) ? count($_FILES['attachments']['name']) : 1;
    for ($i = 0; $i < $fileCount; $i++) {
        $name = is_array($_FILES['attachments']['name']) ? $_FILES['attachments']['name'][$i] : $_FILES['attachments']['name'];
        $tmp  = is_array($_FILES['attachments']['tmp_name']) ? $_FILES['attachments']['tmp_name'][$i] : $_FILES['attachments']['tmp_name'];
        $size = is_array($_FILES['attachments']['size']) ? $_FILES['attachments']['size'][$i] : $_FILES['attachments']['size'];
        $type = is_array($_FILES['attachments']['type']) ? $_FILES['attachments']['type'][$i] : $_FILES['attachments']['type'];
        $err  = is_array($_FILES['attachments']['error']) ? $_FILES['attachments']['error'][$i] : $_FILES['attachments']['error'];

        if ($err !== UPLOAD_ERR_OK || !$tmp) continue;
        if ($size > $maxFileSize) continue;
        if (!in_array($type, $allowedTypes, true)) continue;

        $attachments[] = ['path' => $tmp, 'name' => basename($name)];
    }
}

// --- Send email to operations (with attachments) ---
$errors = [];
try {
    $mail = createMailer($smtpHost, $smtpPort, $smtpUser, $smtpPass, $fromEmail);
    $mail->addAddress($toOps, 'Snappy Fresh Operations');
    $mail->addReplyTo($contactEmail, $contactPerson);
    $mail->Subject = "New Vendor Application: {$companyName}";
    $mail->Body    = $opsHtml;
    $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $opsHtml));

    foreach ($attachments as $att) {
        $mail->addAttachment($att['path'], $att['name']);
    }

    $mail->send();
} catch (Exception $e) {
    $errors[] = "Operations email failed: " . $mail->ErrorInfo;
}

// --- Send confirmation to applicant ---
try {
    $mail2 = createMailer($smtpHost, $smtpPort, $smtpUser, $smtpPass, $fromEmail);
    $mail2->addAddress($contactEmail, $contactPerson);
    $mail2->Subject = 'Snappy Fresh - Application Received';
    $mail2->Body    = $confirmHtml;
    $mail2->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $confirmHtml));
    $mail2->send();
} catch (Exception $e) {
    $errors[] = "Confirmation email failed: " . $mail2->ErrorInfo;
}

// --- Response ---
if (count($errors) < 2) {
    // At least one email sent successfully
    echo json_encode(['success' => true, 'message' => 'Application submitted successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send application. Please try again or email us directly at operations@snappyfresh.net.']);
}
