"""Monta questões 21–30, conferidas com páginas 10–13 do dia 1."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[20:30]]
enunciados = {
    21: 'Pela leitura desses textos, infere-se que a compreensão da arte plumária indígena requer a consideração da',
    22: 'Na letra da canção, a tematização da violência mencionada no Texto II manifesta-se',
    23: 'Ainda que faça uma avaliação positiva da série, nessa resenha, o autor aponta aspectos negativos da obra ao utilizar',
    24: 'Nesse fragmento, a discussão dos personagens traz à cena um debate acerca da escrita que',
    25: 'Eliseu D’Angelo Visconti (1866-1944) desenvolveu diversas obras no Brasil, com grande influência das escolas europeias. Em sua pintura Três meninas no jardim, há',
    26: 'Segundo o texto, apesar do aumento da participação de mulheres em lutas, a realidade na escola ainda é diferente em razão do(a)',
    27: 'Como estratégia para se aproximar de seu leitor, a autora usa uma postura de empatia explicitada em',
    28: 'Para apresentar a apropriação literária que faz da obra de Machado de Assis, o autor desse texto',
    29: 'Das reflexões do narrador, apreende-se uma perspectiva que associa a adoção',
    30: 'No que diz respeito à arte, o posicionamento de Antônio Prata, no Texto II, aproxima-se da tese de Graciliano Ramos, no Texto I, uma vez que ambos',
}
marcadores = {
    21: 'Pela leitura desses textos, infere-se que a compreensão',
    22: 'Na letra da canção, a tematização da violência mencionada',
    23: 'Ainda que faça uma avaliação positiva da série, nessa',
    24: 'Nesse fragmento, a discussão dos personagens traz à',
    25: 'Eliseu D’Angelo Visconti (1866-1944) desenvolveu diversas',
    26: 'Segundo o texto, apesar do aumento da participação de',
    27: 'Como estratégia para se aproximar de seu leitor, a autora',
    28: 'Para apresentar a apropriação literária que faz da obra de',
    29: 'Das reflexões do narrador, apreende-se uma perspectiva',
    30: 'No que diz respeito à arte, o posicionamento de Antônio',
}
imagens = {
    21: ('Diadema de penas coloridas da etnia Kayapó.', 'questao-021.jpeg'),
    25: ('Pintura Três meninas no jardim, de Eliseu Visconti.', 'questao-025.jpeg'),
}

for q in questoes:
    numero = q['numero_enem']
    apoio, separador, _ = q['texto_apoio'].partition(marcadores[numero])
    if not separador:
        raise ValueError(f'Não localizei o enunciado da questão {numero}')
    q['texto_apoio'] = apoio.strip()
    q['enunciado'] = enunciados[numero]
    q['alternativas'] = [re.sub(r'\s*\n\s*', ' ', a) for a in q['alternativas']]
    if numero in imagens:
        alt, nome = imagens[numero]
        q['midias'] = [{'tipo': 'imagem', 'url': f'/assets/enem/2024/azul/{nome}', 'legenda': '', 'alt': alt}]
    q.pop('_revisao')

saida = backend / 'dados/revisao-enem-2024-azul-lote-04.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 21–30 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Dez questões revistas: {saida}')
