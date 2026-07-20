# Birthday Invitation Website

## Project Overview

Build a modern, elegant, responsive, and premium birthday invitation website inspired by wedding invitation websites.

The website should provide guests with all event information, allow RSVP confirmations, display a gift registry, support PIX donations, and include an administrator dashboard for managing the event.

The UI should feel luxurious, smooth, and highly polished, using modern animations and transitions.

---

# Execution Plan

## Phase 1 — Project Setup & Configuration

- Initialize Next.js with App Router and TypeScript: `npx create-next-app@latest`
- Install and configure Tailwind CSS
- Install and initialize shadcn/ui
- Install all core dependencies:
  - `framer-motion`, `react-hook-form`, `zod`, `@hookform/resolvers`
  - `prisma`, `@prisma/client`
  - `next-auth`, `@auth/prisma-adapter`
  - `cloudinary`, `next-cloudinary`
  - `qrcode`, `react-qr-code`
  - `canvas-confetti`, `react-confetti`
  - `zustand` (global music state)
  - `react-hot-toast` (toast notifications)
- Configure environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_*`, `GOOGLE_MAPS_API_KEY`
- Set up `prettier`, `eslint`, and folder structure: `app/`, `components/`, `lib/`, `hooks/`, `services/`, `prisma/`, `public/`, `types/`

---

## Phase 2 — Database Schema

Design and migrate the full Prisma schema before writing any feature code.

Tables:

- `EventSettings` — title, description, date, time, address, mapsUrl, dressCode, contact, pixKey, qrCodeUrl
- `Guest` — name, phone, guestCount, message, status, invitationCode (unique), confirmedAt
- `Gift` — name, description, imageUrl, purchaseLink, status (AVAILABLE | RESERVED), reservedByName, reservedByPhone
- `GalleryItem` — type (IMAGE | VIDEO), url, caption, order
- `AdminUser` — email, hashedPassword (for NextAuth credentials provider)

Run `prisma migrate dev` and generate the client.

---

## Phase 3 — Authentication & Admin Guard

- Configure NextAuth with the Credentials provider
- Create `app/admin/login/page.tsx` (login form)
- Add middleware (`middleware.ts`) to protect all `/admin/*` routes
- Seed one admin user via `prisma/seed.ts`
- Verify redirect to login when unauthenticated

---

## Phase 4 — Layout & Design System

- Create the root `app/layout.tsx` with global font (e.g. Playfair Display + Inter via `next/font`)
- Build the shared `<Navbar />` and `<Footer />` components
- Establish the Tailwind design tokens: color palette, spacing, border radius
- Configure dark mode (`class` strategy in Tailwind)
- Add `<Toaster />` (react-hot-toast) and global `<MotionConfig>` at root level

---

## Phase 5 — Public Page: Hero, About & Event Info

- `Hero` section: full-screen background image, title, subtitle, `<CountdownTimer />` component, entrance animations (Framer Motion)
- `About` section: rich text, images, embedded YouTube `<iframe>`
- `EventInfo` section: date, time, address, dress code, contact, embedded Google Maps iframe
- Apply scroll-triggered reveal animations (`whileInView` + `viewport={{ once: true }}`) to all sections

---

## Phase 6 — RSVP Feature

- Build `<RsvpForm />` using React Hook Form + Zod (fields: name, phone, guestCount, message)
- Create `POST /api/rsvp` route handler — validate with Zod, write to DB, handle duplicate invitation codes
- On success: show confetti/celebration animation (`canvas-confetti`) and a success card
- Handle personalized invite link: read `invitationCode` from URL params (`/invite/[code]`), pre-fill form, mark invitation as used after confirmation

---

## Phase 7 — Gift Registry

- `GET /api/gifts` — return all gifts with status
- Build `<GiftCard />` grid; show "Reserved" badge when status is `RESERVED`
- On "Reserve" click: open a modal asking for name + phone
- `POST /api/gifts/[id]/reserve` — use a DB transaction to atomically check status and update; return 409 if already reserved (race condition safety)
- Optimistically update UI on success

---

## Phase 8 — Gallery

- Build responsive masonry/grid gallery
- Images: lazy load with `next/image`, click to open `<Lightbox />` with keyboard navigation (prev/next/close)
- Videos: embedded YouTube `<iframe>` with thumbnail preview
- `<Lightbox />` component: fullscreen overlay, arrow navigation, swipe on mobile

---

## Phase 9 — PIX Donation

- Display PIX key as styled text
- Generate and display QR Code using `react-qr-code` from the stored PIX key
- "Copy PIX Key" button using the Clipboard API (`navigator.clipboard.writeText`)
- Show toast confirmation after copy

---

## Phase 10 — Personalized Invitation Links

- `app/invite/[code]/page.tsx` — server component that looks up the guest by `invitationCode`
- Pass guest name into the page (greeting, pre-filled RSVP form)
- If code is invalid: show a friendly error
- Track `viewedAt` timestamp on the invitation record

---

## Phase 11 — Admin Dashboard

Build all pages under `app/admin/`.

- `app/admin/page.tsx` — Overview: stat cards (total guests, confirmed, pending, reserved gifts)
- `app/admin/guests/page.tsx` — Table with search, status filter, export CSV button
- `app/admin/gifts/page.tsx` — Gift CRUD (create, edit, delete, toggle availability, view reserver)
- `app/admin/gallery/page.tsx` — Upload images via Cloudinary, add YouTube URL, delete items, reorder
- `app/admin/settings/page.tsx` — Form to edit all `EventSettings` fields including PIX key and QR code upload

Use shadcn/ui `DataTable`, `Dialog`, `Form`, `Card`, and `Tabs` throughout.

---

## Phase 12 — Extra Features & Polish

- **Background Music**: `<MusicPlayer />` floating button; global Zustand store for play/pause state; `<audio>` element mounted once at root layout; no autoplay
- **WhatsApp Sharing**: floating or section button with a pre-composed `wa.me` deep link
- **Celebration animation**: `canvas-confetti` triggered after RSVP success
- **Skeleton loaders**: add to all async data sections (gifts, gallery, guests table)
- **Error boundaries**: wrap major sections; add `loading.tsx` and `error.tsx` per route segment

---

## Phase 13 — SEO & Performance

- Add `metadata` exports to `app/layout.tsx` and each public page (title, description, OG image, Twitter card)
- Create `app/sitemap.ts` and `app/robots.ts`
- Audit all images: use `next/image` with explicit `width`/`height` and `priority` on hero
- Enable Vercel Speed Insights or Lighthouse CI
- Target: Lighthouse score ≥ 90 on mobile

---

## Phase 14 — Deployment

- Push to GitHub
- Connect repo to Vercel; set all environment variables in Vercel dashboard
- Provision a free PostgreSQL database on Neon (or Supabase); update `DATABASE_URL`
- Run `prisma migrate deploy` via Vercel build command or a one-time script
- Configure Cloudinary environment variables
- Verify all features in production; confirm Lighthouse scores

---

# Technology Stack

Use the following technologies:

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- NextAuth/Auth.js (for admin authentication)
- Cloudinary (image uploads)
- YouTube embeds (videos)
- React Hook Form
- Zod validation
- Framer Motion (animations)

The project must be structured to allow deployment on Vercel using a free PostgreSQL database (Neon or Supabase).

---

# Architecture

Use a full-stack Next.js architecture.

- React for UI
- Next.js API Routes / Route Handlers
- Prisma for database access
- PostgreSQL for persistence

The project should be modular, clean, and easy to extend.

Suggested folder structure:

```
app/
components/
lib/
hooks/
services/
prisma/
public/
types/
```

---

# Public Website Features

## Hero Section

Include:

- Beautiful full-screen hero image
- Birthday title
- Subtitle
- Elegant typography
- Countdown timer until the event
- Smooth entrance animations

---

## About

A section describing the birthday celebration.

Support:

- Rich text
- Images
- Embedded YouTube videos

---

## Event Information

Display:

- Date
- Time
- Address
- Google Maps
- Parking information
- Dress code
- Contact information

---

## Gallery

Create a responsive gallery.

Support:

- Images
- Lightbox preview
- Embedded YouTube videos

---

## RSVP

Guests should be able to confirm attendance.

Fields:

- Name
- Phone
- Number of guests
- Optional message

Store all confirmations in the database.

After confirmation, show a friendly success animation.

---

## Gift Registry

Create a wedding-style gift registry.

Each gift should contain:

- Image
- Name
- Description
- Optional purchase link
- Status

Status:

- Available
- Reserved

When a guest reserves a gift:

Ask for:

- Name
- Phone

After reservation:

- Mark the gift as Reserved
- Show "Reserved" in the UI
- Prevent duplicate reservations

---

## PIX Donation

Create a donation section.

Display:

- QR Code
- PIX key
- Copy button

The copy button should use the Clipboard API.

---

## Responsive Design

The website must work perfectly on:

- Desktop
- Tablet
- Mobile

---

# Administrator Dashboard

Create a protected `/admin` area.

Authentication is required.

Dashboard should include:

## Overview

Display cards showing:

- Total invitations
- Confirmed guests
- Pending confirmations
- Reserved gifts

---

## Guest Management

Allow:

- View guest list
- Search guests
- Filter confirmed/pending
- Export CSV (optional)

Columns:

- Name
- Phone
- Number of guests
- Confirmation status
- Message

---

## Gift Management

Allow:

- Create gifts
- Edit gifts
- Delete gifts
- Mark as available
- View who reserved each gift

---

## Gallery Management

Allow:

- Upload images
- Delete images
- Add YouTube videos

---

## Event Settings

Allow editing:

- Event title
- Description
- Address
- Date
- Time
- Google Maps URL
- Dress code
- Contact
- PIX key
- QR Code

---

# UI/UX Requirements

The interface should feel premium.

Use:

- Rounded cards
- Soft shadows
- Glassmorphism where appropriate
- Smooth hover effects
- Framer Motion animations
- Fade transitions
- Scroll animations
- Skeleton loading
- Toast notifications
- Dark mode support
- Accessibility (ARIA)
- Keyboard navigation

---

# Extra Features

Implement the following features:

## Countdown Timer

Display a live countdown until the birthday.

---

## Background Music

Allow visitors to play or pause background music.

Requirements:

- Audio should NOT autoplay.
- Show a floating Play/Pause button.
- Persist playback state while navigating pages.

---

## Scroll Animations

Animate sections as they enter the viewport.

Use Framer Motion.

---

## Image Lightbox

Images should open in fullscreen with navigation.

---

## Google Maps

Embed an interactive Google Map.

---

## Guest Messages

Allow guests to leave a message when confirming attendance.

Display those messages only in the admin dashboard.

---

## Celebration Animation

After RSVP confirmation:

Show a celebration animation such as:

- Confetti
- Fireworks
- Floating balloons

---

## WhatsApp Sharing

Provide a button that shares the invitation through WhatsApp.

---

## Personalized Invitation Links

Support personalized invitation URLs.

Example:

```
/invite/ABC123
```

Each invitation code should identify a guest.

The website should:

- Automatically recognize the guest
- Pre-fill RSVP information
- Prevent multiple confirmations using the same invitation code (optional)
- Track invitation status

---

# Performance

Optimize for:

- Lighthouse score above 90
- Lazy loading
- Image optimization
- SEO metadata
- Open Graph
- Sitemap
- Robots.txt

---

# Code Quality

Follow best practices:

- Clean Architecture where appropriate
- SOLID principles
- Reusable components
- Strong TypeScript typing
- Server Components whenever possible
- Client Components only when necessary
- Validation with Zod
- Error boundaries
- Loading states
- Empty states

---

# Deployment

The project should be ready to deploy on:

- Vercel
- Neon PostgreSQL (or Supabase)
- Cloudinary

The application should work entirely within free hosting limits.

---

# Goal

The final result should look and feel like a professional wedding invitation website rather than a simple landing page.

The design should be elegant, modern, highly interactive, and memorable while remaining lightweight, responsive, and easy to maintain.
