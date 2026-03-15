# Architecture Overview — English Diary App

This document shows an architecture overview for the English Diary app. The diagram highlights the Client, Server, and External Services layers, and the interactions for login, submitting a diary, AI proofreading (Gemini), and storing both original and corrected diaries in Cloud Firestore.

```mermaid
flowchart LR
  %% Layers
  subgraph Client["Client Side (Next.js)"]
    direction TB
    U[User]
    UI[Next.js<br/>UI — write diary]
  end

  subgraph Server["Server Side (Next.js Server Actions / API Routes)"]
    direction TB
    API[Next.js Server Actions / API Routes<br/>(validate, call AI, persist)]
    CheckLen{Check <= 100 words?}
  end

  subgraph External["External Services"]
    direction TB
    Auth[Firebase Authentication<br/>(Google Login)]
    Firestore[Cloud Firestore<br/>(diaries collection)]
    Gemini[Gemini API<br/>(proofreading)]
  end

  %% Authentication flow
  U -->|open app| UI
  UI -->|Sign in with Google| Auth
  Auth -->|idToken / credential| UI

  %% Diary submission & AI processing flow
  UI -->|submit diary text| API
  API -->|verify idToken| Auth
  API --> CheckLen
  CheckLen -- Yes --> |call| Gemini
  CheckLen -- No --> |return| API
  Gemini -->|proofread & corrections| API
  API -->|return proofread result| UI

  %% Persistence
  API -->|save { original, corrected, corrections, metadata }| Firestore
  UI -->|fetch/view saved diaries| Firestore

  %% Notes (visual)
  classDef ext fill:#f9f,stroke:#333,stroke-width:1px;
  class External ext
```

Summary of the main components and responsibilities:
- Client Side (Next.js)
  - Provide the UI for writing diaries and Google Sign-In using Firebase client SDK.
  - Send diary text (and auth token) to the server for processing.
- Server Side (Next.js Server Actions / API Routes)
  - Verify Firebase ID token (server-side) before processing or writing data.
  - Enforce the 100-word limit; reject or truncate if needed.
  - Call Gemini API with the diary text and receive proofread result + corrections.
  - Persist both original and corrected versions (plus correction metadata) to Cloud Firestore using a service account / Admin SDK.
  - Return the proofread result back to the client.
- External Services
  - Firebase Authentication: Google Login and ID token verification.
  - Cloud Firestore: Store diary documents.
  - Gemini API: Proofreading AI (server-side call; keep API key secret).

Example Firestore document (diaries collection)
```json
{
  "userId": "uid_abc123",
  "createdAt": "2026-03-14T12:34:56Z",
  "originalText": "I write my diary in english.",
  "correctedText": "I write my diary in English.",
  "corrections": [
    { "from": "english", "to": "English", "reason": "capitalization" }
  ],
  "wordCount": 5,
  "aiModel": "Gemini",
  "aiProcessedAt": "2026-03-14T12:34:57Z"
}
```

Notes and security considerations:
- Always call the Gemini API from server-side code to keep the API key secret.
- Verify Firebase ID tokens server-side (Firebase Admin SDK) before storing or returning user-specific data.
- Enforce/validate the 100-word limit on the server to avoid unexpected AI usage/costs.
