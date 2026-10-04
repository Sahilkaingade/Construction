require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));

const quoteSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, minlength: 2 },
  company:     { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true,
                 match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone:       { type: String, trim: true },
  projectType: { type: String, required: true, enum: ['Residential', 'Commercial', 'Industrial'] },
  budget:      { type: String, required: true },
  message:     { type: String, required: true, minlength: 10 }
}, { timestamps: true });

const Quote = mongoose.model('Quote', quoteSchema);

app.post('/api/quotes', async (req, res) => {
  try {
    const { Name, Company, Email, Phone, ProjectType, Budget, Message } = req.body;
    const quote = await Quote.create({
      name: Name, company: Company, email: Email, phone: Phone,
      projectType: ProjectType, budget: Budget, message: Message
    });
    res.status(201).json({ success: true, id: quote._id });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));