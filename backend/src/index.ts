import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security: Validate that a file path is within the uploads directory
function isPathSafe(filePath: string): boolean {
  const resolvedPath = path.resolve(filePath);
  const resolvedUploadsDir = path.resolve(uploadsDir);
  return resolvedPath.startsWith(resolvedUploadsDir);
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

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit uploads to 50 per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many uploads from this IP, please try again later.'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Neumes Secrétaire API is running' });
});

// Image upload endpoint
app.post('/api/upload-image', uploadLimiter, upload.single('image'), async (req, res) => {
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
app.post('/api/transcribe', uploadLimiter, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Validate file path for security
    if (!isPathSafe(req.file.path)) {
      return res.status(400).json({ error: 'Invalid file path' });
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
    if (req.file) {
      const filePath = req.file.path;
      if (isPathSafe(filePath) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message 
    });
  }
});

// Combined endpoint for marking with transcription
app.post('/api/mark-and-transcribe', uploadLimiter, upload.fields([
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.audio || files.audio.length === 0) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFile = files.audio[0];
    
    // Validate file path for security
    if (!isPathSafe(audioFile.path)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

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
    if (files && files.audio && files.audio[0]) {
      const audioPath = files.audio[0].path;
      if (isPathSafe(audioPath) && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
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
