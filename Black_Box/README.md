# Black Box Landing Page

A modern, responsive landing page for Black Box smart vending machine solutions built with React, TypeScript, and Tailwind CSS.

## Features

- **Modern Design**: Sleek, professional design with gradient backgrounds and glass morphism effects
- **Responsive**: Fully responsive design that works on all devices
- **Animations**: Smooth animations using Framer Motion
- **Interactive**: Interactive components with hover effects and transitions
- **Accessible**: Built with accessibility in mind using Radix UI components
- **Fast**: Optimized for performance with Vite build system

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the LandingPage directory:
```bash
cd LandingPage
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5174`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
LandingPage/
├── src/
│   ├── components/
│   │   └── ui/           # Reusable UI components
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   ├── pages/
│   │   └── LandingPage.tsx # Main landing page component
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── dist/                 # Built files (generated)
```

## Sections

The landing page includes the following sections:

1. **Navigation** - Fixed header with mobile menu
2. **Hero** - Eye-catching hero section with CTA buttons
3. **Features** - Grid of key features with icons
4. **Benefits** - Why choose Black Box with testimonials
5. **CTA** - Call-to-action section
6. **Contact** - Contact information cards
7. **Footer** - Links and company information

## Customization

### Colors
The color scheme can be customized in `tailwind.config.ts` and `src/index.css`.

### Content
Update the content in `src/pages/LandingPage.tsx` to match your specific needs.

### Animations
Framer Motion animations can be customized by modifying the motion components in the landing page.

## Deployment

This project can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **Railway**: Deploy directly from the repository

## License

This project is part of the Black Box vending machine system.
