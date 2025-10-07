"""Rebuild Orbit's vector illustrations. Requires fonttools."""
from pathlib import Path
from html import escape
from base64 import b64encode
from io import BytesIO
from fontTools import subset
from fontTools.ttLib import TTFont
import xml.etree.ElementTree as ET

OUT = Path(__file__).resolve().parents[1] / 'public' / 'svg'
CSS = ''':root{--night:#101326;--raised:#171B33;--well:#1F2440;--cloud:#F8FAFC;--paper:#F1EEF8;--soft:#E6E1F4;--lavender:#C4B5FD;--violet:#8B5CF6;--accent:#7C3AED;--muted:#5B6478;--muted-dark:#9CA3BF;--rule:#DDD8EC;--rule-dark:#2A2F4A;--arc:#4A4470;--white:#FFFFFF;--display:Outfit,'Trebuchet MS',sans-serif;--body:Onest,Arial,sans-serif;--code:'JetBrains Mono',Consolas,monospace}
text{font-family:var(--body);fill:var(--night);font-size:16px} .head,.button{font-family:var(--display);font-weight:500;letter-spacing:-.03em}.muted{fill:var(--muted)}.light{fill:var(--cloud)}.lavender{fill:var(--lavender)}.night-muted{fill:var(--muted-dark)}.mono{font-family:var(--code)}
'''
def font_css(body):
    if '<text' not in body: return ''
    tree = ET.fromstring('<g>'+body+'</g>')
    chars = ''.join(e.text or '' for e in tree.iter('text'))
    css = ''
    for family, weight, file in [('Onest', 400, 'Onest-Regular.ttf'), ('Outfit', 500, 'Outfit-Medium.ttf')]:
        font = TTFont(OUT.parent / 'fonts' / file)
        options = subset.Options()
        options.flavor = 'woff'
        sub = subset.Subsetter(options=options)
        sub.populate(text=chars)
        sub.subset(font)
        font.flavor = 'woff'
        stream = BytesIO()
        font.save(stream)
        encoded = b64encode(stream.getvalue()).decode('ascii')
        css += f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};src:url(data:font/woff;base64,{encoded}) format('woff')}}"
    return css
def rect(x,y,w,h,c='paper',r=16): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="var(--{c})"/>'
def text(x,y,s,size=16,cls='',fill=None):
    return f'<text x="{x}" y="{y}" class="{cls}" style="font-size:{size}px'+(f';fill:var(--{fill})' if fill else '')+'">'+escape(str(s))+'</text>'
def line(x,y,x2,y2,c='rule'): return f'<path d="M{x} {y}H{x2}" fill="none" stroke="var(--{c})"/>' if y==y2 else f'<path d="M{x} {y}L{x2} {y2}" fill="none" stroke="var(--{c})"/>'
def pill(x,y,s,w=None,active=False):
    w=w or len(s)*8+28
    return rect(x,y,w,32,'accent' if active else 'soft',16)+text(x+w/2,y+21,s,14,'button','white' if active else 'night').replace('<text ', '<text text-anchor="middle" ')
def button(x,y,s,w=140): return rect(x,y,w,48,'accent',24)+text(x+w/2,y+30,s,16,'button','white').replace('<text ','<text text-anchor="middle" ')
def mark(x,y,scale=1,light=False):
    return f'<g transform="translate({x} {y}) scale({scale})" fill="none" stroke="var(--'+('accent' if light else 'lavender')+')" stroke-width="1.5"><circle cx="20" cy="20" r="17"/><circle cx="20" cy="20" r="10"/><circle cx="34" cy="10" r="4" fill="var(--violet)" stroke="none"/></g>'
def save(name,w,h,title,desc,body,bg='cloud'):
    ident=name.replace('.svg','')
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="{ident}-title {ident}-desc">
<title id="{ident}-title">{escape(title)}</title><desc id="{ident}-desc">{escape(desc)}</desc>
<style>{CSS}{font_css(body)}</style><defs><clipPath id="{ident}-clip"><rect width="{w}" height="{h}" rx="{8 if name == 'favicon.svg' else 16}"/></clipPath></defs>
<g clip-path="url(#{ident}-clip)">{rect(0,0,w,h,bg) if bg else ''}{body}</g></svg>'''
    ET.fromstring(svg)
    (OUT/name).write_text(svg,encoding='utf-8')
def header(title,sub='Northstar Studio / Atlas',w=800):
    return text(32,38,sub,14,'muted')+text(32,86,title,32,'head')+pill(w-154,20,'sample data',122)+line(32,110,w-32,110)
def footer(w,h): return line(32,h-52,w-32,h-52)+text(32,h-24,'Northstar Studio is fictional. Sample data.',14,'muted')
def row(y,label,value,w=800): return text(32,y,label,16,'muted')+text(252,y,value)+line(32,y+22,w-32,y+22)

for mode,ink in [('dark','cloud'),('light','night')]:
    save(f'logo-{mode}.svg',204,64,'orbit.','Orbit wordmark with concentric orbital rings and a violet satellite dot.',mark(4,12,1,mode=='light')+text(56,48,'orbit.',48,'head',ink),None)
save('favicon.svg',32,32,'Orbit','Midnight icon with concentric lavender rings and a lavender satellite.',rect(0,0,32,32,'night',8)+'<g fill="none" stroke="var(--lavender)" stroke-width="1.2"><circle cx="16" cy="16" r="10"/><circle cx="16" cy="16" r="5.5"/></g><circle cx="24" cy="10" r="3" fill="var(--lavender)"/>',None)
save('hero-sync-arc.svg',600,360,'One approval, two views','A single orbit arc joins the portal approval to the agency board. The lavender dot rests at the agency endpoint; static reduced-motion-safe artwork.','<path id="sync-arc" d="M480 302C72 338 60 64 290 48" fill="none" stroke="var(--arc)" stroke-width="1"/><circle id="sync-dot" cx="290" cy="48" r="5" fill="var(--lavender)"/>',None)

b=header('atlas')+row(156,'Client','Atlas')+row(220,'Primary contact','Morgan / signs off')+row(284,'Scope','Brand identity and final files')+text(32,350,'portal access',22,'head')+text(32,385,'Morgan can review shared deliverables.',16,'muted')+rect(664,338,72,40,'accent',20)+'<circle cx="716" cy="358" r="14" fill="var(--white)"/>'+text(684,408,'On',16)+row(464,'Linked project','Atlas Brand Identity')+footer(800,560)
save('journey-1-client.svg',800,560,'Add the client','Sample Atlas client record at Northstar Studio. Morgan is the approval contact. Scope: brand identity and final files. Portal access is on.',b)
b=header('atlas brand identity')+text(32,152,'milestones',22,'head')+line(52,199,52,355,'accent')
for y,n,title,date in [(200,'1','Direction agreed','04 Nov 2026'),(272,'2','Identity review','06 Nov 2026'),(344,'3','Final handover','09 Nov 2026')]:
    b+=rect(32,y-22,40,40,'soft',20)+text(52,y+4,n,16,'head').replace('<text ','<text text-anchor="middle" ')+text(96,y,title,20,'head')+text(568,y,date,16,'muted')
b+=line(32,384,768,384)+text(32,424,'assigned team',22,'head')
for x,n in [(32,'Alex'),(210,'Taylor'),(388,'Jamie'),(566,'Riley')]: b+=pill(x,449,n,150)
b+=footer(800,560)
save('journey-2-project.svg',800,560,'Set up the project','Atlas Brand Identity sample project with three milestones and team members Alex, Taylor, Jamie and Riley.',b)

def task(x,y,w,title,person,status=None):
    out=rect(x,y,w,138)+text(x+20,y+34,title,18,'head')+text(x+20,y+65,person,16,'muted')
    if status: out+=pill(x+20,y+88,status)
    return out
b=header('the work, ready to review')+text(32,154,'in progress',20,'head')+text(300,154,'client review',20,'head')+text(568,154,'done',20,'head')
b+=task(32,180,236,'Export guidelines','Riley','medium')+task(300,180,236,'Final presentation v3','Jamie','ready for review')+task(568,180,200,'Brand direction','Taylor','approved')
b+=text(32,379,'activity',22,'head')+line(32,400,768,400)+text(32,434,'Jamie moved Final presentation v3 to client review.')+text(32,467,'09 Nov 2026, 09:24 UTC',14,'muted')+footer(800,560)
save('journey-3-board.svg',800,560,'Do the work','Sample Kanban execution. Final presentation v3 has moved from in progress to client review; Jamie’s move is recorded in the activity log.',b)

b=header('ready for your review','Northstar Studio / Morgan’s portal')+text(32,160,'Final presentation v3',28,'head')+pill(684,134,'v3',64)+rect(32,190,736,150,'night')+text(60,248,'atlas',44,'head','cloud')+text(60,295,'Brand identity / final presentation',18,'','lavender')+button(32,364,'approve',154)+pill(206,372,'ask for changes',174)+line(32,432,768,432)+text(32,466,'Previous decision: Morgan requested changes on v2.')+text(32,493,'06 Nov 2026, 14:32 UTC',14,'muted')+footer(800,580)
save('journey-4-portal.svg',800,580,'Hand it over','Sample Morgan portal review of Final presentation v3. Approve and ask for changes are illustrated controls. The version history preserves Morgan’s changes request on v2 at 14:32 UTC on 6 November 2026.',b)

b=header('invoice INV-2026-042')+text(32,150,'Atlas Brand Identity',24,'head')+text(32,182,'From Final presentation v3, approved by Morgan',16,'muted')+text(32,209,'09 Nov 2026, 10:42 UTC',14,'muted')
for y,label,amount in [(272,'Brand identity, final stage','CAD 2,400.00'),(326,'Final file preparation','CAD 600.00')]:
    b+=text(32,y,label)+text(752,y,amount,18,'head').replace('<text ','<text text-anchor="end" ')+line(32,y+20,768,y+20)
b+=text(32,392,'Total / tax CAD 0.00',16,'muted')+text(752,392,'CAD 3,000.00',28,'head').replace('<text ','<text text-anchor="end" ')
for x,s in [(32,'draft'),(282,'sent'),(532,'paid')]: b+=pill(x,428,s,180,s=='paid')
b+=line(212,444,282,444)+line(462,444,532,444)+text(32,493,'09 Nov',14,'muted')+text(282,493,'10 Nov',14,'muted')+text(532,493,'12 Nov 2026',14,'muted')+footer(800,570)
save('journey-5-invoice.svg',800,570,'Send the invoice','Sample invoice INV-2026-042 for approved Atlas work. CAD 2,400 plus CAD 600, zero tax, total CAD 3,000. Illustrated lifecycle: draft November 9, sent November 10, paid November 12, 2026.',b)

def sidebar(h):
    b=rect(0,0,216,h,'night',0)+mark(24,25)+text(76,57,'orbit.',34,'head','cloud')+text(24,115,'Northstar Studio',16,'','lavender')
    for i,s in enumerate(['overview','projects','my tasks','calendar','clients','team','deliverables','invoices','reports','settings']):
        y=160+i*46
        if i==1:b+=rect(16,y-25,184,38,'well',19)
        b+=text(32,y,s,16,'head','cloud' if i==1 else 'muted-dark')
    return b+text(24,h-34,'Alex / owner',14,'','lavender')
b=sidebar(810)+text(248,39,'Projects / Atlas',14,'muted')+pill(1268,16,'sample data',140)+line(248,64,1408,64)+text(248,112,'atlas brand identity',36,'head')+pill(1140,84,'in progress',142)+text(248,153,'board',18,'head','accent')+text(340,153,'list',18,'head')+text(414,153,'timeline',18,'head')+text(530,153,'files',18,'head')+line(248,174,1408,174)
for i,(title,card,who,status) in enumerate([('to do','Package source files','Riley','medium'),('in progress','Export guidelines','Jamie','high'),('client review','Final presentation v3','Jamie','v3'),('done','Brand direction','Taylor','approved')]):
    x=248+i*290
    b+=text(x,214,title,21,'head')+task(x,240,266,card,who,status)
b+=text(248,437,'internal thread',24,'head')+pill(925,412,'team only',128)+text(248,484,'Taylor',16,'head')+text(248,518,'Keep the source files internal until Morgan signs off.')+line(248,542,1048,542)+text(248,578,'Jamie',16,'head')+text(248,612,'v3 is in the portal. The export package is ready.')
b+=line(1092,410,1092,714)+text(1120,442,'project margin',22,'head')+text(1120,493,'40%',44,'head')+text(1120,530,'Fee CAD 5,000',16,'muted')+text(1120,560,'Cost CAD 3,000',16,'muted')+text(1120,600,'(fee − cost) / fee',16,'muted')+text(248,752,'Northstar Studio is fictional. Every number is sample data.',14,'muted')
save('view-agency.svg',1440,810,'Atlas agency workspace','16:9 sample agency workspace with midnight sidebar, four Kanban columns, private team comments and a 40% sample margin calculated from CAD 5,000 fee less CAD 3,000 cost.',b)

b=mark(40,24,1,True)+text(94,53,'Northstar Studio',24,'head')+text(1234,49,'Morgan / Atlas',16,'muted')+line(40,82,1400,82)
for x,s in [(40,'overview'),(180,'reviews'),(302,'files'),(396,'invoices')]: b+=text(x,124,s,18,'head','accent' if s=='overview' else 'muted')
b+=pill(1260,100,'sample data',140)+text(40,204,'welcome back, Morgan',42,'head')+rect(40,242,1360,190,'night')+text(72,294,'atlas brand identity',32,'head','cloud')+text(72,336,'Next milestone: final handover / 09 Nov 2026',18,'','lavender')+text(72,391,'3 of 4 milestones complete',16,'','cloud')+rect(850,366,500,8,'arc',4)+rect(850,366,375,8,'lavender',4)+text(40,492,'needs your attention',28,'head')
for y,title,sub,act in [(548,'Final presentation v3','Ready for your review','review'),(656,'Invoice INV-2026-041','CAD 1,200.00 / due 16 Nov 2026','view invoice')]:
    b+=text(40,y,title,21,'head')+text(40,y+31,sub,16,'muted')+button(1220,y-25,act,180)+line(40,y+54,1400,y+54)
b+=text(40,777,'Northstar Studio is fictional. Every number is sample data.',14,'muted')
save('view-client.svg',1440,810,'Atlas client portal','16:9 sample portal for Morgan. Top tabs, a midnight Atlas project card and attention rows for Final presentation v3 and an invoice. No internal comments or agency margin data.',b)

b=text(24,42,'Northstar Studio',20,'head')+pill(242,20,'sample data',124)+text(24,102,'morning, Alex',32,'head')+text(24,136,'Monday, 9 November',16,'muted')
for x,y,val,label in [(24,164,'4','Active projects'),(203,164,'84%','Tasks done / due'),(24,284,'6','Waiting on clients'),(203,284,'3','Unpaid invoices')]:
    b+=rect(x,y,163,104)+text(x+16,y+43,val,34,'head')+text(x+16,y+77,label,14,'muted')
b+=text(24,438,'today’s priorities',25,'head')
for y,title,sub,done in [(480,'Send Atlas v3','Jamie / Atlas',True),(564,'Check final exports','Riley / Atlas',False),(648,'Prepare invoice draft','Alex / Atlas',False)]:
    b+=rect(24,y-13,24,24,'accent' if done else 'soft',12)
    if done:b+='<path d="M30 '+str(y-1)+'l4 4 8-9" fill="none" stroke="var(--white)" stroke-width="2"/>'
    b+=text(62,y+4,title,17,'head')+text(62,y+30,sub,14,'muted')+line(24,y+48,366,y+48)
b+=text(24,742,'Fictional workspace. Sample data.',14,'muted')+line(0,774,390,774)
for x,s in [(24,'home'),(111,'projects'),(215,'tasks'),(303,'more')]: b+=text(x,813,s,16,'head','accent' if s=='home' else 'muted')
save('view-phone.svg',390,844,'Orbit on the go','390 by 844 mobile screen without a device bezel. Two-column sample KPI tiles, today’s priority checklist and bottom navigation. Rounded 16 pixel screen corners.',b)

b=text(40,60,'how orbit fits together',34,'head','cloud')+text(40,96,'Logical architecture',16,'','muted-dark')
for x,title,sub in [(40,'public site','Next.js'),(430,'agency workspace','/app'),(820,'client portal','/portal')]:
    b+=rect(x,140,340,110,'raised')+text(x+24,184,title,24,'head','cloud')+text(x+24,218,sub,16,'','lavender')
b+='<g fill="none" stroke="var(--arc)" stroke-width="1.5"><path d="M210 250V290H600V330M600 250V330M990 250V290H600"/><path d="M600 440V480M600 590V630H210V670M600 630H990V670"/></g>'
b+=rect(310,330,580,110,'well')+text(340,375,'server routes + services',28,'head','cloud')+text(340,409,'Permissions, approvals, invoice rules',16,'','lavender')+rect(310,480,580,110,'raised')+text(340,525,'Payload CMS & auth',28,'head','cloud')+text(340,559,'Content, identity and tenant access',16,'','lavender')
for x,title,sub in [(40,'PostgreSQL','Records and relationships'),(820,'storage / email','Files and notifications')]:b+=rect(x,670,340,110,'raised')+text(x+24,714,title,24,'head','cloud')+text(x+24,748,sub,16,'','lavender')
save('architecture-diagram.svg',1200,820,'Orbit logical architecture','Next.js public site, agency workspace and client portal connect to server routes and services, then Payload CMS and authentication. The backend connects to PostgreSQL and storage or email services. Logical system diagram, not a deployment topology.',b,'night')

b=header('atlas brand identity','Northstar Studio / Projects',1680)
for i,(title,card,who) in enumerate([('to do','Package source files','Riley'),('in progress','Final presentation v3','Jamie'),('client review','Logo variations','Taylor')]):
    x=32+i*354
    b+=text(x,160,title,23,'head')+task(x,192,326,card,who,'medium')
b+=line(1110,0,1110,720)+text(1142,58,'task details',26,'head')+text(1142,143,'final presentation v3',28,'head')+pill(1142,170,'in progress',150)+text(1142,249,'Assignee',16,'muted')+text(1320,249,'Jamie')+text(1142,293,'Due date',16,'muted')+text(1320,293,'09 Nov 2026')+line(1142,320,1648,320)+text(1142,365,'Publish the revised presentation.')+text(1142,396,'Attach the final PDF before review.')+text(1142,464,'internal comment',22,'head')+text(1142,508,'Taylor: the PDF is still missing.')+button(1142,556,'attach file',166)
b+=rect(32,510,1038,126,'night')+text(56,550,'Couldn’t move “Final presentation v3”.',22,'head','cloud')+text(56,582,'It’s back in in progress. Attach a file before client review.',16,'','lavender')+text(928,582,'try again',18,'button','cloud')+text(32,686,'Northstar Studio is fictional. Sample data. Illustrated rollback state.',14,'muted')
save('feature-board-showcase.svg',1680,720,'Projects, tasks and rollback','21:9 sample Atlas board with a task detail drawer. An optimistic move was rolled back because a required file is missing; the toast explains why and offers try again.',b)

b=header('reports with a reason','Northstar Studio / Reports',1200)+text(32,163,'task completion',24,'head')+text(32,232,'84%',60,'head')+text(32,271,'42 completed / 50 due',18,'muted')+rect(32,305,680,16,'soft',8)+rect(32,305,571.2,16,'violet',8)+text(32,355,'Rule: completed tasks due in period ÷ all tasks due.',16,'muted')+text(32,385,'Period: 01–30 Nov 2026. Zero due tasks shows “No data”.',16,'muted')+text(820,163,'waiting approvals',24,'head')+text(820,232,'6',60,'head')+text(820,271,'Current pending versions',18,'muted')+text(820,307,'Superseded versions excluded.',16,'muted')+line(32,424,1168,424)+text(32,465,'invoice status',24,'head')
for y,s,n in [(509,'draft',2),(546,'sent',3),(583,'paid',5),(620,'overdue',1),(657,'void',1)]:
    b+=text(32,y,s)+rect(160,y-16,n*100,18,'violet' if s=='paid' else 'soft',9)+text(700,y,str(n),18,'head')
b+=text(820,506,'Rule: count invoices by current state.',16,'muted')+text(820,540,'12 invoices across all five states.',16,'muted')+text(820,590,'Outstanding = sent + overdue',16,'muted')+text(820,620,'unpaid balances; draft and void',16,'muted')+text(820,650,'are excluded from money totals.',16,'muted')+footer(1200,740)
save('feature-reports-chart.svg',1200,740,'Reports and calculation rules','Sample reports: 42 of 50 due tasks completed, 84 percent; six current pending approvals. Invoice counts: draft two, sent three, paid five, overdue one, void one. Calculation rules are printed beside each measure.',b)

verticals=[('creative','Atlas','brand identity','Final presentation v3','v3','Morgan','Brand direction agreed','Final files ready','Approve the identity'),('marketing','Nova','autumn campaign','Campaign assets v2','v2','Campaign lead','Channel brief agreed','Social and email ready','Approve each channel'),('web','Luma','website launch','Staging build v4','v4','Project lead','Sprint demo complete','Staging checks ready','Sign off the launch'),('production','Echo','brand film','Final cut v5','v5','Producer','Edit notes resolved','Master export ready','Approve the final cut')]
for slug,client,project,item,version,contact,a,c,d in verticals:
    b=text(32,38,'Northstar Studio / Client portal',14,'muted')+pill(432,18,'sample data',136)+text(32,108,client.lower(),42,'head')+text(32,145,project,20,'muted')+line(32,173,568,173)+text(32,218,'ready for your review',28,'head')+text(32,264,item,24,'head')+pill(496,239,version,64)
    if slug=='creative':
        b+=rect(32,296,536,202,'night')+text(64,373,'atlas',56,'head','cloud')+text(64,424,'Identity / final direction',18,'','lavender')+rect(64,452,130,14,'lavender',7)+rect(208,452,130,14,'violet',7)
    elif slug=='marketing':
        b+=text(32,321,'Channel',14,'muted')+text(370,321,'Review state',14,'muted')
        for y,label in [(365,'Social campaign'),(422,'Email launch'),(479,'Landing page')]: b+=text(32,y,label,20,'head')+pill(370,y-23,'ready',150)+line(32,y+18,568,y+18)
    elif slug=='web':
        b+=rect(32,296,536,202,'night')+text(60,339,'staging preview',20,'head','lavender')+text(60,389,'luma / launch candidate',26,'head','cloud')+text(60,433,'Keyboard review complete',16,'','cloud')+text(60,464,'Responsive checks complete',16,'','cloud')
    else:
        b+=rect(32,296,536,202,'night')+text(60,338,'echo / final cut',26,'head','cloud')+text(60,380,'00:42 / 01:30',16,'','lavender')+line(60,425,540,425,'arc')+line(60,425,284,425,'lavender')+text(60,469,'00:42  Title timing updated',16,'','cloud')
    b+=button(32,526,'approve',160)+text(218,555,'ask for changes',18,'button','accent')+text(32,620,'handover',24,'head')
    for y,n,s in [(666,'1',a),(716,'2',c),(766,'3',d)]:b+=pill(32,y-24,n,36)+text(88,y,s,18,'head')
    b+=footer(600,856)
    save(f'solution-{slug}.svg',600,856,f'Orbit for {slug}: {client}',f'Fictional {client} {project} handover. {item} is ready for review. Three stages: {a}; {c}; {d}. Static sample UI.',b)

print(f'Generated {len(list(OUT.glob("*.svg")))} SVG assets.')
