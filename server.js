const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 CORS হেডার
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

app.use(express.json({ limit: '50mb' }));

// 🔥 MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// 🔥 Schema
const DataSchema = new mongoose.Schema({
    _id: { type: String, default: 'main' },
    content: { type: Object, default: {} },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'tdr_data' });

const DataModel = mongoose.model('TDRData', DataSchema);

// Default data
function getDefaultData() {
    return {
        maintenance: {},
        lua_version: "1.0.0",
        lua_files: {},
        update_zip_b64: "",
        update_zip_name: "",
        update_zip_time: "",
        app_html_b64: "",
        resellers: [],
        keys: []
    };
}

// 🩺 Health check (UptimeRobot এর জন্য)
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ status: 'ok', database: dbStatus, timestamp: new Date().toISOString() });
});

// ============================================
// 🔵 SHIZUKU PROJECT — /api/data (Protection ছাড়া)
// ============================================
app.get('/api/data', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "Database not connected yet. Try again in a moment." });
        }
        let doc = await DataModel.findById('main');
        if (!doc) {
            doc = await DataModel.create({ _id: 'main', content: getDefaultData() });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(doc.content));
    } catch (e) {
        console.error('GET /api/data Error:', e);
        res.status(500).json({ error: "Server error: " + e.message });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ success: false, error: "Database not connected yet." });
        }
        await DataModel.findByIdAndUpdate(
            'main',
            { content: req.body, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (e) {
        console.error('POST /api/data Error:', e);
        res.status(400).json({ success: false, error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Shizuku API: /api/data`);
    console.log(`🩺 Health: /health`);
});