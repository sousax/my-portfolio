import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Badge, Button, Card, Dialog, IconButton, Input, NavBar, SectionTitle, Select, StatBar, Tabs, Tag, Textarea, Toast, Tooltip } from './ds.jsx'
import './components.css'

const GITHUB_USER = 'sousax'
const GITHUB_URL = `https://github.com/${GITHUB_USER}`
const CATS = ['sistemas', 'games', 'design']
const CV_PT = `${import.meta.env.BASE_URL}curriculo-eduardo-sousa.pdf`
const CV_EN = `${import.meta.env.BASE_URL}resume-eduardo-sousa.pdf`

// All UI copy. Portuguese for pt-* browsers, English for everyone else; the NavBar button overrides and is remembered.
const STRINGS = {
  pt: {
    lang: 'pt-BR', switchTo: 'en', switchLabel: 'Switch to English', switchText: 'EN', turnstile: 'pt-br',
    repoErrors: {
      rate: 'O GitHub limitou as consultas deste navegador por enquanto (60 por hora). Tente de novo em alguns minutos.',
      offline: 'Parece que você está sem internet. Conecte-se e tente de novo.',
      http: 'Não consegui falar com o GitHub agora.',
    },
    retry: 'Tentar de novo',
    topics: { ia: 'IA', automacao: 'Automação', estudo: 'Estudo' },
    online: 'Online', code: 'Código', noDesc: 'Sem descrição.',
    cv: 'Currículo (PDF)', cvUrl: CV_PT,
    roles: ['Desenvolvedor full-stack', 'Java, C# e JavaScript', 'Front-end em evolução'],
    pressHint: 'clique ou aperte Enter', skip: 'Pular intro',
    available: 'Disponível para projetos',
    intro: 'Olá! Sou desenvolvedor full-stack na MG Capital e estudo Análise e Desenvolvimento de Sistemas no IFSP. Escolha uma quest abaixo para ver o que já construí.',
    seeQuests: 'Ver quests', talk: 'Fale comigo', photoAlt: 'Foto de Eduardo Sousa',
    yearsOnGh: y => `${y} ${y === 1 ? 'ano' : 'anos'} no GitHub`, lvTitle: y => `LV = anos desde o primeiro repositório (${y})`, lvSub: 'anos de código',
    about: 'Sobre', aboutTitle: 'Perfil do jogador',
    aboutP1: 'Comecei pelo técnico em Redes no SENAI e passei pela contabilidade e pelo comércio exterior. Foi automatizando essas rotinas com Python, n8n e Power Automate que cortei em até 80% o tempo de tarefas manuais, como o processamento de notas fiscais.',
    aboutP2: 'Hoje, na MG Capital, em Santos, construo aplicações web e ferramentas internas de ponta a ponta, do back-end à interface.',
    statsKicker: 'Stats · linguagens no GitHub', loadingLangs: 'Buscando linguagens no GitHub…',
    shotAlt: t => `Captura de tela de ${t}`, project: 'Projeto',
    questsTitle: 'Projetos selecionados',
    cats: { all: 'Todos', web: 'Web', sistemas: 'Sistemas', games: 'Games', design: 'Design' },
    openLabel: t => `Abrir ${t} (nova aba)`, open: 'Abrir projeto', codeLabel: t => `Código de ${t} no GitHub (nova aba)`,
    noQuests: 'Nenhum projeto por aqui ainda. Veja tudo no GitHub:', loadingQuests: 'Buscando projetos no GitHub…', seeAll: 'Ver tudo no GitHub',
    subjects: ['Projeto freelance', 'Vaga full-time', 'Só dizer oi'],
    sendErrors: {
      error: 'Não consegui enviar agora.',
      timeout: 'O envio demorou demais e foi cancelado.',
      offline: 'Parece que você está sem internet.',
      rate: 'Muitas mensagens em pouco tempo. Espere alguns minutos e tente de novo.',
    },
    errName: 'Diga seu nome, viajante', errEmail: 'Esse email não parece válido. Confira se tem @ e domínio, ex.: voce@email.com',
    errMsg: 'Escreva uma mensagem', errCaptcha: 'Confirme que você não é um robô antes de enviar.',
    contact: 'Contato', contactTitle: 'Pronto para a próxima quest?', contactDesc: 'Freelance, vaga ou só pra conversar sobre o último anime da temporada. Respondo em até 24h.',
    name: 'Nome', emailPh: 'voce@email.com', subject: 'Assunto', message: 'Mensagem', messagePh: 'Conte sobre sua quest…',
    keptMsg: 'Sua mensagem continua aqui; se preferir, escreva direto para', resume: 'Currículo:', sending: 'Enviando…', send: 'Enviar mensagem',
    madeWith: 'Feito com', coffee: 'e muito café',
    lightTheme: 'Usar tema claro', darkTheme: 'Usar tema escuro', hire: 'Contratar',
    sent: 'Mensagem enviada', sentDesc: '+50 XP · respondo em até 24h',
  },
  en: {
    lang: 'en', switchTo: 'pt', switchLabel: 'Mudar para português', switchText: 'PT', turnstile: 'en',
    repoErrors: {
      rate: 'GitHub has rate-limited this browser for now (60 requests per hour). Try again in a few minutes.',
      offline: 'Looks like you are offline. Reconnect and try again.',
      http: "Couldn't reach GitHub right now.",
    },
    retry: 'Try again',
    topics: { ia: 'AI', automacao: 'Automation', estudo: 'Study' },
    online: 'Online', code: 'Code', noDesc: 'No description.',
    cv: 'Resume (PDF)', cvUrl: CV_EN,
    roles: ['Full-stack developer', 'Java, C# and JavaScript', 'Growing in front end'],
    pressHint: 'click or press Enter', skip: 'Skip intro',
    available: 'Available for projects',
    intro: "Hi! I'm a full-stack developer at MG Capital and I study Systems Analysis and Development at IFSP. Pick a quest below to see what I've built.",
    seeQuests: 'View quests', talk: 'Talk to me', photoAlt: 'Photo of Eduardo Sousa',
    yearsOnGh: y => `${y} ${y === 1 ? 'year' : 'years'} on GitHub`, lvTitle: y => `LV = years since the first repository (${y})`, lvSub: 'years of code',
    about: 'About', aboutTitle: 'Player profile',
    aboutP1: 'I started with a technical course in Networking at SENAI, then worked in accounting and foreign trade. Automating those routines with Python, n8n and Power Automate, I cut the time spent on manual tasks such as invoice processing by up to 80%.',
    aboutP2: 'Today, at MG Capital in Santos, Brazil, I build web apps and internal tools end to end, from the back end to the interface.',
    statsKicker: 'Stats · languages on GitHub', loadingLangs: 'Fetching languages from GitHub…',
    shotAlt: t => `Screenshot of ${t}`, project: 'Project',
    questsTitle: 'Selected projects',
    cats: { all: 'All', web: 'Web', sistemas: 'Systems', games: 'Games', design: 'Design' },
    openLabel: t => `Open ${t} (new tab)`, open: 'Open project', codeLabel: t => `${t} source code on GitHub (new tab)`,
    noQuests: 'No projects here yet. See everything on GitHub:', loadingQuests: 'Fetching projects from GitHub…', seeAll: 'See all on GitHub',
    subjects: ['Freelance project', 'Full-time job', 'Just saying hi'],
    sendErrors: {
      error: "Couldn't send it right now.",
      timeout: 'Sending took too long and was cancelled.',
      offline: 'Looks like you are offline.',
      rate: 'Too many messages in a short time. Wait a few minutes and try again.',
    },
    errName: 'Tell me your name, traveler', errEmail: "That email doesn't look valid. Check it has an @ and a domain, e.g. you@email.com",
    errMsg: 'Write a message', errCaptcha: "Confirm you're not a robot before sending.",
    contact: 'Contact', contactTitle: 'Ready for the next quest?', contactDesc: 'Freelance, a job, or just to chat about the latest anime season. I reply within 24h.',
    name: 'Name', emailPh: 'you@email.com', subject: 'Subject', message: 'Message', messagePh: 'Tell me about your quest…',
    keptMsg: 'Your message is still here; if you prefer, write directly to', resume: 'Resume:', sending: 'Sending…', send: 'Send message',
    madeWith: 'Made with', coffee: 'and lots of coffee',
    lightTheme: 'Use light theme', darkTheme: 'Use dark theme', hire: 'Hire me',
    sent: 'Message sent', sentDesc: '+50 XP · I reply within 24h',
  },
}
const LangContext = createContext(STRINGS.pt)
const useT = () => useContext(LangContext)
// Committed screenshots in src/assets/quests/<repo>.webp win; otherwise a live capture of the homepage via thum.io.
const SHOTS = Object.fromEntries(Object.entries(import.meta.glob('./assets/quests/*.webp', { eager: true, import: 'default' }))
  .map(([path, url]) => [path.split('/').pop().replace(/\.webp$/, ''), url]))
// Drop your photo at src/assets/avatar.(jpg|png|webp); resolved at build time, else the GitHub avatar.
const AVATAR = Object.values(import.meta.glob('./assets/avatar.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }))[0]
  ?? `https://avatars.githubusercontent.com/${GITHUB_USER}?s=600`
// ponytail: unauthenticated GitHub API (60 req/h per visitor IP) — cache in localStorage or prebuild to JSON if it ever rate-limits.
// One shared request for About (stats) and Quests.
// Cached per tab for 10 min so reloads don't burn the rate limit.
const CACHE_KEY = 'gh-repos', CACHE_TTL = 10 * 60 * 1000
let reposPromise
function fetchRepos() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY))
    if (c && Date.now() - c.t < CACHE_TTL) return reposPromise ??= Promise.resolve(c.repos)
  } catch { /* storage blocked or corrupt: just fetch */ }
  return reposPromise ??= fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, { signal: AbortSignal.timeout(10000) })
    .then(r => {
      if (r.status === 403 || r.status === 429) throw new Error('rate')
      if (!r.ok) throw new Error('http')
      return r.json()
    })
    .then(all => {
      const repos = all.filter(r => !r.fork && r.name !== GITHUB_USER)
        .map(({ name, description, language, topics = [], homepage, html_url, created_at }) => ({ name, description, language, topics, homepage, html_url, created_at }))
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), repos })) } catch { /* ignore */ }
      return repos
    })
    .catch(e => { reposPromise = undefined; throw e }) // let the next call retry
}
function useRepos() {
  const [state, setState] = useState({ repos: null, error: null })
  const load = useCallback(() => {
    setState({ repos: null, error: null })
    fetchRepos().then(repos => setState({ repos, error: null }), e => setState({ repos: null, error: e.message === 'rate' ? 'rate' : navigator.onLine ? 'http' : 'offline' }))
  }, [])
  useEffect(load, [load])
  return { ...state, retry: load }
}
function RepoError({ error, onRetry }) {
  const t = useT()
  return <div role="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>
    <p>{t.repoErrors[error]}</p>
    <Button size="sm" variant="secondary" icon="reload" onClick={onRetry}>{t.retry}</Button>
  </div>
}

// GitHub topics are slugs; show them as people write them.
const TOPIC_LABELS = { adonisjs: 'AdonisJS', react: 'React', tailwind: 'Tailwind', estudo: 'Estudo', nodejs: 'Node.js', typescript: 'TypeScript', javascript: 'JavaScript' }
const topicLabel = (t, tr) => tr.topics[t] ?? TOPIC_LABELS[t] ?? t.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())

function toQuests(repos, t) {
  const tagged = repos.filter(r => r.topics.includes('portfolio'))
  // Curate by adding the "portfolio" topic on GitHub; until then show the 6 most recent with a description.
  const picked = tagged.length ? tagged : repos.filter(r => r.description).slice(0, 6)
  return picked.map((r, i) => ({
    id: i + 1,
    title: r.name,
    cat: CATS.find(c => r.topics.includes(c)) || 'web',
    status: r.homepage ? t.online : t.code,
    tone: r.homepage ? 'hp' : 'mana',
    desc: r.description || t.noDesc,
    stack: [r.language, ...r.topics.filter(t => t !== 'portfolio' && t !== 'web' && !CATS.includes(t)).map(x => topicLabel(x, t))].filter(Boolean),
    image: SHOTS[r.name] ?? (r.homepage ? `https://image.thum.io/get/width/800/crop/500/noanimate/${r.homepage}` : null),
    language: r.language,
    url: r.homepage || r.html_url,
    repo: r.html_url,
  }))
}

const yearsSince = repos => Math.max(1, Math.floor((Date.now() - Math.min(...repos.map(r => Date.parse(r.created_at)))) / 31557600000))

// Stats = primary language of each public repo; the most used language fills the bar, LV = repo count.
const TONES = ['mp', 'sp', 'violet', 'hp', 'xp', 'mp']
function toSkills(repos) {
  const count = {}
  for (const r of repos) if (r.language) count[r.language] = (count[r.language] || 0) + 1
  const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 6)
  return top.map(([lang, n], i) => ({ lang, n, value: Math.round(n / top[0][1] * 100), tone: TONES[i] }))
}
const socials = t => [['github', 'GitHub', GITHUB_URL], ['mail', 'Email', 'mailto:eduardomssousa@hotmail.com'], ['briefcase', 'LinkedIn', 'https://www.linkedin.com/in/edusousax/'], ['download', t.cv, t.cvUrl]]

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// True while the element is on screen; loops pause and reveals wait for it.
function useInView(threshold = 0) {
  const ref = useRef(null), [inView, setInView] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

function Typer({ words, running, speed = 70, hold = 1400 }) {
  const [i, setI] = useState(0), [n, setN] = useState(0), [del, setDel] = useState(false)
  const still = reducedMotion()
  useEffect(() => {
    if (!running || still) return
    const w = words[i]
    const t = !del && n < w.length ? setTimeout(() => setN(n + 1), speed)
      : !del ? setTimeout(() => setDel(true), hold)
      : n > 0 ? setTimeout(() => setN(n - 1), speed / 2)
      : setTimeout(() => { setDel(false); setI((i + 1) % words.length) }, 0)
    return () => clearTimeout(t)
  }, [n, del, i, words, speed, hold, running, still])
  return <span className="es-cursor">{still ? words[0] : words[i].slice(0, n)}</span>
}

function StartScreen({ onPress, onStart }) {
  const t = useT()
  const [off, setOff] = useState(false)
  const press = useCallback(() => { setOff(true); onPress() }, [onPress])
  const skip = useCallback(() => { onPress(); onStart() }, [onPress, onStart])
  useEffect(() => {
    const k = e => {
      if (e.key === 'Escape') skip()
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press() }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [press, skip])
  // Safety net in case animationend never fires (e.g. backgrounded tab).
  useEffect(() => { if (off) { const t = setTimeout(onStart, 700); return () => clearTimeout(t) } }, [off, onStart])
  return <div onClick={press} onAnimationEnd={e => off && e.target === e.currentTarget && onStart()} className={'es-scanlines es-start' + (off ? ' es-start--off' : '')} style={{ background: 'var(--bg-aura),var(--bg-pixel-grid),var(--ink-950)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center', padding: 24 }}>
      <span className="es-jp" style={{ fontSize: 14 }}>エドゥアルド・ソウザ</span>
      <span aria-hidden className="es-start__name" style={{ fontSize: 'clamp(48px,9vw,104px)', lineHeight: .9, letterSpacing: '-.02em', color: 'var(--fg-1)' }}>Eduardo<br /><span style={{ color: 'var(--fg-accent)' }}>Sousa</span></span>
      <span className="es-kicker">Portfolio · Ver. 2026</span>
      <button type="button" autoFocus className="es-start__press" onClick={e => { e.stopPropagation(); press() }}>
        <span aria-hidden style={{ animation: 'es-blink 1.1s steps(1) infinite' }}>▸ </span>PRESS START
      </button>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{t.pressHint}</span>
    </div>
    <button type="button" className="es-start__skip" onClick={e => { e.stopPropagation(); skip() }}>{t.skip} <kbd>Esc</kbd></button>
  </div>
}

function Hero({ onNav, entered }) {
  const t = useT()
  const { repos } = useRepos()
  const [ref, inView] = useInView()
  const years = repos?.length ? yearsSince(repos) : null
  return <section id="top" ref={ref} className={'es-bg-grid' + (inView ? '' : ' is-paused')} style={{ padding: '72px 24px 96px' }}>
    <div className="es-container hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 56, alignItems: 'center' }}>
      <div className={'hero-copy' + (entered ? ' is-entered' : '')} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Badge tone="hp" live>{t.available}</Badge><span className="es-jp" style={{ fontSize: 12 }}>プレイヤー 01</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 style={{ fontSize: 'clamp(52px,7vw,88px)', lineHeight: .92, letterSpacing: '-.02em' }}>Eduardo<br /><span style={{ color: 'var(--fg-accent)' }}>Sousa</span></h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--fg-1)', minHeight: 28 }}><span className="sr-only">{t.roles.join(', ')}</span><span aria-hidden><span style={{ color: 'var(--fg-accent-2)' }}>&gt; </span><Typer key={t.lang} words={t.roles} running={entered && inView} /></span></div>
        </div>
        <div style={{ maxWidth: 540, marginTop: 8 }}><Dialog inline speaker="Eduardo" showNext>{t.intro}</Dialog></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
          <Button size="lg" icon="play" onClick={() => onNav('quests')}>{t.seeQuests}</Button>
          <Button size="lg" variant="secondary" onClick={() => onNav('contact')}>{t.talk}</Button>
          <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>{socials(t).map(([i, l, href]) => <Tooltip key={i} content={l}><IconButton icon={i} label={l} href={href} {...(href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })} /></Tooltip>)}</div>
        </div>
      </div>
      <div className="hero-photo" style={{ position: 'relative', justifySelf: 'center', width: '100%', maxWidth: 400 }}>
        <div className="hero-float">
          <div className="es-card es-card--brackets" style={{ aspectRatio: '4/5', background: 'var(--bg-pixel-grid),var(--surface-sunken)', overflow: 'hidden' }}>
            <img src={AVATAR} alt={t.photoAlt} fetchPriority="high" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
        <div className="hero-chip hero-chip--class" style={{ position: 'absolute', left: -28, bottom: 48, padding: '10px 14px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-pixel-violet)', display: 'flex', flexDirection: 'column', gap: 2 }}><span className="es-kicker" style={{ color: 'var(--fg-gold)' }}>Class</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--fg-1)' }}>Full-stack</span>{years && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{t.yearsOnGh(years)} · {repos.length} repos</span>}</div>
        {years && <div className="hero-chip hero-chip--lv" title={t.lvTitle(years)} style={{ position: 'absolute', right: -18, top: 36, padding: '8px 12px', background: 'var(--violet-500)', color: '#fff', fontFamily: 'var(--font-pixel)', fontSize: 13, letterSpacing: '.1em', boxShadow: 'var(--shadow-pixel)' }}>LV {years}<span className="hero-chip__sub">{t.lvSub}</span></div>}
      </div>
    </div>
  </section>
}

function About() {
  const t = useT()
  const { repos, error, retry } = useRepos()
  const skills = repos ? toSkills(repos) : []
  const [statsRef, statsSeen] = useInView(0.3)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => { if (statsSeen) setRevealed(true) }, [statsSeen])
  return <section id="about" className="es-section">
    <div className="es-container two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 56 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SectionTitle index="01" kicker={t.about} jp="プロフィール" title={t.aboutTitle} />
        <p style={{ fontSize: 18, lineHeight: 1.7 }}>{t.aboutP1}</p>
        <p>{t.aboutP2}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{['Python', 'JavaScript', 'TypeScript', 'C#', 'Java', 'React', 'Angular', 'n8n', 'Power Automate'].map(t => <Tag key={t}>{t}</Tag>)}</div>
      </div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span className="es-kicker">{t.statsKicker}</span>{repos && <span className="es-kicker" style={{ color: 'var(--fg-gold)' }}>{repos.length} repos</span>}</div>
        <div ref={statsRef} className={'es-stats' + (revealed ? ' is-revealed' : '')} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
          {skills.map((sk, i) => <StatBar key={sk.lang} label={sk.lang} value={sk.value} tone={sk.tone} valueText={`${sk.n} ${sk.n === 1 ? 'repo' : 'repos'}`} delay={i * 90} />)}
          {!repos && !error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>{t.loadingLangs}</p>}
          {error && <RepoError error={error} onRetry={retry} />}
        </div>
      </Card>
    </div>
  </section>
}

// Screenshot of the project, or a dark title card when there is none / it fails to load.
function QuestShot({ q }) {
  const t = useT()
  const [failed, setFailed] = useState(false)
  if (q.image && !failed) return <img src={q.image} alt={t.shotAlt(q.title)} loading="lazy" onError={() => setFailed(true)} />
  return <div className="es-quest-card" aria-hidden>
    <span className="es-kicker">{q.language || t.project}</span>
    <span className="es-break" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--fg-1)' }}>{q.title}</span>
  </div>
}

function Quests() {
  const t = useT()
  const { repos, error, retry } = useRepos()
  const quests = repos && toQuests(repos, t)
  const [tab, setTab] = useState('all')
  const pick = c => (quests || []).filter(q => c === 'all' || q.cat === c)
  const list = pick(tab)
  return <section id="quests" className="es-section es-section--lead" style={{ background: 'var(--bg-pixel-grid)' }}>
    <div className="es-container" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <SectionTitle index="02" kicker="Quests" jp="クエスト" title={t.questsTitle} />
        {new Set(quests?.map(q => q.cat)).size > 1 && <Tabs value={tab} onChange={setTab} items={Object.entries(t.cats).map(([value, label]) => ({ value, label, count: pick(value).length })).filter(t => t.value === 'all' || t.count)} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 24 }}>
        {list.map((q, i) => <article key={q.id} style={{ animation: `es-pop-in 400ms var(--ease-out) ${i * 60}ms both` }}>
          <Card style={{ height: '100%' }} mediaSlot={<QuestShot q={q} />}>
            <div style={{ display: 'flex', gap: 8 }}><Badge tone={q.tone}>{q.status}</Badge><Badge tone="outline">{t.cats[q.cat]}</Badge></div>
            <h3 className="es-break" style={{ fontSize: 22 }}>{q.title}</h3>
            <p className="es-clamp-3" style={{ fontSize: 15 }}>{q.desc}</p>
            {q.stack.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{q.stack.map(s => <Tag key={s}>{s}</Tag>)}</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8 }}>
              {q.url !== q.repo && <Button size="sm" iconRight="external-link" href={q.url} target="_blank" rel="noreferrer" aria-label={t.openLabel(q.title)}>{t.open}</Button>}
              <Button size="sm" variant="ghost" icon="code" href={q.repo} target="_blank" rel="noreferrer" aria-label={t.codeLabel(q.title)}>{t.code}</Button>
            </div>
          </Card>
        </article>)}
      </div>
      {error ? <RepoError error={error} onRetry={retry} />
        : (!quests || !quests.length) && <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>{quests ? t.noQuests : t.loadingQuests}</p>}
      <div style={{ display: 'flex', justifyContent: 'center' }}><Button variant="ghost" iconRight="external-link" href={GITHUB_URL} target="_blank" rel="noreferrer">{t.seeAll}</Button></div>
    </div>
  </section>
}

const FORMSPREE = 'https://formspree.io/f/myekapka'
const EMAIL = 'eduardomssousa@hotmail.com'
// Turnstile site key; the secret lives in Formspree's form settings.
const TURNSTILE_KEY = '0x4AAAAAAFi77z9ISDARxUad'
let turnstileLoad
const loadTurnstile = () => turnstileLoad ??= new Promise((ok, fail) => {
  const s = document.createElement('script')
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  s.onload = ok; s.onerror = fail
  document.head.append(s)
})
// subject is an index into t.subjects so switching language keeps the choice.
const EMPTY = { name: '', email: '', subject: 0, msg: '' }
function Contact({ onSent, theme }) {
  const t = useT()
  const [f, setF] = useState(EMPTY), [err, setErr] = useState({}), [status, setStatus] = useState('idle')
  const captcha = useRef(null), widget = useRef()
  useEffect(() => {
    let gone = false
    loadTurnstile().then(() => {
      if (!gone) widget.current = window.turnstile.render(captcha.current, { sitekey: TURNSTILE_KEY, theme, language: t.turnstile })
    }).catch(() => { turnstileLoad = undefined })
    return () => { gone = true; if (widget.current !== undefined) window.turnstile.remove(widget.current); widget.current = undefined }
  }, [theme, t.turnstile])
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = async e => {
    e.preventDefault()
    const form = e.currentTarget
    if (status === 'sending') return
    const er = {}
    if (!f.name.trim()) er.name = t.errName
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = t.errEmail
    if (!f.msg.trim()) er.msg = t.errMsg
    const token = widget.current !== undefined && window.turnstile.getResponse(widget.current)
    if (!token) er.captcha = t.errCaptcha
    setErr(er)
    const first = Object.keys(er)[0]
    if (first) { form.elements[first]?.focus(); return }
    setStatus('sending')
    try {
      const r = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), _subject: `[Portfolio] ${t.subjects[f.subject]}`, assunto: t.subjects[f.subject], idioma: t.lang, message: f.msg.trim(), _gotcha: form.elements._gotcha.value, 'cf-turnstile-response': token }),
        signal: AbortSignal.timeout(15000),
      })
      if (!r.ok) throw new Error(r.status === 429 ? 'rate' : 'http')
      setStatus('idle'); setF(EMPTY); onSent()
    } catch (x) {
      // keep what they typed so they can retry
      setStatus(x.message === 'rate' ? 'rate' : !navigator.onLine ? 'offline' : x.name === 'TimeoutError' ? 'timeout' : 'error')
    } finally {
      window.turnstile.reset(widget.current) // tokens are single-use
    }
  }
  return <section id="contact" className="es-section">
    <div className="es-container" style={{ maxWidth: 'var(--container-narrow)', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SectionTitle align="center" index="03" kicker={t.contact} jp="コンタクト" title={t.contactTitle} description={t.contactDesc} />
      <Card><form noValidate onSubmit={submit} className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />
        <Input label={t.name} name="name" maxLength={100} prefix="›" placeholder="Player 2" autoComplete="name" value={f.name} error={err.name} onChange={set('name')} />
        <Input label="Email" name="email" maxLength={254} type="email" placeholder={t.emailPh} autoComplete="email" value={f.email} error={err.email} onChange={set('email')} />
        <div style={{ gridColumn: '1/-1' }}><Select label={t.subject} name="subject" options={t.subjects} value={t.subjects[f.subject]} onChange={e => setF({ ...f, subject: t.subjects.indexOf(e.target.value) })} /></div>
        <div style={{ gridColumn: '1/-1' }}><Textarea label={t.message} name="msg" maxLength={5000} placeholder={t.messagePh} value={f.msg} error={err.msg} onChange={set('msg')} /></div>
        <div style={{ gridColumn: '1/-1' }}>
          <div ref={captcha} />
          {err.captcha && <p role="alert" className="es-help es-help--error" style={{ fontSize: 14 }}>{err.captcha}</p>}
        </div>
        {t.sendErrors[status] && <p role="alert" className="es-help es-help--error" style={{ gridColumn: '1/-1', fontSize: 14 }}>{t.sendErrors[status]} {t.keptMsg} <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
        <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span className="es-cv" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>{t.resume} <a href={CV_PT} download>Português</a> · <a href={CV_EN} download>English</a></span>
          <Button type="submit" icon="mail" aria-disabled={status === 'sending' || undefined}>{status === 'sending' ? t.sending : t.send}</Button>
        </div>
      </form></Card>
    </div>
  </section>
}

function Footer() {
  const t = useT()
  return <footer className="es-section" style={{ padding: '28px 24px' }}>
    <div className="es-container" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
      <span>© 2026 Eduardo Sousa</span><span>{t.madeWith} <span style={{ color: 'var(--fg-accent-2)' }}>♥</span> {t.coffee} · <span style={{ color: 'var(--fg-accent)' }}>GAME SAVED</span></span>
    </div>
  </footer>
}

export default function App() {
  const [started, setStarted] = useState(() => sessionStorage.getItem('es-started') === '1')
  // Saved choice first, then the OS preference.
  const [theme, setTheme] = useState(() => {
    try { const t = localStorage.getItem('es-theme'); if (t === 'light' || t === 'dark') return t } catch { /* storage blocked */ }
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })
  // Saved choice first, then the browser language.
  const [lang, setLang] = useState(() => {
    try { const l = localStorage.getItem('es-lang'); if (l in STRINGS) return l } catch { /* storage blocked */ }
    return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
  })
  const t = STRINGS[lang]
  useEffect(() => { document.documentElement.lang = t.lang }, [t])
  const switchLang = () => {
    setLang(t.switchTo)
    try { localStorage.setItem('es-lang', t.switchTo) } catch { /* storage blocked */ }
  }
  const [toasts, setToasts] = useState([])
  const [active, setActive] = useState('')
  // Highlight the section under the header while scrolling.
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    ;['top', 'about', 'quests', 'contact'].forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme
    try { localStorage.setItem('es-theme', theme) } catch { /* storage blocked */ }
  }, [theme])
  const go = id => {
    document.getElementById(id)?.scrollIntoView()
    setActive(id)
  }
  // The hero starts entering on PRESS START, while the CRT switches off over it.
  const [entered, setEntered] = useState(started)
  const enter = useCallback(() => setEntered(true), [])
  const start = useCallback(() => { sessionStorage.setItem('es-started', '1'); setStarted(true) }, [])
  const dropToast = useCallback(id => setToasts(x => x.filter(y => y !== id)), [])
  return <LangContext.Provider value={t}>
    {!started && <StartScreen onPress={enter} onStart={start} />}
    <NavBar links={[{ label: t.about, href: 'about' }, { label: 'Quests', href: 'quests' }, { label: t.contact, href: 'contact' }]} active={active} onNavigate={go}
      actions={<><Button size="sm" variant="ghost" aria-label={t.switchLabel} lang={t.switchTo} onClick={switchLang}>{t.switchText}</Button><IconButton variant="ghost" size="sm" icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? t.lightTheme : t.darkTheme} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} /><Button size="sm" onClick={() => go('contact')}>{t.hire}</Button></>} />
    <main><Hero onNav={go} entered={entered} /><About /><Quests /><Contact theme={theme} onSent={() => setToasts(t => [...t, Date.now()])} /></main>
    <Footer />
    <div className="es-toast-stack">{toasts.map(id => <ToastItem key={id} id={id} onDone={dropToast} />)}</div>
  </LangContext.Provider>
}

function ToastItem({ id, onDone }) {
  const t = useT()
  const close = useCallback(() => onDone(id), [id, onDone])
  return <Toast title={t.sent} description={t.sentDesc} onClose={close} />
}
