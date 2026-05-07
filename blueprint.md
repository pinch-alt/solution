# Couple's Verdict (커플의 판결)

## Overview
A web application where couples can submit their arguments and let the public decide who is right. The app features a modern, interactive interface built with Web Components and modern CSS.

## Features & Capabilities
*   **Mode Switching:** Clear navigation between "Create Question" (질문 생성하기) and "Vote" (투표하기) modes.
*   **Create Question:**
    *   Input fields for Person A and Person B's perspectives.
    *   Toggle for gender disclosure (e.g., "A: Male, B: Female" or "Anonymous").
    *   Vibrant, animated submission process.
*   **Voting System:**
    *   Interactive cards for each dispute.
    *   Real-time vote counting and percentage visualization (animated progress bars).
    *   Visual feedback after voting (thank you message, disabled buttons).
*   **Design & Aesthetics:**
    *   "Premium" feel with subtle textures and multi-layered shadows.
    *   Vibrant color palette (using OKLCH for perceptually uniform colors).
    *   Responsive design using Container Queries and Flexbox/Grid.
    *   Interactive hover states and glow effects.

## Project Structure
*   `index.html`: Main entry point and layout shell.
*   `style.css`: Global styles, layout variables, and component-specific styles using Cascade Layers.
*   `main.js`: Application logic, state management, and Web Component definitions.
*   `blueprint.md`: This document.

## Implementation Plan
1.  **Phase 1: Foundation & Styling**
    *   Set up CSS variables and OKLCH color palette.
    *   Define global layout with mode switching logic.
2.  **Phase 2: Web Components Development**
    *   `AppHeader`: Navigation and branding.
    *   `QuestionForm`: The "Create Question" view.
    *   `VoteList`: The "Vote" view containing multiple `VoteCard` components.
    *   `VoteCard`: Individual dispute card with voting logic and results display.
3.  **Phase 3: State Management & Persistence**
    *   In-memory store for questions.
    *   `localStorage` integration for data persistence.
4.  **Phase 4: Polish & Validation**
    *   Add animations and transitions.
    *   Ensure accessibility (A11Y) compliance.
    *   Verify cross-device responsiveness.
