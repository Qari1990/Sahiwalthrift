# ABCThrift store backend (orders, offers, tracking, emails)

Free, runs in your own Google account. Website orders, offers and newsletter sign-ups land in one Google Sheet, you get an email for every order and offer, and customers who give an email get an order confirmation and status updates.

## One-time setup (about 5 minutes)

1. Open https://sheets.new and name the sheet "ABCThrift Store".
2. Extensions > Apps Script. Delete what is there, paste all of `Code.gs`, Save.
3. Choose the `setup` function at the top and press Run. Allow the permissions it asks for (Sheets, Gmail send, triggers).
4. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy.
5. Copy the Web app URL (ends in /exec) and send it to Claude, or put it in `site.json` as "apiUrl".

If you change `Code.gs` later: Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy. The URL stays the same.

## Orders

- Every website order is a row in "Orders" with an order number like AT-261102-AB12. You get an email with a one-tap WhatsApp link to confirm with the customer.
- Change "status" to confirmed, dispatched, delivered or cancelled. Put the courier tracking number in "tracking". The customer gets an email on each change (if they gave an email), and the Track order page shows the new status.
- Cancelling an order frees its items for other buyers.

## Offers

- Counter an offer: type your price in the "counter" column of that row. The buyer sees it on the item page for 24 hours, and the "note" column gets a ready WhatsApp link to tell them.
- Accept an offer now: set its "status" to "won".
- Item sold elsewhere: set its row in "Items" to state "sold" (the site also stops offers once the item is Sold in the tool).
- Change your hidden lowest price for the 48-hour winner: "reserve" column in "Items".

## Newsletter

Sign-ups from the footer form go to "Subscribers".
