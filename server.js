const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 CORS হেডার - এটাই মূল সমাধান
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json({ limit: '10mb' }));

const dataFile = path.join(__dirname, 'data.json');

app.get('/api/data', (req, res) => {
    try {
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        } else {
            res.status(404).json({ error: "data.json not found" });
        }
    } catch (e) {
        res.status(500).json({ error: "Server error: " + e.message });
    }
});

app.post('/api/data', (req, res) => {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: "Invalid JSON: " + e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});