<?php
// Vishnu Developers & Infrastructure — contact form handler.
// Emails enquiries from the Contact page to the address in $TO below.

$TO      = 'vishnudeveloper2027@gmail.com';
// Must be an address on this domain, otherwise Gmail rejects or spam-files the mail.
$FROM    = 'noreply@vishnudevelopersandinfrastructure.com';
$SUBJECT = 'New Vishnu City enquiry';

// ---------------------------------------------------------------- helpers
// Strips CR/LF so a submitted value can never inject extra mail headers.
function header_safe($value) {
    return trim(str_replace(array("\r", "\n", "%0a", "%0d"), ' ', $value));
}
function field($key, $max = 2000) {
    if (!isset($_POST[$key])) return '';
    $value = trim((string) $_POST[$key]);
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}
function wants_json() {
    $accept = isset($_SERVER['HTTP_ACCEPT']) ? $_SERVER['HTTP_ACCEPT'] : '';
    $xhr    = isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? $_SERVER['HTTP_X_REQUESTED_WITH'] : '';
    return strpos($accept, 'application/json') !== false || $xhr === 'fetch';
}
function respond($ok, $message, $code) {
    http_response_code($code);
    if (wants_json()) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array('ok' => $ok, 'message' => $message));
    } else {
        header('Location: contact?sent=' . ($ok ? '1' : '0'));
    }
    exit;
}

// ---------------------------------------------------------------- guards
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

// Honeypot: real people never see or fill this field.
if (field('website') !== '') {
    respond(true, 'Thank you. We will contact you shortly.', 200);
}

// ---------------------------------------------------------------- input
$name     = header_safe(field('name', 120));
$phone    = header_safe(field('phone', 40));
$email    = header_safe(field('email', 160));
$interest = header_safe(field('interest', 80));
$date     = header_safe(field('date', 40));
$time     = header_safe(field('time', 40));
$message  = field('message', 4000);

if ($name === '' || $phone === '') {
    respond(false, 'Please enter your name and phone number.', 422);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address, or leave it blank.', 422);
}

// ---------------------------------------------------------------- compose
$lines = array(
    'New enquiry from the Vishnu City website',
    '',
    'Name:      ' . $name,
    'Phone:     ' . $phone,
    'Email:     ' . ($email !== '' ? $email : '—'),
    'Interest:  ' . ($interest !== '' ? $interest : '—'),
    'Visit on:  ' . ($date !== '' ? $date : '—') . ($time !== '' ? ' at ' . $time : ''),
    '',
    'Message:',
    ($message !== '' ? $message : '—'),
    '',
    '----',
    'Submitted: ' . date('d M Y, H:i') . ' (server time)',
    'IP:        ' . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown'),
);
$body = implode("\n", $lines);

$headers   = array();
$headers[] = 'From: Vishnu City Website <' . $FROM . '>';
$replyName = str_replace(array('<', '>', '"'), '', $name);
$headers[] = 'Reply-To: ' . ($email !== '' ? $replyName . ' <' . $email . '>' : $FROM);
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$subject = $SUBJECT . ' - ' . $name;
$joined  = implode("\r\n", $headers);

// Some shared hosts block the -f envelope-sender parameter, so fall back without it.
$sent = @mail($TO, $subject, $body, $joined, '-f' . $FROM);
if (!$sent) {
    $sent = @mail($TO, $subject, $body, $joined);
}

if ($sent) {
    respond(true, 'Thank you. We have received your details and will contact you shortly.', 200);
}

respond(false, 'Sorry, we could not send your enquiry just now. Please call 8393010100.', 500);
