<?php
// GET lobby.php?lobby=name returns all users' images of the lobby in a single JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Cache-Control: no-cache, must-revalidate");

$lobby = strtolower($_GET['lobby'] ?? '');
if ($lobby === '' || !ctype_alnum($lobby)) {
    http_response_code(400);
    die(json_encode(['ok' => false, 'error' => 'Invalid lobby']));
}

$users = [];
foreach (glob("img/custom/$lobby/*.png") as $file) {
    $users[] = [
        'username' => basename($file, '.png'),
        'updated' => filemtime($file),
        'image' => 'data:image/png;base64,' . base64_encode(file_get_contents($file)),
    ];
}

echo json_encode(['ok' => true, 'lobby' => $lobby, 'users' => $users]);
