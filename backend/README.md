# Backend

PHP API for creature images (galactic-doodle-invaders). Contains no frontend code.

## Endpoints

- `GET api.php?img=username[&lobby=name]` returns the user's image from the lobby, falling back to `img/default/`.
- `POST upload.php` (multipart/form-data) with `lobby` (a-z, 0-9), `username` (a-z, 0-9, `_`, `-`, max 32) and `fileToUpload` (PNG, max 500 kB).
  The image is trimmed, scaled to 150x150 and saved as `img/custom/<lobby>/<username>.png`. Responds with JSON: `{"ok": true, "lobby", "username", "url"}` or `{"ok": false, "error"}`.

Requires PHP with the GD extension. Both endpoints send `Access-Control-Allow-Origin: *`.
