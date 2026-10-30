# Offers (bargaining) backend

Free, runs in your own Google account. Offers land in a Google Sheet and you get an email for each one.

1. Open https://sheets.new and name the sheet "Sahiwal Thrift Offers".
2. Extensions > Apps Script. Delete what is there, paste all of `Code.gs`, Save.
3. Choose the `setup` function at the top and press Run. Allow the permissions it asks for.
4. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy.
5. Copy the Web app URL (ends in /exec) and send it to Claude, or put it in `site.json` as "offersUrl".

Day to day:
- Counter an offer: type your price in the "counter" column of that row. The buyer sees it on the item page for 24 hours, and the "note" column gets a ready WhatsApp link to tell them.
- Accept an offer now: set its "status" to "won".
- Item sold elsewhere: set its row in "Items" to state "sold" (the site also stops offers once the item is Sold in the tool).
- Change your hidden lowest price for the 48-hour winner: "reserve" column in "Items".
