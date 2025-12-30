# API Examples

This document provides examples for testing the Pastebin Lite API.

## Health Check

```bash
curl http://localhost:3000/api/healthz
```

**Expected Response:**
```json
{"ok":true}
```

## Create a Simple Paste

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello, World!"}'
```

**Expected Response:**
```json
{
  "id": "abc123xyz",
  "url": "http://localhost:3000/p/abc123xyz"
}
```

## Create a Paste with TTL (1 hour)

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"This paste expires in 1 hour","ttl":3600}'
```

## Create a Paste with Max Views

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"This paste can only be viewed 5 times","max_views":5}'
```

## Create a Paste with Both TTL and Max Views

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Expires after 1 hour OR 10 views","ttl":3600,"max_views":10}'
```

## Get a Paste by ID

Replace `{id}` with the actual paste ID:

```bash
curl http://localhost:3000/api/pastes/{id}
```

**Expected Response:**
```json
{
  "content": "Hello, World!",
  "remaining_views": null,
  "expires_at": null
}
```

## View a Paste in Browser

Open in your browser:
```
http://localhost:3000/p/{id}
```

## Testing with Deterministic Time (TEST_MODE)

Set `TEST_MODE=1` in your environment, then use the `x-test-now-ms` header:

```bash
# Current timestamp: 1704110400000 (2024-01-01 12:00:00 UTC)
# Create a paste that expires in 60 seconds
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -H "x-test-now-ms: 1704110400000" \
  -d '{"content":"Test paste","ttl":60}'

# Response will include the paste ID
# Now fetch it 61 seconds later (should be expired)
curl http://localhost:3000/api/pastes/{id} \
  -H "x-test-now-ms: 1704110461000"

# Expected: 404 Not Found
```

## Error Cases

### Invalid Content (Empty)

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":""}'
```

**Expected Response (400):**
```json
{"error":"Content cannot be empty"}
```

### Invalid TTL

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","ttl":-1}'
```

**Expected Response (400):**
```json
{"error":"TTL must be a positive number (seconds)"}
```

### Invalid Max Views

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","max_views":0}'
```

**Expected Response (400):**
```json
{"error":"max_views must be a positive integer"}
```

### Paste Not Found

```bash
curl http://localhost:3000/api/pastes/nonexistent
```

**Expected Response (404):**
```json
{"error":"Paste not found"}
```

## Testing View Limits

```bash
# Create a paste with max 3 views
PASTE_RESPONSE=$(curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Limited views","max_views":3}')

PASTE_ID=$(echo $PASTE_RESPONSE | jq -r '.id')

# View it 3 times
curl http://localhost:3000/api/pastes/$PASTE_ID  # remaining_views: 2
curl http://localhost:3000/api/pastes/$PASTE_ID  # remaining_views: 1
curl http://localhost:3000/api/pastes/$PASTE_ID  # remaining_views: 0

# Try to view it again (should fail with 404)
curl http://localhost:3000/api/pastes/$PASTE_ID  # 404 Not Found
```

## Performance Testing

```bash
# Create 100 pastes
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/pastes \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"Test paste $i\"}" &
done
wait
```
