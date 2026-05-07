# Couple's Verdict (커플의 판결)

## Overview
A web application where couples can submit their arguments and let the public decide who is right. The app features a modern, interactive interface built with Web Components and modern CSS.

## Features & Capabilities
*   **Mode Switching:** Clear navigation between "Create Question" (질문 생성하기) and "Vote" (투표하기) modes.
*   **Create Question:**
    *   Input fields for Person A and Person B's perspectives.
    *   Toggle for gender disclosure with intuitive "남" (Male) and "여" (Female) buttons for each party.
    *   Vibrant, animated submission process.
*   **Voting System:**
    *   Interactive cards for each dispute.
    *   Real-time vote counting and percentage visualization (animated progress bars).
    *   Visual feedback after voting (thank you message, disabled buttons).
    *   Delete functionality for disputes (allows removing content).
*   **Design & Aesthetics:**
    *   "Premium" feel with subtle textures and multi-layered shadows.
    *   Vibrant color palette (using OKLCH for perceptually uniform colors).
    *   Responsive design using Container Queries and Flexbox/Grid.
    *   Interactive hover states and glow effects for buttons.

*   **VoteList:**
    *   Dynamic reconciliation of cards using a `Map` (id -> element).
    *   Preserves component state and prevents redundant re-renders of existing cards.
*   **VoteCard:**
    *   Contextual display of arguments and gender information.
    *   Conditional animation: only animates percentages on the initial vote.
    *   Accessibility-ready progress bars with `aria-valuenow`.

## Project Structure
*   `index.html`: Main entry point, layout shell, and Web Component templates.
*   `style.css`: Global styles, layout variables, and component-specific styles using Cascade Layers.
*   `main.js`: Application logic, state management (AppState), and Web Component definitions.
*   `blueprint.md`: This document.

## Implementation Details
### State Management
The `AppState` class handles the core logic:
*   `questions`: Array of dispute objects.
*   `addQuestion()`: Adds a new dispute to the top.
*   `vote()`: Updates vote counts and sets the `voted` flag (prevents multiple votes).
*   `deleteQuestion()`: Removes a dispute from state and triggers re-render.
*   `localStorage`: Persists data across sessions.

### DOM Reconciliation
The `VoteList` component implements a basic reconciliation algorithm to efficiently update the list of disputes without destroying and re-creating existing DOM nodes.

## Final Polishing & Deployment
*   **Refined UI:** Improved gender selection buttons next to party labels.
*   **Bug Fixes:** Resolved inefficient rendering and animation triggers.
*   **Deployment:** Ready for Git commit and deployment.
