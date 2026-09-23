const jwt = require('jsonwebtoken');

function autenticarUsuario(req, res, next) {
    const authorization = req.header('Authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Acesso negado. Token de autenticação necessário.' });
    }

    const token = authorization.slice(7).trim();
    // Mantém compatibilidade com o login atual nesta etapa.
    // A remoção do fallback será feita junto da validação de JWT_SECRET no ambiente.
    const jwtSecret = process.env.JWT_SECRET || 'CHAVE_TOKEN_ENEMVERSE';

    try {
        const decodificado = jwt.verify(token, jwtSecret);

        if (!decodificado?.id) {
            return res.status(401).json({ erro: 'Token inválido ou expirado.' });
        }

        req.usuario = {
            id: decodificado.id,
            email: decodificado.email
        };

        next();
    } catch (err) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
}

module.exports = autenticarUsuario;
