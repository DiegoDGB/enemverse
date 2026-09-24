"""Confere os 180 registros com os quatro PDFs oficiais, sem liberar importação.

Uso: python scripts/auditar-caderno-2024-pdf.py PROVA_D1 PROVA_D2 GABARITO_D1 GABARITO_D2
Requer PyMuPDF (fitz). A extração textual não substitui a comparação visual de fórmulas e desenhos.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path
import fitz

backend = Path(__file__).resolve().parents[1]
if len(sys.argv) != 5:
    raise SystemExit(__doc__)
provas = [fitz.open(path) for path in sys.argv[1:3]]
gabaritos = [fitz.open(path) for path in sys.argv[3:5]]
if any(len(pdf) == 0 for pdf in provas + gabaritos):
    raise SystemExit('Um dos PDFs não contém páginas legíveis. Recupere a fonte oficial.')
questoes = json.loads((backend / 'dados/enem-2024-azul.json').read_text())['questoes']
respostas = json.loads((backend / 'dados/gabarito-2024-azul.json').read_text())['respostas']

def normalizar(texto):
    sem_acentos = unicodedata.normalize('NFKD', texto.lower()).encode('ascii', 'ignore').decode()
    return re.sub('[^a-z0-9]', '', sem_acentos)

paginas = [[normalizar(page.get_text()) for page in pdf] for pdf in provas]
texto_g1 = '\n'.join(page.get_text() for page in gabaritos[0])
texto_g2 = '\n'.join(page.get_text() for page in gabaritos[1])
chaves_pdf = {
    **{int(n): letra for n, letra, _ in re.findall(r'(?m)^([1-5])\n([A-E])\n([A-E])\n', texto_g1)},
    **{int(n): letra for n, letra in re.findall(r'(?m)^(\d{1,2})\n([A-E])\n', texto_g1) if int(n) > 5},
    **{int(n): 'ANULADA' if letra == 'Anulado' else letra for n, letra in re.findall(r'(?m)^(\d{2,3})\n([A-E]|Anulado)\n', texto_g2)},
}
problemas = []
locais = []
primeiro_dia_alternativas = 0
for numero, q in enumerate(questoes, 1):
    if q['numero_enem'] != numero:
        problemas.append(f'{numero}: numeração divergente')
        continue
    prova = 0 if numero <= 90 else 1
    inicio = normalizar(' '.join(q['enunciado'].split()[:8]))
    encontradas = [i + 1 for i, texto in enumerate(paginas[prova]) if inicio in texto]
    if not encontradas:
        problemas.append(f'{numero}: início do enunciado não localizado no PDF')
        continue
    pagina = encontradas[0]
    texto_pdf = paginas[prova][pagina - 1]
    if normalizar(q['enunciado']) not in texto_pdf:
        problemas.append(f'{numero}: enunciado não coincide com o texto do PDF')
    apoio = normalizar(q['texto_apoio'])
    if apoio[:min(80, len(apoio))] not in texto_pdf:
        problemas.append(f'{numero}: início do texto de apoio não localizado na página {pagina}')
    if numero <= 90:
        coincidencias = sum(normalizar(alt) in texto_pdf for alt in q['alternativas'])
        primeiro_dia_alternativas += coincidencias
        if coincidencias != 5:
            problemas.append(f'{numero}: {coincidencias}/5 alternativas textuais localizadas no PDF')
    if respostas[str(numero)] != chaves_pdf.get(numero):
        problemas.append(f'{numero}: gabarito diverge do PDF oficial')
    if len(q['alternativas']) != 5 or any(not a.strip() for a in q['alternativas']):
        problemas.append(f'{numero}: alternativas ausentes')
    for midia in q['midias']:
        if not (backend.parent / midia['url'].lstrip('/')).is_file():
            problemas.append(f'{numero}: mídia ausente: {midia["url"]}')
    locais.append((numero, prova + 1, pagina))
if len(questoes) != 180 or len(chaves_pdf) != 180:
    problemas.append(f'Cobertura incompleta: {len(questoes)} questões; {len(chaves_pdf)} respostas nos PDFs')
print(f'Questões localizadas: {len(locais)}/180')
print(f'Alternativas textuais do dia 1 localizadas: {primeiro_dia_alternativas}/450')
print(f'Respostas oficiais extraídas: {len(chaves_pdf)}/180')
print(f'Arquivos de mídia referenciados: {sum(len(q["midias"]) for q in questoes)}')
print(f'Divergências automáticas: {len(problemas)}')
for problema in problemas:
    print('- ' + problema)
if problemas:
    sys.exit(1)
