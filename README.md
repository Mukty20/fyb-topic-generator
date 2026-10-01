# Final Year Topic Prompting Generator System

A personalized, questionnaire-driven web platform that helps final year
undergraduate students in Nigerian tertiary institutions generate relevant
project topics and receive structured guidance through the early stages of
their academic project planning built as a final year project at
Kaduna State University, Department of Informatics.

## The Problem

Final year students routinely submit ten to twenty project topic ideas
before one gets approved, with supervisors unable to give every student
the individual guidance the topic selection process actually needs. This
system replaces that trial-and-error cycle with a guided, prompt-driven
flow that produces topic suggestions tailored to each student's actual
department, skills, and hardware — not generic, recycled ideas.

## How It Works — Six Stages

1. **Student Profiling** — a conversational, chat-style interview of six
   chained questions: department, area of interest (filtered by
   department), main tool/language, programming proficiency, hardware
   available, and preferred learning style. Students with no prior
   programming experience are routed into a separate beginner-guidance
   branch instead of a skill rating that wouldn't mean anything to them.
   Target complexity is derived automatically from proficiency and
   hardware rather than self-declared.

2. **Topic Prompting** — three project topics generated from the full
   profile, each with a description, a relevance explanation tied
   directly to the student's own answers, and a "Problem Grounding"
   note explaining in general terms why the problem area is worth
   addressing without inventing citations. Students can reprompt for
   a fresh set in one action.

3. **Topic Development** — once a topic is selected, the system breaks
   it down into problem, affected parties, solution, and differentiation,
   plus a development roadmap with step-by-step guidelines and time
   estimates.

4. **Research Kickstart** — key concepts, related technology areas, and
   five Google Scholar-linked search terms to start the literature
   review with real, verifiable sources.

5. **Project Timeline** — a six-phase project plan scaled to the
   derived complexity level, each phase with concrete deliverables and
   a practical tip.

6. **Dashboard & Download** — an adaptive dashboard (different views for
   new vs. returning students) summarizing progress, with a one-click
   PDF export of the complete Personal Project Plan.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, React Router DOM
- **Backend:** Firebase Authentication, Firebase Firestore
- **Generation:** Claude API (Sonnet)
- **Export:** jsPDF
- **Diagrams:** matplotlib (architecture, ERD), Graphviz (flowchart)

## Current Status

- Core six-stage flow is fully built and functional, including a
  responsive layout (desktop sidebar / mobile menu) and per-user daily
  generation limits.
- Generation is currently running on structured mock responses that
  mirror the exact shape of the real Claude API output, so the entire
  flow has been fully tested end-to-end before spending on live API
  credits.
- **Known limitation:** the Claude API key is currently used
  client-side. Before any public deployment, this needs to move behind
  a server-side function (planned) so the key is never exposed in the
  browser bundle.
- Live Claude API integration and the server-side key migration are the
  next planned steps, in that order.

## Setup

1. Clone the repo and run `npm install`
2. Create a Firebase project with Authentication (Email/Password) and
   Firestore enabled
3. Copy your Firebase config and a Claude API key into a `.env` file:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CLAUDE_API_KEY=

4. Publish Firestore security rules restricting each collection to its
   owning user (see `firestore.rules` in the repo)
5. `npm run dev`

## Academic Context

Built as a final year Computer Science project at Kaduna State
University, Department of Informatics, under the title *"Design and
Implementation of a Final Year Topic Prompting Generator System."*
Full academic documentation (Chapters 1–4) is maintained separately
following departmental project guidelines.

mukty_codes