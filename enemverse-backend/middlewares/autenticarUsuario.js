const jwt = require('jsonwebtoken');

function autenticarUsuario(req, res, next) {
    const authorization = req.header('Authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Acesso negado. Token de autenticação necessário.' });
    }

    const token = authorization.slice(7).trim();
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error('JWT_SECRET não configurado no ambiente.');
        return res.status(500).json({ erro: 'Configuração de autenticação indisponível.' });
    }

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
