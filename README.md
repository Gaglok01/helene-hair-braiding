# Rosa Premium Website

Premium frontend for **Rosa's All About Hair**, with services, prices and service images loaded from Square.

## What Rosa manages in Square

- Service names
- Descriptions
- Prices
- Durations
- Service images
- Availability and bookings

The website calls `/api/catalog`, which securely reads the Square Catalog API. The production access token is never placed in the browser.

## Local preview

For the static design:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

The Square API function requires Cloudflare Pages Functions or Wrangler. Without the secret, fallback sample services appear.

## Deploy to Cloudflare Pages

1. Create a GitHub repository and upload this project.
2. In Cloudflare Dashboard, open **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository.
4. Framework preset: **None**
5. Build command: leave empty
6. Build output directory: `/`
7. Deploy.
8. In the Pages project, open **Settings → Variables and Secrets**.
9. Add an encrypted secret:
   - Name: `SQUARE_ACCESS_TOKEN`
   - Value: Rosa's **Production Access Token**
10. Redeploy.

Never commit the production token to GitHub or place it inside HTML/JavaScript.

## Square setup

In Square Developer Console:

1. Open **Rosa Website → Credentials**
2. Switch from **Sandbox** to **Production**
3. Reveal and copy the Production Access Token
4. Paste it only into Cloudflare's encrypted secret field

The website uses the Catalog API endpoint to search ITEM objects and related IMAGE objects.

## Main files

- `index.html` — full website
- `assets/css/style.css` — visual design
- `assets/js/app.js` — dynamic rendering and interactions
- `functions/api/catalog.js` — secure Square proxy
- `assets/images/rosa-logo.png` — official logo

## Booking link

Current Square booking URL:

`https://book.squareup.com/appointments/6wbu997dkzpv60/location/LYX600Y176JVJ/services`
