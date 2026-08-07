const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Pin = require('./models/Pin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Rose Board API is running');
});

app.get('/api/pins', async (req, res) => {
  try {
    const pins = await Pin.find().sort({ createdAt: -1 });
    res.json(pins);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pins', error: err.message });
  }
});

app.post('/api/pins', async (req, res) => {
  try {
    const { caption, imageUrl, tags } = req.body;
    const newPin = new Pin({ caption, imageUrl, tags });
    const savedPin = await newPin.save();
    res.status(201).json(savedPin);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create pin', error: err.message });
  }
});

app.delete('/api/pins/:id', async (req, res) => {
  try {
    const deletedPin = await Pin.findByIdAndDelete(req.params.id);
    if (!deletedPin) {
      return res.status(404).json({ message: 'Pin not found' });
    }
    res.json({ message: 'Pin deleted', deletedPin });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete pin', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});