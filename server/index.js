const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const upload = require('./middleware/upload');
const cloudinary = require('./config/cloudinary');
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

app.post('/api/pins/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'rose-board' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const result = await streamUpload();

    const { caption, tags } = req.body;
    const parsedTags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    const newPin = new Pin({
      caption,
      imageUrl: result.secure_url,
      tags: parsedTags,
    });

    const savedPin = await newPin.save();
    res.status(201).json(savedPin);
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload image and create pin', error: err.message });
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