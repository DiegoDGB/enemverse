import json
import random
from http.server import BaseHTTPRequestHandler

def gerar_questao_aleatoria_dinamica():
    """
    Motor procedural que monta uma questão inédita mudando valores,
    produtos e descontos em tempo real a cada requisição.
    """
    # 1. Banco de cenários e preços base
    cenarios_matematica = [
        {"produto": "um smartphone premium", "preco_base": 2000},
        {"produto": "um notebook de estudos", "preco_base": 3000},
        {"produto": "um fone de ouvido bluetooth", "preco_base": 400},
        {"produto": "um tablet com caneta", "preco_base": 1500}
    ]
    
    # Sorteia um cenário
    cenario = random.choice(cenarios_matematica)
    produto = cenario["produto"]
    preco = cenario["preco_base"]
    
    # 2. Sorteia uma porcentagem de desconto realista para o Pix (10%, 15%, 20% ou 25%)
    desconto_porcentagem = random.choice([10, 15, 20, 25])
    
    # 3. Cálculos matemáticos exatos feitos no back-end
    valor_desconto = (desconto_porcentagem / 100) * preco
    valor_correto = int(preco - valor_desconto)
    
    # 4. Cria distratores (alternativas erradas) plausíveis para confundir o estudante
    alternativas_falsas = [
        int(preco - (valor_desconto / 2)),         # Erro: aplicou apenas metade do desconto
        int(preco),                                 # Erro: esqueceu de subtrair o desconto
        int(preco - desconto_porcentagem),          # Erro: subtraiu a porcentagem direto em reais (Ex: 2000 - 15)
        int(valor_correto + random.choice([-50, 50, 100])) # Erro: valor flutuante próximo
    ]
    
    # Remove duplicatas acidentais e garante que não inclua o valor correto na lista de falsas
    alternativas_falsas = list(set([v for v in alternativas_falsas if v != valor_correto]))
    
    # Garante que teremos exatamente 4 alternativas erradas completando com números aleatórios
    while len(alternativas_falsas) < 4:
        alternativas_falsas.append(valor_correto + random.randint(15, 85))
        alternativas_falsas = list(set(alternativas_falsas))
        
    # 5. Une a alternativa correta com as falsas e embaralha as posições
    todas_alternativas = [valor_correto] + alternativas_falsas[:4]
    random.shuffle(todas_alternativas)
    
    # Descobre em qual índice o valor correto caiu após o embaralhamento (0 a 4)
    indice_correto = todas_alternativas.index(valor_correto)
    
    # Formata todos os números para texto em moeda nacional (R$)
    alternativas_formatadas = [f"R$ {val},00" for val in todas_alternativas]
    
    # 6. Monta o objeto final idêntico à assinatura esperada pelo front-end
    questao_dinamica = {
        "id": f"ENEM-PROD-{random.randint(10000, 99999)}",
        "ano": 2026,
        "materia": "Matemática e suas Tecnologias",
        "subtopico": "Álgebra / Porcentagem",
        "texto_apoio": f"<p>Uma loja de comércio eletrônico parceira da Central do Estudante está realizando uma queima de estoque e oferece um excelente desconto de <strong>{desconto_porcentagem}%</strong> para pagamentos à vista realizados via Pix.</p>",
        "enunciado": f"Um estudante do ENEMVerse decidiu aproveitar a promoção e comprou {produto} que custava originalmente R$ {preco},00. O valor final, em reais, pago pelo estudante ao fechar a compra foi de:",
        "alternativas": alternativas_formatadas,
        "correta": indice_correto,
        "explicacao": f"A alternativa está correta. O desconto de {desconto_porcentagem}% sobre R$ {preco},00 é calculado multiplicando ({desconto_porcentagem}/100) × {preco} = R$ {int(valor_desconto)},00. Subtraindo esse valor do preço original, temos: {preco} - {int(valor_desconto)} = R$ {valor_correto},00."
    }
    
    return [questao_dinamica] # Devolve dentro de uma lista para o array.forEach do JS funcionar

class ObterQuestoesHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Invoca o motor de geração procedural on-the-fly
            dados_questoes = gerar_questao_aleatoria_dinamica()
            conteudo_resposta = json.dumps(dados_questoes, ensure_ascii=False)
            status_codigo = 200
            
        except Exception as e:
            # Fallback seguro caso ocorra erro (evita quebrar o JSON do front-end)
            conteudo_resposta = json.dumps([
                {
                    "id": "ERR-FALLBACK",
                    "ano": 2026,
                    "materia": "Erro de Processamento",
                    "subtopico": "Geral",
                    "texto_apoio": "<p>Houve uma falha temporária ao gerar a questão dinâmica no servidor.</p>",
                    "enunciado": f"Detalhes internos da exceção capturada: {str(e)}",
                    "alternativas": ["Tentar recarregar a página", "Voltar depois", "Avisar o suporte", "Nenhuma das anteriores", "Opção E"],
                    "correta": 0,
                    "explicacao": "Verifique os logs de execução na sua dashboard da Vercel."
                }
            ], ensure_ascii=False)
            status_codigo = 200 # Devolve 200 com a questão de erro para não quebrar o JS

        self.send_response(status_codigo)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*') 
        self.end_headers()
        
        self.wfile.write(conteudo_resposta.encode('utf-8'))

# Mapeamento do ponto de entrada (entrypoint) exigido pela Vercel
handler = ObterQuestoesHandler
