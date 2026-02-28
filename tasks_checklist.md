
# Development Checklist: 21st Century Interview Experience

## 1. Application Wizard Refinement
- [x] **Remove Manual Entry Tab**: Remove the explicit "Manual Entry" tab from the Candidate Info step.
- [x] **Ensure Fallback**: Keep the "Manual Text" logic as a fallback.
- [x] **Verify Import/Upload**: add defensive error handling for CV upload and Application creation. Fixed schema mismatch on backend.

## 2. UI/UX Overhaul ("21st Dev" Style)
- [x] **Global Theme**: Updated `InterviewInterface` to use dark mode, glassmorphism, and neon accents.
- [x] **Interview Interface**:
    - [x] Transformed to "Video Call" layout.
    - [x] Added "Voice Visualizer" animation.
    - [x] Added "Camera Preview".
    - [x] Improved typography and spacing.

## 3. Voice Realism (Audio)
- [x] **Voice Selection**: Implemented logic to auto-select best voice (Google US English etc.).
- [x] **Auto-Speak**: AI speaks automatically upon generating a question.
- [x] **Pitch/Rate Tweak**: Configured `SpeechSynthesisUtterance` for natural flow.

## 4. Interview Logic & Content
- [x] **Prompt Engineering**: Updated system prompt to be more conversational, reactive, and less robotic.
- [x] **Dynamic Questioning**: AI now instructed to follow up on vague answers.

## 5. End-to-End Testing
- [x] **Fix Creation Bug**: Resolved schema mismatch in `/api/applications/create` causing "Failed to create application".
- [x] **Error Handling**: Improved frontend error toasts for better debugging.

