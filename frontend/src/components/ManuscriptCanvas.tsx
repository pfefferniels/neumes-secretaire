import { useState, useRef, useEffect } from 'react';
import './ManuscriptCanvas.css';

interface Mark {
  id: string;
  type: 'underline' | 'circle';
  points: { x: number; y: number }[];
  transcription?: string;
  timestamp: number;
}

interface ManuscriptCanvasProps {
  imageUrl: string;
  onReset: () => void;
}

const ManuscriptCanvas = ({ imageUrl, onReset }: ManuscriptCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      redrawCanvas();
    };
  }, [imageUrl]);

  useEffect(() => {
    redrawCanvas();
  }, [marks]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Draw all marks
    marks.forEach((mark) => {
      drawMark(ctx, mark);
    });

    // Draw current drawing
    if (currentPoints.length > 0) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  };

  const drawMark = (ctx: CanvasRenderingContext2D, mark: Mark) => {
    if (mark.points.length === 0) return;

    ctx.strokeStyle = mark.transcription ? '#00ff00' : '#ffff00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(mark.points[0].x, mark.points[0].y);
    mark.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setCurrentPoints([point]);
    
    // Start recording audio immediately when user starts drawing
    startRecording();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    setCurrentPoints((prev) => [...prev, point]);
    redrawCanvas();
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentPoints.length > 0) {
      // Create a new mark
      const newMark: Mark = {
        id: Date.now().toString(),
        type: 'underline', // Could be determined by shape analysis
        points: currentPoints,
        timestamp: Date.now(),
      };
      
      setMarks((prev) => [...prev, newMark]);
      setCurrentPoints([]);
      
      // Stop recording and transcribe
      if (mediaRecorder && isRecording) {
        stopRecording(newMark.id);
      }
    }
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = (markId: string) => {
    if (!mediaRecorder) return;

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Stop all tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setMediaRecorder(null);

      // Transcribe the audio
      await transcribeAudio(audioBlob, markId);
    };

    mediaRecorder.stop();
  };

  const transcribeAudio = async (audioBlob: Blob, markId: string) => {
    setTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('context', 'Medieval manuscript notation, neumes, Latin liturgical text');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      
      // Update the mark with transcription
      setMarks((prev) =>
        prev.map((mark) =>
          mark.id === markId
            ? { ...mark, transcription: data.text }
            : mark
        )
      );
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const clearAllMarks = () => {
    if (window.confirm('Clear all marks and transcriptions?')) {
      setMarks([]);
    }
  };

  return (
    <div className="manuscript-canvas-container">
      <div className="canvas-toolbar">
        <button onClick={onReset} className="toolbar-button">
          ← New Image
        </button>
        <div className="status-indicators">
          {isRecording && (
            <span className="recording-indicator">🎤 Recording...</span>
          )}
          {transcribing && (
            <span className="transcribing-indicator">⏳ Transcribing...</span>
          )}
        </div>
        <button onClick={clearAllMarks} className="toolbar-button" disabled={marks.length === 0}>
          Clear All
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="manuscript-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="transcriptions-panel">
        <h3>Transcriptions ({marks.length})</h3>
        {marks.length === 0 ? (
          <p className="no-transcriptions">
            Draw on the manuscript and speak to create transcriptions
          </p>
        ) : (
          <ul className="transcriptions-list">
            {marks.map((mark) => (
              <li key={mark.id} className="transcription-item">
                <span className="transcription-time">
                  {new Date(mark.timestamp).toLocaleTimeString()}
                </span>
                <span className="transcription-text">
                  {mark.transcription || 'Waiting for transcription...'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="instructions">
        <p>💡 <strong>How to use:</strong> Click/touch and draw on the manuscript while speaking to identify elements</p>
      </div>
    </div>
  );
};

export default ManuscriptCanvas;
