"""Reconstrói questões 91–105, com figuras e notação revistas nas páginas 2–6."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[90:105]]
enunciados = {
    91: 'Considerando o carro, seus ocupantes e o muro da figura como um sistema isolado, o crumple zone aumenta a segurança dos passageiros porque, durante uma colisão, a deformação da estrutura do carro',
    92: 'Qual das equações representa a reação global que ocorre durante o funcionamento dessa CCM?',
    93: 'A concepção científica atual define esses compostos como substâncias',
    94: 'Na estrutura desse fármaco, o grupamento capaz de reagir com a base de Brönsted-Lowry é o grupo',
    95: 'Nesse contexto, essa técnica é importante para detectar genes',
    96: 'Em qual ponto deve ser fixada a peça de chumbo para corrigir a posição do centro de massa desse conjunto roda/pneu?',
    97: 'Qual é o valor mais próximo da massa, em grama, de cloreto de sódio presente em uma única colher pequena?',
    98: 'Ao longo do processo evolutivo, percebem-se, entre esses animais, perdas e ganhos nos padrões citados que envolvem o(a)',
    99: 'Durante a aproximação, como o operador percebe o som da sirene e qual é a relação entre as frequências fᵣ e f₀ medidas pelo radar?',
    100: 'A natureza da imagem formada e a distância vertical entre cada ponto objeto e seu correspondente ponto imagem são',
    101: 'Para um valor máximo do ruído de fundo, a maior distância que um estudante pode estar do professor para que ainda consiga compreender sua fala é mais próxima de',
    102: 'Utilizando esse procedimento, o sabor foi conservado porque houve',
    103: 'O processo pelo qual ocorre transferência de calor dos coletores solares para o reservatório térmico é a',
    104: 'Nesse contexto, como a urbanização está causando riscos à saúde humana?',
    105: 'Em animais vertebrados, essa associação de poluentes será preferencialmente acumulada no tecido',
}
marcadores = {
    91: 'Considerando o carro, seus ocupantes e o muro da figura',
    92: 'Qual das equações representa a reação global que ocorre',
    93: 'A concepção científica atual define esses compostos',
    94: 'Na estrutura desse fármaco, o grupamento capaz de',
    95: 'Nesse contexto, essa técnica é importante para detectar',
    96: 'Em qual ponto deve ser fixada a peça de chumbo para corrigir',
    97: 'Qual é o valor mais próximo da massa, em grama, de',
    98: 'Ao longo do processo evolutivo, percebem-se, entre',
    99: 'Durante a aproximação, como o operador percebe o som',
    100: 'A natureza da imagem formada e a distância vertical entre',
    101: 'Para um valor máximo do ruído de fundo, a maior distância',
    102: 'Utilizando esse procedimento, o sabor foi conservado',
    103: 'O processo pelo qual ocorre transferência de calor dos',
    104: 'Nesse contexto, como a urbanização está causando',
    105: 'Em animais vertebrados, essa associação de poluentes',
}
imagens = {
    91: [('questao-091.jpeg', 'Carro em colisão, com região deformável, airbags e cintos de segurança.')],
    92: [
        ('questao-092.jpeg', 'Esquema da célula a combustível microbiana com ânodo, membrana e cátodo.'),
        ('questao-092-reacoes.png', 'Semirreações químicas indicadas na prova oficial.')
    ],
    94: [('questao-094.jpeg', 'Estrutura química da nimesulida e grupos funcionais identificados.')],
    96: [('questao-096.jpeg', 'Roda com cinco pontos possíveis de fixação de uma peça de chumbo.')],
    98: [('questao-098.jpeg', 'Cladograma de mamíferos monotremados, marsupiais e placentários.')],
    100: [('questao-100.jpeg', 'Mirascópio e esquema com raios refletidos, posições e medidas.')],
    101: [('questao-101.jpeg', 'Gráfico do nível sonoro por distância em uma sala de aula.')],
    103: [('questao-103.jpeg', 'Esquema do aquecedor solar com reservatório e coletor.')],
    104: [('questao-104.jpeg', 'Fluxograma de urbanização, saneamento, água, biodiversidade e saúde.')],
}
alternativas_formulas = {
    92: [
        'CH₃COO⁻ (aq) + O₂ (g) → 2 CO₂ (g) + 3 H⁺ (aq)',
        'CO₂ (g) + O₂ (g) + H⁺ (aq) → H₂O (l) + CH₃COO⁻ (aq)',
        'CH₃COO⁻ (aq) + H⁺ (aq) + 2 O₂ (g) → 2 CO₂ (g) + 2 H₂O (l)',
        'CH₃COO⁻ (aq) + 6 H₂O (l) → 2 CO₂ (g) + 2 O₂ (g) + 15 H⁺ (aq)',
        '2 CO₂ (g) + 11 H⁺ (aq) + O₂ (g) → CH₃COO⁻ (aq) + 4 H₂O (l)'
    ],
    99: [
        'Mais grave do que o som emitido e fᵣ < f₀.',
        'Mais agudo do que o som emitido e fᵣ < f₀.',
        'Mais agudo do que o som emitido e fᵣ = f₀.',
        'Mais agudo do que o som emitido e fᵣ > f₀.',
        'Mais grave do que o som emitido e fᵣ > f₀.'
    ]
}

for q in questoes:
    numero = q['numero_enem']
    apoio, separador, _ = q['texto_apoio'].partition(marcadores[numero])
    if not separador:
        raise ValueError(f'Não localizei o enunciado da questão {numero}')
    q['texto_apoio'] = apoio.strip()
    if numero == 92:
        inicio = q['texto_apoio'].index('CH3\nCOO−')
        fim = q['texto_apoio'].index('QUINTO, A. C.', inicio)
        q['texto_apoio'] = (
            q['texto_apoio'][:inicio]
            + 'CH₃COO⁻ (aq) + 2 H₂O (l) → 2 CO₂ (g) + 7 H⁺ (aq) + 8 e⁻\n'
            + '4 H⁺ (aq) + O₂ (g) + 4 e⁻ → 2 H₂O (l)\n'
            + q['texto_apoio'][fim:]
        )
    if numero == 99:
        q['texto_apoio'] = q['texto_apoio'].replace('f0\n', 'f₀ ').replace('fr\n', 'fᵣ ')
    q['enunciado'] = enunciados[numero]
    q['alternativas'] = alternativas_formulas.get(numero) or [re.sub(r'\s*\n\s*', ' ', a) for a in q['alternativas']]
    q['midias'] = [
        {'tipo': 'imagem', 'url': f'/assets/enem/2024/azul/{nome}', 'legenda': '', 'alt': alt}
        for nome, alt in imagens.get(numero, [])
    ]
    q.pop('_revisao')

saida = backend / 'dados/revisao-enem-2024-azul-lote-09.json'
saida.write_text(json.dumps({
    'aviso': 'Lote parcial, questões 91–105 revisadas visualmente. Não importar isoladamente.',
    'questoes': questoes
}, ensure_ascii=False, indent=2) + '\n')
print(f'Quinze questões revistas: {saida}')
