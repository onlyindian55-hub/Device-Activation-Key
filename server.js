const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 API Key (Render Environment Variable থেকে আসবে)
const API_KEY = process.env.API_KEY || "TdrModz@2026#SecretKey!Xyz";

// 🔥 CORS হেডার
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

app.use(express.json({ limit: '50mb' }));

// 🔒 API Key যাচাই
function verifyApiKey(req, res, next) {
    const providedKey = req.headers['x-api-key'];
    if (!providedKey || providedKey !== API_KEY) {
        return res.status(401).json({ error: "Unauthorized - Invalid API Key" });
    }
    next();
}

// 🔥 MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// 🔥 Schema
const DataSchema = new mongoose.Schema({
    _id: { type: String },
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

// ============================================
// 🔵 SHIZUKU PROJECT (id: 'main')
// ============================================
app.get('/api/data', verifyApiKey, async (req, res) => {
    try {
        let doc = await DataModel.findById('main');
        if (!doc) {
            doc = await DataModel.create({ _id: 'main', content: getDefaultData() });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(doc.content));
    } catch (e) {
        res.status(500).json({ error: "Server error: " + e.message });
    }
});

app.post('/api/data', verifyApiKey, async (req, res) => {
    try {
        await DataModel.findByIdAndUpdate(
            'main',
            { content: req.body, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// ============================================
// 🟢 ROOT PROJECT (id: 'root')
// ============================================
app.get('/api/root-data', verifyApiKey, async (req, res) => {
    try {
        let doc = await DataModel.findById('root');
        if (!doc) {
            doc = await DataModel.create({ _id: 'root', content: getDefaultData() });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(doc.content));
    } catch (e) {
        res.status(500).json({ error: "Server error: " + e.message });
    }
});

app.post('/api/root-data', verifyApiKey, async (req, res) => {
    try {
        await DataModel.findByIdAndUpdate(
            'root',
            { content: req.body, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});