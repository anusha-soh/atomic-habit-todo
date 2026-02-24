# Quickstart: Landing Page Modernization

## Development Setup

1. **Environment**: Ensure you are in the `apps/web` directory.
2. **Dependencies**: 
   ```bash
   npm install roughjs
   # Tailwind v4 is handled via @tailwindcss/postcss or the new CLI
   ```
3. **Fonts**: `Caveat` and `Patrick Hand` are loaded in `src/app/layout.tsx`.

## Key Components

- `hero.tsx`: Uses `Caveat` for H1 and `roughjs` for the primary CTA button.
- `sticky-note.tsx`: A reusable wrapper for feature cards using `roughjs` SVG borders.
- `notebook-nav.tsx`: Implements the semi-transparent scroll persistence.

## Running Locally

```bash
cd apps/web
npm run dev
```
Navigate to `http://localhost:3000` to see the landing page.

## Testing

- **Visuals**: Check for cream background (`#FFFDD0` or equivalent token) and sketchy borders on all cards.
- **Responsive**: Verify the layout stacks to 1 column on mobile (<768px).
- **Accessibility**: Run `npm run lint` and verify contrast ratios in dev tools.
