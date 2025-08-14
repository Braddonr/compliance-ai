const express = require('express');
const path = require('path');
const app = express();

// Security and logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the dist directory with proper headers
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: false
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  console.log(`🔄 SPA Route: ${req.url} -> index.html`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Frontend server running on port ${port}`);
  console.log(`📱 Serving React app with SPA routing support`);
  console.log(`🔍 Static files served from: ${path.join(__dirname, 'dist')}`);
});