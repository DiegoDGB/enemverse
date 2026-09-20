const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    xp: { type: Number, default: 0 },
    ofensiva: { type: Number, default: 0 },
    ultimo_acesso: { type: Date, default: null }
});

module.exports = mongoose.model('usuario', UsuarioSchema);
