# The Response Contract

Every HTTP response this API produces has one of two shapes. There is no
third, and there are no per-endpoint exceptions.

| | Shape | Content-Type |
|---|---|---|
| **2xx** | `{ "data": …, "meta": { … } }` | `application/json` |
| **4xx / 5xx** | RFC 7807 Problem Details | `application/problem+json` |
| **204** | no body at all | — |

This document is the specification for the Django/DRF backend. The mock
server in [`mock/server.ts`](../../mock/server.ts) already implements it, so
it is also an executable reference: run `bun run mock` and read the wire.

> This supersedes [general.md §3](general.md#3-envelopes) and
> [§6](general.md#6-errors), which described bare payloads and DRF's default
> error body. Those sections now point here.

---

## 1. Why two shapes and not one

The earlier decision was to return single resources bare, on the grounds that
a wrapper is "a field to unwrap on every one of 61 endpoints." That objection
was correct about the cost and wrong about where the cost lands. The frontend
reaches the network through exactly one function — `apiFetch` in
[`src/hooks/use-api.ts`](../../src/hooks/use-api.ts) — so the envelope is
unwrapped in one place, once. No hook and no screen ever names it.

What the envelope buys, that a bare payload cannot:

- **A place for things that are about the response rather than in it.**
  `requestId` is the obvious one: a user pastes it into a bug report and the
  log line is findable. It does not belong inside a `Course`.
- **Paging that does not collide with the resource.** A bare list has nowhere
  to put `count` without wrapping; a bare object cannot be paged at all.
- **One parser.** A client that knows every 2xx is `{data, meta}` and every
  non-2xx is a problem needs two branches total, not sixty-one.

RFC 7807 is chosen for errors over a hand-rolled shape for the same reason
DRF's pagination was chosen over a custom one: it is the thing other tools
already understand. Its `type` member gives every failure mode a stable,
dereferenceable identity — which a bare `{"detail": "…"}` never had.

---

## 2. The success envelope

```jsonc
{
  "data": { "id": "inv-2", "number": "INV-4402", "amount": "48500.00" },
  "meta": {
    "requestId": "01JT3KQ8ZH2N4V7WXY9C6BMDPA",
    "timestamp": "2026-08-04T11:20:33Z"
  }
}
```

### 2.1 `data`

The resource, and nothing else. Whatever the endpoint's documented response
type is — `StudentDashboardResponse`, `Invoice`, `CourseOffering[]` — goes
here verbatim.

- A single resource → an object.
- A collection → an array.
- A screen-shaped payload → the object that screen's contract names.

`data` is **never** omitted on a 2xx. An endpoint with nothing to return uses
`204 No Content` and no body, not `{"data": null}`.

### 2.2 `meta`

| Member | Required | Meaning |
|---|---|---|
| `requestId` | yes | Opaque per-request id. Also sent as the `X-Request-Id` header — the two must match. |
| `timestamp` | no | RFC 3339 UTC instant, the server's clock at response time. Useful for clock-skew and cache-age debugging. |
| `pagination` | only when paged | See §2.3. Absent means "this is the whole thing." |

`meta` carries no business data. If a value is something the screen renders,
it belongs in `data`. The test: would you still send it if the request
succeeded but the user closed the tab? If yes, it is `meta`.

Adding a member to `meta` is backwards-compatible. Adding one to `data` is a
change to that endpoint's contract.

### 2.3 `meta.pagination`

Two forms, discriminated by which members are present.

**Page-number** — the default, for anything with a stable row order:

```jsonc
{
  "data": [ { "id": "usr-1" }, { "id": "usr-2" } ],
  "meta": {
    "requestId": "01JT3K…",
    "pagination": {
      "count": 240,
      "next": "https://api.unigpt.edu/api/admin/users/?page=3&page_size=20",
      "previous": "https://api.unigpt.edu/api/admin/users/?page=1&page_size=20"
    }
  }
}
```

`next` and `previous` are absolute URLs, or `null` at the edges. The client
passes them back verbatim and never rebuilds them from a page number.

**Cursor** — for feeds where rows are inserted while the user pages (forum
threads, payment history, the AI conversation list). Offset paging on a live
feed either skips a row or shows it twice:

```jsonc
{
  "data": [ { "id": "th-9" }, { "id": "th-8" } ],
  "meta": {
    "requestId": "01JT3K…",
    "pagination": { "nextCursor": "cD0yMDI2LTA4LTA0" }
  }
}
```

`nextCursor` is opaque. The client sends it back as `?cursor=`. `null` means
the end of the feed.

**Bounded lists are not paged.** Six metrics, five timetable slots, four
installment steps — these ship as plain arrays inside the screen payload,
with no `meta.pagination`. Paginating them is ceremony.

### 2.4 A screen payload that contains a paged list

Some admin screens need collection-wide figures alongside one page of rows —
"240 users, 12 suspended" is computed over the whole table, not the page. The
rows still page; the metrics do not.

```jsonc
{
  "data": {
    "metrics": [ { "label": "Total users", "value": "240", "tone": "brand" } ],
    "results": [ { "id": "usr-1" }, { "id": "usr-2" } ]
  },
  "meta": {
    "requestId": "01JT3K…",
    "pagination": { "count": 240, "next": "…", "previous": null }
  }
}
```

The list lives under `data.results` and the paging stays in `meta`. Do not
duplicate `count`/`next`/`previous` into `data`.

---

## 3. Errors: RFC 7807 Problem Details

Every non-2xx response is a problem document, served as
`application/problem+json`.

```jsonc
{
  "type": "https://api.unigpt.edu/problems/seat-unavailable",
  "title": "Conflict",
  "status": 409,
  "detail": "CS-401 Section B filled while you were deciding.",
  "instance": "/api/student/academic/registration/courses/",
  "code": "seat_unavailable",
  "requestId": "01JT3KQ8ZH2N4V7WXY9C6BMDPA"
}
```

### 3.1 The standard members

| Member | Required | Rule |
|---|---|---|
| `type` | yes | Absolute URI identifying the *kind* of problem. `about:blank` when the status alone says everything. |
| `title` | yes | Short human summary. **Stable per `type`** — it must not vary with the occurrence. |
| `status` | yes | Repeats the HTTP status, so a logged problem is self-contained. |
| `detail` | no | This occurrence, in prose. Safe to show a user. Never contains a stack trace, a SQL fragment, or another user's data. |
| `instance` | no | Path of the request that failed. |

`title` vs `detail` is the member pair people get wrong. `title` answers "what
class of thing went wrong" and is the same string every time for a given
`type`. `detail` answers "what happened to *this* request" and names the
course, the amount, the field.

### 3.2 Our extension members

RFC 7807 §3.2 permits additional members. We define four, and the contract for
each endpoint may define more.

| Member | When | Meaning |
|---|---|---|
| `code` | whenever the failure is branchable | Machine-readable reason, `snake_case`. **The only member a client is allowed to branch on.** |
| `errors` | 422 only | Array of per-field rejections. See §3.3. |
| `requestId` | always | Same value as `X-Request-Id` and as `meta.requestId` on the success path. |
| *endpoint-specific* | as documented | e.g. `retryAfter` on 429, `blockedReason` on an admit-card 403. Declare it in that endpoint's contract. |

**Never branch on `title` or `detail`.** They are copy. Copy gets rewritten,
translated, and shortened without a version bump. `code` is the API surface;
the prose is not.

`type` is derived from `code`: `seat_unavailable` →
`https://api.unigpt.edu/problems/seat-unavailable`. When there is no `code`,
`type` is `about:blank`.

### 3.3 Field validation — `422` and the `errors` array

A request that is well-formed but semantically rejected returns **422**, with
one entry per rejection:

```jsonc
{
  "type": "https://api.unigpt.edu/problems/validation-failed",
  "title": "Validation failed",
  "status": 422,
  "detail": "2 fields were rejected.",
  "instance": "/api/faculty/profile/",
  "code": "validation_failed",
  "errors": [
    { "field": "phone",       "code": "invalid",         "detail": "Enter a valid phone number." },
    { "field": "officeRoom",  "code": "read_only_field", "detail": "The registrar owns this field." }
  ],
  "requestId": "01JT3K…"
}
```

| Member | Rule |
|---|---|
| `field` | Dotted path into the request body: `scores.2.points`, not just `scores`. Matches the request's own casing — camelCase on the wire. |
| `code` | Machine-readable: `blank`, `invalid`, `required`, `min_value`, `max_value`, `read_only_field`, `not_found`, `duplicate`. |
| `detail` | Human-readable, already localised. Rendered under the input. |

An **array, not an object keyed by field**, for three reasons: one field can
fail twice (`min_value` *and* `invalid`), the order is the order the form
should surface them in, and every entry gets its own machine `code` — which a
`{field: ["message"]}` map cannot carry.

`400` vs `422`: **400** means the request itself was malformed — unparseable
JSON, a missing body, a bad `Content-Type`. **422** means it parsed fine and
the values were wrong. If you are attaching an `errors` array, it is a 422.

### 3.4 `about:blank` and the hops that are not us

A reverse proxy timing out, a load balancer 502, a dropped connection — none
of these reach Django, so none of them can produce a problem document. The
client treats any non-2xx it cannot parse as
`{type: "about:blank", title: "Request failed with <status>", status}` and
falls back to status-derived copy. Nothing needs to be done server-side; this
is documented so the fallback is not mistaken for a contract violation.

### 3.5 Status codes

| Status | Means | Carries | Frontend does |
|---|---|---|---|
| `400` | Malformed request | `detail` | Generic error state |
| `401` | Token missing, expired, or invalid | `code: "token_not_valid"` | `apiFetch` refreshes once and retries, then signs out |
| `403` | Authenticated, not permitted | `code`, `detail` | Renders `detail` — it says *why*, and there are six different whys |
| `404` | No such resource | `detail` | Empty state, not an error state |
| `409` | Conflict with current state | `code` **required** | Toast + refetch; **rolls back an optimistic update** |
| `422` | Well-formed, semantically rejected | `errors` | Field errors under the inputs |
| `429` | Rate limited (AI endpoints) | `retryAfter` | Disables the trigger, shows the window |
| `5xx` | Ours | `detail`, `requestId` | Retry with backoff, then error state |

409 is the one that must always carry a `code`. It is the status the
optimistic-UI rollback path branches on, and "conflict" alone does not tell a
screen whether to refetch the seat map or re-read the settings version.

### 3.6 Problem code registry

Every `code` in use today. Adding one means adding a row here.

| `code` | Status | Raised when |
|---|---|---|
| `validation_failed` | 422 | Any request with field-level rejections |
| `token_not_valid` | 401 | Access token missing, expired, or unparseable |
| `seat_unavailable` | 409 | Registering for a section with no seats left |
| `duplicate` | 409 | Registering for a section already in the cart |
| `drop_closed` | 409 | Dropping a course past the deadline |
| `read_only_field` | 403 | Writing a registrar-owned profile field |
| `duplicate_email` | 409 | Creating a user with an email already on file |
| `current_session` | 409 | Revoking the session making the request |
| `stale_version` | 409 | Settings `PUT` with an out-of-date `version` |
| `locked` | 409 | Editing a marks sheet after publication |
| `incomplete` | 409 | Publishing marks with rows still unfilled |
| `hall_clash` | 409 | Assigning a hall already booked for that sitting |
| `already_decided` | 409 | Re-deciding a decided admission application |
| `mock_failure` | any | Injected by `?_fail=` — mock server only, never production |

---

## 4. Implementing it in DRF

Three pieces. None of them touch a view.

### 4.1 The renderer — wraps every 2xx

```python
# api/renderers.py
from rest_framework.renderers import JSONRenderer


class EnvelopeJSONRenderer(JSONRenderer):
    """Wrap every successful payload in {data, meta}.

    Error responses are already problem documents by the time they reach a
    renderer (see exception_handler below), so they pass through untouched.
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context["response"]
        request = renderer_context["request"]

        if response.status_code >= 400:
            return super().render(data, accepted_media_type, renderer_context)

        meta = {
            "requestId": request.request_id,
            "timestamp": timezone.now().isoformat().replace("+00:00", "Z"),
        }
        # The pagination class stashes this; see 4.2.
        pagination = getattr(response, "pagination_meta", None)
        if pagination is not None:
            meta["pagination"] = pagination

        return super().render(
            {"data": data, "meta": meta}, accepted_media_type, renderer_context
        )
```

`request.request_id` comes from a middleware that generates a ULID per
request, attaches it, and sets the `X-Request-Id` response header. If a
trusted upstream proxy already sent one, reuse it — that is how a request is
correlated across services.

### 4.2 The pagination classes — move paging into `meta`

```python
# api/pagination.py
from rest_framework.pagination import CursorPagination, PageNumberPagination
from rest_framework.response import Response


class EnvelopePageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        # `data` is the page of rows. It becomes the envelope's `data`; the
        # paging goes on the response for the renderer to pick up.
        response = Response(data)
        response.pagination_meta = {
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
        }
        return response


class EnvelopeCursorPagination(CursorPagination):
    page_size = 20
    ordering = "-created_at"

    def get_paginated_response(self, data):
        response = Response(data)
        response.pagination_meta = {"nextCursor": self._cursor_from(self.get_next_link())}
        return response
```

For the §2.4 case — a screen payload that contains the page — build the
payload in the view and set `response.pagination_meta` yourself:

```python
page = self.paginate_queryset(self.filter_queryset(self.get_queryset()))
response = Response({
    "metrics": collection_metrics(),          # over the whole queryset
    "results": UserRowSerializer(page, many=True).data,
})
response.pagination_meta = {
    "count": self.paginator.page.paginator.count,
    "next": self.paginator.get_next_link(),
    "previous": self.paginator.get_previous_link(),
}
return response
```

Note that the metrics are computed over the **queryset**, not the page. That
is the whole reason this shape exists.

### 4.3 The exception handler — one function, every error

```python
# api/exceptions.py
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import ValidationError

PROBLEM_BASE = "https://api.unigpt.edu/problems"

TITLES = {
    400: "Bad request", 401: "Not authenticated", 403: "Forbidden",
    404: "Not found",   409: "Conflict",          422: "Validation failed",
    429: "Too many requests", 500: "Server error",
}


def flatten(detail, prefix=""):
    """DRF nests ValidationError arbitrarily. Flatten to dotted field paths."""
    if isinstance(detail, dict):
        for key, value in detail.items():
            yield from flatten(value, f"{prefix}{key}." if prefix else f"{key}.")
    elif isinstance(detail, list):
        for i, value in enumerate(detail):
            if isinstance(value, (dict, list)):
                yield from flatten(value, f"{prefix.rstrip('.')}.{i}.")
            else:
                yield prefix.rstrip("."), getattr(value, "code", "invalid"), str(value)
    else:
        yield prefix.rstrip("."), getattr(detail, "code", "invalid"), str(detail)


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        return None  # let Django's 500 handling take it

    request = context["request"]
    status = response.status_code
    errors, code, detail = [], None, None

    if isinstance(exc, ValidationError):
        errors = [
            {"field": field, "code": err_code, "detail": message}
            for field, err_code, message in flatten(exc.detail)
        ]
        status = 422
        code = "validation_failed"
        detail = f"{len(errors)} field{' was' if len(errors) == 1 else 's were'} rejected."
    else:
        body = response.data if isinstance(response.data, dict) else {}
        detail = str(body.get("detail")) if body.get("detail") else None
        code = getattr(exc, "code", None) or body.get("code")

    problem = {
        "type": f"{PROBLEM_BASE}/{code.replace('_', '-')}" if code else "about:blank",
        "title": TITLES.get(status, f"HTTP {status}"),
        "status": status,
        **({"detail": detail} if detail else {}),
        "instance": request.path,
        **({"code": code} if code else {}),
        **({"errors": errors} if errors else {}),
        "requestId": request.request_id,
    }

    response.data = problem
    response.status_code = status
    response.content_type = "application/problem+json"
    return response
```

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["api.renderers.EnvelopeJSONRenderer"],
    "DEFAULT_PAGINATION_CLASS": "api.pagination.EnvelopePageNumberPagination",
    "EXCEPTION_HANDLER": "api.exceptions.exception_handler",
}
```

To raise a coded conflict from a view:

```python
class SeatUnavailable(APIException):
    status_code = 409
    default_detail = "No seats remaining."
    code = "seat_unavailable"
```

### 4.4 What is deliberately *not* enveloped

- **`204 No Content`** — no body, so nothing to wrap.
- **Server-Sent Events** (`/api/student/ai/chat/stream/`) — `text/event-stream`
  is a different transport. Each event's `data:` line is a bare JSON object.
  Errors mid-stream arrive as an `event: error` frame whose payload *is* a
  problem document, so the shape is still the one the client knows.
- **File downloads** — a pre-signed URL redirect or a binary body. The JSON
  response that *hands out* the URL is enveloped; the bytes are not.

`POST /api/token/` and `POST /api/token/refresh/` **are** enveloped, despite
being SimpleJWT's own views. Subclass them so the renderer applies —
otherwise the one request made before a session exists is the one request with
a different shape, which is exactly the wrong exception to make.

---

## 5. What the frontend already does

Nothing in a screen or a feature hook names the envelope. Two functions in
[`src/hooks/use-api.ts`](../../src/hooks/use-api.ts) absorb the whole
contract:

```ts
// Strips {data, meta}; folds meta.pagination back onto the rows so a caller
// gets one object instead of two.
function unwrap<T>(raw: unknown): T

// Parses the problem, falling back to about:blank for anything that never
// reached the application.
class ApiError extends Error {
  status: number
  problem: Problem
  get code(): string | undefined      // branch on this
  get detail(): string | undefined    // render this
  fieldError(field: string): string | undefined
}
```

So a screen handling a rejection reads:

```tsx
const error = save.error instanceof ApiError ? save.error : null
const stale = error?.code === 'stale_version'
…
{error?.fieldError('phone') ?? error?.detail ?? 'Could not save your changes.'}
```

Types live in [`src/types/common.ts`](../../src/types/common.ts): `Envelope<T>`,
`Meta`, `Pagination`, `Problem`, `FieldError`.

---

## 6. Checklist

Per endpoint, before calling it done:

- [ ] 2xx body is `{data, meta}`; `data` holds exactly the documented type.
- [ ] `meta.requestId` is present and equals the `X-Request-Id` header.
- [ ] Paged? `meta.pagination` present, rows in `data` (or `data.results`),
      no paging fields duplicated into `data`.
- [ ] Not paged? No `meta.pagination` at all — not `null`, absent.
- [ ] Every failure is `application/problem+json` with `type`, `title`, `status`.
- [ ] Every branchable failure has a `code`, and that code is in the §3.6 registry.
- [ ] Field rejections are 422 with an `errors` array; `field` is a dotted
      camelCase path matching the request body.
- [ ] `detail` leaks no stack trace, no SQL, no other user's data.
- [ ] `title` is identical across every occurrence of that `type`.

Verify against the mock, which asserts all of the above:

```bash
bun run mock:test
```
