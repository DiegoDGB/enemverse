const http = require('http');

let usuarios = [];
let questoes = [
  {
    "id": "ENEM-2023-BIO-001",
    "ano": 2023,
    "materia": "Ciências da Natureza e suas Tecnologias",
    "subtopico": "Biologia",
    "texto_apoio": "<p>A introdução de espécies exóticas em ecossistemas nativos pode causar desequilíbrios ecológicos severos.</p>",
    "enunciado": "O principal impacto imediato decorrente da introdução de uma espécie exótica predadora em uma ilha isolada é:",
    "alternativas": [
      "O aumento imediato da biodiversidade local.",
      "A redução populacional ou extinção de presas nativas.",
      "A alteração da radiação solar incidente na vegetação.",
      "O surgimento espontâneo de novas barreiras geográficas.",
      "O aumento na taxa de mutações benéficas das plantas locais."
    ],
    "correta": 1,
    "explicacao": "A alternativa B está correta porque predadores exóticos dizimam as populações nativas."
  }
];

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url.startsWith('/api/questoes') && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(questoes));
        return;
    }

    if (req.url.startsWith('/api/ranking') && req.method === 'GET') {
        const rankingOrdenado = [...usuarios].sort((a, b) => b.xp - a.xp).slice(0, 100);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rankingOrdenado));
        return;
    }

    if (req.url.startsWith('/api/auth/cadastrar') && req.method === 'POST') {
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

    if (req.url.startsWith('/api/auth/login') && req.method === 'POST') {
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

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ erro: 'Endpoint não encontrado.' }));
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`🚀 API NATIVA DO ENEMVERSE ATIVA NA NUVEM NA PORTA ${PORT}!`);
});
