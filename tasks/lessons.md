# Lessons Learned

## Pattern: Always verify Supabase schema before writing code that depends on columns
**Date:** 2026-02-22
**Trigger:** "Could not start voice interview" error
**Root Cause:** API routes were inserting `config` jsonb field into `interview_sessions` table, but that column didn't exist in Supabase.
**Rule:** Before writing any INSERT/UPDATE that references a column, verify the column exists in the actual Supabase schema first. Never assume columns exist just because the code references them.
**Prevention:**
1. Run `SELECT * FROM table LIMIT 1` to check actual columns before writing routes
2. Add fallback logic for optional columns
3. Always test API routes with actual database calls, not just build checks

---

## Pattern: Check SDK API changes before using hooks
**Date:** 2026-02-22
**Trigger:** TypeScript error — `connectionType` missing in `startSession()` call
**Root Cause:** `@elevenlabs/react@0.14.0` requires `connectionType` as a mandatory parameter in `startSession()`, but the code was written against an older API shape.
**Rule:** After installing any SDK, check the actual TypeScript types or run `--help` equivalent before writing integration code.
**Prevention:**
1. Check `node_modules/@elevenlabs/react/dist/index.d.ts` for actual types
2. Test with a minimal example before building full UI

---

## Pattern: Don't trust "build passes" as proof of correctness
**Date:** 2026-02-22
**Trigger:** Build passed but runtime failed due to missing DB column
**Root Cause:** TypeScript/Next.js build checks code syntax and types, NOT runtime database schema.
**Rule:** "Build passes" ≠ "it works". Always verify with actual runtime tests (API calls, browser testing).
**Prevention:**
1. After build passes, always do a curl/fetch test against the actual API
2. Check server logs for runtime errors
3. Test the full user flow in the browser
