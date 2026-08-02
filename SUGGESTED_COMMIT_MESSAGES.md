# 📝 SmartFarm AI — Suggested Git Commit History

Use these structured commit messages when committing and pushing your repository to GitHub for TBI Internship grading.

---

## Week 6: Authentication & Security Commits

```text
feat(auth): implement bcrypt password hashing and user registration

- Add native bcrypt password hashing with gensalt and hashpw
- Implement UserCreate schema with strong password validation
- Add duplicate email and username check returning HTTP 400 Bad Request
- Add audit log entries for user registration events
```

```text
feat(auth): add JWT access tokens, refresh token rotation, and logout

- Implement OAuth2 Bearer token generation with 7-day expiration
- Add RefreshToken model with DB persistence and single-use rotation
- Implement POST /auth/logout revoking refresh tokens
- Add get_current_user and get_current_active_user FastAPI dependencies
```

```text
feat(oauth): integrate Google OAuth 2.0 authentication flow

- Add POST /auth/google endpoint for Google ID token verification
- Add GET /auth/google/login redirect URL generator
- Add GET /auth/google/callback for authorization code exchange
- Integrate frontend "Continue with Google" button and session sync
```

```text
security(middleware): add rate limiting, CORS, and security headers

- Implement 60 req/min IP rate limiting with Redis/in-memory cache
- Add brute-force login throttling (5 attempts per 5 mins)
- Apply CSP, HSTS, X-Frame-Options, X-Content-Type-Options headers
- Configure strict CORS origins for production deployment
```

```text
feat(frontend): implement AuthContext, route guards, and Axios interceptors

- Persist JWT access token and refresh token in LocalStorage
- Add Axios request interceptor injecting Bearer auth headers
- Add Axios response interceptor for automatic 401 token refresh
- Implement client-side route guarding for all dashboard pages
```

---

## Week 7: Google Gemini AI Integration & Prompt Engineering Commits

```text
feat(ai): integrate Google Gemini API in LLMService

- Configure GEMINI_API_KEY environment variable in backend config
- Add live REST API integration for gemini-1.5-flash and gemini-2.0-flash
- Implement 15-second timeout, rate limit (429) handling, and fallback logic
- Integrate local agronomist decision engine fallback for high availability
```

```text
feat(api): expose POST /api/ai/chat and POST /api/v1/ai/chat endpoints

- Register ai_router with FastAPI app under /api and /api/v1
- Update ChatMessageCreate schema to accept message, prompt, or query keys
- Persist AI chat conversations to ChatHistory database table
- Support guest queries and authenticated farmer session history
```

```text
docs(prompts): document prompt engineering iterations and PROMPTS.md

- Create PROMPTS.md detailing V1, V2, and V3 System Prompt evolution
- Document evaluation matrix across domain accuracy, latency, and tokens
- Add benchmark test cases across 5 agricultural domains
- Add prompt injection security and safety guardrails documentation
```

```text
feat(frontend): enhance Farmer AI Assistant UI with voice and error handling

- Update AIAssistant.tsx to connect to live /api/ai/chat endpoint
- Add animated loading indicators and error toast notifications
- Integrate Web Speech API voice recording and SpeechSynthesis TTS
- Format Markdown AI responses with headers, bold text, and bullet points
```

```text
test(qa): expand Pytest suite and verify Week 6 & 7 deliverables

- Fix test passwords to conform with strong password validation
- Verify all 23 unit tests pass successfully
- Update README.md with Week 7 AI architecture and API setup docs
- Add Postman collection and submission verification checklists
```
