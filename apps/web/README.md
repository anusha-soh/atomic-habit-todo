# Frontend Web App - Phase 2 Core Infrastructure

Next.js 16 frontend for Atomic Habits todo application with App Router, TailwindCSS 4, and Radix UI.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS 4 (mobile-first)
- **Components**: Radix UI (accessible primitives)
- **TypeScript**: Strict mode enabled
- **API Client**: Custom fetch wrapper with error handling

## Prerequisites

- Node.js 20+
- pnpm 8+ (installed globally: `npm install -g pnpm`)

## Environment Variables

Create a `.env.local` file in `apps/web/` directory:

```bash
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production**:
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

> ⚠️ **Important**: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets here.

## Installation

From the repository root:

```bash
# Install all workspace dependencies
pnpm install

# Or from apps/web directory
cd apps/web
pnpm install
```

## Running the Development Server

```bash
# From repository root
pnpm dev:web

# Or from apps/web directory
cd apps/web
pnpm dev
```

The app will be available at:
- Frontend: http://localhost:3000

## Building for Production

```bash
# From apps/web directory
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles (Tailwind)
│   │   ├── register/           # Registration page
│   │   ├── login/              # Login page
│   │   └── dashboard/          # Protected dashboard
│   ├── components/
│   │   └── ui/                 # Radix UI components
│   │       ├── button.tsx      # Button component
│   │       ├── input.tsx       # Input component
│   │       └── label.tsx       # Label component
│   └── lib/
│       ├── api.ts              # API client for backend
│       └── utils.ts            # Utility functions (cn)
├── public/                     # Static assets
├── package.json
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # TailwindCSS configuration
└── next.config.js              # Next.js configuration
```

## Pages & Routes

### Public Routes

- `/` - Home page (landing)
- `/register` - User registration
- `/login` - User login

### Protected Routes

- `/dashboard` - User dashboard (requires authentication)

## API Client Usage

The API client (`src/lib/api.ts`) provides a typed interface for backend communication:

```typescript
import { api, authAPI } from '@/lib/api'

// Authentication
await authAPI.register('user@example.com', 'password123')
await authAPI.login('user@example.com', 'password123')
await authAPI.logout()
const user = await authAPI.me()

// Generic API calls
await api.get('/api/some-endpoint')
await api.post('/api/some-endpoint', { data: 'value' })
```

### Error Handling

```typescript
import { APIError } from '@/lib/api'

try {
  await authAPI.login(email, password)
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}):`, error.message)
    // error.data contains full error response
  }
}
```

## Mobile-First Design

All components use mobile-first responsive design:

- **Default**: Mobile (320px+)
- **sm**: Large phones, landscape (640px+)
- **md**: Tablets (768px+)
- **lg**: Small desktops (1024px+)
- **xl**: Large desktops (1280px+)

### Touch Targets

All interactive elements meet accessibility guidelines:
- **Minimum size**: 44×44px (Apple HIG, Material Design)
- **Utility class**: `.touch-target` automatically applied to buttons/inputs

```tsx
<Button className="touch-target">Click me</Button>
```

## TailwindCSS Utilities

### Touch Target Utility

```tsx
// Ensures minimum 44×44px touch target for mobile accessibility
<button className="touch-target">
  Accessible Button
</button>
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="w-full lg:w-auto">
  {/* Full width on mobile, auto width on desktop */}
</div>
```

## UI Components

### Button

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Input

```tsx
import { Input } from '@/components/ui/input'

<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

### Label

```tsx
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

## Type Safety

Shared types from `@atomic-habits/core` package:

```typescript
import { User, Session, RegisterRequest } from '@atomic-habits/core'

const user: User = {
  id: '...',
  email: 'user@example.com',
  created_at: '2026-01-03T10:00:00Z',
}
```

## Development Tips

### Live Reload

Next.js automatically reloads when you:
- Edit any file in `src/app/`
- Change components in `src/components/`
- Update `globals.css` or Tailwind config

### TypeScript Checking

```bash
# Check types without emitting files
pnpm type-check
```

### Linting

```bash
pnpm lint
```

## Connecting to Backend

1. **Start backend server** (see `apps/api/README.md`)
2. **Ensure environment variable is set**:
   ```bash
   # apps/web/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. **Verify connection**: Open browser console and check for CORS errors

### CORS Issues

If you see CORS errors:
1. Check backend `ALLOWED_ORIGINS` includes `http://localhost:3000`
2. Restart backend server after changing `.env`
3. Clear browser cache

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
pnpm dev -- -p 3001
```

### Cannot connect to backend

- Verify backend is running: `curl http://localhost:8000/health`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Restart Next.js dev server after changing environment variables

### Build errors

```bash
# Clean Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## Next Steps

After setup:

1. ✅ Install dependencies: `pnpm install`
2. ✅ Create `.env.local` with `NEXT_PUBLIC_API_URL`
3. ✅ Start dev server: `pnpm dev`
4. ✅ Open app: http://localhost:3000
5. ⏭️ Implement registration and login pages (User Stories 2 & 3)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
