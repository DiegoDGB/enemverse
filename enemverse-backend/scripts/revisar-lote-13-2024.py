"""Reconstrói questões 151–165 com diagramas e alternativas gráficas."""
import json
import re
from pathlib import Path
backend=Path(__file__).resolve().parents[1]
origem=json.loads((backend/'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes=[dict(q) for q in origem[150:165]]
marcadores={
 151:'A medida da área do vão aberto nessa maquete, em',
 152:'A ordenação dos saldos S1',
 153:'Qual é a representação decimal da taxa percentual desse',
 154:'O tempo médio, em minuto, necessário para a leitura',
 155:'O proprietário do imóvel deverá adquirir o sensor do tipo',
 156:'Nessas condições, a expressão que fornece o valor V a',
 157:'A partir da próxima semana, qual será o novo valor',
 158:'O valor mínimo, em real, a ser gasto pelo agricultor é',
 159:'A unidade de medida adequada para descrever o fluxo',
 160:'A vazão do sistema de abastecimento da segunda piscina,',
 161:'O gráfico que descreve, em cada instante, a maior altura',
 162:'Qual é o mês que esse cliente deverá escolher para',
 163:'A medida do comprimento dessa correia, em centímetro, é',
 164:'A distância, em quilômetro, entre o hospital e cada um dos',
 165:'Para isso, a redução do tempo em que o sinal ficará',
}
enunciados={
 151:'A medida da área do vão aberto nessa maquete, em centímetro quadrado, é',
 152:'A ordenação dos saldos S₁, S₂ e S₃, do maior para o menor, é',
 153:'Qual é a representação decimal da taxa percentual desse crescimento populacional?',
 154:'O tempo médio, em minuto, necessário para a leitura completa de um contrato de serviço dentre os listados no quadro é, com uma casa decimal, aproximadamente,',
 155:'O proprietário do imóvel deverá adquirir o sensor do tipo',
 156:'Nessas condições, a expressão que fornece o valor V a ser pago por uma viagem desse aplicativo é',
 157:'A partir da próxima semana, qual será o novo valor cobrado, em real, por uma porção?',
 158:'O valor mínimo, em real, a ser gasto pelo agricultor é',
 159:'A unidade de medida adequada para descrever o fluxo (φ) de água que atravessa a superfície da membrana é',
 160:'A vazão do sistema de abastecimento da segunda piscina, em litro por minuto, é',
 161:'O gráfico que descreve, em cada instante, a maior altura de coluna de água, dentre aquelas que vão sendo formadas ao longo do enchimento do tanque, é',
 162:'Qual é o mês que esse cliente deverá escolher para realizar a compra do apartamento?',
 163:'A medida do comprimento dessa correia, em centímetro, é',
 164:'A distância, em quilômetro, entre o hospital e cada um dos postos de saúde, é um valor entre',
 165:'Para isso, a redução do tempo em que o sinal ficará vermelho, em segundo, estabelecida pelo engenheiro foi de',
}
imagens={
 152:[('questao-152.jpeg','Gráfico de importações e exportações brasileiras nos três meses assinalados.')],
 154:[('questao-154-tabela.png','Tabela de tempos de leitura de contratos dos serviços A a F.')],
 155:[('questao-155.jpeg','Setor circular com raio R e ângulo α do sensor de presença.')],
 158:[('questao-158.jpeg','Cartaz com promoção e preços dos defensivos e da máscara.')],
 159:[('questao-159-alternativas.png','Expressões fracionárias das unidades de medida A a E.')],
 161:[('questao-161-tanque.jpeg','Tanque com três compartimentos e anteparos de alturas H/2 e H/4.')]+[(f'questao-161-{c.lower()}.jpeg',f'Gráfico de altura da coluna de água da alternativa {c}.') for c in 'ABCDE'],
 163:[('questao-163.jpeg','Duas polias, trechos tangentes de correia e medidas.')],
 164:[('questao-164.jpeg','Triângulo dos postos P₁, P₂, P₃ e hospital H.')],
}
formulas={
 152:['S₁, S₃ e S₂.','S₂, S₁ e S₃.','S₂, S₃ e S₁.','S₃, S₁ e S₂.','S₃, S₂ e S₁.'],
 159:['mL · s · cm²','(mL/s) · cm²','mL/(cm² · s)','(cm² · s)/mL','cm²/(mL · s)'],
 161:['Gráfico A: cresce entre 0 e 2 h, permanece constante entre 2 e 4 h e cresce de 4 a 12 h.','Gráfico B: cresce entre 0 e 2 h, permanece constante entre 2 e 6 h e cresce de 6 a 12 h.','Gráfico C: cresce entre 0 e 2 h, permanece constante entre 2 e 10 h e cresce de 10 a 12 h.','Gráfico D: segmentos horizontais com degraus entre 2 e 6 h.','Gráfico E: segmentos horizontais com degraus entre 2 e 6 h.'],
}
for q in questoes:
 n=q['numero_enem'];apoio,sep,_=q['texto_apoio'].partition(marcadores[n])
 if not sep:raise ValueError(f'Marcador não encontrado: {n}')
 q['texto_apoio']=apoio.strip()
 q['enunciado']=enunciados[n]
 q['alternativas']=formulas.get(n) or [re.sub(r'\s*\n\s*',' ',a).strip() for a in q['alternativas']]
 if n==151:q['texto_apoio']=q['texto_apoio'].replace('1672 m2\n','1 672 m²\n')
 if n==152:q['texto_apoio']=re.sub(r'S([123])\n',lambda m:'S'+('₁','₂','₃')[int(m.group(1))-1]+' ',q['texto_apoio'])
 if n==155:q['texto_apoio']=q['texto_apoio'].replace('°\n°','°').replace('70 m2\n','70 m²\n')
 if n==164:
  for original,corrigido in [('P1\n','P₁ '),('P2\n','P₂ '),('P3\n','P₃ ')]:q['texto_apoio']=q['texto_apoio'].replace(original,corrigido)
 if n==165:
  q['texto_apoio']=(
   'Para melhorar o fluxo de ônibus em uma avenida que tem dois semáforos, a prefeitura reduzirá o tempo em que cada sinal ficará vermelho, '
   'que atualmente é de 15 segundos a cada 60 segundos. Admita que o instante de chegada de um ônibus a cada semáforo é aleatório.\n'
   'O engenheiro de tráfego da prefeitura calculou a probabilidade de um ônibus encontrar cada um deles vermelho, obtendo 15/60. '
   'A partir daí, estabeleceu uma mesma redução na quantidade do tempo, em segundo, em que cada sinal ficará vermelho, '
   'de maneira que a probabilidade de um ônibus encontrar ambos os sinais vermelhos numa mesma viagem seja igual a 4/100, '
   'considerando os eventos independentes.'
  )
 q['midias']=[{'tipo':'imagem','url':f'/assets/enem/2024/azul/{nome}','legenda':'','alt':alt} for nome,alt in imagens.get(n,[])]
 q.pop('_revisao')
saida=backend/'dados/revisao-enem-2024-azul-lote-13.json'
saida.write_text(json.dumps({'aviso':'Lote parcial, questões 151–165 revisadas visualmente. Não importar isoladamente.','questoes':questoes},ensure_ascii=False,indent=2)+'\n')
print(saida)
