"""Monta as cinco questões de Inglês conferidas visualmente com o PDF oficial."""
import json
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[:5]]

enunciados = {
    1: 'A relação entre as citações atribuídas ao físico Albert Einstein e ao cantor e compositor Bob Marley reside na crença de que é necessário',
    2: 'Nessa letra de canção, que aborda um contexto de ódio e intolerância, o marcador “instead of” introduz a ideia de',
    3: 'O texto estabelece uma relação entre elementos da natureza e comandos de um programa de computador para',
    4: 'O problema abordado nesse texto sobre imigrantes residentes nos Estados Unidos diz respeito aos prejuízos gerados pelo(a)',
    5: 'A carta da editora Stephanie Allen-Nichols à escritora Alice Walker tem o propósito de',
}
apoios = {
    1: 'Disponível em: http://thumbpress.com. Acesso em: 28 out. 2013.',
    2: origem[1]['texto_apoio'].split('Nessa letra de canção')[0].strip(),
    3: 'Disponível em: www.hongkiat.com. Acesso em: 18 ago. 2017 (adaptado).',
    4: origem[3]['texto_apoio'].split('O problema abordado')[0].strip(),
    5: 'Disponível em: www.clickhole.com. Acesso em: 26 out. 2015.',
}
alts = {
    1: ['dar oportunidade a pessoas que parecem necessitadas.', 'identificar contextos que podem representar perigo.', 'tirar proveito de situações que podem ser adversas.', 'evitar dificuldades que parecem ser intransponíveis.', 'contestar circunstâncias que parecem ser harmônicas.'],
    2: ['mudança de comportamento.', 'panorama de conflitos.', 'rotina de isolamento.', 'perspectiva bélica.', 'cenário religioso.'],
    3: ['alertar as pessoas sobre a rápida destruição da natureza.', 'conscientizar os indivíduos sobre a passagem acelerada do tempo.', 'apresentar aos leitores os avanços tecnológicos na área da agricultura.', 'orientar os usuários sobre o emprego sustentável das novas tecnologias.', 'informar os interessados sobre o tempo de crescimento de novas árvores.'],
    4: ['repúdio ao sotaque espanhol no uso do inglês.', 'resignação diante do apagamento da língua materna.', 'escassez de oportunidades de aprendizado do espanhol.', 'choque entre falantes de línguas distintas de diferentes gerações.', 'concorrência entre as variações linguísticas do inglês e as do espanhol.'],
    5: ['problematizar o enredo de sua obra.', 'acusar o recebimento de seu manuscrito.', 'solicitar a revisão ortográfica de seu texto.', 'informar a transferência de seu livro a outra editora.', 'comunicar a recusa da publicação de seu romance.'],
}
alt_img = {
    1: 'Duas ilustrações com citações atribuídas a Albert Einstein e Bob Marley.',
    3: 'Ilustração de uma janela de exclusão de arquivos: ícones de árvores desaparecem da Terra.',
    5: 'Carta ilustrada da editora Stephanie Allen-Nichols dirigida a Alice Walker.',
}

for q in questoes:
    numero = q['numero_enem']
    q['texto_apoio'] = apoios[numero]
    q['enunciado'] = enunciados[numero]
    q['alternativas'] = alts[numero]
    if numero in alt_img:
        q['midias'] = [{
            'tipo': 'imagem', 'url': f'/assets/enem/2024/azul/questao-{numero:03}.jpeg',
            'legenda': '', 'alt': alt_img[numero]
        }]
    q.pop('_revisao')

saida = backend / 'dados/revisao-enem-2024-azul-lote-01.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 1–5 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Cinco questões revisadas: {saida}')
