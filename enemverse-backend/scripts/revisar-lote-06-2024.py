"""Reconstrói as questões 46–60, conferidas com páginas 20–23 do dia 1."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[45:60]]
enunciados = {
    46: 'As diferenças entre os eventos geológicos relatados decorrem de distintas posições geográficas das cidades em relação a:',
    47: 'O texto dos sanitaristas atuantes nas décadas de 1920 e 1930 veicula uma mensagem caracterizada pela',
    48: 'Conforme o texto, o evento gerou o seguinte impacto na relação entre as pessoas e o seu espaço vivido:',
    49: 'No Brasil, os eventos descritos ganharam conotação política ao serem vinculados à',
    50: 'Os diferentes pontos de vista presentes no texto expressam que o bispo era, ao mesmo tempo,',
    51: 'A expressão cultural descrita no texto foi rejeitada no início da Idade Moderna por congregar',
    52: 'A reivindicação do movimento norte-americano apresentada no texto consiste na necessidade de',
    53: 'A desproporção de velocidade e tempo de duração nos tipos de inundação destacados é condicionada pela',
    54: 'Com base na reflexão suscitada no texto, o preconceito de identidade é responsável por um tipo de injustiça',
    55: 'Esse texto reforça uma concepção metafísica clássica que remete a um(a)',
    56: 'O ritual brasileiro apresentado no texto representa, para seus adeptos, a',
    57: 'As características descritas no texto exibem a importância dos espaços públicos para a',
    58: 'Os textos indicam que a prática de ações virtuosas, sempre efetivada na pólis, ocorre por meio do(a)',
    59: 'De acordo com o texto, o legado das universidades medievais torna-se um relevante patrimônio histórico-cultural por',
    60: 'O texto expõe a possibilidade de uma nova racionalidade produtiva por meio de uma gestão territorial que se baseia na',
}
marcadores = {
    46: 'As diferenças entre os eventos geológicos relatados',
    47: 'O texto dos sanitaristas atuantes nas décadas de 1920 e',
    48: 'Conforme o texto, o evento gerou o seguinte impacto na',
    49: 'No Brasil, os eventos descritos ganharam conotação',
    50: 'Os diferentes pontos de vista presentes no texto expressam',
    51: 'A expressão cultural descrita no texto foi rejeitada no início',
    52: 'A reivindicação do movimento norte-americano apresentada',
    53: 'A desproporção de velocidade e tempo de duração nos',
    54: 'Com base na reflexão suscitada no texto, o preconceito',
    55: 'Esse texto reforça uma concepção metafísica clássica que',
    56: 'O ritual brasileiro apresentado no texto representa, para',
    57: 'As características descritas no texto exibem a importância',
    58: 'Os textos indicam que a prática de ações virtuosas,',
    59: 'De acordo com o texto, o legado das universidades medievais',
    60: 'O texto expõe a possibilidade de uma nova racionalidade',
}

for q in questoes:
    numero = q['numero_enem']
    apoio, separador, _ = q['texto_apoio'].partition(marcadores[numero])
    if not separador:
        raise ValueError(f'Não localizei o enunciado da questão {numero}')
    q['texto_apoio'] = apoio.strip()
    q['enunciado'] = enunciados[numero]
    q['alternativas'] = [re.sub(r'\s*\n\s*', ' ', a) for a in q['alternativas']]
    if numero == 53:
        q['midias'] = [{
            'tipo': 'imagem', 'url': '/assets/enem/2024/azul/questao-053.png',
            'legenda': '', 'alt': 'Gráfico de velocidade por tempo: inundação gradual e inundação brusca.'
        }]
    q.pop('_revisao')

saida = backend / 'dados/revisao-enem-2024-azul-lote-06.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 46–60 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Quinze questões revistas: {saida}')
