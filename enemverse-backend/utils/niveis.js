const XP_POR_NIVEL = 300;

function nivelPorXP(valor) {
    const xp = Math.max(0, Math.floor(Number(valor) || 0));
    const numero = Math.floor(xp / XP_POR_NIVEL) + 1;
    const titulo = numero >= 10 ? 'Mestre Supremo' : numero >= 7 ? 'Especialista Federal'
        : numero >= 4 ? 'Veterano das Bancas' : numero >= 2 ? 'Guerreiro Estudantil' : 'Aspirante';
    const acumuladoNoNivel = xp % XP_POR_NIVEL;
    return {
        numero, titulo, xpAtual: xp, xpPorNivel: XP_POR_NIVEL, xpNoNivel: acumuladoNoNivel,
        xpProximoNivel: XP_POR_NIVEL - acumuladoNoNivel,
        progresso: Math.floor(acumuladoNoNivel * 100 / XP_POR_NIVEL)
    };
}

module.exports = { nivelPorXP };
