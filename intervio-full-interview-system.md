# Intervio Full AI Interview System Specification

## Product Overview

Intervio is an AI-powered job-specific interview simulation platform.

Instead of generic interview practice, Intervio simulates realistic interviews based on:

- a real job posting
- the candidate's CV or LinkedIn profile

The goal is to help candidates understand their real hiring chances before attending an actual interview.

---

# Core Product Flow

1. User opens Intervio
2. User pastes a LinkedIn job posting link
3. User uploads their CV or LinkedIn profile
4. System parses the job description
5. System parses the CV
6. System compares job requirements with the CV
7. AI generates a structured interview plan
8. AI conducts the interview
9. System evaluates answers
10. System calculates interview score
11. System calculates hire probability
12. Results are displayed in a popup
13. User can share their results

---

# Job Description Parsing

The system extracts structured information from the job posting.

Extracted fields:

- role_title
- seniority_level
- required_skills
- preferred_skills
- technologies
- responsibilities
- years_of_experience
- domain

---

# CV Parsing

The system extracts structured information from the candidate's CV.

Extracted fields:

- skills
- projects
- past_roles
- technologies
- experience_duration
- domain_knowledge

---

# Job–CV Matching

The system compares the job posting with the CV.

Outputs:

- matching_skills
- missing_skills
- experience_match_score

This information influences interview questions.

---

# Interview Plan Generation

Before the interview begins, the system generates a structured interview plan.

The plan includes:

- focus_skills
- technical_questions
- behavioral_questions
- CV_based_questions
- gap_questions

---

# AI Interview Behavior Rules

The AI must simulate a professional interviewer.

Rules:

- Ask one question at a time
- Wait for the candidate response
- Ask follow-up questions
- Reference the job description
- Reference the candidate CV
- Challenge vague answers
- Maintain professional interviewer tone

---

# Interview Structure

Interview stages:

1. Greeting
2. Background questions
3. Technical questions
4. Follow-up probing
5. Behavioral questions
6. Candidate questions
7. Closing

---

# Interview Duration

Expected interview duration: 12–18 minutes

---

# Number of Questions

Each interview should contain: 8–10 questions

Questions may include follow-up probes.

---

# Interview Scoring System

Each interview produces a score from 0 to 100.

Score categories and weights:

CV Match:      25%
Technical:     30%
Communication: 15%
Confidence:    10%
Behavioral:    20%

---

# Interview Score Calculation

Interview Score =
(CV Match × 0.25) + (Technical × 0.30) + (Communication × 0.15) + (Confidence × 0.10) + (Behavioral × 0.20)

---

# Hire Probability Calculation

0–49  → Score × 0.60
50–69 → Score × 0.75
70–84 → Score × 0.85
85+   → Score × 0.92

---

# Result Popup

After the interview, show a result modal with:
- Interview Score (0-100)
- Sub-scores: CV Match, Technical Depth, Communication, Confidence, Behavioral
- Estimated Hire Probability
- AI Feedback text

---

# Social Sharing Feature

Users can share their interview results.

Example:
"I simulated a real job interview with AI.
Role: Software Engineer | Score: 84 | Hire Probability: 68%
Try it → Intervio"

---

# Product Goal

Simulate real interviews for real job postings.
Help candidates understand their real hiring probability before their real interview.
