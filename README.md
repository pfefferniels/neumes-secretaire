# 🎵 Neumes Secrétaire

Voice-assisted transcription tool for Latin medieval manuscripts. This application allows users to upload manuscript images, mark regions of interest with mouse/touch gestures, and simultaneously identify them using voice input powered by OpenAI's Whisper speech-to-text API.

## Features

- 📸 **Image Upload**: Upload medieval manuscript images for transcription
- ✍️ **Interactive Marking**: Draw on the manuscript with mouse or touch to mark regions
- 🎤 **Voice Recognition**: Simultaneous voice identification while marking
- 🗣️ **Latin-Optimized Transcription**: Specialized prompts for Latin medieval terminology
- 📝 **Real-time Transcription**: View transcriptions as you work
- 💾 **Session Management**: Track all marks and transcriptions in a session

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **HTML5 Canvas** for interactive drawing
- **MediaRecorder API** for audio capture
- **Axios** for API communication

### Backend
- **Express.js** with TypeScript
- **OpenAI Whisper API** for speech-to-text
- **Multer** for file upload handling
- **CORS** enabled for cross-origin requests

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **OpenAI API Key** (for Whisper speech-to-text)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pfefferniels/neumes-secretaire.git
   cd neumes-secretaire
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

3. **Configure environment variables**
   ```bash
   # Create backend .env file
   cd backend
   cp .env.example .env
   ```

   Edit `backend/.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
# From the root directory
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Production Build

```bash
# Build both frontend and backend
npm run build

# Start the backend
cd backend
npm start

# Serve the frontend build (use a static file server)
cd frontend
npx serve -s dist
```

## Usage

1. **Upload an Image**
   - Click "Choose Image" and select a medieval manuscript image
   - Supported formats: JPG, PNG, WebP, etc.

2. **Mark and Transcribe**
   - Click/touch and drag on the manuscript to draw marks
   - Speak while drawing to identify the element
   - The system will automatically record your voice and transcribe it
   - Transcriptions appear in the panel below the canvas

3. **View Transcriptions**
   - All transcriptions are listed with timestamps
   - Green marks indicate completed transcriptions
   - Yellow marks indicate pending transcriptions

4. **Manage Session**
   - Use "Clear All" to remove all marks and start fresh
   - Use "New Image" to upload a different manuscript

## API Endpoints

### Backend API

- **POST** `/api/upload-image`
  - Upload a manuscript image
  - Body: `multipart/form-data` with `image` field
  - Returns: Image metadata and URL

- **POST** `/api/transcribe`
  - Transcribe audio to text
  - Body: `multipart/form-data` with `audio` field and optional `context`
  - Returns: Transcribed text in Latin

- **POST** `/api/mark-and-transcribe`
  - Combined endpoint for marking with transcription
  - Body: `multipart/form-data` with `audio`, `markData`, and optional `context`
  - Returns: Transcription and marking data

- **GET** `/api/health`
  - Health check endpoint
  - Returns: Server status

## OpenAI Whisper Configuration

The application uses OpenAI's Whisper API with Latin language optimization:

- **Model**: `whisper-1`
- **Language**: `la` (Latin)
- **Prompt**: Specialized for medieval manuscript terminology including:
  - Musical notation terms (neumes, ligatures, punctum, virga, pes, clivis, etc.)
  - Manuscript types (graduale, antiphonale, responsoria)
  - Common Latin liturgical text

The transcription prompt is designed to improve accuracy for specialized medieval Latin terminology.

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS requires user interaction to enable microphone)
- **Opera**: Full support

**Note**: Microphone access requires HTTPS in production environments.

## Troubleshooting

### Microphone Not Working
- Ensure browser has microphone permissions
- Check that you're using HTTPS (required for production)
- Test in a different browser

### Image Upload Fails
- Check file size (max 25MB)
- Verify backend is running
- Check CORS configuration

### Transcription Errors
- Verify OpenAI API key is correct
- Check API key has sufficient credits
- Ensure audio recording is working
- Check backend logs for detailed errors

## Project Structure

```
neumes-secretaire/
├── backend/
│   ├── src/
│   │   └── index.ts          # Express server with API endpoints
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ManuscriptCanvas.tsx    # Main canvas component
│   │   │   └── ManuscriptCanvas.css
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── package.json              # Root package.json for workspace
├── .gitignore
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- OpenAI Whisper API for speech-to-text capabilities
- Medieval manuscript community for domain knowledge
- React and Express.js communities for excellent frameworks