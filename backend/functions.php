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

const LOBBY_MAX_AGE_SECONDS = 60;

// Failures (e.g. permission denied) are skipped silently so cleanup never breaks an upload.
function delete_dir($dir) {
    $items = @scandir($dir);
    if ($items === false) {
        return;
    }
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        $path = "$dir/$item";
        if (is_dir($path) && !is_link($path)) {
            delete_dir($path);
        } else {
            @unlink($path);
        }
    }
    @rmdir($dir);
}

// Deletes lobby folders (and their content) under $baseDir whose latest modification is older than the max age.
function clean_old_lobbies($baseDir, $maxAge = LOBBY_MAX_AGE_SECONDS) {
    if (!is_dir($baseDir)) {
        return;
    }
    $items = @scandir($baseDir);
    if ($items === false) {
        return;
    }
    $now = time();
    foreach ($items as $item) {
        $path = "$baseDir/$item";
        if ($item === '.' || $item === '..' || !is_dir($path) || is_link($path)) {
            continue;
        }
        $latest = @filemtime($path);
        if ($latest === false) {
            continue;
        }
        foreach (glob("$path/*") ?: [] as $file) {
            $latest = max($latest, @filemtime($file) ?: 0);
        }
        if ($now - $latest > $maxAge) {
            delete_dir($path);
        }
    }
}

function json_response($status, $data) {
    http_response_code($status);
    header("Content-Type: application/json");
    echo json_encode($data);
    die();
}
