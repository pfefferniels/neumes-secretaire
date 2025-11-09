import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit (OpenAI Whisper limit)
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Neumes Secrétaire API is running' });
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Voice transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { context } = req.body;

    // Prepare the transcription prompt optimized for Latin medieval manuscripts
    const prompt = context 
      ? `Transcribing Latin medieval manuscript notation. Context: ${context}. Common terms include neumes, ligatures, punctum, virga, pes, clivis, scandicus, climacus, porrectus, torculus, graduale, antiphonale, responsoria.`
      : 'Transcribing Latin medieval manuscript notation. Listen for musical notation terms, Latin liturgical text, and manuscript-specific terminology.';

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'la', // Latin language code
      prompt: prompt,
      response_format: 'json'
    });

    // Clean up the audio file after transcription
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      text: transcription.text,
      language: 'la'
    });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message 
    });
  }
});

// Combined endpoint for marking with transcription
app.post('/api/mark-and-transcribe', upload.fields([
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.audio || files.audio.length === 0) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFile = files.audio[0];
    const { markData, context } = req.body;

    // Parse marking data (coordinates, type of mark, etc.)
    let marking = null;
    if (markData) {
      try {
        marking = JSON.parse(markData);
      } catch (e) {
        console.error('Error parsing mark data:', e);
      }
    }

    // Transcribe audio with Latin medieval context
    const prompt = `Transcribing Latin medieval manuscript notation. ${context || ''} Common terms include neumes, ligatures, punctum, virga, pes, clivis, scandicus, climacus, porrectus, torculus, graduale, antiphonale.`;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.path),
      model: 'whisper-1',
      language: 'la',
      prompt: prompt,
      response_format: 'json'
    });

    // Clean up audio file
    fs.unlinkSync(audioFile.path);

    res.json({
      success: true,
      transcription: {
        text: transcription.text,
        language: 'la'
      },
      marking: marking
    });
  } catch (error: any) {
    console.error('Error in mark and transcribe:', error);
    
    // Clean up files on error
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files && files.audio && files.audio[0] && fs.existsSync(files.audio[0].path)) {
      fs.unlinkSync(files.audio[0].path);
    }

    res.status(500).json({ 
      error: 'Failed to process marking and transcription',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Neumes Secrétaire backend running on port ${PORT}`);
  console.log(`📝 Ready to transcribe medieval manuscripts`);
});
