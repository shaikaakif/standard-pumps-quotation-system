# Final Production Launch Checklist

Before sharing the application with end-users or deploying it for daily operational use in the shop, verify the following:

## 1. Security & Infrastructure
- [ ] `VITE_API_BASE_URL` in Vercel points to the secure `https://` Render backend URL.
- [ ] `FRONTEND_URL` in Render exactly matches the Vercel URL (no trailing slash).
- [ ] `ALLOWED_HOSTS` in Render exactly matches the Render URL (preventing Host header spoofing).
- [ ] `ENVIRONMENT` is set to `production` in Render.
- [ ] Render's persistent disk is successfully mounted at `/data`.

## 2. PWA & Mobile UX
- [ ] Open the app on an Android device using Google Chrome.
- [ ] Verify the "Add to Home Screen" (Install) prompt appears.
- [ ] Install the app and launch it from the home screen to ensure the Splash Screen displays correctly.
- [ ] Put the phone in Airplane mode and verify the app still opens and correctly displays the offline warning chip ("Offline").

## 3. PDF & Share Verification
- [ ] Generate a test quotation on a mobile device.
- [ ] Click "Share via WhatsApp" and verify the Web Share API triggers natively.
- [ ] Click "Generate PDF" and ensure the download triggers successfully.
- [ ] Open the downloaded PDF and verify that fonts (Inter/Poppins), Tailwind styles, and layout alignments are identical to the web preview.

## 4. Branding Validation
- [ ] Navigate to the `/settings` route in the live production app.
- [ ] Upload the `company-logo.png` and `quotation-logo.png`.
- [ ] Update the Shop Name, Phone, and Address.
- [ ] Generate a new quotation and verify the watermark, header, and footer reflect the new live settings.

## 5. Persistence Safety Check
- [ ] Generate a quotation to save it to History.
- [ ] Manually trigger a "Manual Deploy" on Render to restart the server.
- [ ] Wait for the server to come back online.
- [ ] Check the History tab in the app. If the quotation is still there, your SQLite persistent volume is configured correctly.
