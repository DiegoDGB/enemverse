"""Monta questões 11–20, revistas nas páginas 6–9 da prova do dia 1."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[10:20]]
enunciados = {
    11: 'Nesse texto, as falas atribuídas a Evanildo Bechara são representativas da variedade linguística',
    12: 'A Língua da Tabatinga tem sido preservada porque o(a)',
    13: 'Esse texto é marcado pela função referencial da linguagem, uma vez que cumpre o propósito de',
    14: 'A vivência relatada no texto evidencia que as variedades linguísticas',
    15: 'Ao tratar da telemedicina, esse texto ressalta que um dos benefícios dessa tecnologia para a sociedade é o fato de ela',
    16: 'Sob a perspectiva da multiculturalidade e de acordo com o texto, a produção artística afro-brasileira caracteriza-se pelo(a)',
    17: 'A apresentação do dado estatístico ao final desse texto revela a intenção de',
    18: 'O texto evidencia a perspectiva ampliada de saúde ao abordar criticamente a pandemia da covid-19 a partir do(a)',
    19: 'Nesse fragmento do romance de Júlia Lopes de Almeida, escrito no cenário brasileiro pós-abolição, a narradora exprime um olhar crítico sobre a',
    20: 'O recurso utilizado na progressão textual para garantir a unidade temática dessa crônica é a',
}
marcadores = {
    11: 'Nesse texto, as falas atribuídas a Evanildo Bechara são',
    12: 'A Língua da Tabatinga tem sido preservada porque o(a)',
    13: 'Esse texto é marcado pela função referencial da linguagem,',
    14: 'A vivência relatada no texto evidencia que as variedades',
    15: 'Ao tratar da telemedicina, esse texto ressalta que um dos',
    16: 'Sob a perspectiva da multiculturalidade e de acordo com',
    17: 'A apresentação do dado estatístico ao final desse texto',
    18: 'O texto evidencia a perspectiva ampliada de saúde ao',
    19: 'Nesse fragmento do romance de Júlia Lopes de Almeida,',
    20: 'O recurso utilizado na progressão textual para garantir a',
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

saida = backend / 'dados/revisao-enem-2024-azul-lote-03.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 11–20 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Dez questões revistas: {saida}')
