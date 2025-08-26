---
title: Error Reference
description: Complete guide to error handling in Massimo clients
---

Massimo provides detailed error information to help you handle failures gracefully. This guide covers all error types and how to handle them.

## Error Codes

Massimo clients use specific error codes to identify different failure scenarios:

| Error Code                            | Description                       | Common Causes                                 |
| ------------------------------------- | --------------------------------- | --------------------------------------------- |
| `PLT_MASSIMO_OPTIONS_URL_REQUIRED`    | URL is required in client options | Missing or undefined URL when creating client |
| `PLT_MASSIMO_FORM_DATA_REQUIRED`      | FormData object required          | Multipart/form-data request without FormData  |
| `PLT_MASSIMO_MISSING_PARAMS_REQUIRED` | Missing required path parameter   | URL path parameter not provided               |
| `PLT_MASSIMO_WRONG_OPTS_TYPE`         | Wrong option type provided        | Invalid type for client configuration option  |
| `PLT_MASSIMO_INVALID_RESPONSE_SCHEMA` | Response validation failed        | Response missing required status code         |
| `PLT_MASSIMO_INVALID_CONTENT_TYPE`    | Invalid content type in response  | Server returned unexpected content type       |
| `PLT_MASSIMO_INVALID_RESPONSE_FORMAT` | Response doesn't match schema     | Response body doesn't match OpenAPI schema    |
| `PLT_MASSIMO_UNEXPECTED_CALL_FAILURE` | Unexpected request failure        | Network error or server unavailable           |
