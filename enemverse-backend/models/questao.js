const mongoose = require('mongoose');

const QuestaoSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    ano: {
        type: Number
    },
    numero_enem: { type: Number },
    dia: { type: Number, enum: [1, 2] },
    caderno: { type: String },
    aplicacao: { type: String, default: 'Regular' },
    lingua_estrangeira: { type: String, enum: ['Inglês', 'Espanhol', 'Não se aplica'], default: 'Não se aplica' },
    fonte: { type: String },
    fonte_url: { type: String },
    area_enem: {
        type: String,
        enum: [
            'Ciências da Natureza e suas Tecnologias',
            'Matemática e suas Tecnologias',
            'Ciências Humanas e suas Tecnologias',
            'Linguagens, Códigos e suas Tecnologias'
        ]
    },
    materia: {
        type: String
    },
    subtopico: {
        type: String
    },
    dificuldade: {
        type: String,
        enum: ['Fácil', 'Média', 'Difícil'],
        default: 'Média'
    },
    texto_apoio: {
        type: String
    },
    midias: [{
        tipo: { type: String, enum: ['imagem'], default: 'imagem' },
        url: { type: String, required: true },
        legenda: { type: String, default: '' },
        alt: { type: String, default: '' }
    }],
    enunciado: {
        type: String,
        required: true
    },
    alternativas: {
        type: [String],
        required: true
    },
    anulada: { type: Boolean, default: false },
    correta: {
        type: Number,
        required: function() { return !this.anulada; },
        min: 0,
        max: 4,
        default: null
    },
    explicacao: {
        type: String
    }
}, {
    timestamps: true,
    strict: false,
    collection: 'questoes'
});

module.exports = mongoose.models.Questao || mongoose.model('Questao', QuestaoSchema);
