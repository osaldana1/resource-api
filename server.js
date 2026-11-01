const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 1.Parse incoming JSON request bodies
app.use(express.json());

// 2.Print timestamp, method, and route for every inbound request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// In-Memory Dataset Matrix
let resources = [
  { id: '1', name: 'Q3 Analytics Sync', type: 'Event Profile', status: 'Active' },
  { id: '2', name: 'Server Migration Task', type: 'Task', status: 'Pending' }
];

// --- ENDPOINT ARRAY MATRIX ---

// GET /api/resources — Return all tracked collection elements
app.get('/api/resources', (req, res) => {
  res.status(200).json(resources);
});

// GET /api/resources/:id — Target and isolate one unique collection item (404 if missing)
app.get('/api/resources/:id', (req, res) => {
  const resource = resources.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.status(200).json(resource);
});

// POST /api/resources — Collect inbound JSON, append unique tracking ID, push, return 201
app.post('/api/resources', (req, res) => {
  const { name, type, status } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Validation Error: "name" property is required.' });
  }

  const newResource = {
    id: Date.now().toString(), // Generate a unique tracking ID based on timestamp
    name,
    type: type || 'General Item',
    status: status || 'Active'
  };

  resources.push(newResource);
  res.status(201).json(newResource);
});

// PUT /api/resources/:id — Safely update/overwrite properties for a matching target ID
app.put('/api/resources/:id', (req, res) => {
  const index = resources.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const { name, type, status } = req.body;
  
  resources[index] = {
    ...resources[index],
    ...(name !== undefined && { name }),
    ...(type !== undefined && { type }),
    ...(status !== undefined && { status })
  };

  res.status(200).json(resources[index]);
});

// DELETE /api/resources/:id — Target and splice out the matching object from the array
app.delete('/api/resources/:id', (req, res) => {
  const index = resources.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const [removedResource] = resources.splice(index, 1);
  res.status(200).json({
    message: 'Resource successfully deleted',
    deleted: removedResource
  });
});

// Initialize Server Listener
app.listen(PORT, () => {
  console.log(`🚀 REST API Engine running live at http://localhost:${PORT}`);
});