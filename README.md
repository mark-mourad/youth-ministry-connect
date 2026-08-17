# Youth Ministry Connect

Act as a Senior Full-Stack Engineer and Lead UX/UI Designer. Build a complete, production-ready, highly responsive mobile-first web application for Church Youth Ministry Management using React (TypeScript), Tailwind CSS, Lucide React icons, Recharts, and Supabase.

I will provide the Supabase project connection details (API URL & Anon Key) and uploaded assets (Youth Logo, Design Wireframe Screenshots, and Color Palette). Please strictly adhere to the project specifications and requirements below.

---

### 1. UI/UX DESIGN SYSTEM & BRANDING (MOBILE-FIRST)

- **Mobile-First Approach:** Design all views primarily for mobile viewports (375px–430px) to mimic a native mobile app (Bottom Navigation Bar, touch-friendly dropdowns, draggable bottom sheets, rounded cards).

- **Theme & Palette (Spotify Dark Theme Reference):**

  - Background: Dark Grey / Near Black (`#121212`).

  - Card Surfaces: Dark Charcoal (`#1E1E1E`).

  - Primary Accent: Spotify Vibrant Green (`#1DB954`) for interactive triggers, primary buttons, and active states, complemented by secondary colors extracted from the uploaded High Secondary School Youth Logo.

- **Iconography & UI Controls:** Use Google Material Symbols / Lucide React icons across all controls.

- **Branding Assets:** Incorporate the uploaded High Secondary School Youth Logo in the Header, Login Screen, and Student QR ID Card.

---

### 2. SUPABASE DATABASE SCHEMA & RLS POLICIES

Set up and connect the PostgreSQL database structure on Supabase with Row Level Security (RLS) policies:

1. `users` Table:

   - `id` (UUID, Primary Key, references `auth.users`)

   - `full_name` (Text)

   - `email` (Text)

   - `role` (Enum: `'student'`, `'servant'`)

   - `grade_level` (Enum: `'1st_sec'`, `'2nd_sec'`, `'3rd_sec'`)

   - `class_id` (Foreign Key -> `classes.id`, Nullable)

   - `created_at` (Timestamp)

2. `classes` Table:

   - `id` (UUID, Primary Key)

   - `name` (Text)

   - `grade_level` (Enum: `'1st_sec'`, `'2nd_sec'`, `'3rd_sec'`)

   - `created_by` (Foreign Key -> `users.id`)

   - `created_at` (Timestamp)

3. `events` Table:

   - `id` (UUID, Primary Key)

   - `title` (Text)

   - `event_type` (Enum: `'sunday_school'`, `'activity'`, `'recreation'`, `'liturgy'`, `'tasbeha'`)

   - `start_time` (Timestamp), `end_time` (Timestamp)

   - `recurrence` (Enum: `'once'`, `'weekly'`, `'custom'`)

   - `custom_days` (Array of Strings / Dates)

   - `created_by` (Foreign Key -> `users.id`)

4. `attendance` Table:

   - `id` (UUID, Primary Key)

   - `event_id` (Foreign Key -> `events.id`)

   - `student_id` (Foreign Key -> `users.id`)

   - `scanned_by` (Foreign Key -> `users.id`)

   - `scanned_at` (Timestamp)

5. `spiritual_journal` Table:

   - `id` (UUID, Primary Key)

   - `student_id` (Foreign Key -> `users.id`)

   - `date` (Date)

   - `prayers` (JSONB: `{ baker: boolean, ghroob: boolean, noom: boolean, free: boolean }`)

   - `bible_testament` (Enum: `'old'`, `'new'`)

   - `bible_book` (Text)

   - `bible_chapter` (Integer)

   - `other_readings` (Text)

6. `followup_notes` Table (Private Servant Notes):

   - `id` (UUID, Primary Key)

   - `student_id` (Foreign Key -> `users.id`)

   - `servant_id` (Foreign Key -> `users.id`)

   - `note` (Text)

   - `created_at` (Timestamp)

---

### 3. AUTHENTICATION, ONBOARDING & SECRET SERVANT REGISTRATION

- **Unified Login Screen (`/login`):**

  - Single login form for all users displaying the Youth Logo.

  - Automatic Role-Based Redirect upon sign-in:

    - If `user.role === 'student'` -> Redirect to `/student`.

    - If `user.role === 'servant'` -> Redirect to `/servant`.

- **Public Student Sign-Up (`/signup`):**

  - Fields: Full Name, Email, Password, Confirm Password.

  - Dropdown 1 (Academic Grade): 1st Secondary (`أولى ثانوي`), 2nd Secondary (`ثانية ثانوي`), 3rd Secondary (`ثالثة ثانوي`).

  - Dropdown 2 (Dynamic Class Selection based on Dropdown 1):

    - *1st Sec Pre-populated Classes:* البابا ألكسندروس, البابا أثناسيوس, البابا كيرلس عمود الدين, البابا ديسقورس, البابا بطرس.

    - *2nd Sec Pre-populated Classes:* القديس إكليمنضدس, القديس إغناطيوس, القديس بوليكاربوس, القديس تيموثاوس, القديس تيطس.

    - *Dynamic Classes:* Fetches any newly added classes created by servants for that specific grade level.

- **SECRET SERVANT SIGN-UP ROUTE (`/servant-register-secret-89xq`):**

  - A hidden, unlinked registration route intended exclusively for servants.

  - Requires a **Secret Passcode** (validated via Supabase Function or Env Variable) to assign `role = 'servant'`.

  - Servants select their assigned Grade Level upon registration.

---

### 4. DASHBOARDS & CORE APP FEATURES

#### A. Student Dashboard (`/student`) — Overview & Service Navigation

- **Overview Screen (Home Tab):**

  - Top Profile Header displaying Student Name, Grade Level, Class Name, and a permanent **Personal QR Code / Barcode** generated from `user.id`.

  - **Upcoming Events Cards:** Horizontal/Grid scroll list showing event details (title, date, time interval, type badge).

  - **Spiritual Progress Summary Widget:** Weekly aggregates showing logged prayers and Bible chapters read.

- **Bottom Navigation Bar (Student Mode):**

  - `Home`: Returns to Student Overview screen.

  - `Book / Bible`: Opens the Spiritual Journal logging interface (Select Testament -> Dynamic Book Dropdown -> Enter Chapter -> Check Daily Prayers -> Save).

  - `QR Code Icon`: Displays fullscreen high-contrast QR Code for event check-in scanning.

#### B. Servant Dashboard (`/servant`) — Class Tracking & Administration

- **Overview Screen (Home Tab):**

  - Displays Servant Name, Grade Level, and Class Management overview.

  - **Events Management:** List active events with options to Add, Edit, or Cancel/Delete events.

    - *Add/Edit Event Form:* Event Title, Type (`Sunday School`, `Activity`, `Recreation`, `Liturgy`, `Tasbeha`), Time Interval (`From HH:MM To HH:MM`), and Recurrence (`Once`, `Weekly - Pick Day of Week`, or `Custom - Multi-date Calendar Picker`).

- **Class Attendance & Absence Alert System:**

  - Filter students by assigned grade/class.

  - Shows attendance percentage per student.

  - **Absence Alert:** Automatically flags students with 2 or more consecutive absences with an **"إنذار افتقاد"** badge.

- **FEATURE: Add New Class (`إضافة فصل جديد`):**

  - A modal allowing servants to create and add new class names to their grade level. Once saved, it immediately syncs with Supabase and populates the Student Sign-Up dropdown list for that grade.

- **Individual Student Profile Modal:**

  - View historical attendance logs.

  - Read-Only view of the student's Spiritual Journal entries.

  - **Private Follow-up Notes (ملاحظات الافتقاد):** Confidential text editor for servants to log private notes (e.g., "محتاج افتقاد", "مريض", "عنده امتحانات") hidden from the student.

- **Bottom Navigation Bar (Servant Mode):**

  - `Home`: Servant Dashboard Overview.

  - `QR Camera Scanner`: Launches camera inside the browser to scan student QR codes and log attendance instantly.

  - `Class Tracker`: Displays class-wide spiritual progress and attendance table.

  - `Export Reports`: Triggers instant download of attendance & spiritual progress reports in **PDF / Excel (`xlsx`)** formats.

---

### 5. TECHNICAL & PWA ENHANCEMENTS

- **Progressive Web App (PWA):** Configure `manifest.json` and service workers to enable "Add to Home Screen" installation on iOS/Android.

- **Offline Attendance Scanning:** Utilize local storage (`IndexedDB` / `localStorage`) when network connectivity is poor, auto-syncing offline records to Supabase once connection is restored.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cb7e7937-5fa6-4c33-b55a-d920971d6844).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
