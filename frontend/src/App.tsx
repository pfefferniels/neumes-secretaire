import { useState } from 'react';
import ManuscriptCanvas from './components/ManuscriptCanvas';
import './App.css';

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setUploadedImage(`http://localhost:3001${data.path}`);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Neumes Secrétaire</h1>
        <p>Voice-Assisted Medieval Manuscript Transcription</p>
      </header>

      <main className="app-main">
        {!uploadedImage ? (
          <div className="upload-section">
            <div className="upload-card">
              <h2>Upload a Manuscript Image</h2>
              <p>Select an image of a Latin medieval manuscript to begin transcription.</p>
              
              <label className="file-input-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="file-input"
                />
                <span className="file-input-button">
                  {isUploading ? 'Uploading...' : 'Choose Image'}
                </span>
              </label>
            </div>
          </div>
        ) : (
          <ManuscriptCanvas 
            imageUrl={uploadedImage}
            onReset={() => setUploadedImage(null)}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Mark regions with your mouse/touch and identify them with your voice</p>
      </footer>
    </div>
  );
}

export default App;
