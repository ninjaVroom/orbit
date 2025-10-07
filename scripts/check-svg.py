"""Check SVG XML/accessibility and browser text bounds; render a contact sheet.

Requires Playwright with Chromium and Pillow for visual QA only.
"""
from pathlib import Path
import tempfile
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
output = Path(tempfile.gettempdir()) / 'orbit-svg-qa'
output.mkdir(exist_ok=True)
files = sorted((root / 'public' / 'svg').glob('*.svg'))
issues = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(device_scale_factor=1)
    for file in files:
        tree = ET.parse(file).getroot()
        assert tree.attrib.get('viewBox')
        for tag in ['title', 'desc']:
            assert tree.find('{http://www.w3.org/2000/svg}' + tag).text
        w, h = int(tree.attrib['width']), int(tree.attrib['height'])
        page.set_viewport_size({'width': w, 'height': h})
        page.goto(file.as_uri())
        page.evaluate('document.fonts.ready')
        bounds = page.evaluate('''() => [...document.querySelectorAll('text')].map(e => {
          const b = e.getBBox(); return {text:e.textContent,x:b.x,y:b.y,w:b.width,h:b.height};
        })''')
        for box in bounds:
            if box['x'] < 0 or box['y'] < 0 or box['x'] + box['w'] > w or box['y'] + box['h'] > h:
                issues.append((file.name, 'outside viewBox', box['text']))
        for i, a in enumerate(bounds):
            for b in bounds[i+1:]:
                if min(a['x']+a['w'],b['x']+b['w'])-max(a['x'],b['x'])>1 and min(a['y']+a['h'],b['y']+b['h'])-max(a['y'],b['y'])>1:
                    issues.append((file.name,'overlapping text',a['text'],b['text']))
        page.screenshot(path=str(output / (file.stem + '.png')),omit_background=True)
    browser.close()
sheet=Image.new('RGB',(1200,((len(files)+2)//3)*350),'#ddd8ec')
draw=ImageDraw.Draw(sheet)
for i,file in enumerate(files):
    im=Image.open(output/(file.stem+'.png')).convert('RGBA')
    im.thumbnail((380,310))
    x=(i%3)*400+10; y=(i//3)*350+30
    if file.name in ['logo-dark.svg','hero-sync-arc.svg']:
        draw.rectangle((x,y,x+380,y+310),fill='#101326')
    sheet.paste(im,(x,y),im)
    draw.text((x,y-20),file.name,fill='#101326')
sheet.save(output/'contact-sheet.png')
print(f'{len(files)} SVGs parsed and rendered. Issues: {issues}')
print(output/'contact-sheet.png')
assert not issues
