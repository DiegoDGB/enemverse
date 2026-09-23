"""Reconstrói questões 106–120 do caderno azul de 2024."""
import json
import re
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
origem = json.loads((backend / 'fontes-pdf/revisao-2024-azul.json').read_text())['questoes']
questoes = [dict(q) for q in origem[105:120]]
marcadores = {
 106:'Que explicação física justifica esse procedimento?',
 107:'Em qual órgão esse processo será iniciado?',
 108:'O conjunto dessas mudanças graduais é análogo ao',
 109:'Um atleta que sonha em disputar os Jogos Olímpicos e',
 110:'Qual é a vantagem dessa similaridade para as falsas-corais?',
 111:'Para superar essa limitação, o exoesqueleto deve ser',
 112:'Qual heredograma foi recebido pelo casal?',
 113:'Em qual etapa numerada ocorre uma transformação redox',
 114:'Na condição de razão ar/combustível igual a 18, haverá',
 115:'Qual componente celular foi afetado pela droga utilizada',
 116:'O método adequado para separar o Mg(OH)2',
 117:'Ao emitirem o som estridente, esses anfíbios',
 118:'Considerando o equilíbrio químico envolvido, qual creme dental',
 119:'Nessa situação, em quantos minutos o nadador completará',
 120:'Uma possível consequência da infecção por HTLV-1 é o',
}
enunciados = {
 106:'Que explicação física justifica esse procedimento?',
 107:'Em qual órgão esse processo será iniciado?',
 108:'O conjunto dessas mudanças graduais é análogo ao processo natural denominado',
 109:'Um atleta que sonha em disputar os Jogos Olímpicos e tem uma maior proporção de fibras brancas que fibras vermelhas teria mais vantagens na realização da prova de:',
 110:'Qual é a vantagem dessa similaridade para as falsas-corais?',
 111:'Para superar essa limitação, o exoesqueleto deve ser',
 112:'Qual heredograma foi recebido pelo casal?',
 113:'Em qual etapa numerada ocorre uma transformação redox como a que ocorre nos procariontes nitrificantes?',
 114:'Na condição de razão ar/combustível igual a 18, haverá uma emissão',
 115:'Qual componente celular foi afetado pela droga utilizada no experimento?',
 116:'O método adequado para separar o Mg(OH)₂ dessa mistura é a',
 117:'Ao emitirem o som estridente, esses anfíbios',
 118:'Considerando o equilíbrio químico envolvido, qual creme dental promove a maior desmineralização do esmalte do dente?',
 119:'Nessa situação, em quantos minutos o nadador completará a prova?',
 120:'Uma possível consequência da infecção por HTLV-1 é o desenvolvimento de',
}
imagens = {
 110:[('questao-110.jpeg','Fotografias comparativas da coral-verdadeira e da falsa-coral.')],
 112:[('questao-112-alternativas.png','Legenda e cinco heredogramas das alternativas A a E.')],
 113:[('questao-113.jpeg','Esquema numerado do ciclo do nitrogênio.'),('questao-113-ciclo-carbono.jpeg','Esquema numerado do ciclo do carbono.')],
 114:[('questao-114.jpeg','Gráfico das emissões de gases versus razão ar/combustível.')],
 115:[('questao-115.jpeg','Esquemas de amebas de controle e sob efeito da citocalasina B.')],
 118:[('questao-118-tabela.png','Equilíbrio de desmineralização e tabela de cremes dentais com pH.')],
 119:[('questao-119.jpeg','Circuito de natação e vetores de velocidades da corrente e do nadador.')],
}
for q in questoes:
 n=q['numero_enem']
 apoio, sep, _=q['texto_apoio'].partition(marcadores[n])
 if not sep: raise ValueError(f'Marcador não encontrado: {n}')
 q['texto_apoio']=apoio.strip()
 q['enunciado']=enunciados[n]
 q['alternativas']=[re.sub(r'\s*\n\s*',' ',a).strip() for a in q['alternativas']]
 if n==112:
  q['alternativas']=[
   'Heredograma A: filha não daltônica, filha daltônica, filho daltônico e filho não daltônico.',
   'Heredograma B: filha não daltônica, filha portadora, filho não daltônico e filho daltônico.',
   'Heredograma C: duas filhas portadoras e dois filhos não daltônicos.',
   'Heredograma D: duas filhas não daltônicas e dois filhos daltônicos.',
   'Heredograma E: duas filhas daltônicas e dois filhos não daltônicos.',
  ]
 if n==114:
  q['texto_apoio']=q['texto_apoio'].replace('CO2\n)', 'CO₂)').replace('O2\n)', 'O₂)')
  q['alternativas']=[a.replace('O2','O₂').replace('CO2','CO₂') for a in q['alternativas']]
 if n==116:
  q['texto_apoio']=q['texto_apoio'].replace('Mg2+\ne','Mg²⁺ e').replace('Ca(OH)2\n,','Ca(OH)₂,').replace('Ca2+\n,','Ca²⁺,')
  start=q['texto_apoio'].index('Mg2+\n(aq)')
  q['texto_apoio']=q['texto_apoio'][:start]+'Mg²⁺ (aq) + Ca(OH)₂ (aq) → Mg(OH)₂ (s) + Ca²⁺ (aq)'
 q['midias']=[{'tipo':'imagem','url':f'/assets/enem/2024/azul/{nome}','legenda':'','alt':alt} for nome,alt in imagens.get(n,[])]
 q.pop('_revisao')
saida=backend/'dados/revisao-enem-2024-azul-lote-10.json'
saida.write_text(json.dumps({'aviso':'Lote parcial, questões 106–120 revisadas visualmente. Não importar isoladamente.','questoes':questoes},ensure_ascii=False,indent=2)+'\n')
print(saida)
