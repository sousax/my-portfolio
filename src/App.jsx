import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge, Button, Card, Dialog, IconButton, Input, NavBar, SectionTitle, Select, StatBar, Tabs, Tag, Textarea, Toast, Tooltip } from './ds.jsx'
import './components.css'

const GITHUB_USER = 'sousax'
const GITHUB_URL = `https://github.com/${GITHUB_USER}`
const CATS = ['games', 'design']
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
const REPO_ERRORS = {
  rate: 'O GitHub limitou as consultas deste navegador por enquanto (60 por hora). Tente de novo em alguns minutos.',
  offline: 'Parece que você está sem internet. Conecte-se e tente de novo.',
  http: 'Não consegui falar com o GitHub agora.',
}
function RepoError({ error, onRetry }) {
  return <div role="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>
    <p>{REPO_ERRORS[error]}</p>
    <Button size="sm" variant="secondary" icon="reload" onClick={onRetry}>Tentar de novo</Button>
  </div>
}

function toQuests(repos) {
  const tagged = repos.filter(r => r.topics.includes('portfolio'))
  // Curate by adding the "portfolio" topic on GitHub; until then show the 6 most recent with a description.
  const picked = tagged.length ? tagged : repos.filter(r => r.description).slice(0, 6)
  return picked.map((r, i) => ({
    id: i + 1,
    title: r.name,
    cat: CATS.find(c => r.topics.includes(c)) || 'web',
    status: r.homepage ? 'Online' : 'Código',
    tone: r.homepage ? 'hp' : 'mana',
    desc: r.description || 'Sem descrição.',
    stack: [r.language, ...r.topics.filter(t => t !== 'portfolio' && t !== 'web' && !CATS.includes(t))].filter(Boolean),
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
const CV_PT = `${import.meta.env.BASE_URL}curriculo-eduardo-sousa.pdf`
const CV_EN = `${import.meta.env.BASE_URL}resume-eduardo-sousa.pdf`
const SOCIALS = [['github', 'GitHub', GITHUB_URL], ['mail', 'Email', 'mailto:eduardomssousa@hotmail.com'], ['briefcase', 'LinkedIn', 'https://www.linkedin.com/in/edusousax/'], ['download', 'Currículo (PDF)', CV_PT]]
const ROLES = ['Desenvolvedor full-stack', 'Java, C# e JavaScript', 'Front-end em evolução']

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
  const [off, setOff] = useState(false)
  const press = useCallback(() => { setOff(true); onPress() }, [onPress])
  useEffect(() => {
    const k = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), press())
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [press])
  // Safety net in case animationend never fires (e.g. backgrounded tab).
  useEffect(() => { if (off) { const t = setTimeout(onStart, 700); return () => clearTimeout(t) } }, [off, onStart])
  return <button type="button" autoFocus onClick={press} onAnimationEnd={e => off && e.target === e.currentTarget && onStart()} aria-label="Entrar no portfolio" className={'es-scanlines es-start' + (off ? ' es-start--off' : '')} style={{ background: 'var(--bg-aura),var(--bg-pixel-grid),var(--ink-950)' }}>
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center', padding: 24 }}>
      <span className="es-jp" style={{ fontSize: 14 }}>エドゥアルド・ソウザ</span>
      <span aria-hidden className="es-start__name" style={{ fontSize: 'clamp(48px,9vw,104px)', lineHeight: .9, letterSpacing: '-.02em', color: 'var(--fg-1)' }}>Eduardo<br /><span style={{ color: 'var(--fg-accent)' }}>Sousa</span></span>
      <span className="es-kicker">Portfolio · Ver. 2026</span>
      <span style={{ display: 'block', marginTop: 28, fontFamily: 'var(--font-pixel)', fontSize: 18, letterSpacing: '.12em', color: 'var(--gold-500)', animation: 'es-blink 1.1s steps(1) infinite' }}>▸ PRESS START</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>clique ou aperte Enter</span>
    </span>
  </button>
}

function Hero({ onNav, entered }) {
  const { repos } = useRepos()
  const [ref, inView] = useInView()
  const years = repos?.length ? yearsSince(repos) : null
  return <section id="top" ref={ref} className={'es-bg-grid' + (inView ? '' : ' is-paused')} style={{ padding: '72px 24px 96px' }}>
    <div className="es-container hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 56, alignItems: 'center' }}>
      <div className={'hero-copy' + (entered ? ' is-entered' : '')} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Badge tone="hp" live>Disponível para projetos</Badge><span className="es-jp" style={{ fontSize: 12 }}>プレイヤー 01</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 style={{ fontSize: 'clamp(52px,7vw,88px)', lineHeight: .92, letterSpacing: '-.02em' }}>Eduardo<br /><span style={{ color: 'var(--fg-accent)' }}>Sousa</span></h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--fg-1)', minHeight: 28 }}><span className="sr-only">{ROLES.join(', ')}</span><span aria-hidden><span style={{ color: 'var(--fg-accent-2)' }}>&gt; </span><Typer words={ROLES} running={entered && inView} /></span></div>
        </div>
        <div style={{ maxWidth: 540, marginTop: 8 }}><Dialog inline speaker="Eduardo" showNext>Olá! Sou desenvolvedor full-stack na MG Capital e estudo Análise e Desenvolvimento de Sistemas no IFSP. Escolha uma quest abaixo para ver o que já construí.</Dialog></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
          <Button size="lg" icon="play" onClick={() => onNav('quests')}>Ver quests</Button>
          <Button size="lg" variant="secondary" onClick={() => onNav('contact')}>Fale comigo</Button>
          <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>{SOCIALS.map(([i, l, href]) => <Tooltip key={i} content={l}><IconButton icon={i} label={l} href={href} {...(href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })} /></Tooltip>)}</div>
        </div>
      </div>
      <div className="hero-photo" style={{ position: 'relative', justifySelf: 'center', width: '100%', maxWidth: 400 }}>
        <div className="hero-float">
          <div className="es-card es-card--brackets" style={{ aspectRatio: '4/5', background: 'var(--bg-pixel-grid),var(--surface-sunken)', overflow: 'hidden' }}>
            <img src={AVATAR} alt="Foto de Eduardo Sousa" fetchPriority="high" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
        <div className="hero-chip hero-chip--class" style={{ position: 'absolute', left: -28, bottom: 48, padding: '10px 14px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-pixel-violet)', display: 'flex', flexDirection: 'column', gap: 2 }}><span className="es-kicker" style={{ color: 'var(--fg-gold)' }}>Class</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--fg-1)' }}>Full-stack</span>{years && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{years} {years === 1 ? 'ano' : 'anos'} no GitHub · {repos.length} repos</span>}</div>
        {years && <div className="hero-chip hero-chip--lv" title={`LV = anos desde o primeiro repositório (${years})`} style={{ position: 'absolute', right: -18, top: 36, padding: '8px 12px', background: 'var(--violet-500)', color: '#fff', fontFamily: 'var(--font-pixel)', fontSize: 13, letterSpacing: '.1em', boxShadow: 'var(--shadow-pixel)' }}>LV {years}</div>}
      </div>
    </div>
  </section>
}

function About() {
  const { repos, error, retry } = useRepos()
  const skills = repos ? toSkills(repos) : []
  const [statsRef, statsSeen] = useInView(0.3)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => { if (statsSeen) setRevealed(true) }, [statsSeen])
  return <section id="about" className="es-section">
    <div className="es-container two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 56 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SectionTitle index="01" kicker="Sobre" jp="プロフィール" title="Perfil do jogador" />
        <p style={{ fontSize: 18, lineHeight: 1.7 }}>Sou desenvolvedor full-stack na MG Capital, em Santos, e estudo Análise e Desenvolvimento de Sistemas no IFSP. Construo aplicações web e ferramentas internas de ponta a ponta, do back-end à interface.</p>
        <p>Vim do comércio exterior e da contabilidade, onde comecei a automatizar rotinas com Python, n8n e Power Automate, e cortei em até 80% o tempo de tarefas manuais como o processamento de notas fiscais.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{['Python', 'JavaScript', 'TypeScript', 'C#', 'Java', 'React', 'Angular', 'n8n', 'Power Automate'].map(t => <Tag key={t}>{t}</Tag>)}</div>
      </div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span className="es-kicker">Stats · linguagens no GitHub</span>{repos && <span className="es-kicker" style={{ color: 'var(--fg-gold)' }}>{repos.length} repos</span>}</div>
        <div ref={statsRef} className={'es-stats' + (revealed ? ' is-revealed' : '')} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
          {skills.map((sk, i) => <StatBar key={sk.lang} label={sk.lang} value={sk.value} tone={sk.tone} valueText={`${sk.n} ${sk.n === 1 ? 'repo' : 'repos'}`} delay={i * 90} />)}
          {!repos && !error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>Buscando linguagens no GitHub…</p>}
          {error && <RepoError error={error} onRetry={retry} />}
        </div>
      </Card>
    </div>
  </section>
}

// Screenshot of the project, or a dark title card when there is none / it fails to load.
function QuestShot({ q }) {
  const [failed, setFailed] = useState(false)
  if (q.image && !failed) return <img src={q.image} alt={`Captura de tela de ${q.title}`} loading="lazy" onError={() => setFailed(true)} />
  return <div className="es-quest-card" aria-hidden>
    <span className="es-kicker">{q.language || 'Projeto'}</span>
    <span className="es-break" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--fg-1)' }}>{q.title}</span>
  </div>
}

function Quests() {
  const { repos, error, retry } = useRepos()
  const quests = repos && toQuests(repos)
  const [tab, setTab] = useState('all')
  const pick = c => (quests || []).filter(q => c === 'all' || q.cat === c)
  const list = pick(tab)
  return <section id="quests" className="es-section es-section--lead" style={{ background: 'var(--bg-pixel-grid)' }}>
    <div className="es-container" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <SectionTitle index="02" kicker="Quests" jp="クエスト" title="Projetos selecionados" />
        {quests?.length > 0 && <Tabs value={tab} onChange={setTab} items={[['all', 'Todos'], ['web', 'Web'], ['games', 'Games'], ['design', 'Design']].map(([value, label]) => ({ value, label, count: pick(value).length })).filter(t => t.value === 'all' || t.count)} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 24 }}>
        {list.map((q, i) => <article key={q.id} style={{ animation: `es-pop-in 400ms var(--ease-out) ${i * 60}ms both` }}>
          <Card style={{ height: '100%' }} mediaSlot={<QuestShot q={q} />}>
            <div style={{ display: 'flex', gap: 8 }}><Badge tone={q.tone}>{q.status}</Badge><Badge tone="outline">{q.cat}</Badge></div>
            <h3 className="es-break" style={{ fontSize: 22 }}>{q.title}</h3>
            <p className="es-clamp-3" style={{ fontSize: 15 }}>{q.desc}</p>
            {q.stack.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{q.stack.map(s => <Tag key={s}>{s}</Tag>)}</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8 }}>
              {q.url !== q.repo && <Button size="sm" iconRight="external-link" href={q.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${q.title} (nova aba)`}>Abrir projeto</Button>}
              <Button size="sm" variant="ghost" icon="code" href={q.repo} target="_blank" rel="noreferrer" aria-label={`Código de ${q.title} no GitHub (nova aba)`}>Código</Button>
            </div>
          </Card>
        </article>)}
      </div>
      {error ? <RepoError error={error} onRetry={retry} />
        : (!quests || !quests.length) && <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>{quests ? 'Nenhum projeto por aqui ainda. Veja tudo no GitHub:' : 'Buscando projetos no GitHub…'}</p>}
      <div style={{ display: 'flex', justifyContent: 'center' }}><Button variant="ghost" iconRight="external-link" href={GITHUB_URL} target="_blank" rel="noreferrer">Ver tudo no GitHub</Button></div>
    </div>
  </section>
}

const FORMSPREE = 'https://formspree.io/f/myekapka'
const EMAIL = 'eduardomssousa@hotmail.com'
const SUBJECTS = ['Projeto freelance', 'Vaga full-time', 'Só dizer oi']
const EMPTY = { name: '', email: '', subject: SUBJECTS[0], msg: '' }
const SEND_ERRORS = {
  error: 'Não consegui enviar agora.',
  timeout: 'O envio demorou demais e foi cancelado.',
  offline: 'Parece que você está sem internet.',
  rate: 'Muitas mensagens em pouco tempo. Espere alguns minutos e tente de novo.',
}
function Contact({ onSent }) {
  const [f, setF] = useState(EMPTY), [err, setErr] = useState({}), [status, setStatus] = useState('idle')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = async e => {
    e.preventDefault()
    const form = e.currentTarget
    if (status === 'sending') return
    const er = {}
    if (!f.name.trim()) er.name = 'Diga seu nome, viajante'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = 'Esse email não parece válido. Confira se tem @ e domínio, ex.: voce@email.com'
    if (!f.msg.trim()) er.msg = 'Escreva uma mensagem'
    setErr(er)
    const first = Object.keys(er)[0]
    if (first) { form.elements[first].focus(); return }
    setStatus('sending')
    try {
      const r = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), _subject: `[Portfolio] ${f.subject}`, assunto: f.subject, message: f.msg.trim(), _gotcha: form.elements._gotcha.value }),
        signal: AbortSignal.timeout(15000),
      })
      if (!r.ok) throw new Error(r.status === 429 ? 'rate' : 'http')
      setStatus('idle'); setF(EMPTY); onSent()
    } catch (x) {
      // keep what they typed so they can retry
      setStatus(x.message === 'rate' ? 'rate' : !navigator.onLine ? 'offline' : x.name === 'TimeoutError' ? 'timeout' : 'error')
    }
  }
  return <section id="contact" className="es-section">
    <div className="es-container" style={{ maxWidth: 'var(--container-narrow)', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SectionTitle align="center" index="03" kicker="Contato" jp="コンタクト" title="Pronto para a próxima quest?" description="Freelance, vaga ou só pra conversar sobre o último anime da temporada. Respondo em até 24h." />
      <Card><form noValidate onSubmit={submit} className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />
        <Input label="Nome" name="name" maxLength={100} prefix="›" placeholder="Player 2" autoComplete="name" value={f.name} error={err.name} onChange={set('name')} />
        <Input label="Email" name="email" maxLength={254} type="email" placeholder="voce@email.com" autoComplete="email" value={f.email} error={err.email} onChange={set('email')} />
        <div style={{ gridColumn: '1/-1' }}><Select label="Assunto" name="subject" options={SUBJECTS} value={f.subject} onChange={set('subject')} /></div>
        <div style={{ gridColumn: '1/-1' }}><Textarea label="Mensagem" name="msg" maxLength={5000} placeholder="Conte sobre sua quest…" value={f.msg} error={err.msg} onChange={set('msg')} /></div>
        {SEND_ERRORS[status] && <p role="alert" className="es-help es-help--error" style={{ gridColumn: '1/-1', fontSize: 14 }}>{SEND_ERRORS[status]} Sua mensagem continua aqui; se preferir, escreva direto para <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
        <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>Currículo: <a href={CV_PT} download>Português</a> · <a href={CV_EN} download>English</a></span>
          <Button type="submit" icon="mail" aria-disabled={status === 'sending' || undefined}>{status === 'sending' ? 'Enviando…' : 'Enviar mensagem'}</Button>
        </div>
      </form></Card>
    </div>
  </section>
}

function Footer() {
  return <footer className="es-section" style={{ padding: '28px 24px' }}>
    <div className="es-container" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
      <span>© 2026 Eduardo Sousa</span><span>Feito com <span style={{ color: 'var(--fg-accent-2)' }}>♥</span> e muito café · <span style={{ color: 'var(--fg-accent)' }}>GAME SAVED</span></span>
    </div>
  </footer>
}

export default function App() {
  const [started, setStarted] = useState(() => sessionStorage.getItem('es-started') === '1')
  const [theme, setTheme] = useState('dark')
  const [toasts, setToasts] = useState([])
  const [active, setActive] = useState('')
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme }, [theme])
  const go = id => {
    document.getElementById(id)?.scrollIntoView()
    setActive(id)
  }
  // The hero starts entering on PRESS START, while the CRT switches off over it.
  const [entered, setEntered] = useState(started)
  const enter = useCallback(() => setEntered(true), [])
  const start = useCallback(() => { sessionStorage.setItem('es-started', '1'); setStarted(true) }, [])
  const dropToast = useCallback(id => setToasts(x => x.filter(y => y !== id)), [])
  return <>
    {!started && <StartScreen onPress={enter} onStart={start} />}
    <NavBar links={[{ label: 'Sobre', href: 'about' }, { label: 'Quests', href: 'quests' }, { label: 'Contato', href: 'contact' }]} active={active} onNavigate={go}
      actions={<><IconButton variant="ghost" size="sm" icon={theme === 'dark' ? 'sun' : 'moon'} label="Alternar tema" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} /><Button size="sm" onClick={() => go('contact')}>Contratar</Button></>} />
    <main><Hero onNav={go} entered={entered} /><About /><Quests /><Contact onSent={() => setToasts(t => [...t, Date.now()])} /></main>
    <Footer />
    <div className="es-toast-stack">{toasts.map(id => <ToastItem key={id} id={id} onDone={dropToast} />)}</div>
  </>
}

function ToastItem({ id, onDone }) {
  const close = useCallback(() => onDone(id), [id, onDone])
  return <Toast title="Mensagem enviada" description="+50 XP · respondo em até 24h" onClose={close} />
}
