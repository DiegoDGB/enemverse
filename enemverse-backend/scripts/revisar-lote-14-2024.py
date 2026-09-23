"""Reconstrói questões 166–180, com alternativas gráficas e combinatórias."""
import json
import re
from pathlib import Path
backend=Path(__file__).resolve().parents[1]
origem=json.loads((backend/'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes=[dict(q) for q in origem[165:180]]
marcadores={
 166:'A expressão que relaciona d(Q) e d(R) é',
 167:'A diferença de tamanho, em valor absoluto, entre as',
 168:'O tipo de gráfico que descreve o comportamento oscilatório',
 169:'A probabilidade de se descobrir o padrão dessa Cifra',
 170:'O valor aproximado da magnitude M2',
 171:'O jardineiro escolherá a forma de',
 172:'Qual câmera registra o momento em que os ônibus A e B',
 173:'A maior probabilidade é que o funcionário sorteado esteja',
 174:'A projeção ortogonal, sobre o plano da base, da trajetória',
 175:'Dentre essas duas embalagens, a de maior capacidade',
 176:'A estimativa da receita, em milhão de reais, dessa',
 177:'O custo total, em real, para a produção de 80 mochilas será',
 178:'Nessa cidade, a mediana desses dados, em porcentagem,',
 179:'Qual a maior diferença, em real, entre os valores recebidos',
 180:'A expressão numérica que representa o número máximo',
}
enunciados={
 166:'A expressão que relaciona d(Q) e d(R) é',
 167:'A diferença de tamanho, em valor absoluto, entre as medidas, em polegada, das telas do celular 2 e do celular 1, representada apenas com uma casa decimal, é',
 168:'O tipo de gráfico que descreve o comportamento oscilatório de um amortecedor aprovado nesse experimento é',
 169:'A probabilidade de se descobrir o padrão dessa Cifra de César apenas na terceira tentativa é dada por',
 170:'O valor aproximado da magnitude M₂ do segundo terremoto, expresso com uma casa decimal, é igual a',
 171:'O jardineiro escolherá a forma de',
 172:'Qual câmera registra o momento em que os ônibus A e B se encontram?',
 173:'A maior probabilidade é que o funcionário sorteado esteja na faixa etária',
 174:'A projeção ortogonal, sobre o plano da base, da trajetória ABCDEF descrita pelo personagem é',
 175:'Dentre essas duas embalagens, a de maior capacidade apresentará volume, em centímetro cúbico, igual a',
 176:'A estimativa da receita, em milhão de reais, dessa indústria, para o ano de 2026, obtida a partir dessa reta de tendência, é',
 177:'O custo total, em real, para a produção de 80 mochilas será',
 178:'Nessa cidade, a mediana desses dados, em porcentagem, da umidade relativa do ar no período considerado foi',
 179:'Qual a maior diferença, em real, entre os valores recebidos por esse serviço entre dois desses engenheiros?',
 180:'A expressão numérica que representa o número máximo de maneiras distintas de formar essa equipe é',
}
imagens={
 166:[('questao-166-alternativas.png','Expressões fracionárias das alternativas A a E.')],
 167:[('questao-167.jpeg','Comparação das diagonais dos celulares de 3 1/2 e 4 5/6 polegadas.')],
 168:[(f'questao-168-{c.lower()}.jpeg',f'Gráfico de oscilação da alternativa {c}.') for c in 'ABCDE'],
 169:[('questao-169-cifra.png','Correspondência das letras na cifra de César.'),('questao-169-alternativas.png','Produtos e somas de probabilidades das alternativas A a E.')],
 170:[('questao-170-formula.png','Fórmula da relação entre magnitudes e energias sísmicas.')],
 171:[('questao-171-alternativas.png','Áreas propostas para hexágono, quadrado e triângulo equilátero.')],
 172:[('questao-172.jpeg','Mapa do percurso e campos de visão das câmeras I a V.')],
 173:[('questao-173.jpeg','Distribuição de empregados em setores e faixas etárias.')],
 174:[('questao-174.jpeg','Trajetória ABCDEF em paredes e plano da base.')]+[(f'questao-174-{c.lower()}.jpeg',f'Projeção ortogonal proposta na alternativa {c}.') for c in 'ABCDE'],
 175:[('questao-175.jpeg','Duas orientações de folha retangular para montagem de embalagens cilíndricas.')],
 176:[('questao-176.jpeg','Pontos de receita anual e reta de tendência entre 2014 e 2021.')],
 177:[('questao-177-tabela.png','Tabela de quantidade de mochilas e custo total.')],
 178:[('questao-178-tabela.png','Tabela da umidade relativa em seis meses.')],
 180:[('questao-180-alternativas.png','Cinco expressões combinatórias completas das alternativas A a E.')],
}
formulas={
 166:['d(Q) = (1/4) d(R)','d(Q) = (1/2) d(R)','d(Q) = (3/4) d(R)','d(Q) = (3/2) d(R)','d(Q) = (2/3) d(R)'],
 168:['Gráfico A: amplitude constante menor no asfalto e constante maior na estrada de chão.','Gráfico B: amplitude constante no asfalto e decrescente na estrada de chão.','Gráfico C: amplitude decrescente na estrada de chão.','Gráfico D: amplitude menor na estrada de chão do que no asfalto.','Gráfico E: amplitude menor na estrada de chão do que no asfalto.'],
 169:['1/25 + 1/25 + 1/25','24/25 + 23/24 + 1/23','1/25 × 1/24 × 1/23','24/25 × 23/25 × 1/25','24/25 × 23/24 × 1/23'],
 171:['Hexágono regular; área = k²√3/24.','Hexágono regular; área = 3k²√3/2.','Quadrado; área = k²/16.','Triângulo equilátero; área = k²√3/36.','Triângulo equilátero; área = k²√3/4.'],
 174:[f'Projeção ortogonal {c} da trajetória ABCDEF, conforme a figura.' for c in 'ABCDE'],
 175:['4 000π','2 000π','4 000/π','1 000/π','500/π'],
 180:[
  '(7!/4!) × (6!/4!)',
  '[7!/(3! × 4!)] × [6!/(2! × 4!)]',
  '[7!/(3! × 4!)] + [6!/(2! × 4!)] + [5!/(1! × 4!)]',
  '([7!/(3! × 4!)] + [6!/(2! × 4!)]) × ([7!/(4! × 3!)] + [6!/(1! × 5!)]) × ([7!/(5! × 2!)] + [6!/(0! × 6!)])',
  '[7!/(3! × 4!)] × [6!/(2! × 4!)] + [7!/(4! × 3!)] × [6!/(1! × 5!)] + [7!/(5! × 2!)] × [6!/(0! × 6!)]',
 ]
}
for q in questoes:
 n=q['numero_enem'];apoio,sep,_=q['texto_apoio'].partition(marcadores[n])
 if not sep:raise ValueError(f'Marcador não encontrado: {n}')
 q['texto_apoio']=apoio.strip()
 q['enunciado']=enunciados[n]
 q['alternativas']=formulas.get(n) or [re.sub(r'\s*\n\s*',' ',a).strip() for a in q['alternativas']]
 if n==167:
  q['texto_apoio']=re.sub(r'telas medindo 3\s*polegadas', 'telas medindo 3 1/2 polegadas',q['texto_apoio'])
  q['texto_apoio']=re.sub(r'telas medindo 4\s*polegadas', 'telas medindo 4 5/6 polegadas',q['texto_apoio'])
 if n==170:
  a=q['texto_apoio'];start=a.index('M M\nE\nE');end=a.index('Estudos mais abrangentes',start)
  q['texto_apoio']=a[:start]+'M₂ − M₁ = (2/3) log(E₂/E₁)\n'+a[end:]
  q['texto_apoio']=q['texto_apoio'].replace('M1\n','M₁ ').replace('M2\n','M₂ ').replace('E1\n','E₁ ').replace('E2\n','E₂ ')
 if n==172:
  a=q['texto_apoio'];start=a.index('O alcance de cada uma das cinco câmeras é:');end=a.index('Em determinado horário',start)
  q['texto_apoio']=a[:start]+('O alcance de cada uma das cinco câmeras é:\n• câmera I: 1/5 do percurso;\n• câmera II: 3/10 do percurso;\n• câmera III: 1/10 do percurso;\n• câmera IV: 1/10 do percurso;\n• câmera V: 3/10 do percurso.\n')+a[end:]
 q['midias']=[{'tipo':'imagem','url':f'/assets/enem/2024/azul/{nome}','legenda':'','alt':alt} for nome,alt in imagens.get(n,[])]
 q.pop('_revisao')
saida=backend/'dados/revisao-enem-2024-azul-lote-14.json'
saida.write_text(json.dumps({'aviso':'Lote parcial, questões 166–180 reconstruídas. Revisão integral antes de importar.','questoes':questoes},ensure_ascii=False,indent=2)+'\n')
print(saida)
