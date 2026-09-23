"""Monta questões 31–45, conferidas com páginas 13–18 do dia 1."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[30:45]]
enunciados = {
    31: 'Convidada para o último baile do Império, na Ilha Fiscal, localizada no Rio de Janeiro, Flora devaneia sobre aspectos daquele contexto, no qual o narrador ironiza a',
    32: 'Nesse trecho, o drama do declínio físico da narradora transmite uma sensibilidade lírica centrada na',
    33: 'Nesse cartaz, a expressão “Vou deixar que você se vá”, em conjunto com os elementos não verbais utilizados, tem a finalidade de',
    34: 'De acordo com esse texto, o aplicativo Linklado contribuiu para a',
    35: 'Ao tematizar o casamento, esse fragmento reproduz uma concepção de literatura romântica evidenciada na',
    36: 'A leitura comparativa das duas esculturas, separadas por mais de 2 500 anos, indica a',
    37: 'Defendendo a importância da música para o bem-estar e o equilíbrio emocional das pessoas, a autora usa, como recurso persuasivo, a',
    38: 'Esse poema, por meio da ideia de deslocamento, metaforiza a tentativa de pessoas',
    39: 'O “falar errado” a que o texto se refere constitui um preconceito em relação ao uso que Adoniran Barbosa fazia da língua em suas composições, pois esse uso',
    40: 'A apropriação de elementos como rivalidade, competitividade, torcida e gritos de guerra pelo festival de Parintins evidencia a',
    41: 'As informações dessa reportagem auxiliam no combate ao câncer de mama masculino por apresentarem um alerta sobre o(s)',
    42: 'Apesar de haver marcas formais de carta e receita, a característica que define esse texto como poema é o(a)',
    43: 'O experimento realizado por Regina Valkenborgh resultou no entendimento de que a',
    44: 'A mudança no programa olímpico mencionada no texto mostra que o esporte está se',
    45: 'Ao abordar a relação dos memes com a educação, a reportagem sustenta uma crítica à',
}
marcadores = {
    31: 'Convidada para o último baile do Império, na Ilha Fiscal,',
    32: 'Nesse trecho, o drama do declínio físico da narradora',
    33: 'Nesse cartaz, a expressão “Vou deixar que você se vá”,',
    34: 'De acordo com esse texto, o aplicativo Linklado contribuiu',
    35: 'Ao tematizar o casamento, esse fragmento reproduz uma concepção',
    36: 'A leitura comparativa das duas esculturas, separadas por mais de 2500 anos,',
    37: 'Defendendo a importância da música para o bem-estar e',
    38: 'Esse poema, por meio da ideia de deslocamento, metaforiza',
    39: 'O “falar errado” a que o texto se refere constitui um',
    40: 'Aapropriação de elementos como rivalidade, competitividade,',
    41: 'As informações dessa reportagem auxiliam no combate',
    42: 'Apesar de haver marcas formais de carta e receita,',
    43: 'O experimento realizado por Regina Valkenborgh resultou',
    44: 'A mudança no programa olímpico mencionada no texto',
    45: 'Ao abordar a relação dos memes com a educação,',
}
imagens = {
    33: [('questao-033.jpeg', 'Cartaz da campanha do agasalho com mulher segurando roupa.')],
    36: [
        ('questao-036-texto-1.jpeg', 'Texto I: cabeça de figura feminina de aproximadamente 2700–2500 a.C.'),
        ('questao-036-texto-2.jpeg', 'Texto II: escultura Cabeça de mulher, de Modigliani.')
    ],
    43: [('questao-043.png', 'Registro fotográfico dos arcos de luz do Sol no céu ao longo de oito anos.')]
}

for q in questoes:
    numero = q['numero_enem']
    apoio, separador, _ = q['texto_apoio'].partition(marcadores[numero])
    if not separador:
        raise ValueError(f'Não localizei o enunciado da questão {numero}')
    q['texto_apoio'] = apoio.strip()
    if numero == 41:
        q['texto_apoio'] = re.sub(r'(?m)([1-4]\.)\s*\x07[^\n]*\n', r'\1 ', q['texto_apoio'])
    q['enunciado'] = enunciados[numero]
    q['alternativas'] = [re.sub(r'\s*\n\s*', ' ', a) for a in q['alternativas']]
    q['midias'] = [
        {'tipo': 'imagem', 'url': f'/assets/enem/2024/azul/{nome}', 'legenda': '', 'alt': alt}
        for nome, alt in imagens.get(numero, [])
    ]
    q.pop('_revisao')

saida = backend / 'dados/revisao-enem-2024-azul-lote-05.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 31–45 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Quinze questões revistas: {saida}')
