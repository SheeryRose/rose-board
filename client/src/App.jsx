import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPins = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/pins')
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
    if (!caption || !imageUrl) return;

    setSubmitting(true);

    const newPin = {
      caption,
      imageUrl,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    fetch('http://localhost:5000/api/pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPin),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create pin');
        return res.json();
      })
      .then(() => {
        setCaption('');
        setImageUrl('');
        setTags('');
        setSubmitting(false);
        fetchPins();
      })
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/pins/${id}`, {
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

  if (loading) return <p>Loading pins...</p>;
  if (error) return <p>Error: {error}</p>;

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
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Pin'}
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