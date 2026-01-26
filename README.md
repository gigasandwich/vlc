Data reset:

```bash
docker compose down -v
docker compose up --build db
```

## Setup firebase
- Download the Service Account Key from the Firebase Console
    - Project Settings > Service Accounts
    - Generate New Private Key and download the JSON file
    - Put the json file in `back/src/main/resources/` and rename it to `serve-vlc-firebase-adminsdk-fbsvc-d8aabff390.json`

Map import:
```bash
docker compose up map_import
```

When its done:
```bash
docker compose stop map_import
```