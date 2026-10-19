# ⚡ Task Matrix — Modern Family & Focus Planner

> **Day 8 of 30-Day Vibe Coding**  
> An elegant, responsive, and space-efficient task management matrix and family planner built entirely with pure **HTML5, Vanilla CSS3, and modern ES6+ JavaScript**. Zero external build steps, zero bulky dependencies.
> 
> **Aesthetic Direction:** *Tactile Archival Instrument (Paper & Ink Chrono-Matrix)*  
> **DFII Score:** **14 / 15** *(Aesthetic: 5, Fit: 5, Feasibility: 4, Performance: 5, Consistency Risk: 1)*

---

## 🌟 Key Highlights

* **Unified Ambient Aesthetic:** Single-color cohesive background glow (Electric Indigo `#6366f1`) with zero distracting rainbow clashes.
* **Warm Yellowish Paper Light Mode:** Authentic warm parchment canvas (`#f3efe6`) with subtle organic SVG paper grain (`.paper-grain-layer`) paired with deep charcoal fountain pen ink (`#292c25`) for AAA contrast and effortless reading.
* **Animated Ink-Strike Micro-Interaction:** Custom `@keyframes inkStrike` animation that draws a realistic fluid ink line across tasks when checked off.
* **Compact Animated Status Strip:** Replaced bulky marketing paragraphs with a sleek, space-saving productivity bar featuring an expanding radar wave, shimmering progress bar, and dynamic motivational status messages.
* **Interactive Monthly Calendar:** Month-by-month navigation (`‹`, `Today`, `›`) featuring multi-person color dots for team/family members, overdue warnings on past days, and one-click date filtering.
* **In-App & Desktop Reminders:** Built-in modal alerts with harmonic dual-tone Web Audio chimes (no audio asset files needed) and native browser desktop notification support.
* **Celebratory Canvas Confetti:** Custom-engineered HTML5 canvas particle burst that celebrates completed tasks in matching indigo & diamond white tones.
* **Offline-First LocalStorage:** Instant client-side persistence that saves tasks, filter states, and theme preferences across sessions.

---

## 🎨 Dual Theme System

| Element | Deep Space Dark (Default) | Warm Yellowish Paper (Light Mode) |
| :--- | :--- | :--- |
| **Canvas Background** | Deep Midnight `#080c16` | Warm Yellowish Paper `#f3efe6` |
| **Card Surfaces** | Translucent Slate Glass `rgba(15, 23, 42, 0.65)` | Creamy Parchment `#fffdf8` / `rgba(255, 253, 248, 0.94)` |
| **Borders & Lines** | Subtle Indigo Glow `rgba(255, 255, 255, 0.08)` | Warm Paper Line `#ded8c9` |
| **Primary Text** | Crisp White `#f8fafc` | Deep Charcoal Ink `#292c25` |
| **Accent Hue** | Electric Indigo `#6366f1` / `#818cf8` | Deep Fountain Pen Indigo `#4338ca` / `#4f46e5` |
| **Background Vibe** | Floating Indigo Ambient Orbs & Geometric Mesh | Soft Warm Parchment Grid Texture |

---

## 📁 File Structure

```text
day8-to-do-app/
├── index.html        # Clean semantic HTML5 layout & accessible landmarks
├── style.css         # Centralized design system, glassmorphism & animation keyframes
├── app.js            # Reactive application logic, calendar engine & Web Audio chime
└── README.md         # Architecture documentation and usage guide
```

### Component Breakdown

1. **`index.html`**
   * Semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<dialog>`).
   * Google Fonts integration (`Outfit`, `Plus Jakarta Sans`, and `JetBrains Mono`).
   * Accessible input forms with explicit labels, placeholders, and ARIA attributes.
   * Floating canvas layer for confetti particle rendering.

2. **`style.css`**
   * CSS custom properties (`:root` & `html.light`) for tokenized styling.
   * Hardware-accelerated animations:
     * `@keyframes radarWave`: Expanding pulse ripple on the live status indicator.
     * `@keyframes shimmerLight`: Light reflection sweep travelling across progress bars.
     * `@keyframes borderGlow`: Breathing ambient border light pulse.
     * `@keyframes slideInTask`: Smooth slide-and-fade entrance for newly scheduled items.
   * Custom browser scrollbars tailored for both paper light and dark modes.
   * Visible `:focus-visible` accessibility rings for keyboard navigators.

3. **`app.js`**
   * **State Store:** `tasks`, `currentFilter`, `selectedCalendarDate`, `notificationsEnabled`, `isDarkMode`.
   * **Audio Synthesis:** High-performance singleton `AudioContext` generating harmonic dual-tone chimes without external MP3/WAV assets.
   * **Confetti Engine:** Lightweight canvas particle system with natural gravity, air resistance, and random rotations.
   * **Calendar Engine:** Generates accurate day grids for any month, maps tasks to dates, and renders per-person indicator dots.
   * **Inline Editing:** Quick in-place editor for updating task titles, dates, times, durations, and assignees.
   * **Google Calendar Real-Time Sync & Direct Push:**
     * **Real-Time Direct Push Button:** One-click `Sync GCal` button in the top navigation and `Push to Google Calendar` in the footer that sends tasks directly into Google Calendar via the REST API.
     * **1-Click Task Add:** Click the calendar icon on any task to instantly open or push the event directly.
     * **Auto-Open on Add:** Checkbox option in the task creation form to immediately launch Google Calendar upon submitting a new task.
     * **Inline Edit GCal Button:** Launch Google Calendar event directly while editing any task.
     * **RFC 5545 iCalendar (.ics) Export:** Export Active, Monthly, or All tasks into a standard `.ics` file.

---

## 📅 Google Calendar Linking Guide

### 1. Real-Time Push / Sync Button (Direct API)
* Click the **Sync GCal** button in the top bar or **Push to Google Calendar** in the task footer.
* Enter your Google OAuth Client ID once (it's saved in your browser).
* Authorize once with your Google account.
* All active tasks are pushed directly to your Google Calendar, and each synced task displays a green `✓ GCal` badge!

> **Note on Google OAuth:** Google requires running via a local web server (not `file:///`). Simply run `python -m http.server 8000` in the directory and open `http://localhost:8000`.

### 2. Instant 1-Click Task Link (Zero-Setup Fallback)
* Click the 📅 icon on any individual task item in the list or the **Google Cal** button inside the inline task editor.
* Google Calendar opens in a new tab with the title, date, start time, calculated end time, duration, and family assignee automatically populated.
* Click **Save** in Google Calendar!

### 3. Bulk Export via iCalendar (.ics)
1. Click **GCal Settings / Export** in the tasks footer or the Calendar card header.
2. Select your export scope: **Active**, **This Month**, or **All Tasks**.
3. Click **Download .ics File** and import it into Google Calendar in 3 clicks.

---

## ⌨️ Accessibility & Keyboard Shortcuts

* **`Tab` / `Shift + Tab`:** Cycle forward/backward through all interactive buttons and inputs with high-visibility focus indicators.
* **`Space` or `Enter`:** Toggle task completion status when focused on a checkbox button.
* **`Escape`:**
  * Instantly dismisses the Reminder Modal popup.
  * Cancels active inline task editing and restores normal listing view.
* **Click Outside:** Clicking outside the modal backdrop automatically closes the alert.

---

## 👥 Assignee Roster

Tasks can be categorized and assigned across household or team members with dedicated badges:
* 🟦 **Dad** (`#3b82f6`)
* 🟪 **Mom** (`#ec4899`)
* 🟩 **Alex** (`#10b981`)
* 🟧 **Chicky** (`#f59e0b`)
* 🟪 **Kimi** (`#a855f7`)

---

## 🚀 Quick Start

No installations, build steps, or package managers required. Open `index.html` directly in any modern browser:

### Option A: Direct Open
Double-click `index.html` in your file explorer.

### Option B: Terminal Command (Windows PowerShell)
```powershell
start d:\Antigravity-Project\day8-to-do-app\index.html
```

---

*Crafted with precision for Day 8 of the Vibe Coding series.*
