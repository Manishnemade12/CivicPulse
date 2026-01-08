# 07.2 Input validation + global error format

## Goal

Prevent bad data and keep frontend error handling simple.

## Backend requirements

- Add Bean Validation annotations on request DTOs
- Add global exception handler that maps:
  - validation errors → `VALIDATION_ERROR`
  - not found → `NOT_FOUND`
  - forbidden → `FORBIDDEN`

## Standard error shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      { "field": "title", "message": "must not be blank" }
    ]
  }
}
```

## Acceptance criteria

- Frontend can show `error.message` reliably
