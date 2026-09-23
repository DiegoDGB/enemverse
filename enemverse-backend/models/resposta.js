const mongoose = require('mongoose');

const RespostaSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        index: true
    },
    questao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Questao',
        required: true
    },
    questaoId: {
        type: Number,
        required: true,
        index: true
    },
    alternativaSelecionada: {
        type: Number,
        required: true,
        min: 0,
        max: 4
    },
    correto: {
        type: Boolean,
        default: false
    },
    anulada: {
        type: Boolean,
        default: false
    },
    tempoEsgotado: {
        type: Boolean,
        default: false
    },
    xpGanho: {
        type: Number,
        default: 0,
        min: 0
    },
    xpConcedido: {
        type: Boolean,
        default: false
    },
    tentativas: {
        type: Number,
        default: 1,
        min: 1
    },
    primeiraRespostaEm: {
        type: Date,
        default: Date.now
    },
    ultimaRespostaEm: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

RespostaSchema.index({ usuario: 1, questaoId: 1 }, { unique: true });

module.exports = mongoose.models.Resposta || mongoose.model('Resposta', RespostaSchema);
