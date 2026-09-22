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
    enunciado: {
        type: String,
        required: true
    },
    alternativas: {
        type: [String],
        required: true
    },
    correta: {
        type: Number,
        required: true,
        min: 0,
        max: 4
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
