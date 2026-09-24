// Configuração única de ambiente do frontend EnemVerse.
// Produção usa a API de produção; previews/localhost usam a API DEV.
window.ENEMVERSE_API_BASE_URL = window.location.hostname === 'enemverse.vercel.app'
    ? 'https://enemverse-api.onrender.com'
    : 'https://enemverse-api-dev.onrender.com';
