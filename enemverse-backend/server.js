const express = require('express');
const cors = require('cors');
const conectarBanco = require('./config/db');

// Inicializa o servidor Express
const app = express();

// Conecta ao banco de dados (Atlas ou Local)
conectarBanco();

// Middlewares Globais
app.use(cors({ origin: ['https://enemverse.vercel.app'], methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'] }));
app.use(express.json()); // Permite que a API entenda requisições em formato JSON

/* 
   ===================================================================
   MAPEAMENTO DE ROTAS (Express)
   Atenção: Garanta que os arquivos nas pastas usem letras minúsculas 
   para evitar erros em servidores Linux (Render).
   ===================================================================
*/

// Rotas de Autenticação (Cadastro, Login e Perfil Seguro)
app.use('/api/auth', require('./controllers/authController'));

// Rotas do Simulado (Listar Questões e Responder/Computar XP)
app.use('/api/questoes', require('./controllers/questoesController'));

// Rotas do Leaderboard (Tabela Classificatória Geral)
app.use('/api/ranking', require('./controllers/rankController'));

// Rota Base de Teste para verificar o status do servidor
app.get('/', (req, res) => {
    res.status(200).json({
        mensagem: "🚀 API do EnemVerse ativa e operando com sucesso!",
        status: "Online",
        banco: "Conectado"
    });
});

// Middleware para tratamento de rotas inexistentes (Substitui o 404 antigo)
app.use((req, res) => {
    res.status(404).json({ erro: 'Endpoint não encontrado no ecossistema EnemVerse.' });
});

// Configuração da Porta de Redirecionamento Dinâmico
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 API DO ENEMVERSE ATIVA NA PORTA ${PORT}!`);
});
