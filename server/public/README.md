# eThavanai Book - Landing Page

This directory contains the public landing page for eThavanai Book - Daily Ledger.

## Files

- **index.html** - Main landing page
- **icon.svg** - App icon in SVG format (scalable)
- **icon-preview.html** - Icon preview and download page

## Features

### Landing Page (index.html)
- **Modern Design:** Responsive, mobile-friendly layout
- **Hero Section:** Eye-catching introduction with app name in English and Tamil
- **Features Grid:** 6 key features with icons
- **App Preview:** Mobile phone mockup showing app interface
- **Statistics:** Social proof with user numbers
- **Testimonials:** User reviews
- **Download Section:** App store badges (coming soon)
- **Footer:** Complete navigation and legal links

### App Icon (icon.svg)
- **Design Elements:**
  - Book/Ledger icon (white on blue)
  - Rupee symbol (₹) in gold
  - Ledger lines suggesting daily entries
  - "eT" monogram in bottom right
- **Colors:**
  - Primary: #2196F3 (Blue)
  - Secondary: #1976D2 (Dark Blue)
  - Accent: #FFC107 (Gold)
- **Specifications:**
  - SVG format (scalable to any size)
  - Rounded square shape
  - Professional gradient background

## Access URLs

When server is running:

- **Home:** http://tapi.thesrsconsulting.in/ or http://localhost:3000/
- **Home (alt):** http://tapi.thesrsconsulting.in/home
- **Icon Preview:** http://tapi.thesrsconsulting.in/icon-preview.html

## Icon Usage

### For Mobile App

1. **View the icon:** Visit `/icon-preview.html`
2. **Download SVG:** Right-click and save
3. **Generate all sizes:** Use [appicon.co](https://appicon.co) or ImageMagick:
   ```bash
   # Convert to PNG at different sizes
   convert icon.svg -resize 1024x1024 icon-1024.png
   convert icon.svg -resize 512x512 icon-512.png
   convert icon.svg -resize 180x180 icon-180.png
   ```
4. **Replace placeholders:** Copy to `assets/` folder in mobile app
5. **Update app.json:** Verify icon paths

### Required Sizes

**iOS:**
- 1024×1024 (App Store)
- 180×180 (iPhone @3x)
- 120×120 (iPhone @2x)
- 167×167 (iPad Pro)
- 152×152 (iPad @2x)

**Android:**
- 512×512 (Play Store)
- 192×192 (xxxhdpi)
- 144×144 (xxhdpi)
- 96×96 (xhdpi)

## Customization

### Update Content

Edit `index.html` to change:
- Hero text and taglines
- Feature descriptions
- Statistics (currently using placeholder numbers)
- Testimonials
- Contact information
- Footer links

### Branding Colors

Current color scheme:
```css
--primary: #2196F3 (Blue)
--primary-dark: #1976D2
--secondary: #4CAF50 (Green)
--accent: #FFC107 (Gold)
```

To change colors, search and replace in `index.html` style section.

### Add Real App Store Links

Update download section when apps are published:
```html
<a href="https://play.google.com/store/apps/details?id=com.thesrsconsulting.tapp">
    <img src="..." alt="Google Play">
</a>
```

## SEO Optimization

The landing page includes:
- ✅ Meta description
- ✅ Semantic HTML
- ✅ Responsive design
- ✅ Fast loading (no external dependencies)
- ✅ Accessibility features

To improve SEO:
1. Add structured data (JSON-LD)
2. Create sitemap.xml
3. Add robots.txt
4. Implement Open Graph tags
5. Add analytics (Google Analytics)

## Future Enhancements

- [ ] Add email signup form
- [ ] Integrate blog/news section
- [ ] Add video demo
- [ ] Implement dark mode
- [ ] Add language toggle (Tamil/English)
- [ ] Create separate pages for Privacy Policy and Terms
- [ ] Add customer success stories
- [ ] Implement live chat support

## Technologies Used

- **HTML5:** Semantic markup
- **CSS3:** Modern styling with gradients and flexbox/grid
- **SVG:** Scalable vector graphics for icon
- **Responsive Design:** Mobile-first approach
- **No Dependencies:** Pure HTML/CSS (no frameworks)

## Development

To modify the landing page:

1. Edit files in this directory
2. Restart server or use nodemon for auto-reload
3. Test on multiple devices/browsers
4. Validate HTML at [validator.w3.org](https://validator.w3.org/)

## Deployment

The landing page is served automatically by the Express server:
- Static files served from `/public`
- Routes: `/` and `/home`
- No build step required

---

**Created:** October 26, 2025  
**Last Updated:** October 26, 2025  
**Version:** 1.0.0

