"""Reconstrói questões 61–75 do primeiro dia, páginas 23–27."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[60:75]]
enunciados = {
    61: 'O texto apresenta uma reflexão da personagem acerca de um problema característico da filosofia contemporânea, que trata da(s)',
    62: 'Ao comparar os textos, conclui-se que eles apresentam posicionamentos filosóficos divergentes com relação ao',
    63: 'Ao analisar as consequências da dinâmica apresentada no texto, as autoras destacam a importância do conceito como:',
    64: 'Os textos indicam a participação de artistas e intelectuais brasileiros em defesa do(a)',
    65: 'De acordo com o texto, o processo apresentado contribuiu para',
    66: 'Qual foi o efeito social resultante do avanço tecnológico mencionado no texto?',
    67: 'A adoção da tecnologia mencionada amplia a rentabilidade das comunidades citadas, ao possibilitar o(a):',
    68: 'Para a região amazônica, a relação entre as informações dos textos indica uma redução do(a)',
    69: 'Nesse texto, escrito no século XVIII, a autora reivindica para as mulheres a',
    70: 'De acordo com o texto, o território torna-se cada vez mais dotado de objetos com a finalidade de intensificar a',
    71: 'Conforme o texto, o compromisso assumido pelo Brasil foi resultado dos tensionamentos promovidos por',
    72: 'A realidade abordada no texto indica a necessidade de se promover uma ética interpessoal centrada no',
    73: 'No início do século XX, a incorporação da técnica de produção descrita no texto promoveu uma renovação da',
    74: 'O reconhecimento da festa descrita no texto, como patrimônio histórico, encontra sustentação no(a)',
    75: 'No período iluminista, os espaços sociais mencionados contribuíram para',
}
marcadores = {
    61: 'O texto apresenta uma reflexão da personagem acerca de',
    62: 'Ao comparar os textos, conclui-se que eles apresentam',
    63: 'Ao analisar as consequências da dinâmica apresentada no',
    64: 'Os textos indicam a participação de artistas e intelectuais',
    65: 'De acordo com o texto, o processo apresentado contribuiu',
    66: 'Qual foi o efeito social resultante do avanço tecnológico',
    67: 'A adoção da tecnologia mencionada amplia a rentabilidade',
    68: 'Para a região amazônica, a relação entre as informações',
    69: 'Nesse texto, escrito no século XVIII, a autora reivindica',
    70: 'De acordo com o texto, o território torna-se cada vez mais',
    71: 'Conforme o texto, o compromisso assumido pelo Brasil foi',
    72: 'A realidade abordada no texto indica a necessidade de se',
    73: 'No início do século XX, a incorporação da técnica de',
    74: 'O reconhecimento da festa descrita no texto, como',
    75: 'No período iluminista, os espaços sociais mencionados',
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

saida = backend / 'dados/revisao-enem-2024-azul-lote-07.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 61–75 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Quinze questões revistas: {saida}')
