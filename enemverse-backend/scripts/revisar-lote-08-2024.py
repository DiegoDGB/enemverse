"""Reconstrói questões 76–90, conferidas com páginas 27–31 do dia 1."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[75:90]]
enunciados = {
    76: 'Qual elemento da cultura contemporânea se relaciona às características do conceito de rizoma, conforme descrito no texto?',
    77: 'O que as capas da revista Travel in Brazil, publicadas entre 1941 e 1944 pelo Departamento de Imprensa e Propaganda (DIP), evidenciam?',
    78: 'O princípio ético apresentado no texto, como elemento estruturante da vida em sociedade, se traduz pela seguinte formulação teórica:',
    79: 'A eliminação, para os refugiados, do tipo de fronteira descrita no texto necessita de políticas públicas de',
    80: 'Embora situados em continentes diferentes com práticas sociais distintas, Rússia e Angola se aproximam, conforme os textos I e II, no aspecto',
    81: 'Na esfera de ação do Estado, com a Constituição de 1988, os espaços mencionados tornaram-se objeto de',
    82: 'Qual tipo de raciocínio corresponde ao padrão de pensamento exibido pelo personagem do texto?',
    83: 'No texto, a cartografia é apresentada como um instrumento usado essencialmente para a',
    84: 'Como parte do patrimônio cultural da Amazônia, o regatão foi fundamental, no século XIX, para a',
    85: 'Qual problema de âmbito nacional argentino o movimento social mencionado expôs ao mundo?',
    86: 'A comparação entre as imagens de satélite indica a ocorrência de um processo de',
    87: 'O que sustenta o exercício do poder, conforme a configuração apresentada no texto escrito na década de 1920?',
    88: 'Qual medida atenua os problemas abordados no texto?',
    89: 'A composição e o funcionamento do organismo internacional apresentados revelam a seguinte característica das relações internacionais entre os países-membros:',
    90: 'O texto apresenta uma contradição interna do capitalismo caracterizada pela',
}
marcadores = {
    76: 'Qual elemento da cultura contemporânea se relaciona às',
    77: 'O que as capas da revista Travel in Brazil, publicadas entre 1941 e 1944',
    78: 'O princípio ético apresentado no texto, como elemento estruturante',
    79: 'A eliminação, para os refugiados, do tipo de fronteira',
    80: 'Embora situados em continentes diferentes com práticas',
    81: 'Na esfera de ação do Estado, com a Constituição de 1988,',
    82: 'Qual tipo de raciocínio corresponde ao padrão de pensamento',
    83: 'No texto, a cartografia é apresentada como um instrumento',
    84: 'Como parte do patrimônio cultural da Amazônia, o regatão',
    85: 'Qual problema de âmbito nacional argentino o movimento',
    86: 'A comparação entre as imagens de satélite indica a',
    87: 'O que sustenta o exercício do poder, conforme a configuração',
    88: 'Qual medida atenua os problemas abordados no texto?',
    89: 'A composição e o funcionamento do organismo internacional',
    90: 'O texto apresenta uma contradição interna do capitalismo',
}
imagens = {
    77: [('questao-077.jpeg', 'Três capas da revista Travel in Brazil, dos anos 1940.')],
    86: [
        ('questao-086-texto-1.jpeg', 'Texto I: imagem de satélite de Dubai em 2000.'),
        ('questao-086-texto-2.jpeg', 'Texto II: imagem de satélite de Dubai em 2020.')
    ]
}

for q in questoes:
    numero = q['numero_enem']
    apoio, separador, _ = q['texto_apoio'].partition(marcadores[numero])
    if not separador:
        raise ValueError(f'Não localizei o enunciado da questão {numero}')
    q['texto_apoio'] = apoio.strip()
    q['enunciado'] = enunciados[numero]
    q['alternativas'] = [re.sub(r'\s*\n\s*', ' ', a) for a in q['alternativas']]
    q['midias'] = [
        {'tipo': 'imagem', 'url': f'/assets/enem/2024/azul/{nome}', 'legenda': '', 'alt': alt}
        for nome, alt in imagens.get(numero, [])
    ]
    q.pop('_revisao')

saida = backend / 'dados/revisao-enem-2024-azul-lote-08.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 76–90 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Quinze questões revistas: {saida}')
