# React Bits Integration Guide

## Installation Methods

React Bits components can be added in two ways:

### Method 1: Using jsrepo CLI (Recommended)
```bash
# Install jsrepo globally (if not installed)
npm install -g jsrepo

# Add Dot Grid Background (Tailwind variant)
npx jsrepo add https://reactbits.dev/tailwind/Backgrounds/DotGrid

# Add other backgrounds
npx jsrepo add https://reactbits.dev/tailwind/Backgrounds/Aurora
npx jsrepo add https://reactbits.dev/tailwind/Backgrounds/Particles
npx jsrepo add https://reactbits.dev/tailwind/Backgrounds/GridPattern
```

### Method 2: Manual Installation (Copy from website)
1. Visit https://reactbits.dev/backgrounds/dot-grid
2. Click on the "Code" tab
3. Select "JS + Tailwind" variant
4. Copy the component code
5. Paste into your project

## Components to Add

### Backgrounds
- **Dot Grid** - Animated dot pattern with mouse interaction
- **Aurora** - Northern lights gradient effect
- **Particles** - Floating particles with connections
- **Grid Pattern** - Animated grid lines

### Text Animations  
- **Split Text** - Character-by-character animations
- **Typewriter** - Typing effect
- **Blur In** - Fade and blur effect

### UI Components
- **Magnetic Button** - Button that follows cursor
- **Glow Card** - Cards with glow effects
- **Reveal Cards** - Cards with reveal animations

## Usage in Project

After installation, import and use:

```jsx
import DotGrid from '@/components/backgrounds/DotGrid';

function MyPage() {
  return (
    <div className="relative min-h-screen">
      <DotGrid />
      {/* Your content */}
    </div>
  );
}
```

## Pages to Update

1. **Landing Page** (`/pages/landing.js`) - Add Dot Grid or Aurora background
2. **About Page** (`/pages/about.js`) - Add Grid Pattern  
3. **Dashboard** (`/pages/dashboard.js`) - Add subtle Particles
4. **CV Intelligence** - Add Glow Cards for resume display
5. **Interview Coordinator** - Add animated buttons

## Current Status

Waiting for manual component installation...
