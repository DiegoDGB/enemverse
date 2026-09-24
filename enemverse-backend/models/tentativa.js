const mongoose = require('mongoose');

const TentativaSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
    questao: { type: mongoose.Schema.Types.ObjectId, ref: 'Questao', required: true },
    questaoId: { type: Number, required: true },
    numero: { type: Number, required: true, min: 1 },
    alternativaSelecionada: { type: Number, required: true, min: 0, max: 4 },
    correto: { type: Boolean, required: true },
    anulada: { type: Boolean, required: true },
    tempoEsgotado: { type: Boolean, required: true },
    xpGanho: { type: Number, required: true, min: 0 },
    respondidaEm: { type: Date, required: true }
}, { timestamps: true });

TentativaSchema.index({ usuario: 1, respondidaEm: -1, _id: -1 });
TentativaSchema.index({ usuario: 1, questaoId: 1, numero: 1 }, { unique: true });

module.exports = mongoose.models.Tentativa || mongoose.model('Tentativa', TentativaSchema);
