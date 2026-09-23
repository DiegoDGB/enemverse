"""Reconstrói questões 121–135 do caderno azul de 2024."""
import json
import re
from pathlib import Path
backend=Path(__file__).resolve().parents[1]
origem=json.loads((backend/'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes=[dict(q) for q in origem[120:135]]
marcadores={
 121:'Qual vetor representa a força resultante exercida pelo chão',
 122:'Na tirinha, a geladeira é necessária para fazer gelo porque',
 123:'Qual é a função orgânica correspondente ao grupo funcional',
 124:'Em relação ao metabolismo energético, os microrganismos',
 125:'O aparecimento do brilho nessas condições ocorre como',
 126:'Nessas vacinas, essa proteína viral induz a',
 127:'Ao repetir o experimento colocando um cilindro metálico',
 128:'Ao produzir eletricidade em dias chuvosos, o grafeno',
 129:'Qual a eficiência energética calculada pelo estudante?',
 130:'A transformação da energia térmica em energia útil ocorre',
 131:'O circuito que o estudante pode montar, para que ambos os',
 132:'Em qual desses pontos o amperímetro deve ser conectado',
 133:'Nessas condições, a massa de metano necessária para',
 134:'O método que retira o mercúrio de uma área contaminada',
 135:'Levando em conta apenas a reciclagem de latas, qual é',
}
enunciados={
 121:'Qual vetor representa a força resultante exercida pelo chão sobre Calvin no exato momento em que ele toca o chão?',
 122:'Na tirinha, a geladeira é necessária para fazer gelo porque',
 123:'Qual é a função orgânica correspondente ao grupo funcional comum presente nesses dois compostos?',
 124:'Em relação ao metabolismo energético, os microrganismos presentes nos tubos 1, 2 e 3 são classificados, respectivamente, como',
 125:'O aparecimento do brilho nessas condições ocorre como consequência de',
 126:'Nessas vacinas, essa proteína viral induz a',
 127:'Ao repetir o experimento colocando um cilindro metálico oco entre as placas, o esquema que representa o formato das linhas de campo assumido pelo farelo é:',
 128:'Ao produzir eletricidade em dias chuvosos, o grafeno',
 129:'Qual a eficiência energética calculada pelo estudante?',
 130:'A transformação da energia térmica em energia útil ocorre na etapa',
 131:'O circuito que o estudante pode montar, para que ambos os LEDs fiquem acesos e cada um seja percorrido por Iₘáₓ, é',
 132:'Em qual desses pontos o amperímetro deve ser conectado para que as lâmpadas acendam exatamente segundo as especificações de tensão e potência elétricas fornecidas?',
 133:'Nessas condições, a massa de metano necessária para substituir 10 mol de etanol na produção de energia é mais próxima de',
 134:'O método que retira o mercúrio de uma área contaminada, impedindo sua entrada na cadeia alimentar, é a',
 135:'Levando em conta apenas a reciclagem de latas, qual é o valor mais próximo da massa de bauxita, em tonelada, que deixou de ser extraída da natureza em 2020 no Brasil?',
}
imagens={
 121:[('questao-121.jpeg','Tirinha de Calvin e Haroldo sobre queda do balanço.'),('questao-121-alternativas.png','Cinco vetores desenhados nas alternativas A a E.')],
 122:[('questao-122.jpeg','Tirinha sobre a geladeira no interior de um iglu.')],
 123:[('questao-123.jpeg','Estruturas químicas dos compostos 1 e 2.')],
 124:[('questao-124.jpeg','Distribuição das bactérias nos tubos numerados de 1 a 3.')],
 125:[('questao-125.jpeg','Placa de saída de emergência fosforescente.')],
 127:[('questao-127.jpeg','Placas elétricas com linhas de campo na ausência do cilindro.'),('questao-127-alternativas.png','Cinco desenhos das linhas de campo nas alternativas A a E.')],
 128:[('questao-128.jpeg','Esquema da célula solar com grafeno e gotas de chuva.')],
 130:[('questao-130.jpeg','Diagrama pressão-volume do ciclo de Otto.'),('questao-130-tabela.png','Tabela das seis etapas do ciclo de Otto.')],
 131:[('questao-131-simbolo.jpeg','Símbolo e sentido permitido da corrente no LED.'),('questao-131-alternativas.png','Cinco circuitos elétricos das alternativas A a E.')],
 132:[('questao-132.jpeg','Circuito com duas lâmpadas, amperímetro e pontos de conexão A a E.')],
 134:[('questao-134.jpeg','Figura e definições dos métodos de fitorremediação.')],
}
alternativas_figuradas={
 121:['Vetor diagonal para cima e para a direita.','Vetor horizontal para a esquerda.','Vetor diagonal para cima e para a esquerda.','Vetor vertical para cima.','Vetor horizontal para a direita.'],
 127:['Linhas da placa A para B atravessam o cilindro sem desvio.','Linhas da placa B para A atravessam o cilindro sem desvio.','Linhas da placa B para A se desviam nas bordas, mas também atravessam o cilindro.','Linhas da placa A para B se desviam nas bordas e também atravessam o cilindro.','Linhas da placa A para B se desviam ao redor do cilindro, sem atravessar seu interior.'],
 131:['Um resistor em série com dois LEDs ligados em paralelo no sentido direto.','Dois ramos em paralelo, cada um com um resistor e um LED em série no sentido direto.','Dois ramos em paralelo, cada um com um resistor e um LED em série no sentido inverso.','Dois resistores e dois LEDs todos em série no sentido direto.','Um resistor em série com dois LEDs ligados em paralelo no sentido inverso.'],
}
for q in questoes:
 n=q['numero_enem'];apoio,sep,_=q['texto_apoio'].partition(marcadores[n])
 if not sep:raise ValueError(f'Marcador não encontrado: {n}')
 q['texto_apoio']=apoio.strip()
 q['enunciado']=enunciados[n]
 q['alternativas']=alternativas_figuradas.get(n) or [re.sub(r'\s*\n\s*',' ',a).strip() for a in q['alternativas']]
 if n==135:
  q['alternativas']=['1,0 × 10⁴ ton','3,9 × 10⁵ ton','5,0 × 10⁵ ton','1,9 × 10⁶ ton','2,0 × 10⁷ ton']
  q['texto_apoio']=q['texto_apoio'].replace('Al2\nO3\n)', 'Al₂O₃)').replace('4,0 × 105','4,0 × 10⁵')
 if n==129:
  q['texto_apoio']=q['texto_apoio'].replace('100 °\n°C','100 °C').replace('20 °\n°C','20 °C').replace('1 °\n°C','1 °C')
 if n==132:
  for original, corrigido in [('L1\n','L₁ '),('L2\n','L₂ '),('VQR\n','V(QR) ')]:q['texto_apoio']=q['texto_apoio'].replace(original,corrigido)
 if n==133:q['texto_apoio']=q['texto_apoio'].replace('1 m3','1 m³')
 q['midias']=[{'tipo':'imagem','url':f'/assets/enem/2024/azul/{nome}','legenda':'','alt':alt} for nome,alt in imagens.get(n,[])]
 q.pop('_revisao')
saida=backend/'dados/revisao-enem-2024-azul-lote-11.json'
saida.write_text(json.dumps({'aviso':'Lote parcial, questões 121–135 revisadas visualmente. Não importar isoladamente.','questoes':questoes},ensure_ascii=False,indent=2)+'\n')
print(saida)
