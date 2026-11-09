const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/resource-api';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'General Item' },
    status: { type: String, default: 'Active' }
}, { timestamps: true });

const Resource = mongoose.model('Resource', resourceSchema);

app.get('/api/resources', async (req, res) => {
    try {
        const resources = await Resource.find({});
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/resources/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.status(200).json(resource);
    } catch (error) {
        res.status(404).json({ error: 'Resource not found or invalid ID format' });
    }
});

app.post('/api/resources', async (req, res) => {
    try {
        const { name, type, status } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Validation Error: "name" property is required.' });
        }

        const newResource = await Resource.create({
            name,
            type: type || 'General Item',
            status: status || 'Active'
        });

        res.status(201).json(newResource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/resources/:id', async (req, res) => {
    try {
        const { name, type, status } = req.body;

        const updatedResource = await Resource.findByIdAndUpdate(
            req.params.id,
            {
                ...(name !== undefined && { name }),
                ...(type !== undefined && { type }),
                ...(status !== undefined && { status })
            },
            { new: true, runValidators: true }
        );

        if (!updatedResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.status(200).json(updatedResource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/resources/:id', async (req, res) => {
    try {
        const removedResource = await Resource.findByIdAndDelete(req.params.id);
        if (!removedResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.status(200).json({
            message: 'Resource successfully deleted',
            deleted: removedResource
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`REST API Engine running live at http://localhost:${PORT}`);
});
