# IRONFUEL - Gym Supplements Store

Open `index.html` in a browser (or run `npx serve .` / VS Code Live Server). No build step.

## Structure
- `index.html` - page shell (home sections, product-page container, cart drawer, modal, chatbot)
- `css/style.css` - all styling (dark theme, lime/cyan accents)
- `js/data.js` - products, sizes, flavours, product-page content, FOOD DATABASE
- `js/app.js` - router (#/product/ID), cards, cart + order summary, checkout, one-time gift, scroll animations, Lenis
- `js/product.js` - product detail page (gallery, size/flavour, tabs, sticky bar, related products)
- `js/diet.js` - calorie calculator, BMI, diet plan with live food search, PDF export (jsPDF)
- `js/chat.js` - rule-based chatbot (edit the KB array to add answers)
- `assets/` - product images

## Notes
- Libraries load from CDN: Lenis (smooth scroll), jsPDF (PDF). Internet needed for those.
- Checkout is a demo. Connect Razorpay/Stripe + a backend to take real payments and to enforce the one-time gift per order.
- To add a product: add an object to `P` in `js/data.js` (add `im:"a"` style image keys in `IMG` for photos).
- To add foods: add a line to the `FOODS` template in `js/data.js` (name|serving|kcal|protein|carbs|fat|veg 1/0).
