from pathlib import Path
import json, re, subprocess, html
from datetime import datetime
from zoneinfo import ZoneInfo
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'reports/playwright'
data=json.loads((OUT/'results.json').read_text())
layouts=json.loads((OUT/'layout-results.json').read_text()) if (OUT/'layout-results.json').exists() else []
for name,file in [('DejaVu','DejaVuSans.ttf'),('DejaVuBold','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportTitle',fontName='DejaVuBold',fontSize=27,leading=33,textColor=colors.HexColor('#600b20'),spaceAfter=14))
styles.add(ParagraphStyle(name='ReportH1',fontName='DejaVuBold',fontSize=15,leading=20,textColor=colors.HexColor('#600b20'),spaceBefore=12,spaceAfter=10))
styles.add(ParagraphStyle(name='ReportBody',fontName='DejaVu',fontSize=9.3,leading=14,spaceAfter=8))
styles.add(ParagraphStyle(name='ReportSmall',fontName='DejaVu',fontSize=8,leading=11,spaceAfter=5))
styles.add(ParagraphStyle(name='ReportCaption',fontName='DejaVu',fontSize=8.5,leading=12,textColor=colors.HexColor('#57534e'),spaceAfter=12))
P=lambda text,style='ReportBody':Paragraph(html.escape(str(text)).replace('\n','<br/>'),styles[style])
rows=[]
def walk(suite):
 for spec in suite.get('specs',[]):
  for test in spec.get('tests',[]):
   results=test.get('results',[]);result=results[-1] if results else {};status=result.get('status','skipped')
   rows.append({'title':spec['title'],'status':status,'duration':sum(r.get('duration',0) for r in results),'error':result.get('error',{}).get('message','')})
 for child in suite.get('suites',[]):walk(child)
for suite in data.get('suites',[]):walk(suite)
rows.sort(key=lambda row:int(re.match(r'\d+',row['title']).group()) if re.match(r'\d+',row['title']) else 999)
passed=sum(r['status']=='passed' for r in rows);failed=sum(r['status'] not in ['passed','skipped'] for r in rows);skipped=sum(r['status']=='skipped' for r in rows)
commit=subprocess.check_output(['git','rev-parse','--short','HEAD'],cwd=ROOT,text=True).strip()
now=datetime.now(ZoneInfo('America/Sao_Paulo'))
status='APROVADO NOS CENÁRIOS EXECUTADOS' if not failed and not skipped else 'RESULTADO PARCIAL — CONSULTAR OCORRÊNCIAS'
output=OUT/'relatorio-testes-playwright.pdf'
def footer(canvas,doc):
 canvas.setStrokeColor(colors.HexColor('#dfd9d4'));canvas.line(18*mm,16*mm,192*mm,16*mm)
 canvas.setFont('DejaVu',7);canvas.setFillColor(colors.HexColor('#69615d'));canvas.drawString(18*mm,11*mm,'UNICAP · Relatório Playwright · '+now.strftime('%d/%m/%Y'));canvas.drawRightString(192*mm,11*mm,f'Página {doc.page}')
doc=SimpleDocTemplate(str(output),pagesize=(210*mm,297*mm),leftMargin=18*mm,rightMargin=18*mm,topMargin=18*mm,bottomMargin=22*mm,title='Relatório de testes Playwright — Portal UNICAP',author='Codex · verificação automatizada')
story=[P('PORTAL DE EXTENSÃO · UNICAP','ReportSmall'),Spacer(1,9*mm),P('Relatório de testes\nPlaywright','ReportTitle'),P('Verificação funcional, permissões, persistência e responsividade da plataforma.'),Spacer(1,6*mm)]
summary=[[P('RESULTADO','ReportSmall'),P(status,'ReportSmall')],[P('Cenários Playwright','ReportSmall'),P(f'{len(rows)} executáveis · {passed} aprovados · {failed} falhas · {skipped} não executados','ReportSmall')],[P('Layouts adicionais','ReportSmall'),P(f'{len(layouts)} combinações de tela, largura, direção e ampliação de texto','ReportSmall')],[P('Data e horário','ReportSmall'),P(now.strftime('%d/%m/%Y às %H:%M — America/Sao_Paulo'),'ReportSmall')],[P('Versão da aplicação','ReportSmall'),P(commit,'ReportSmall')],[P('Site publicado','ReportSmall'),P('https://projeto-silk-iota.vercel.app/','ReportSmall')]]
t=Table(summary,colWidths=[48*mm,126*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eee6e2')),('BACKGROUND',(0,1),(-1,-1),colors.HexColor('#faf8f5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#dfd9d4'))]));story+=[t,Spacer(1,8*mm),P('Como interpretar o resultado','ReportH1'),P('A aprovação comprova os caminhos e dados de teste descritos neste documento. Não representa certificação de ausência de defeitos, auditoria completa de segurança ou validação de todos os navegadores e dispositivos.'),P('Os fluxos que criam ou alteram registros foram executados em emuladores locais de Firebase Authentication e Firestore. No site publicado, os testes foram somente de leitura: abrir páginas, verificar redirecionamentos, alternar a visibilidade das senhas e consultar APIs sem login. Nenhuma conta, proposta, inscrição ou parceria foi criada em produção.'),PageBreak()]
story+=[P('Escopo e método','ReportH1'),P('Autenticação real no emulador: os testes de cadastro e login utilizam o SDK Firebase, contas e tokens emitidos pelo emulador. As APIs usam os mesmos handlers da aplicação, com Firebase Admin direcionado ao projeto demo-portal-unicap. Apenas a configuração de conexão do navegador é redirecionada para os emuladores; as funções de login, sessão e banco não são substituídas nesses testes.'),P('Fluxos cobertos','ReportH1')]
for text in ['Visitante: vitrine pública, detalhes e bloqueio das rotas privadas.','Cadastro: nome, perfis, chave de gestor válida/inválida, confirmação e visibilidade das senhas.','Acesso: senha incorreta, recuperação de senha no Firebase emulado, login por perfil e sessão após recarga.','Gestão: submissão pelas seis etapas, validações, anexos privados, detalhes, publicação e retirada da vitrine.','Participação: busca pública, inscrição idempotente, lista de espera, cancelamento e admissão pela gestão.','Tracking: catálogo de projetos, busca, filtros, vigência, metas, equipe, frequência, homologação em lote e reaprovação.','Entregas: vínculo ao relatório previsto, conflito de edição detectado com pedido de recarga, PDF privado, devolução para ajustes, nova versão, aprovação e download.','Conta e operação: configurações persistentes, densidade, parceria e atendimento, exportações e saída.','Permissões: aluno não cria projetos ou altera perfis; regras do Firestore negam acesso direto aos registros privados.']:
 story.append(P('• '+text))
story+=[P('Responsividade e sessão','ReportH1'),P('Um cenário Playwright adicional executa a regressão com autenticação substituída e APIs/Firestore emulados, incluindo a sessão inativa e a matriz de layouts. São verificadas larguras de 320, 390, 768, 1024 e 1440 CSS px nas telas principais; etapas e diálogos usam larguras selecionadas. A matriz inclui texto a 200% em 720px e reflow RTL em 320px. A ampliação de texto não equivale ao zoom nativo do navegador.'),PageBreak(),P('Resultados por cenário','ReportH1')]
header=[P('Cenário','ReportSmall'),P('Resultado','ReportSmall'),P('Tempo','ReportSmall')]
body=[header]
for row in rows:
 label={'passed':'PASSOU','failed':'FALHOU','timedOut':'TEMPO ESGOTADO','skipped':'NÃO EXECUTADO'}.get(row['status'],row['status'])
 body.append([P(row['title'],'ReportSmall'),P(label,'ReportSmall'),P(f"{row['duration']/1000:.1f}s",'ReportSmall')])
t=Table(body,colWidths=[126*mm,30*mm,18*mm],repeatRows=1,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eee6e2')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.3,colors.HexColor('#dfd9d4')),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),4)]));story.append(t)
if failed or skipped:
 story+=[Spacer(1,5*mm),P('Ocorrências e bloqueios','ReportH1')]
 for row in rows:
  if row['status']!='passed':story.append(P(row['title']+' — '+re.sub(r'\x1b\[[0-9;]*m','',row['error'])[:1200]))
else:story+=[Spacer(1,5*mm),P('Não houve falhas ou cenários ignorados na rodada final. Ajustes de seletores durante a preparação do roteiro não são classificados como defeitos do produto. Não foram usados retries automáticos para converter falhas em aprovação.')]
findings=json.loads((OUT/'findings.json').read_text()) if (OUT/'findings.json').exists() else []
if findings:
 story+=[Spacer(1,5*mm),P('Defeito encontrado e corrigido','ReportH1')]
 for finding in findings:
  story.extend([P(finding['id']+' · '+finding['area']+' · Severidade '+finding['severity'],'ReportSmall'),P(finding['problem']),P('Correção: '+finding['fix']),P('Validação: '+finding['verification'])])
story+=[PageBreak(),P('Evidências visuais','ReportH1'),P('Capturas dos próprios testes. Os nomes e registros dos emuladores são fictícios. As capturas de produção não envolvem submissão de dados.','ReportCaption')]
for file,caption in [('proposta-salva.png','Proposta enviada pelas seis etapas e confirmada pelo banco emulado.'),('frequencia-real.png','Frequência persistente e situação após edição de horas homologadas.'),('relatorio-aprovado.png','Parecer do gestor e documento privado disponível para download.'),('producao-cadastro.png','Cadastro do site publicado, com controles de visibilidade nos dois campos.')]:
 p=OUT/file
 if p.exists():
  with PILImage.open(p) as im:w,h=im.size
  iw=174*mm;ih=iw*h/w
  if ih>170*mm:ih=170*mm;iw=ih*w/h
  story.append(KeepTogether([Image(str(p),width=iw,height=ih),Spacer(1,3*mm),P(caption,'ReportCaption')]))
story+=[PageBreak(),P('Limites e próximos testes','ReportH1')]
for text in ['Navegador desta execução: Chromium headless via Playwright. Firefox, WebKit/Safari e aparelhos físicos não foram executados.','Fluxos autenticados de produção não foram testados com contas reais. Cadastro, escrita, papéis e persistência foram exercitados no ambiente emulado.','A recuperação de senha valida a geração do pedido no Firebase Authentication emulado; não comprova entrega de e-mail real. Avisos internos não implicam integração com e-mail ou financeiro.','Não foram executados testes de carga, penetração, disponibilidade prolongada, todos os tamanhos/extensões de anexos ou auditoria WCAG completa com leitor de tela.','A pesquisa e paginação de projetos trabalham sobre resumos carregados no navegador; escala de milhares de projetos não foi medida nesta rodada.','As verificações de layout usam os dados e estados descritos. Valores muito longos, idiomas adicionais e teclados virtuais de dispositivos reais exigem testes específicos.']:
 story.append(P('• '+text))
story+=[P('Arquivos de suporte','ReportH1'),P('results.json: resultado estruturado do runner. html/index.html: relatório HTML do Playwright. layout-results.json: matriz de layouts. Capturas PNG: evidências dos cenários. O roteiro reproduzível está em server/playwright/*.spec.cjs e a configuração em server/playwright.config.cjs.'),P('Execução reproduzível','ReportH1'),P('A configuração inicia ou reutiliza o Vite em 127.0.0.1:5173. Iniciar os emuladores auth e firestore com projeto demo-portal-unicap e executar o CLI Playwright com --config server/playwright.config.cjs. A suíte se recusa a iniciar os fluxos locais sem ambos os emuladores.'),P('Referências','ReportH1'),P('Documentação oficial: https://playwright.dev/docs/test-intro e https://playwright.dev/docs/test-reporters.'),P('Conclusão','ReportH1'),P(status+'. O resultado vale para esta versão, este navegador e os cenários detalhados acima.')]
doc.build(story,onFirstPage=footer,onLaterPages=footer)
(OUT/'summary.json').write_text(json.dumps({'passed':passed,'failed':failed,'skipped':skipped,'cases':len(rows),'layouts':len(layouts),'commit':commit,'pdf':str(output)},ensure_ascii=False,indent=2))
print(json.dumps({'pdf':str(output),'passed':passed,'failed':failed,'skipped':skipped,'cases':len(rows),'layouts':len(layouts)},ensure_ascii=False))
