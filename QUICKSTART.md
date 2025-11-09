# Quick Start Guide

## 1. Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm 9+ installed
- An OpenAI API key (get one at https://platform.openai.com/api-keys)

## 2. Installation

```bash
# Clone the repository
git clone https://github.com/pfefferniels/neumes-secretaire.git
cd neumes-secretaire

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

## 3. Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3001
```

## 4. Running the Application

### Option A: Run Both Services Together

From the root directory:
```bash
npm run dev
```

### Option B: Run Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 5. Using the Application

1. Open your browser to http://localhost:3000

2. Click **"Choose Image"** to upload a medieval manuscript image
   - Supported formats: JPG, PNG, WebP, GIF, etc.
   - Maximum file size: 25MB

3. Once the image loads, you can:
   - **Mark regions**: Click and drag on the manuscript to draw marks
   - **Speak simultaneously**: While drawing, speak to identify what you're marking
   - The system will automatically record your voice and transcribe it
   
4. View your transcriptions in the panel below the canvas
   - Each transcription shows a timestamp
   - Green marks indicate completed transcriptions
   - Yellow marks are still processing

5. Use the controls:
   - **New Image**: Upload a different manuscript
   - **Clear All**: Remove all marks and start fresh

## 6. Tips for Best Results

### For Better Transcription Accuracy:

1. **Speak clearly** and at a moderate pace
2. **Use Latin terminology** when possible (e.g., "punctum", "virga", "neuma")
3. **Minimize background noise** for better audio quality
4. **Keep marks focused** on specific elements you're identifying

### Common Latin Terms for Medieval Manuscripts:

- **Neumes**: Basic notation units (punctum, virga, pes, clivis)
- **Ligatures**: Connected note groups (scandicus, climacus, porrectus, torculus)
- **Manuscript Types**: graduale, antiphonale, responsoria
- **Text Elements**: initium, versus, antiphona, responsorium

## 7. Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome  | ✅ Full Support | Recommended |
| Edge    | ✅ Full Support | Recommended |
| Firefox | ✅ Full Support | |
| Safari  | ✅ Full Support | May require user interaction for microphone |
| Opera   | ✅ Full Support | |

**Note**: Microphone access requires HTTPS in production. For local development, HTTP is sufficient.

## 8. Troubleshooting

### Microphone Not Working
- Check browser permissions (usually a camera/microphone icon in the address bar)
- Try a different browser
- Ensure no other application is using the microphone

### Cannot Upload Image
- Check file size (max 25MB)
- Verify the backend server is running on port 3001
- Check backend console for error messages

### Transcription Fails
1. Verify your OpenAI API key is correct in `backend/.env`
2. Check your OpenAI account has sufficient credits
3. Look at backend console logs for detailed error messages
4. Try recording a shorter audio sample

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Try again
npm run build
```

## 9. API Testing with cURL

Test the backend API directly:

```bash
# Health check
curl http://localhost:3001/api/health

# Upload an image
curl -X POST http://localhost:3001/api/upload-image \
  -F "image=@/path/to/your/manuscript.jpg"
```

## 10. Development Workflow

```bash
# Backend development with hot reload
cd backend
npm run dev

# Frontend development with hot reload
cd frontend
npm run dev

# Build for production
npm run build

# Start production backend
cd backend
npm start
```

## Need Help?

If you encounter any issues not covered here, please:
1. Check the main README.md for detailed documentation
2. Review the backend logs in the terminal
3. Check the browser console for frontend errors
4. Open an issue on GitHub with details about the problem

---

**Happy transcribing! 🎵📜**
