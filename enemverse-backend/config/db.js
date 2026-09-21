const mongoose = require('mongoose');

const conectarBanco = async () => {
    try {
        // Se houver uma variável de ambiente no Render, usa ela. Caso contrário, usa o MongoDB local.
        const urlBanco = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enemverse';
        
        await mongoose.connect(urlBanco);
        console.log('🔌 [MongoDB] Conectado com sucesso ao banco de dados!');
    } catch (err) {
        console.error('❌ [MongoDB] Erro crítico ao conectar ao banco:', err.message);
        process.exit(1); // Fecha o processo do servidor se o banco falhar
    }
};

module.exports = conectarBanco;
