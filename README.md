# Delston Roofing Website

A modern, high-converting single-page website for Delston Roofing, serving Cardiff, Newport, and Penarth.

## Features

- **Responsive Design** - Mobile-first approach, works beautifully on all devices
- **Modern Tech Stack** - Vanilla HTML, CSS, and JavaScript with Three.js for premium effects
- **Performance Optimized** - Fast loading, minimal dependencies
- **Trust-Focused** - Designed to build trust with homeowners through transparency and clarity
- **Interactive Elements**:
  - Aurora Borealis background effect (Three.js)
  - Neon tube animations (Three.js)
  - Glassmorphism UI elements
  - Smooth scroll animations
  - Magnetic buttons and hover effects

## Tech Stack

- **HTML5** - Semantic, accessible markup
- **CSS3** - Custom properties, glassmorphism, modern layouts
- **Vanilla JavaScript** - No framework dependencies
- **Three.js** - WebGL-powered 3D backgrounds

## Structure

```
delstonroofing/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── main.js         # Navigation, form handling
│   ├── animations.js   # Scroll animations
│   └── three-bg.js     # Three.js effects
└── assets/             # Images (using external URLs)
```

## Sections

1. **Hero** - Bold headline with aurora background
2. **Problem/Empathy** - Addresses customer fears
3. **Services** - Grid of service offerings
4. **Our Process** - 6-step timeline (key differentiator)
5. **About Us** - Personal story and values
6. **Reviews** - Customer testimonials
7. **FAQ** - Common questions answered
8. **Contact** - Quote request form

## Development

No build process required. Simply open `index.html` in a browser or serve with any static server.

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve
```

## Deployment

Deploy to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## Color Palette

- **Primary Blue**: #2563eb
- **Light Blue**: #3b82f6, #60a5fa
- **Accent Orange**: #f97316
- **Dark**: #0c1929, #1a365d

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Three.js effects gracefully degrade on older browsers and mobile devices.

## License

All rights reserved. Delston Roofing 2026.
