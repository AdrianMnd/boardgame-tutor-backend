# Project Inventory

Generated from the submitted frontend and backend ZIPs.

## Frontend

- 65 source files under `src/`
- React/Vite application
- Main UI areas: Header, Sidebar, Chat, Message, Sources, PDF Viewer, UI helpers
- Conversation state persisted in localStorage
- API communication through `src/services/apiClient.ts`

## Backend

- 168 source files under `src/`
- Express API
- File-based game repository
- PDF extraction/import pipeline
- RAG pipeline
- Multiple AI provider clients
- Vitest tests/fakes
- 4 game directories included in the ZIP

## Current API routes found in source

```text
GET  /
GET  /api/games
GET  /api/games/:id/manual
POST /api/chat
```

## Current static route

```text
/games/*
```

## Source-of-truth note

This inventory reflects the submitted ZIPs, not earlier versions discussed in the conversation.
