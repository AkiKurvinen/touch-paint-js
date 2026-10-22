<?php
// GET api.php?img=username[&lobby=name] returns the lobby's custom image or the default one
header("Access-Control-Allow-Origin: *");

$img = $_GET['img'] ?? '';
$lobby = strtolower($_GET['lobby'] ?? '');

// GET api.php?lobby=name&start=true creates the lobby folder and returns an example starting url
if ($img === '' && $lobby !== '' && ($_GET['start'] ?? '') === 'true') {
    header("Content-Type: application/json");
    if (!ctype_alnum($lobby)) {
        http_response_code(400);
        die(json_encode(['ok' => false, 'error' => 'Invalid lobby']));
    }
    $dir = "img/custom/$lobby";
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        http_response_code(500);
        die(json_encode(['ok' => false, 'error' => 'Could not create lobby']));
    }
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $root = preg_replace('#/backend/[^/]*$#', '', $_SERVER['SCRIPT_NAME']);
    $url = "$scheme://{$_SERVER['HTTP_HOST']}$root/backend/api.php?" . http_build_query(['lobby' => $lobby]);
    die(json_encode(['ok' => true, 'lobby' => $lobby, 'url' => $url]));
}
if ($img === '') {
    if ($lobby !== '') {
        echo $lobby;
    }
    die();
}

// only plain names are allowed, which prevents path traversal
if (!preg_match('/^[A-Za-z0-9_-]{1,32}$/', $img) || ($lobby !== '' && !ctype_alnum($lobby))) {
    http_response_code(400);
    die();
}

$img = strtolower($img);
$custom_file = $lobby !== '' ? "img/custom/$lobby/$img.png" : "img/custom/$img.png";
$default_file = "img/default/$img.png";

function send_file($file_out) {
    $image_info = getimagesize($file_out);
    header('Content-Type: ' . $image_info['mime']);
    header('Content-Length: ' . filesize($file_out));
    readfile($file_out);
}

if (file_exists($custom_file)) {
    send_file($custom_file);
} else if (file_exists($default_file)) {
    send_file($default_file);
} else {
    http_response_code(404);
}
