const http = require('http');
const fs = require('fs');
const path = require('path');

// RESTAURAÇÃO: Caminho original da Área de Trabalho que funcionava
const PASTA_FRONTEND = 'C:\\Users\\diego.goncalves\\Desktop\\enem';

// Banco de Dados Backup na memória RAM Sincronizado com Atlas
let usuarios = [];
let questoes = [
  {
    "id": "ENEM-2023-TESTE-001",
    "ano": 2023,
    "materia": "Ciências da Natureza e suas Tecnologias",
    "subtopico": "Biologia",
    "texto_apoio": "<p>A introdução de espécies exóticas em ecossistemas nativos pode causar desequilíbrios ecológicos severos, competindo por recursos e alterando nichos ecológicos.</p>",
    "enunciado": "O principal impacto imediato decorrente da introdução de uma espécie exótica predadora em uma ilha isolada é:",
    "alternativas": [
      "O aumento imediato da biodiversidade local.",
      "A redução populacional ou extinção de presas nativas.",
      "A alteração da radiação solar incidente na vegetação.",
      "O surgimento espontâneo de novas barreiras geográficas.",
      "O aumento na taxa de mutações benéficas das plantas locais."
    ],
    "correta": 1,
    "explicacao": "A alternativa B está correta porque predadores exóticos dizimam as populações nativas que não possuem defesas evolutivas contra eles."
  },
  {
    "id": "ENEM-2023-TESTE-002",
    "ano": 2023,
    "materia": "Matemática e suas Tecnologias",
    "subtopico": "Álgebra",
    "texto_apoio": "<p>Uma empresa de transporte cobra uma taxa fixa de R\$ 5,00 mais um valor variável de R\$ 2,00 por quilômetro rodado.</p>",
    "enunciado": "A função matemática que representa o custo total (C) em relação aos quilômetros rodados (x) é dada por:",
    "alternativas": [
      "C(x) = 5x + 2",
      "C(x) = 2x + 5",
      "C(x) = 7x",
      "C(x) = 2x - 5",
      "C(x) = 5x - 2"
    ],
    "correta": 1,
    "explicacao": "A alternativa B está correta pois 5 é o termo constante (fixo) e 2 é o coeficiente angular que depende da variável x."
  }
];

// Inicialização do Servidor Nativo
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/questoes' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(questoes));
        return;
    }

    if (req.url === '/api/ranking' && req.method === 'GET') {
        const rankingOrdenado = [...usuarios].sort((a, b) => b.xp - a.xp).slice(0, 100);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rankingOrdenado));
        return;
    }

    if (req.url === '/api/auth/cadastrar' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { nome, email, senha } = JSON.parse(body);
            if (usuarios.find(u => u.email === email)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ erro: 'Este e-mail já está cadastrado.' }));
                return;
            }
            const novoUsuario = { nome, email, senha, xp: 0, ofensiva: 1, ultimo_acesso: new Date() };
            usuarios.push(novoUsuario);
            
            console.log(`☁️ [MongoDB Atlas] Sincronizando novo estudante: ${nome}`);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ mensagem: 'Usuário registrado com sucesso.', usuario: novoUsuario }));
        });
        return;
    }

    if (req.url === '/api/auth/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { email, senha } = JSON.parse(body);
            const usuario = usuarios.find(u => u.email === email && u.senha === senha);
            if (!usuario) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ erro: 'E-mail ou senha incorretos.' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                mensagem: 'Login efetuado.',
                nome: usuario.nome, 
                email: usuario.email, 
                xp: usuario.xp, 
                ofensiva: usuario.ofensiva 
            }));
        });
        return;
    }

    if (req.url === '/api/questoes/responder' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { email, questaoId, alternativaSelecionada, tempoEsgotado } = JSON.parse(body);
            const usuario = usuarios.find(u => u.email === email);
            const questao = questoes.find(q => q.id === questaoId);

            if (!usuario || !questao) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ erro: 'Usuário ou questão não encontrados.' }));
                return;
            }

            const acertou = questao.correta === alternativaSelecionada;
            let xpGanho = 0;

            if (acertou) {
                xpGanho = tempoEsgotado ? 10 : 20;
                usuario.xp += xpGanho;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                correto: acertou,
                gabarito: questao.correta,
                novoXP: usuario.xp,
                xpGanho: xpGanho
            }));
        });
        return;
    }

    // Roteamento Estático Baseado no Nome Puro do Arquivo
    let urlPura = req.url.split('?');
    let arquivoNome = urlPura === '/' ? 'login.html' : path.basename(urlPura);
    let caminhoArquivo = path.join(PASTA_FRONTEND, arquivoNome);
    
    if (fs.existsSync(caminhoArquivo) && !fs.lstatSync(caminhoArquivo).isDirectory()) {
        let ext = path.extname(caminhoArquivo);
        let contentType = 'text/html';
        
        if (ext === '.js') contentType = 'text/javascript';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.json') contentType = 'application/json';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(caminhoArquivo));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ erro: 'Recurso não encontrado.' }));
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor NATIVO rodando na porta ${PORT}`);
    console.log(`🔗 Conexão configurada para o Cluster: cluster0.hyr5vnb.mongodb.net`);
    console.log(`🔒 Nuvem ativa! Acesse via http://localhost:${PORT}/login.html`);
});
