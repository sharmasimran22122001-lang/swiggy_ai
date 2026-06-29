This should be a detailed engineering playbook.

Include:

Overall architecture.
Folder structure.
Backend design.
State management.
API contracts.
JSON schemas.
Error handling.
Logging.
Environment configuration.
Security practices.
Gemini integration.
Retrieval flow.
Prompt construction.
Caching strategy.
Testing strategy.

Explicit rules such as:

API keys must never be stored in the client.
Gemini is never called directly from the frontend.
Retrieval always happens before prompting the LLM.
Prompts must be version-controlled.
Every backend endpoint returns typed JSON.
UI never parses raw LLM text.