from pathlib import Path
import re,json,html
root=Path(__file__).resolve().parents[1]
work=Path(__file__).parent
translations={key:json.loads((root/'locales'/f'{key}.json').read_text(encoding='utf-8')) for key in ['en','ru','uk','pl','de','es','ja','zh']}
labels={'en':'EN · English','ru':'RU · Русский','uk':'UK · Українська','pl':'PL · Polski','de':'DE · Deutsch','es':'ES · Español','ja':'JA · 日本語','zh':'ZH · 简体中文'}
base='https://terawww337.github.io/'
steam='https://store.steampowered.com/app/4312600/WriteNor/'
dev='https://store.steampowered.com/developer/terawww'
itch='https://terawww.itch.io/'
demo=itch+'writenor'
game='https://writenor.github.io/'
youtube='https://www.youtube.com/@WriteNor'
discord='https://discord.gg/QD5mUt44n5'
fallbacklinks=' · '.join(f'<a href="{"/" if k=="en" else "/"+k+"/"}" lang="{translations[k]["htmlLang"]}">{v}</a>' for k,v in labels.items())
def esc(s): return html.escape(str(s), quote=True)
def ext(url, text, cls=''):
    return f'<a href="{url}" class="{cls}" target="_blank" rel="noopener">{text}</a>'

for lang, t in translations.items():
    canonical = base if lang == 'en' else base+lang+'/'
    alternates = ''.join(f'<link rel="alternate" hreflang="{d["htmlLang"]}" href="{base if k=="en" else base+k+"/"}" />\n' for k,d in translations.items())
    ogalternates = ''.join(f'<meta property="og:locale:alternate" content="{d["oglocale"]}" />\n' for k,d in translations.items() if k != lang)
    languageoptions = ''.join(f'<option value="{k}"{" selected" if k==lang else ""}>{v}</option>' for k,v in labels.items())
    graph = {
      '@context': 'https://schema.org', '@graph': [
       {'@type': 'WebSite', '@id': base+'#website', 'url': base, 'name': 'Terawww', 'alternateName': ['Teraw', 'Терав', 'Тераввв'], 'inLanguage': [d['htmlLang'] for d in translations.values()], 'publisher': {'@id':base+'#developer'}},
       {'@type': 'ProfilePage', '@id': canonical+'#profile', 'url':canonical, 'name':t['title'], 'description':t['description'], 'inLanguage':t['htmlLang'], 'isPartOf':{'@id':base+'#website'}, 'mainEntity':{'@id':base+'#developer'}},
       {'@type': 'Person', '@id':base+'#developer', 'name':'Terawww', 'alternateName':['Teraw','Терав','Тераввв','Terawww337'], 'url':base, 'jobTitle':t['role'], 'description':t['description'], 'sameAs':[dev,itch,youtube,'https://github.com/Terawww337'], 'knowsAbout':['Game development','Psychological horror','Narrative design']},
       {'@type':'VideoGame', '@id':game+'#game', 'name':'WriteNor', 'url':game, 'description':re.sub('<[^>]+>','',t['gamedesc']), 'genre':['Psychological horror','Adventure','Indie'], 'operatingSystem':['Windows','Linux'], 'applicationCategory':'GameApplication', 'playMode':'https://schema.org/SinglePlayer', 'creativeWorkStatus':'In development', 'author':{'@id':base+'#developer'}, 'creator':{'@id':base+'#developer'}, 'publisher':{'@id':base+'#developer'}, 'sameAs':[steam,demo]}
      ]}
    head = f'''<!DOCTYPE html>
<html lang="{t['htmlLang']}" data-locale="{lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="/assets/locale.js?v=20261024b"></script>
  <title>{esc(t['title'])}</title>
  <meta name="description" content="{esc(t['description'])}" />
  <meta name="theme-color" content="#020202" />
  <link rel="canonical" href="{canonical}" />
  {alternates}
  <link rel="alternate" hreflang="x-default" href="{base}" />
  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta property="og:type" content="profile" />
  <meta property="og:site_name" content="Terawww" />
  <meta property="og:locale" content="{t['oglocale']}" />
  {ogalternates}
  <meta property="og:url" content="{canonical}" />
  <meta property="og:title" content="{esc(t['title'])}" />
  <meta property="og:description" content="{esc(t['description'])}" />
  <meta property="og:image" content="{base}assets/social-cover.png" />
  <meta property="og:image:alt" content="{esc(t['avatar'])}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(t['title'])}" />
  <meta name="twitter:description" content="{esc(t['description'])}" />
  <meta name="twitter:image" content="{base}assets/social-cover.png" />
  <meta name="twitter:image:alt" content="{esc(t['avatar'])}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500&amp;family=Roboto:wght@300;400&amp;family=Syncopate:wght@400;700&amp;family=JetBrains+Mono:wght@300;400&amp;display=swap" rel="stylesheet" />
  <script type="application/ld+json">{json.dumps(graph,ensure_ascii=False,separators=(',',':'))}</script>
<link rel="stylesheet" href="/assets/base.css?v=20261024b" />
  <link rel="stylesheet" href="/assets/refinements.css?v=20261024b" />
  <script src="/assets/site.js?v=20261024b" defer></script>
</head>
<body>
  <a class="skip-link" href="#main-content">{t['skip']}</a>
  <div class="cursor" id="cursor" aria-hidden="true"></div>
  <div class="cursor-ring" id="cursor-ring" aria-hidden="true"></div>
  <div class="scanlines" aria-hidden="true"></div>
  <div class="vignette" aria-hidden="true"></div>
  <canvas id="bg-canvas" aria-hidden="true"></canvas>
  <nav aria-label="{t['navlabel']}">
    <a href="#hero" class="nav-logo" aria-label="{t['home']}"><span class="nav-logo-dot" aria-hidden="true"></span>TERAWWW</a>
    <ul class="nav-links" id="main-nav">
      {''.join(f'<li><a href="#{anchor}">{label}</a></li>' for anchor,label in zip(['about','writenor','philosophy','contact'],t['nav']))}
      <li>{ext(dev,'Steam ↗','nav-cta')}</li>
    </ul>
    <div class="nav-tools">
      <button class="effects-toggle" type="button" aria-pressed="true" data-on="{t['effects']}" data-off="{t['effectsoff']}" data-reduced="{t['effectsreduced']}" data-reduced-title="{t['reducedtitle']}">{t['effects']}</button>
      <div class="language-control"><label class="visually-hidden" for="language">{t['language']}</label><select id="language" class="language-select" data-auto="{esc(t['auto'])}"><option value="auto">{t['auto']}</option>{languageoptions}</select></div>
      <button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false">{t['menu']}</button>
    </div>
  </nav>
  <noscript><div class="language-fallback">{fallbacklinks}</div></noscript>
  <main id="main-content" tabindex="-1">
    <section id="hero" aria-labelledby="hero-heading">
      <div class="hero-bg-line" aria-hidden="true"></div><div class="hero-glow-l" aria-hidden="true"></div><div class="hero-glow-r" aria-hidden="true"></div>
      <div class="hero-eyebrow">{esc(t['eyebrow'])}</div>
      <h1 class="hero-title-wrap" id="hero-heading"><span class="hero-title-ghost" aria-hidden="true">TERAWWW</span><span class="hero-title">TERAWWW</span><span class="hero-role">{t['role']}</span></h1>
      <p class="hero-sub">{t['sub']}</p>
      <div class="hero-tags">{''.join(f'<div class="tag{(" accent" if i==0 else "")}">{tag}</div>' for i,tag in enumerate(t['tags']))}</div>
      <div class="hero-btns"><a href="#writenor" class="btn btn-primary">{t['buttons'][0]}</a>{ext(dev,t['buttons'][1],'btn')}<a href="#contact" class="btn">{t['buttons'][2]}</a></div>
      <div class="hero-scroll-hint" aria-hidden="true"><span class="scroll-line"></span><span class="scroll-label">{t['scroll']}</span></div>
    </section>
    <div class="ticker" aria-hidden="true"><div class="ticker-inner">{''.join(f'<span>{text}</span><span class="ticker-sep">///</span>' for text in t['ticker']*2)}</div></div>
    <section id="about" aria-labelledby="about-heading"><div class="container"><div class="about-grid">
      <div class="about-left reveal-l"><div class="section-label">{esc(t['devlabel'])}</div><h2 class="section-title" id="about-heading">{t['about']}</h2><div class="about-status">
      {''.join(f'<div class="status-row"><span class="status-key">{key}</span><span class="status-val{(" live" if i==4 else "")}">{value}</span></div>' for i,(key,value) in enumerate(t['profile']))}
      </div></div>
      <div class="about-right"><div class="about-manifesto reveal">
      {''.join(f'<div class="manifesto-item"><div class="manifesto-num">[0{i+1}]</div><h3>{heading}</h3><p>{text}</p></div>' for i,(heading,text) in enumerate(t['aboutblocks']))}
      </div><div class="skills-grid reveal">
      {''.join(f'<div class="skill-cell"><span class="skill-icon" aria-hidden="true">{icon}</span><h3>{heading}</h3><p>{text}</p></div>' for icon,heading,text in t['skills'])}
      </div></div>
    </div></div></section>
    <section id="writenor" aria-labelledby="work-heading">
      <div class="writenor-header"><div class="container"><div class="section-label reveal">{esc(t['currentlabel'])}</div><h2 class="section-title reveal" id="work-heading">{t['work']}</h2></div></div>
      <div class="writenor-main"><div class="writenor-visual"><img src="https://writenor.github.io/Office.png" alt="{t['screenshot']}" width="1920" height="1080" loading="lazy" /><div class="writenor-visual-overlay" aria-hidden="true"></div><div class="writenor-visual-bar" aria-hidden="true"></div></div>
        <div class="writenor-info reveal-r"><div><div class="section-label">&gt; WRITENOR</div><h3 class="writenor-name">WriteNor</h3></div>
          <p class="writenor-logline">{t['logline']}</p><p class="writenor-desc">{t['gamedesc']}</p>
          <div class="writenor-meta">{''.join(f'<div class="meta-row"><span class="meta-key">{key}</span><span class="meta-val{(" highlight" if i==2 else "")}">{value}</span></div>' for i,(key,value) in enumerate(t['meta']))}</div>
          <div class="writenor-links">{ext(steam,t['gamelinks'][0],'btn btn-primary')}{ext(demo,t['gamelinks'][1],'btn')}{ext(game,t['gamelinks'][2],'btn')}</div>
        </div>
      </div>
      <div class="features-strip" aria-label="{t['featureslabel']}"><div class="features-inner">{''.join(f'<div class="feature-chip"{(" aria-hidden=\"true\"" if i>=len(t["chips"]) else "")}><span aria-hidden="true">◈</span>{chip}</div>' for i,chip in enumerate(t['chips']*2))}</div></div>
      <aside class="project-archive container" aria-labelledby="archive-heading"><h3 id="archive-heading">{t['archiveheading']}</h3><p>{t['archive']}</p>{ext(itch+'the-last-command',t['archivelink'],'archive-link')}</aside>
    </section>
    <section id="philosophy" aria-labelledby="approach-heading"><div class="container">
      <div class="reveal section-intro"><div class="section-label">{esc(t['approachlabel'])}</div><h2 class="section-title" id="approach-heading">{t['approach']}</h2></div>
      <div class="philosophy-grid reveal">{''.join(f'<div class="philosophy-block"><div class="philosophy-num">[0{i+1}]</div><h3>{heading}</h3><p>{text}</p></div>' for i,(heading,text) in enumerate(t['philosophy']))}</div>
      <div class="quote-block reveal"><p class="quote-text">{t['quote']}</p><p class="quote-attr">{t['quoteattr']}</p></div>
    </div></section>
    <section id="contact" aria-labelledby="contact-heading"><div class="container"><div class="contact-grid">
      <div class="contact-info reveal-l"><div class="section-label">{esc(t['transmissionlabel'])}</div><h2 class="section-title" id="contact-heading">{t['contact']}</h2><p>{t['contactp']}</p><p>{t['contactp2']}</p>
        <div class="contact-details"><div class="contact-item"><span class="contact-key">STEAM</span>{ext(dev,'Terawww')}</div><div class="contact-item"><span class="contact-key">DISCORD</span>{ext(discord,t['communitylabel'])}</div><div class="contact-item"><span class="contact-key">YOUTUBE</span>{ext(youtube,'@WriteNor')}</div><div class="contact-item"><span class="contact-key">ITCH.IO</span>{ext(itch,'terawww.itch.io')}</div><div class="contact-item"><span class="contact-key">{t['open']}</span><span>{t['opento']}</span></div></div>
      </div>
      <div class="contact-form reveal-r"><form action="https://formspree.io/f/mlgelkpz" method="POST">
        <div class="form-row"><div class="form-field"><label class="form-label" for="contact-name">{t['name']}</label><input id="contact-name" type="text" name="name" autocomplete="name" class="form-input" placeholder="{t['nameplaceholder']}" required /></div><div class="form-field"><label class="form-label" for="contact-email">{t['email']}</label><input id="contact-email" type="email" name="_replyto" autocomplete="email" class="form-input" placeholder="{t['emailplaceholder']}" required /></div></div>
        <div class="form-field"><label class="form-label" for="contact-subject">{t['subject']}</label><input id="contact-subject" type="text" name="subject" class="form-input" placeholder="{t['subjectplaceholder']}" /></div>
        <div class="form-field"><label class="form-label" for="contact-message">{t['message']}</label><textarea id="contact-message" name="message" class="form-textarea" placeholder="{t['messageplaceholder']}" required></textarea></div>
        <button type="submit" class="form-submit">{t['submit']}</button><p class="form-note">{t['privacy']}</p>
      </form></div>
    </div></div></section>
    <section id="links" aria-labelledby="links-heading"><div class="container"><div class="reveal section-intro"><h2 class="section-label" id="links-heading">{esc(t['external'])}</h2></div><div class="links-row reveal">
      {''.join(ext(url,f'<span>{label}</span><span class="link-line" aria-hidden="true"></span>','link-item') for url,label in [(steam,'Steam'),(dev,'Terawww / Steam'),(game,'WriteNor'),(discord,'Discord'),(youtube,'YouTube'),(itch,'Itch.io')])}
    </div></div></section>
  </main>
  <footer><span>© <span id="year">2026</span> {t['footer']}</span><div class="footer-signal"><span class="footer-signal-dot" aria-hidden="true"></span><span>{t['signal']}</span></div></footer>
</body>
</html>
'''
    dest = root/'index.html' if lang=='en' else root/lang/'index.html'
    dest.parent.mkdir(exist_ok=True)
    dest.write_text(head,encoding='utf-8',newline='\n')
    print(lang, dest.stat().st_size)

# Keep discovery links reciprocal across every static translation.
from datetime import date
routes={key:base if key=='en' else base+key+'/' for key in translations}
links=''.join(f'    <xhtml:link rel="alternate" hreflang="{translations[key]["htmlLang"]}" href="{url}" />\n' for key,url in routes.items())
links+=f'    <xhtml:link rel="alternate" hreflang="x-default" href="{base}" />\n'
urls=''.join(f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{date.today().isoformat()}</lastmod>\n{links}  </url>\n' for url in routes.values())
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+urls+'</urlset>\n',encoding='utf-8',newline='\n')
