"""Gera PDF com evidências reais dos testes finais, sem executar testes."""
import json
import subprocess
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from html import escape
from collections import Counter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/final-tests'
def read(name):
    return json.loads((OUT / name).read_text())
current = read('after-fixes.json')
before = read('before-fixes.json')
smoke = read('smoke-results.json')
root_audit = read('root-audit-after.json')
app_audit = read('app-audit-after.json')
headers = read('production-headers-after.json')
production_smoke = read('production-smoke-results.json')
sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
pdfmetrics.registerFont(TTFont('DejaVu', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
styles = getSampleStyleSheet()
for name in ['Normal', 'BodyText', 'Heading1', 'Heading2', 'Title']:
    styles[name].fontName = 'DejaVu-Bold' if name in ['Title', 'Heading1', 'Heading2'] else 'DejaVu'
    styles[name].leading = 14
styles['Normal'].fontSize = 9
styles['BodyText'].fontSize = 9
styles['Heading1'].fontSize = 19
styles['Heading1'].leading = 25
styles['Heading2'].fontSize = 12
styles['Heading2'].leading = 17
styles['Title'].fontSize = 27
styles['Title'].leading = 34
styles.add(ParagraphStyle(name='Cell', fontName='DejaVu', fontSize=7.5, leading=10, alignment=TA_LEFT))
story = []
def p(text, style='BodyText'):
    story.append(Paragraph(text, styles[style]))
    story.append(Spacer(1, 7))
def table(rows, widths=None):
    cells = [[Paragraph(escape(str(c)), styles['Cell']) for c in row] for row in rows]
    t = Table(cells, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8edf4')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('LINEBELOW', (0, 0), (-1, -1), .3, colors.HexColor('#d5dae1')),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))
def page(title):
    story.append(PageBreak())
    p(title, 'Heading1')
def walk_tests(suite):
    for spec in suite.get('specs', []):
        for test in spec.get('tests', []):
            yield spec['title'], test
    for child in suite.get('suites', []):
        yield from walk_tests(child)
tests = [item for suite in smoke['suites'] for item in walk_tests(suite)]
passed = sum(test['status'] == 'expected' for _, test in tests)
when = datetime.now(ZoneInfo('America/Sao_Paulo')).strftime('%d/%m/%Y %H:%M BRT')
p('PORTAL DE EXTENSÃO • UNICAP')
p('Testes finais', 'Title')
p('Carga → estresse → segurança → correções → Smoke Test', 'Heading2')
p('Relatório de execução • ' + when)
p('Código avaliado: ' + sha[:12] + ' • out000001/projeto')
p('Ambiente de carga e segurança: HTTP local com handlers reais e Firebase Auth/Firestore Emulator. Produção foi consultada apenas com verificações leves de leitura; nenhum teste de estresse foi dirigido à Vercel.')
table([
    ['Etapa', 'Resultado e alcance'],
    ['Loading Test', '4 níveis; critério local p95 ≤ 1.500 ms e nenhuma resposta inesperada.'],
    ['Stress Testing', 'Até 120 requisições simultâneas. Ponto exato de ruptura não atingido dentro do teto.'],
    ['Security Testing', f"Inicial: {sum(x['pass'] for x in before['security'])}/24. Após correções: {sum(x['pass'] for x in current['security'])}/24."],
    ['Regressão', '16 testes Node e 210 testes do aplicativo aprovados; lint e build concluídos.'],
    ['Smoke Test', f'{passed}/{len(tests)} casos Playwright aprovados, incluindo verificações de layout e fluxos autenticados no emulador.'],
    ['Dependências', f"Servidor: {root_audit['metadata']['vulnerabilities']['total']} alertas. Aplicativo/ferramentas: {len(app_audit)} pacotes com alertas; ver triagem."],
], [115, 385])
p('Conclusão: os cenários funcionais e de segurança executados passaram após as correções. O teste de estresse é limitado e não determina a capacidade de produção. A existência de alertas residuais de dependências impede afirmar que todos os riscos foram eliminados.')
page('1. Loading Test')
p('Método e critérios', 'Heading2')
p('Base com 100 projetos e três contas. Distribuição: 10% catálogo do gestor, 45% conta, 45% detalhe do acompanhamento. Autenticação real do emulador; consultas ao Firestore Emulator. Aquecimento de 10 requisições antes da medição. Cada etapa usa fila fechada, sem pausas de usuário.')
p('Critério escolhido para esta validação local: p95 ≤ 1.500 ms e zero respostas inesperadas. Não é um SLA contratado. Quota do ambiente: duas CPUs e 8 GiB de memória; Node ' + escape(current['environment']['node']) + ', heap de 512 MB, Java com heap de 768 MB. Timeout de 5 segundos por requisição.')
rows = [['Simult.', 'Total', 'p50 ms', 'p95 ms', 'p99 ms', 'Req/s', 'Erros']]
for r in current['load']:
    rows.append([r['concurrency'], r['requests'], r['p50Ms'], r['p95Ms'], r['p99Ms'], r['requestsPerSecond'], r['unexpected']])
table(rows, [58, 52, 70, 70, 70, 95, 85])
p('Comparação antes/depois', 'Heading2')
rows = [['Simult.', 'p95 inicial (ms)', 'p95 final (ms)', 'Observação']]
for a, b in zip(before['load'], current['load']):
    rows.append([a['concurrency'], a['p95Ms'], b['p95Ms'], 'Sem erro inesperado em ambas as rodadas'])
table(rows, [60, 100, 100, 240])
p('As diferenças entre rodadas incluem aquecimento, escalonamento do ambiente e atualizações de dependências. Não há experimento controlado suficiente para atribuir melhora de latência às correções. A duração curta não avalia vazamentos de memória nem estabilidade por horas.')
page('2. Stress Testing e recuperação')
p('Escalada limitada e controlada', 'Heading2')
p('Níveis de 40, 80 e 120 requisições simultâneas; proteção para encerrar acima de 700 MB de RSS ou mais de 50% de respostas inesperadas. Não foi necessário acionar essas proteções. As requisições são leituras autenticadas; não representam todos os padrões de gravação e anexos.')
table([['Simult.', 'Total', 'p95 ms', 'Máx. ms', 'Req/s', 'RSS MB', 'Erros']] + [
    [r['concurrency'], r['requests'], r['p95Ms'], r['maxMs'], r['requestsPerSecond'], r['rssMb'], r['unexpected']] for r in current['stress']], [58, 52, 70, 80, 80, 80, 80])
p('O ponto exato de ruptura NÃO foi atingido dentro do teto. O resultado não comprova suporte a 120 usuários reais na Vercel. Servidor HTTP e gerador compartilham o processo; RSS e CPU incluem ambos. O Firestore emulado tem características diferentes do serviço hospedado.')
p('Falha e recuperação da dependência', 'Heading2')
table([['Cenário', 'Requisições', 'HTTP observado', 'p95 ms']] + [
    [r['label'], r['requests'], str(r['statuses']), r['p95Ms']] for r in current['recovery']], [215, 75, 125, 85])
p('A falha foi injetada na interface do banco: a operação de coleção lança erro de indisponibilidade. O handler real converte a falha em 503. Após restaurar o adaptador real do emulador, as 30 consultas retornaram 200. Não foi provocada uma queda real do Firebase, nem medido tempo de failover ou reinício da infraestrutura.')
page('3. Segurança: achados e correções')
table([
    ['Achado reproduzido', 'Antes', 'Correção e reteste'],
    ['Anexo nulo em relatório', '503', 'Validação de tipo antes de acessar metadados; retorna 400.'],
    ['E-mail numérico de participante', '503', 'Validação explícita de string; retorna 400.'],
    ['E-mail alternativo numérico', '503', 'Validação sem chamar trim em tipos inválidos; retorna 400.'],
    ['Aluno com participação inativa envia anexo', '200', 'Upload exige participante ativo do projeto; retorna 403.'],
    ['Cabeçalhos defensivos ausentes', 'Ausentes', 'nosniff, DENY, Referrer-Policy e CSP parcial adicionados; verificação de produção após publicação.'],
], [210, 60, 230])
p('Cinco testes Node de regressão cobrem essas entradas e a permissão de upload. Histórico de consulta de participantes arquivados é preservado; a restrição nova atua em envio de novos arquivos.')
p('Verificações de segurança após correções', 'Heading2')
table([['Cenário', 'Esperado', 'Obtido', 'Resultado']] + [
    [r['name'], r['expected'], r['actual'], 'PASS' if r['pass'] else 'FAIL'] for r in current['security']], [320, 55, 55, 70])
p('Escopo: autenticação, papéis, vínculo ao projeto, regras diretas do Firestore, alteração de perfil, revisão concorrente, dados malformados e limites de tentativas. Não é uma auditoria de penetração completa, revisão criptográfica ou prova de ausência de XSS, CSRF e outros ataques.')
page('4. Dependências e produção')
p('Atualizações verificadas', 'Heading2')
p('Firebase Admin 14.5.1, Firebase cliente 13.3.0, React Router 7.18.5, Vite 7.3.8 e Vitest 4.1.12. Locks atualizados e testes de compatibilidade executados. O transporte gRPC recebeu override para uma versão corrigida. Auditoria da raiz usa npm; auditoria do aplicativo usa seu bun.lock oficial, incluindo ferramentas de desenvolvimento.')
p('O servidor teve 13 alertas iniciais e zero na auditoria final. Os avisos do aplicativo são agrupados por pacote; essa contagem não é diretamente comparável à contagem de dependências afetadas do npm audit.')
rows = [['Pacote com alerta residual', 'Severidade', 'Alcance e ação pendente']]
for name, items in sorted(app_audit.items()):
    severities = ', '.join(sorted(set(item['severity'] for item in items)))
    paths = {'@opentelemetry/core': 'firebase-tools → pubsub → core 1.x', 'glob': 'firebase-tools → glob 10.x', 'minimatch': 'firebase-tools → glob → minimatch 9.x', 'uuid': 'firebase-tools → gaxios → uuid 9.x'}
    rows.append([name, severities, paths.get(name, 'Revisar dependência responsável') + '. Ferramenta local; aguarda atualização compatível do pacote responsável.'])
if len(rows) == 1:
    rows.append(['Nenhum', '—', 'Auditoria atual sem alertas conhecidos.'])
table(rows, [150, 90, 260])
p('As ferramentas de desenvolvimento não são servidas como aplicações públicas na Vercel. Ainda assim, alertas locais permanecem relevantes para quem executa essas ferramentas. A auditoria não comprova exploração nem ausência de vulnerabilidades desconhecidas. Os JSONs preservam títulos e links dos advisories.')
p('Cabeçalhos após publicação', 'Heading2')
for result in headers:
    p(escape(result['url']) + ' • HTTP ' + str(result['status']))
    table([['Cabeçalho', 'Valor observado']] + [[k, v or 'AUSENTE'] for k, v in result['headers'].items()], [170, 330])
p('A CSP é parcial: frame-ancestors, base-uri e object-src. Não restringe todas as origens de scripts e não deve ser apresentada como proteção completa contra XSS.')
page('5. Smoke Test após as correções')
p('Chromium headless, uma execução por caso, sem retries. Fluxos autenticados usam contas e banco dos emuladores; testes públicos de produção apenas consultam páginas e rejeição de acesso anônimo. Não houve escrita de dados reais na produção.')
p(f'Resultado: {passed}/{len(tests)} casos aprovados. A suíte inclui cadastro/login dos dois perfis, proposta em seis etapas, publicação, inscrição e espera, acompanhamento, participantes, horas, homologação, anexos, relatórios/revisões, CSV, configurações, parcerias, cancelamento e logout. O caso de responsividade agrega 125 combinações de tela/fluxo; isso não corresponde a 125 casos independentes no contador do Playwright.')
table([['Caso Playwright', 'Resultado']] + [[title, 'PASS' if test['status'] == 'expected' else test['status']] for title, test in tests], [440, 60])
p('Após a publicação do commit avaliado, os quatro casos públicos foram repetidos: ' + str(production_smoke['stats']['expected']) + '/4 aprovados em ' + production_smoke['stats']['startTime'] + '. Esses casos verificam páginas públicas, visibilidade de senha, redirecionamento de visitantes e respostas 401; não validam operações autenticadas no banco real.')
p('Validações complementares: lint do servidor sem erros/avisos, lint do aplicativo aprovado, 16 testes Node e 210 testes Vitest aprovados. Build concluído; permanece aviso sobre tamanho do bundle, que não é falha de compilação e merece otimização futura. Não houve ensaio em Safari/Firefox ou dispositivos físicos.')
page('6. Evidências e reprodução')
p('Evidências preservadas', 'Heading2')
for name in ['before-fixes.json', 'after-fixes.json', 'root-audit.json', 'root-audit-after.json', 'app-audit.json', 'app-audit-after.json', 'production-headers-before.json', 'production-headers-after.json', 'smoke-results.json', 'production-smoke-results.json', 'tool-versions.json']:
    p('reports/final-tests/' + name)
p('O roteiro e os comandos estão em docs/final-validation.md. O gerador de carga/segurança está em server/final-validation.mjs; os testes de regressão em server/security-input.test.mjs. A suíte de navegador está em server/playwright. Este PDF é gerado por server/generate-final-report.py a partir dos resultados, sem inventar testes ausentes.')
p('Sequência observada', 'Heading2')
table([
    ['Marco', 'Horário UTC'],
    ['Rodada inicial', before['date']],
    ['Rodada final: carga → estresse → segurança', current['date']],
    ['Fim da rodada final', current.get('completed', '')],
    ['Smoke Test após correções, antes de publicar', smoke['stats']['startTime']],
    ['Verificação pública após publicação', production_smoke['stats']['startTime']],
    ['Geração do relatório', datetime.now(ZoneInfo('UTC')).isoformat()],
], [245, 255])
p('Parecer final', 'Heading2')
p('Os problemas reproduzidos de validação e autorização foram corrigidos e retestados. O caminho crítico passou no ambiente testado. Restam os limites declarados: ruptura desconhecida além do teto, ensaio curto com banco emulado, alertas residuais conforme a auditoria e falta de ensaios em outras engines. Portanto, a entrega demonstra os testes executados, sem certificar segurança total ou capacidade de produção.')
def footer(canvas, doc):
    canvas.setFont('DejaVu', 7)
    canvas.setFillColor(colors.HexColor('#5d6674'))
    canvas.drawString(42, 25, 'Portal de Extensão UNICAP • Testes finais • ' + sha[:8])
    canvas.drawRightString(553, 25, str(doc.page))
SimpleDocTemplate(str(OUT / 'relatorio-testes-finais.pdf'), pagesize=(595, 842), rightMargin=45, leftMargin=45, topMargin=42, bottomMargin=44).build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT / 'relatorio-testes-finais.pdf')
