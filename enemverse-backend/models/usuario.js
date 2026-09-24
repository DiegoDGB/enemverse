const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    senha: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        default: 0 // Inicia automaticamente com zero se o formulário não enviar
    },
    ofensiva: {
        type: Number,
        default: 0 // Inicia zerado automaticamente
    },
    ultimo_acesso: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Cria automaticamente os campos de data de criação e atualização
});

// Evita erros de compilação duplicada caso o Node reinicie em ambiente de desenvolvimento
module.exports = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
