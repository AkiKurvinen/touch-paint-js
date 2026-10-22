# touch-paint-js
- Paint with touch or mouse
- Change brush color and size
- Eraser tool within brush
- Download or preview drawing
- Transparent background PNG
- Automatic cropping

## How to use
- Draw something on canvas
- Press Done to crop image and add it as form input file
- Press Continue to send form and preview image


## Dev
```
php -S localhost:8000 -t . 
http://localhost:8000/api/
```

## Backend - API
Start the server (GD extension required): `php -S localhost:8000 -t .`

Upload an image (PNG, max 500 kB; lobby a-z 0-9, username a-z 0-9 _ -):
```
curl -F lobby=aaa -F username=bbb -F "fileToUpload=@myimage.png;type=image/png" http://localhost:8000/backend/upload.php
```
Response: `{"ok":true,"lobby":"aaa","username":"bbb","url":"api.php?lobby=aaa&img=bbb"}`

Get a single image:
```
curl -o bbb.png "http://localhost:8000/backend/api.php?lobby=aaa&img=bbb"
```

Get all images of a lobby in one request (JSON, images as base64 data URIs):
```
curl "http://localhost:8000/backend/lobby.php?lobby=aaa"
```
Response: `{"ok":true,"lobby":"aaa","users":[{"username":"bbb","updated":1700000000,"image":"data:image/png;base64,..."}]}`

Save every image of a lobby as PNG files (PowerShell):
```
(curl.exe -s "http://localhost:8000/backend/lobby.php?lobby=aaa" | ConvertFrom-Json).users | ForEach-Object { [IO.File]::WriteAllBytes("$($_.username).png", [Convert]::FromBase64String($_.image.Split(',')[1])) }
```
Same with jq (bash):
```
curl -s "http://localhost:8000/backend/lobby.php?lobby=aaa" | jq -r '.users[] | "\(.username) \(.image|split(",")[1])"' | while read u b; do echo "$b" | base64 -d > "$u.png"; done
```

Errors are JSON with `"ok":false` and an `"error"` message, e.g. an invalid lobby returns HTTP 400.
