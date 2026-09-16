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

app.use(express.json({ limit: '10mb' }));

// 🔥 MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://brmtrm07_db_user:rahat1234321@tdrmodz.wzbvvki.mongodb.net/?appName=TDRMODZ";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// 🔥 Schema
const DataSchema = new mongoose.Schema({
    _id: { type: String, default: 'main' },
    content: { type: Object, default: {} },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'tdr_data' });

const DataModel = mongoose.model('TDRData', DataSchema);

// ==============================================
// GET: ডাটা পড়া
// ==============================================
app.get('/api/data', async (req, res) => {
    try {
        let doc = await DataModel.findById('main');
        
        if (!doc) {
            doc = await DataModel.create({
                _id: 'main',
                content: {
                    maintenance: {},
                    lua_version: "1.0.0",
                    lua_files: {},
                    update_zip_b64: "",
                    update_zip_name: "",
                    update_zip_time: "",
                    app_html_b64: "",
                    resellers: [],
                    keys: []
                }
            });
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(doc.content));
    } catch (e) {
        console.error('GET Error:', e);
        res.status(500).json({ error: "Server error: " + e.message });
    }
});

// ==============================================
// POST: ডাটা সেভ করা
// ==============================================
app.post('/api/data', async (req, res) => {
    try {
        const newData = req.body;

        await DataModel.findByIdAndUpdate(
            'main',
            { 
                content: newData,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "Data saved to MongoDB" });
    } catch (e) {
        console.error('POST Error:', e);
        res.status(400).json({ success: false, error: "Invalid data: " + e.message });
    }
});

// ==============================================
// Server Start
// ==============================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});