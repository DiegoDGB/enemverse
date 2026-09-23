"""Monta as questões 6–10 revisadas visualmente contra páginas 5 e 6."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[5:10]]

enunciados = {
    6: 'A reportagem apresenta duas iniciativas: o livro Amazonês e as camisetas do Caboquês Ilustrado. Com temática em comum, essas iniciativas',
    7: 'Esse conjunto de minibiografias tem como propósito',
    8: 'O conjunto dessas práticas musicais demonstra que os instrumentos mencionados no texto',
    9: 'As causas do desequilíbrio na saúde mental apontadas no texto estão relacionadas às',
    10: 'Segundo a argumentação construída nesse texto, o podcast',
}
marcadores = {
    6: 'A reportagem apresenta duas iniciativas:',
    7: 'Esse conjunto de minibiografias tem como propósito',
    8: 'O conjunto dessas práticas musicais demonstra que os',
    9: 'As causas do desequilíbrio na saúde mental apontadas',
    10: 'Segundo a argumentação construída nesse texto, o podcast',
}

for q in questoes:
    numero = q['numero_enem']
    apoio, separador, _ = q['texto_apoio'].partition(marcadores[numero])
    if not separador:
        raise ValueError(f'Não localizei o enunciado da questão {numero}')
    q['texto_apoio'] = apoio.strip()
    q['enunciado'] = enunciados[numero]
    q['alternativas'] = [re.sub(r'\s*\n\s*', ' ', a) for a in q['alternativas']]
    q.pop('_revisao')

saida = backend / 'dados/revisao-enem-2024-azul-lote-02.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 6–10 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Cinco questões revisadas: {saida}')
