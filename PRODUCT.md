# Product

## Register

product

## Users

Two distinct audiences:

- **Admins / event staff** (primary, daily users): organizers who build forms inside
  projects, publish public links, manage submissions, check people in, run QR claim
  scanning, and send notification emails. They work in the admin console for extended
  sessions and value speed, clarity, and confidence that their actions took effect.
- **Public respondents** (occasional, one-time users): event attendees — largely Thai
  speakers, often on mobile — who open a shared link and fill out a single form. Their
  context is brief and unfamiliar; the form must feel welcoming, trustworthy, and
  effortless, with no learning curve.

## Product Purpose

A web app for running events / attendance / registration. Admins create projects, build
forms, share public links, and collect submissions. Submissions import/export via Excel,
items can be claimed via QR codes, and notification emails go out over SMTP. Success =
admins set up and run an event quickly with zero doubt about whether each action worked,
and respondents complete forms without friction or confusion.

## Brand Personality

Friendly and approachable, with the calm, content-first restraint of Notion. Warm but not
childish; organized but not clinical. Three words: **welcoming, calm, dependable.** The
admin side should feel like a capable, quiet tool that gets out of the way; the public form
should feel like a friendly invitation, not a bureaucratic intake.

## Anti-references

- **Cluttered / busy** — competing borders, nested boxes, cramped data tables.
- **Generic Bootstrap-y** — default-template look, flat gray, obvious off-the-shelf parts.
- **Loud / flashy** — heavy gradients, big drop shadows, many bright colors, excess motion.
- **Cold / sterile** — harsh, clinical, no warmth or personality.
- **Google Forms clone** — the form builder and public form currently mimic Google Forms
  almost 1:1 (Google blue, `.google-preview-*` card styling). This is a deliberate
  anti-reference: the form surface should have its own calm, friendly identity, not read as
  a Google Forms reskin.

## Design Principles

1. **Confidence over guessing.** Every action shows it worked, where the user is looking —
   no silent successes, no hunting for a tiny corner toast.
2. **Calm density.** Show real data without cramming; breathing room and clear hierarchy
   beat squeezing more onto the screen.
3. **One identity, ours.** Consistent brand color, type, and component language across admin
   and public surfaces — never a borrowed look (esp. not Google Forms).
4. **Welcoming to strangers.** The public form assumes no prior knowledge; friendly copy,
   obvious required fields, forgiving errors, mobile-first.
5. **Refine, don't reinvent.** Elevate the existing identity (Nunito, blue, light/dark)
   rather than replacing it; preserve all working behavior.

## Accessibility & Inclusion

- Light and dark themes already supported (toggle on `<html data-theme>`); both must stay
  legible (body text ≥ 4.5:1 contrast, large text ≥ 3:1).
- Thai + Latin text (Nunito + Anuphan) — layouts must tolerate longer Thai strings without
  breaking.
- Mobile-first for the public form; admin tables need a real responsive strategy, not tiny
  horizontal scroll.
- Respect reduced-motion; keep feedback animations subtle and non-essential.
- Status must never rely on color alone (pair color with icon/label).
