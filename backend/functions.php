<?php
function resize($newWidth, $originalFile, $targetFile) {
    $image = imagecreatefrompng($originalFile);
    $new_image = imagecreatetruecolor($newWidth, $newWidth);
    imagealphablending($new_image, false);
    imagesavealpha($new_image, true);
    imagecopyresampled($new_image, $image, 0, 0, 0, 0, $newWidth, $newWidth, imagesx($image), imagesy($image));
    imagepng($new_image, $targetFile);
    imagedestroy($image);
    imagedestroy($new_image);
}

function trim_image($originalFile, $targetFile) {
    $im = imagecreatefrompng($originalFile);
    $cropped = imagecropauto($im, IMG_CROP_SIDES);
    if ($cropped !== false) {
        imagedestroy($im);
        $im = $cropped;
    }
    imagealphablending($im, false);
    imagesavealpha($im, true);
    imagepng($im, $targetFile);
    imagedestroy($im);
}

// Trims transparent edges, scales to a square and removes the original file.
function crop_and_resize($originalFile, $targetFile) {
    $newWidth = 150;
    trim_image($originalFile, $targetFile);
    resize($newWidth, $targetFile, $targetFile);
    unlink($originalFile);
}

function json_response($status, $data) {
    http_response_code($status);
    header("Content-Type: application/json");
    echo json_encode($data);
    die();
}
