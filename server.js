const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname)));

// Route all requests to index.html for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Spomegel server running on http://localhost:${PORT}`);
});
