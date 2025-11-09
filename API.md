# API Reference

This document describes the REST API endpoints provided by the Neumes Secrétaire backend.

## Base URL

```
http://localhost:3001/api
```

## Rate Limiting

- **General API endpoints**: 100 requests per 15 minutes per IP
- **Upload endpoints**: 50 requests per 15 minutes per IP

Exceeding these limits will result in a 429 (Too Many Requests) response.

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "message": "Neumes Secrétaire API is running"
}
```

---

### Upload Image

Upload a medieval manuscript image.

**Endpoint:** `POST /api/upload-image`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `image` (file, required): Image file to upload
  - Supported formats: JPG, PNG, WebP, GIF, etc.
  - Maximum size: 25MB

**Success Response (200):**
```json
{
  "success": true,
  "filename": "image-1234567890-123456789.jpg",
  "path": "/uploads/image-1234567890-123456789.jpg",
  "size": 1048576,
  "mimetype": "image/jpeg"
}
```

**Error Response (400):**
```json
{
  "error": "No image file provided"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to upload image"
}
```

---

### Transcribe Audio

Transcribe audio to Latin text using OpenAI Whisper.

**Endpoint:** `POST /api/transcribe`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `audio` (file, required): Audio file to transcribe
  - Supported formats: MP3, MP4, WAV, WebM, etc.
  - Maximum size: 25MB
- `context` (string, optional): Additional context for transcription

**Success Response (200):**
```json
{
  "success": true,
  "text": "punctum virga clivis",
  "language": "la"
}
```

**Error Response (400):**
```json
{
  "error": "No audio file provided"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to transcribe audio",
  "details": "Invalid API key"
}
```

**Transcription Details:**
- Model: `whisper-1`
- Language: Latin (`la`)
- Optimized prompt includes medieval manuscript terminology:
  - Neumes: punctum, virga, pes, clivis, scandicus, climacus, porrectus, torculus
  - Manuscript types: graduale, antiphonale, responsoria

---

### Mark and Transcribe

Combined endpoint for marking with simultaneous transcription.

**Endpoint:** `POST /api/mark-and-transcribe`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `audio` (file, required): Audio file to transcribe
  - Supported formats: MP3, MP4, WAV, WebM, etc.
  - Maximum size: 25MB
- `markData` (string, optional): JSON string containing mark coordinates and metadata
- `context` (string, optional): Additional context for transcription

**markData Format:**
```json
{
  "type": "underline",
  "points": [
    { "x": 100, "y": 200 },
    { "x": 150, "y": 200 },
    { "x": 200, "y": 200 }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "transcription": {
    "text": "punctum virga",
    "language": "la"
  },
  "marking": {
    "type": "underline",
    "points": [
      { "x": 100, "y": 200 },
      { "x": 150, "y": 200 },
      { "x": 200, "y": 200 }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "error": "No audio file provided"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to process marking and transcription",
  "details": "Error message"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request - Invalid or missing parameters |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server-side error |

---

## Security

### Path Validation
All file paths are validated to ensure they remain within the designated uploads directory, preventing path traversal attacks.

### Rate Limiting
Rate limiting is enforced on all endpoints to prevent abuse:
- General API: 100 requests per 15 minutes
- Upload endpoints: 50 requests per 15 minutes

### File Size Limits
- Maximum file size: 25MB (enforced by multer)
- This matches OpenAI Whisper API limits

---

## cURL Examples

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Upload Image
```bash
curl -X POST http://localhost:3001/api/upload-image \
  -F "image=@manuscript.jpg"
```

### Transcribe Audio
```bash
curl -X POST http://localhost:3001/api/transcribe \
  -F "audio=@recording.webm" \
  -F "context=Neume notation"
```

### Mark and Transcribe
```bash
curl -X POST http://localhost:3001/api/mark-and-transcribe \
  -F "audio=@recording.webm" \
  -F 'markData={"type":"underline","points":[{"x":100,"y":200}]}' \
  -F "context=Medieval notation"
```

---

## Client Libraries

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

// Upload image
const formData = new FormData();
formData.append('image', imageFile);
const response = await axios.post('/api/upload-image', formData);

// Transcribe audio
const audioData = new FormData();
audioData.append('audio', audioBlob);
audioData.append('context', 'Medieval notation');
const transcription = await axios.post('/api/transcribe', audioData);
```

### JavaScript (Fetch)

```javascript
// Upload image
const formData = new FormData();
formData.append('image', imageFile);
const response = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData
});
const data = await response.json();
```

---

## Environment Variables

Required environment variables for the backend:

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `PORT` (optional): Server port (default: 3001)

---

## Support

For issues or questions about the API, please open an issue on GitHub.
