import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

  if (loading) return <p>Loading pins...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="App">
      <h1>Rose Board</h1>
      {pins.length === 0 ? (
        <p>No pins yet. Add your first one!</p>
      ) : (
        <div className="pin-grid">
          {pins.map((pin) => (
            <div key={pin._id} className="pin-card">
              <img src={pin.imageUrl} alt={pin.caption} />
              <p>{pin.caption}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;