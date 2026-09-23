"""Reconstrói questões 136–150, inclusive fórmulas e gráficos de Matemática."""
import json
import re
from pathlib import Path
backend=Path(__file__).resolve().parents[1]
origem=json.loads((backend/'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes=[dict(q) for q in origem[135:150]]
marcadores={
 136:'A lente objetiva a ser selecionada pela estudante é a',
 137:'O valor correto da média das notas desse estudante é',
 138:'O número de possibilidades diferentes que esse',
 139:'O artesão efetuará a compra na loja',
 140:'Os conceitos de João e Felipe foram, respectivamente,',
 141:'O valor máximo assumido pela grandeza III, quando a',
 142:'Qual foi o total de figuras contidas na mensagem enviada?',
 143:'Para que se alcance o lucro esperado, o gasto médio por',
 144:'O sólido obtido foi um(a)',
 145:'Em quantos metros quadrados a área do campo do',
 146:'Qual será a medida, em metro, do maior lado do galinheiro?',
 147:'As posições indicadas pelo estudante foram',
 148:'Os valores das constantes a e b são',
 149:'A medida da aresta da nova embalagem, em centímetro,',
 150:'A compra será realizada na loja',
}
enunciados={
 136:'A lente objetiva a ser selecionada pela estudante é a',
 137:'O valor correto da média das notas desse estudante é',
 138:'O número de possibilidades diferentes que esse funcionário tem para cadastrar sua senha é',
 139:'O artesão efetuará a compra na loja',
 140:'Os conceitos de João e Felipe foram, respectivamente,',
 141:'O valor máximo assumido pela grandeza III, quando a grandeza I varia de 1 a 3, é',
 142:'Qual foi o total de figuras contidas na mensagem enviada?',
 143:'Para que se alcance o lucro esperado, o gasto médio por pessoa com bebidas e petiscos, em real, deverá ser de',
 144:'O sólido obtido foi um(a)',
 145:'Em quantos metros quadrados a área do campo do Maracanã foi reduzida?',
 146:'Qual será a medida, em metro, do maior lado do galinheiro?',
 147:'As posições indicadas pelo estudante foram',
 148:'Os valores das constantes a e b são',
 149:'A medida da aresta da nova embalagem, em centímetro, deve ser',
 150:'A compra será realizada na loja',
}
imagens={
 136:[('questao-136.jpeg','Microscópio com lentes ocular e objetivas.')],
 138:[('questao-138.jpeg','Teclado numérico com letras associadas às teclas.')],
 139:[('questao-139-tabela.png','Preços dos componentes X e Y nas lojas I e II.')],
 141:[('questao-141-grafico-1.jpeg','Gráfico da grandeza II em função da grandeza I.'),('questao-141-grafico-2.jpeg','Gráfico da grandeza III em função da grandeza II.')],
 142:[('questao-142-tabela.png','Três etapas de duplicação das figuras no visor da mensagem.')],
 144:[('questao-144.jpeg','Trapézio PQRS preso à vareta pelo lado PS.')],
 147:[('questao-147.jpeg','Visor da máquina de números com seis posições e frações.')],
 148:[('questao-148.jpeg','Temperatura em função do tempo, curva de decaimento.'),('questao-148-alternativas.png','Expressões matemáticas das alternativas A a E.')],
 149:[('questao-149-alternativas.png','Alternativas com raízes quadradas e cúbicas.')],
 150:[('questao-150-sala.jpeg','Planta da sala retangular e disposição das colunas.'),('questao-150-tabela.png','Tabela de raios e preços por loja.')],
}
formulas={
 142:['3 × 2¹⁹','3 × 2²⁰','3 × 2²¹','3 × 2²⁰ − 1','3 × 2²⁰ − 3'],
 148:['a = 20; b = log(0,5)','a = 100; b = 0,5','a = 20; b = (0,5)^(1/10)','a = 20; b = (40)^(1/10) / 80','a = 20; b = 40'],
 149:['6','18','6√6','6∛6','3∛12'],
}
for q in questoes:
 n=q['numero_enem'];apoio,sep,_=q['texto_apoio'].partition(marcadores[n])
 if not sep:raise ValueError(f'Marcador não encontrado: {n}')
 q['texto_apoio']=apoio.strip()
 q['enunciado']=enunciados[n]
 q['alternativas']=formulas.get(n) or [re.sub(r'\s*\n\s*',' ',a).strip() for a in q['alternativas']]
 if n==136:q['texto_apoio']=q['texto_apoio'].replace('10−3','10⁻³').replace('10-3\n','10⁻³ ')
 if n==142:q['texto_apoio']=q['texto_apoio'].replace('figuras\ndo tipo no visor','figuras do tipo 🙂 no visor')
 if n==144:q['texto_apoio']=q['texto_apoio'].replace('360°\n°','360°')
 if n==148:q['texto_apoio']=q['texto_apoio'].replace('T(t) = a + 80 bt\n','T(t) = a + 80 bᵗ')
 q['midias']=[{'tipo':'imagem','url':f'/assets/enem/2024/azul/{nome}','legenda':'','alt':alt} for nome,alt in imagens.get(n,[])]
 q.pop('_revisao')
saida=backend/'dados/revisao-enem-2024-azul-lote-12.json'
saida.write_text(json.dumps({'aviso':'Lote parcial, questões 136–150 revisadas visualmente. Não importar isoladamente.','questoes':questoes},ensure_ascii=False,indent=2)+'\n')
print(saida)
