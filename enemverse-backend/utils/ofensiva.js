function fusoValido(valor) {
    if (typeof valor !== 'string' || valor.length > 80) return false;
    try {
        new Intl.DateTimeFormat('pt-BR', { timeZone: valor });
        return true;
    } catch (_) {
        return false;
    }
}

function diaLocal(data, fuso) {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: fusoValido(fuso) ? fuso : 'UTC',
        year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(data);
    const campos = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
    return `${campos.year}-${campos.month}-${campos.day}`;
}

function distanciaDias(de, ate) {
    const a = Date.parse(`${de}T00:00:00Z`);
    const b = Date.parse(`${ate}T00:00:00Z`);
    return Number.isFinite(a) && Number.isFinite(b) ? Math.round((b - a) / 86400000) : Infinity;
}

function ofensivaVisivel(usuario, agora = new Date()) {
    if (!usuario.ultimo_estudo_dia) return 0;
    const diferenca = distanciaDias(usuario.ultimo_estudo_dia,
        diaLocal(agora, usuario.fuso_horario || 'UTC'));
    return diferenca === 0 || diferenca === 1 ? Number(usuario.ofensiva) || 0 : 0;
}

function proximaOfensiva(usuario, agora, fusoRecebido) {
    const fuso = fusoValido(fusoRecebido) ? fusoRecebido : usuario.fuso_horario || 'UTC';
    const dia = diaLocal(agora, fuso);
    const diferenca = usuario.ultimo_estudo_dia
        ? distanciaDias(usuario.ultimo_estudo_dia, dia) : Infinity;
    return {
        ultimo_estudo_dia: dia,
        fuso_horario: fuso,
        ofensiva: diferenca === 0 ? Number(usuario.ofensiva) || 1
            : diferenca === 1 ? (Number(usuario.ofensiva) || 0) + 1 : 1
    };
}

module.exports = { diaLocal, ofensivaVisivel, proximaOfensiva };
