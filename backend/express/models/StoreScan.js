const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    id: { type: String, required: true },
    scan_type: { type: String,enum: ['full', 'custom','fast'], required: true, default:'fast'},
    scan_id: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
    custom_options: { type: String },
    response: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('StoreScan', StoreSchema);