const mongoose = require('mongoose');

const conectarBanco = async () => {
    try {
        // Conecta ao banco de dados local do seu notebook chamado 'enemverse'
        await mongoose.connect('mongodb://127.0.0.1:27017/enemverse');
        console.log('🔌 MongoDB Conectado com sucesso!');
    } catch (err) {
        console.error('❌ Erro ao conectar ao MongoDB:', err.message);
        process.exit(1); // Fecha o servidor caso o banco falhe
    }
};

module.exports = conectarBanco;
