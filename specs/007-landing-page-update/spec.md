# Feature Specification: Landing Page Modernization

**Feature Branch**: `007-landing-page-update`  
**Created**: 2026-02-15  
**Status**: Draft  
**Input**: User description: "i eanna update my sites landindg page using tailwind css v4 and shedcn. see @specs/006-notebook-design-system/spec.md for desing inspiration"

## Context & Scope

The landing page is the first point of contact for new users. This feature updates the landing page to use **Tailwind CSS v4** and **shadcn** components, while adopting the **Cozy Handwritten Notebook** design system established in `006-notebook-design-system`. The goal is to create a seamless transition from the marketing site to the application experience, emphasizing warmth, intimacy, and encouragement.

### Design Inspiration (from Spec 006)
- **Palette**: Cream paper backgrounds, soft ink colors, highlight accents (yellow, pink, mint).
- **Typography**: Handwritten fonts for headings and personality; clean sans-serif for readability.
- **Aesthetic**: Bullet journal, sticky notes, organic shapes, and soft shadows.

## Clarifications

### Session 2026-02-15

- Q: What is the definitive order of sections from top to bottom? → A: Hero -> Features -> Testimonials -> Final CTA -> Footer (Option A).
- Q: Should the landing page include a visual preview of the application dashboard? → A: No, rely on feature cards/icons only (Option C).
- Q: Should the navigation bar have a background or shadow when scrolling? → A: Semi-transparent cream + soft shadow (Option A).
- Q: Should footer informational links open in a new tab? → A: New tab (`_blank`) (Option A).
- Q: How many testimonials should be displayed in the social proof section? → A: 3 testimonials (Option A).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Warm Welcome & Brand Identity (Priority: P1)

A visitor arrives at the landing page and immediately feels a sense of warmth and personal connection through the notebook aesthetic. The hero section clearly communicates the "Atomic Habit" value proposition using handwritten typography and a cozy cream background.

**Why this priority**: The landing page must instantly differentiate the product from generic "productivity" apps. The notebook aesthetic is the primary emotional hook.

**Independent Test**: Can be tested by loading the root URL (`/`) and verifying the hero section renders with a cream background, handwritten primary headline, and soft shadows on the main visual elements.

**Acceptance Scenarios**:
1. **Given** a first-time visitor, **When** they load the landing page, **Then** the hero section displays a handwritten headline that is legible and prominent.
2. **Given** any screen size, **When** the hero section renders, **Then** it uses the `notebook-cream` background color and maintains professional spacing.
3. **Given** a user scrolling down, **When** they move past the hero, **Then** the visual transition to subsequent sections feels cohesive and follows the notebook theme.

---

### User Story 2 - Feature Discovery via "Sticky Notes" (Priority: P1)

Visitors can browse the core features of the app (Habits, Tasks, Streaks) presented as "sticky note" cards. These cards use sketchy borders and handwritten labels to make the features feel approachable and personal.

**Why this priority**: Clearly explaining WHAT the app does is essential for conversion. Presenting these as sticky notes reinforces the journaling metaphor.

**Independent Test**: Can be tested by navigating to the features section and verifying that feature cards resemble sticky notes with unique sketchy borders and soft shadows.

**Acceptance Scenarios**:
1. **Given** the features section, **When** rendered, **Then** at least 3 feature cards are visible, each styled as a distinct sticky note (slightly different tints: yellow, pink, mint).
2. **Given** a mobile device, **When** viewing features, **Then** the cards stack vertically and maintain readability without layout breaking.
3. **Given** a desktop hover, **When** the cursor enters a feature card, **Then** the card "lifts" slightly, mimicking a paper effect.

---

### User Story 3 - Seamless Navigation and CTA (Priority: P2)

Visitors can easily navigate the landing page and find the "Get Started" or "Login" buttons. These buttons are styled with the notebook aesthetic (ink-fill or sketchy-outline) but remain highly visible and functional.

**Why this priority**: Converting visitors into users requires clear and functional navigation/CTAs.

**Independent Test**: Can be tested by clicking the "Get Started" button in both the Navbar and the Hero section to ensure they lead to the registration flow.

**Acceptance Scenarios**:
1. **Given** the navigation bar, **When** rendered, **Then** it follows the notebook tab style with handwritten font for labels.
2. **Given** the primary CTA button, **When** rendered, **Then** it uses a "blue ink" fill style with a hand-drawn-style border.
3. **Given** a logged-in user, **When** visiting the landing page, **Then** the CTA changes from "Get Started" to "Go to Dashboard".

---

### User Story 4 - Social Proof & Encouragement (Priority: P3)

The landing page displays 3 small, friendly "handwritten" testimonials or encouragement quotes that feel like notes left by friends, increasing trust and emotional resonance.

**Why this priority**: Social proof builds trust, but generic testimonial boxes would break the notebook aesthetic.

**Independent Test**: Can be tested by viewing the testimonial section and verifying it uses the "notebook" font and organic layout with 3 distinct entries.

**Acceptance Scenarios**:
1. **Given** the testimonial section, **When** rendered, **Then** 3 quotes appear in the `Patrick Hand` (label) font with "ink" colors.
2. **Given** a testimonial, **When** viewed, **Then** it includes a small hand-drawn-style avatar or doodle icon.

---

### Edge Cases

- **What happens when the visitor has Dark Mode enabled in OS?** The landing page remains in its "Light/Cream" notebook theme for this phase (consistent with Spec 006 out-of-scope items).
- **How does the system handle extremely long headlines?** Headlines should wrap gracefully using the handwritten font without overlapping other UI elements or breaking the hero layout.
- **What happens if Tailwind CSS v4 features (like new engine) encounter older browsers?** The site should fall back to basic layouts while maintaining content readability, though standard modern browser support is expected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use **Tailwind CSS v4** for all styling, utilizing the new CSS-first configuration to define the notebook theme tokens (colors, fonts, shadows).
- **FR-002**: UI MUST be built using **shadcn/ui** components, which are customized to match the notebook design system (sketchy borders, cream backgrounds, ink colors).
- **FR-003**: System MUST load the **notebook design system fonts** (Caveat for headers, Patrick Hand for labels, Inter for body) as defined in `006-notebook-design-system`.
- **FR-004**: The Landing Page MUST include a **Hero Section** with a handwritten H1, a clear sub-headline in sans-serif, and a prominent "ink-styled" CTA button.
- **FR-005**: The Landing Page MUST include a **Features Section** where each feature is represented by a "Sticky Note" card component with a sketchy border and warm background tint.
- **FR-006**: The Landing Page MUST include a **Navigation Bar** that stays fixed at the top, styled as notebook tabs with handwritten labels. When scrolling, the bar MUST transition to a semi-transparent cream background with a soft shadow to maintain contrast.
- **FR-007**: System MUST use **roughjs** or a similar SVG-based approach to generate consistent "sketchy" borders for cards and buttons as per FR-028 in Spec 006.
- **FR-008**: The layout MUST be **fully responsive**, transitioning from a single-column layout on mobile to a multi-column layout on desktop.
- **FR-009**: System MUST include a **Footer** that contains essential links (Privacy, Terms, About) styled consistently with the notebook theme. These informational links MUST open in a new tab (`_blank`).
- **FR-010**: The Landing Page MUST follow the scroll sequence: **Hero -> Features -> Testimonials -> Final CTA -> Footer**.

### Key Entities *(none - this is a marketing landing page)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of landing page elements follow the notebook design system (colors, fonts, sketchy borders).
- **SC-002**: Page passes **Lighthouse accessibility audit** with a score of 90+ (ensuring contrast ratios and aria labels are correct).
- **SC-003**: Hero section is visible and legible on mobile screens (<375px) without horizontal scrolling.
- **SC-004**: First Contentful Paint (FCP) is under 1.2 seconds to ensure a "snappy" feeling despite the custom fonts and SVGs.
- **SC-005**: All CTA buttons have a minimum touch target size of 44x44px.
