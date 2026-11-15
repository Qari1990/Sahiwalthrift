# ABCThrift store backend (orders, offers, tracking, emails)

Free, runs in your own Google account. Website orders, offers and newsletter sign-ups land in one Google Sheet, you get an email for every order and offer, and customers who give an email get an order confirmation and status updates.

## One-time setup (about 5 minutes)

1. Open https://sheets.new and name the sheet "ABCThrift Store".
2. Extensions > Apps Script. Delete what is there, paste all of `Code.gs`, Save.
3. Choose the `setup` function at the top and press Run. Allow the permissions it asks for (Sheets, Gmail send, triggers).
4. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy.
5. Copy the Web app URL (ends in /exec) and send it to Claude, or put it in `site.json` as "apiUrl".

If you change `Code.gs` later: Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy. The URL stays the same.

## Check that the website can reach the sheet

Open the web app URL with `?a=ping` at the end in any browser (incognito is best), for example
`https://script.google.com/macros/s/.../exec?a=ping`. You should see something like
`{"ok":true,"store":"ABCThrift","version":"2026-11-11","websiteItems":52,...}`.

- A Google sign-in page or "Sorry, unable to open the file" means the deployment is not set to "Who has access: Anyone". Edit the deployment and change it.
- `"missingTabs":[...]` means `setup` has not been run. Run it once.
- `"websiteItems":0` means the script could not read `https://abcthrift.store/items.json`. Check the site is up.
- No `"version"` in the answer means the old code is still deployed. Deploy a new version (above).

If the web app is down, the website still works: orders and offers open in WhatsApp instead.

## Orders

- Every website order is a row in "Orders" with an order number like AT-261102-AB12. You get an email with a one-tap WhatsApp link to confirm with the customer.
- Change "status" to confirmed, dispatched, delivered or cancelled. Put the courier tracking number in "tracking". The customer gets an email on each change (if they gave an email), and the Track order page shows the new status.
- Cancelling an order frees its items for other buyers.

## Offers

- Offers on an item are open for 24 hours from the first offer. Then the highest offer wins (if it reaches your "reserve").
- The winner has 24 hours to complete the deal. If the item is not marked Sold or Reserved in the tool (and no website order came in for it) by then, the offer expires and the item goes back on sale at its normal price, open for new offers. You get an email when that happens.
- Counter an offer: type your price in the "counter" column of that row. The buyer sees it on the item page for 24 hours, and the "note" column gets a ready WhatsApp link to tell them.
- Accept an offer now: set its "status" to "won".
- Item sold elsewhere: set its row in "Items" to state "sold" (the site also stops offers once the item is Sold in the tool).
- Change your hidden lowest price for the winning offer: "reserve" column in "Items".

## Newsletter

Sign-ups from the footer form go to "Subscribers".

## Automations (free, added 2026-11-15)

After pasting the new `Code.gs`, run `setup` once more (it keeps your data, re-creates the triggers and emails you an owner key), then Deploy > Manage deployments > edit > New version.

- **One-tap Sold**: `<exec URL>?a=mark&sku=ST-PUF-0001&to=sold&k=<owner key>` marks the item sold in "Items"; the website shows it as Sold out within a few minutes, no rebuild. `to=open` puts it back on sale. Several SKUs: `sku=ST-PUF-0001,ST-HOO-0002`. In Landa Lister, put the owner key in Presets once; "Sold ho gaya", Save with status Sold and the bulk status button then open this link for you.
- **Orders hold items**: an item in a website order that is not cancelled shows "Reserved" on the site (dispatched / delivered orders show Sold out) and cannot be offered on or ordered again.
- **Live product feed**: `<exec URL>?a=feed` is the site's `feed.xml` with sold and reserved items set to `out_of_stock`. Use it as the scheduled data feed in Meta Commerce Manager (Facebook / Instagram Shop) and Google Merchant Center.
- **Customer WhatsApp messages**: when you change an order's status (Confirmed, Dispatched, Delivered, Cancelled) or add tracking, the "customerWa" column gets a one-tap WhatsApp link with the message ready. Tap it, then Send.
- **Weekly report**: every Monday 9 AM (Pakistan time) an email with orders, sales, pending orders, stock left and the items to promote.
- **Pending reminder**: 9 PM every day, only when an order has waited 6+ hours for confirmation, with one-tap WhatsApp links.

Google's free limits (about 100 emails and 20,000 URL fetches a day) are far above what the store uses.
