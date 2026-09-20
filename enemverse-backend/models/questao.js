const mongoose = require('mongoose');

const QuestaoSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    ano: { type: Number, required: true },
    materia: { type: String, required: true },
    subtopico: { type: String },
    texto_apoio: { type: String },
    enunciado: { type: String, required: true },
    alternativas: [{ type: String, required: true }],
    correta: { type: Number, required: true }, // Índice da alternativa certa (0=A, 1=B, etc)
    explicacao: { type: String }
});

module.exports = mongoose.model('questao', QuestaoSchema);
