<?php
// JSON API: POST multipart/form-data with fields lobby, username and fileToUpload (PNG)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Cache-Control: no-cache, must-revalidate");
require 'functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    die();
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['ok' => false, 'error' => 'Method not allowed']);
}

$lobby = strtolower(trim($_POST['lobby'] ?? ''));
$username = strtolower(trim($_POST['username'] ?? ''));
$file = $_FILES['fileToUpload'] ?? null;

if ($lobby === '') {
    json_response(400, ['ok' => false, 'error' => 'Invalid lobby']);
}
if (!ctype_alnum($lobby)) {
    json_response(400, ['ok' => false, 'error' => 'Lobby name has invalid characters. Please use a-z, 0-9']);
}
if (!preg_match('/^[a-z0-9_-]{1,32}$/', $username)) {
    json_response(400, ['ok' => false, 'error' => 'Invalid username. Use a-z, 0-9, _ or - (max 32 characters)']);
}
if ($file === null || $file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
    json_response(400, ['ok' => false, 'error' => 'No file selected']);
}
if ($file['size'] > 500000) {
    json_response(413, ['ok' => false, 'error' => 'File is too large']);
}

$info = getimagesize($file['tmp_name']);
if ($info === false || $info['mime'] !== 'image/png') {
    json_response(415, ['ok' => false, 'error' => 'Only PNG images are allowed']);
}

$target_dir = "img/custom/$lobby/";
if (!file_exists($target_dir) && !mkdir($target_dir, 0777, true)) {
    json_response(500, ['ok' => false, 'error' => 'Could not create lobby']);
}

$temp_file = $target_dir . uniqid('upload_', true) . '.png';
if (!move_uploaded_file($file['tmp_name'], $temp_file)) {
    json_response(500, ['ok' => false, 'error' => 'Could not upload']);
}

$target_file = $target_dir . "$username.png";
crop_and_resize($temp_file, $target_file);

json_response(200, [
    'ok' => true,
    'lobby' => $lobby,
    'username' => $username,
    'url' => "api.php?lobby=$lobby&img=$username",
]);
