<?php
/**
 * Contact Form Email Handler — PHPMailer
 * Sends contact form submissions via Mailtrap SMTP
 */

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

// CORS
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
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

// --- SMTP Config (Mailtrap Live) ---
$smtpHost  = getenv('SMTP_HOST')  ?: 'live.smtp.mailtrap.io';
$smtpPort  = (int)(getenv('SMTP_PORT') ?: 587);
$smtpUser  = getenv('SMTP_USER')  ?: 'api';
$smtpPass  = getenv('SMTP_PASS')  ?: '7f50b9ede63fb745356535186049b825';
$fromEmail = getenv('SMTP_FROM')  ?: 'support@snappyfresh.net';
$toOps     = 'operations@snappyfresh.net';

// --- Parse input (JSON body) ---
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    // Try form-encoded fallback
    $data = $_POST;
}

$name    = trim($data['name'] ?? '');
$email   = trim($data['email'] ?? '');
$phone   = trim($data['phone'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');

if (!$name || !$email || !$subject || !$message) {
    http_response_code(400);
    echo json_encode(['message' => 'Please fill in all required fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid email address.']);
    exit;
}

$subjectLabels = [
    'general'  => 'General Inquiry',
    'order'    => 'Order Support',
    'delivery' => 'Delivery Issue',
    'vendor'   => 'Become a Vendor',
    'feedback' => 'Feedback',
    'other'    => 'Other',
];
$subjectLabel = $subjectLabels[$subject] ?? $subject;

$htmlBody = <<<HTML
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0d6e3f, #3bb77e); padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h2 style="color: #fff; margin: 0; font-size: 1.3rem;">New Contact Form Message</h2>
  </div>
  <div style="background: #fff; padding: 28px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 8px 0; color: #6b7280; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 600;">{$name}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:{$email}">{$email}</a></td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0;">{$phone}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Subject</td><td style="padding: 8px 0;">{$subjectLabel}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
    <p style="color: #374151; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">{$message}</p>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Submitted via Snappy Fresh website contact form</p>
  </div>
</div>
HTML;

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $smtpPort;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($fromEmail, 'Snappy Fresh');
    $mail->addAddress($toOps, 'Snappy Fresh Operations');
    $mail->addAddress($email, $name);
    $mail->addReplyTo($email, $name);
    $mail->isHTML(true);
    $mail->Subject = "Contact Form: {$subjectLabel} - {$name}";
    $mail->Body    = $htmlBody;
    $mail->AltBody = "Contact Form Submission\n\nName: {$name}\nEmail: {$email}\nPhone: {$phone}\nSubject: {$subjectLabel}\n\nMessage:\n{$message}";

    $mail->send();

    echo json_encode(['message' => 'Message sent successfully.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to send message. Please try again or contact us directly.']);
}
