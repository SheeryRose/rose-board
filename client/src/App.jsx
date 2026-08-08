import { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchPins = () => {
    setLoading(true);
    fetch(`${API_URL}/api/pins`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch pins');
        return res.json();
      })
      .then((data) => {
        setPins(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption || !imageFile) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('tags', tags);
    formData.append('image', imageFile);

    fetch(`${API_URL}/api/pins/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to upload pin');
        return res.json();
      })
      .then(() => {
        setCaption('');
        setTags('');
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSubmitting(false);
        fetchPins();
      })
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  };

  const handleDelete = (id) => {
    fetch(`${API_URL}/api/pins/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete pin');
        return res.json();
      })
      .then(() => {
        setPins((prevPins) => prevPins.filter((pin) => pin._id !== id));
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  if (loading) return <p className="status-message">Loading pins...</p>;
  if (error) return <p className="status-message error">Something went wrong: {error}. Please check that the server is running.</p>;

  return (
    <div className="App">
      <h1>Rose Board</h1>

      <form onSubmit={handleSubmit} className="pin-form">
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Uploading...' : 'Add Pin'}
        </button>
      </form>

      {pins.length === 0 ? (
        <p>No pins yet. Add your first one!</p>
      ) : (
        <div className="pin-grid">
          {pins.map((pin) => (
            <div key={pin._id} className="pin-card">
              <img src={pin.imageUrl} alt={pin.caption} />
              <p>{pin.caption}</p>
              <button onClick={() => handleDelete(pin._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;