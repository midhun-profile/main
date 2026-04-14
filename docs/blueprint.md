# **App Name**: FlexForm Studio

## Core Features:

- Section Lifecycle Management: Enable users to create, rename, and delete custom sections to organize their dynamic forms and data. Each section defines a unique data structure.
- Flexible Blueprint Configuration: Allow users to define, modify, and manage the input fields (blueprint) for each section, including field names and types (text, number, date, email).
- Dynamic Entry Handling: Facilitate the creation, editing, and deletion of individual data entries, rendering dynamic input forms based on the associated section's blueprint. Supports collapsible entries for organized viewing.
- Google Authentication & Secure Access: Implement user sign-in via Google and ensure all user-specific data (sections, blueprints, entries) is securely protected and accessible only to the authenticated user.
- Data Persistence with Firestore: Persist all application data (sections, field blueprints, and entries) reliably using Firebase Firestore, structured for user-specific access.
- Responsive and Animated User Interface: Deliver a fluid and responsive UI across devices with a sidebar navigation and off-canvas menu for mobile, incorporating subtle animations for a smooth user experience, alongside clear loading and empty states.
- AI-Powered Field Type Recommendation Tool: Assist users during blueprint creation by offering intelligent suggestions for field types (e.g., Text, Number, Date, Email) based on the user-provided field name, leveraging a generative AI tool to interpret input context.

## Style Guidelines:

- Primary color: A vibrant indigo (#4F46E5) to convey productivity and a modern, professional aesthetic. (HSL: 236, 62%, 59%)
- Background color: A subtle, heavily desaturated light grey (#F7F8FB), derived from the primary hue, providing a clean and understated canvas. (HSL: 236, 15%, 97%)
- Accent color: A clear sky-blue (#2685C6) to highlight interactive elements and provide emphasis, analogous to the primary color for a harmonious yet distinct visual. (HSL: 206, 70%, 45%)
- Headline and body font: 'Inter' (sans-serif) for its modern, legible, and versatile qualities across various content types. Note: currently only Google Fonts are supported.
- Utilize solid-style icons from Font Awesome for clear and professional visual representation of actions and data, maintaining consistency with existing elements.
- Implement an adaptive two-column layout for desktop interfaces, featuring a prominent sidebar for navigation. For mobile, transition to a stacked layout with an off-canvas menu for the sidebar. Content should be presented using a clean card-based structure.
- Maintain subtle, purposeful animations for sidebar transitions, collapsing content sections, and modal presentations, ensuring a fluid and intuitive user experience.