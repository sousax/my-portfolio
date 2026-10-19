import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Card, Checkbox, Dialog, IconButton, Input, NavBar, SectionTitle, Select, StatBar, Tabs, Tag, Textarea, Toast, Tooltip } from './ds.jsx'
import './components.css'

const GITHUB_USER = 'sousax'
const GITHUB_URL = `https://github.com/${GITHUB_USER}`
const CATS = ['games', 'design']
// Drop your photo at src/assets/avatar.(jpg|png|webp); resolved at build time, else the GitHub avatar.
const AVATAR = Object.values(import.meta.glob('./assets/avatar.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }))[0]
  ?? `https://avatars.githubusercontent.com/${GITHUB_USER}?s=600`
// ponytail: unauthenticated GitHub API (60 req/h per visitor IP) — cache in localStorage or prebuild to JSON if it ever rate-limits.
// One shared request for About (stats) and Quests.
let reposPromise
const fetchRepos = () => reposPromise ??= fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)
  .then(r => { if (!r.ok) throw r; return r.json() })
  .then(repos => repos.filter(r => !r.fork && r.name !== GITHUB_USER))
function useRepos() {
  const [state, setState] = useState({ repos: null, error: false })
  useEffect(() => { fetchRepos().then(repos => setState({ repos, error: false }), () => setState({ repos: [], error: true })) }, [])
  return state
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
    image: `https://opengraph.githubassets.com/1/${GITHUB_USER}/${r.name}`,
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
// Add ['download', 'Currículo', '/curriculo.pdf'] once the PDF is in public/.
const SOCIALS = [['github', 'GitHub', GITHUB_URL], ['mail', 'Email', 'mailto:eduardomssousa@hotmail.com'], ['briefcase', 'LinkedIn', 'https://www.linkedin.com/in/edusousax/']]
const ROLES = ['Desenvolvedor full-stack', 'Java, C# e JavaScript', 'Front-end em evolução']

function Typer({ words, speed = 70, hold = 1400 }) {
  const [i, setI] = useState(0), [n, setN] = useState(0), [del, setDel] = useState(false)
  useEffect(() => {
    const w = words[i]
    const t = !del && n < w.length ? setTimeout(() => setN(n + 1), speed)
      : !del ? setTimeout(() => setDel(true), hold)
      : n > 0 ? setTimeout(() => setN(n - 1), speed / 2)
      : setTimeout(() => { setDel(false); setI((i + 1) % words.length) }, 0)
    return () => clearTimeout(t)
  }, [n, del, i, words, speed, hold])
  return <span className="es-cursor">{words[i].slice(0, n)}</span>
}

function StartScreen({ onStart }) {
  useEffect(() => {
    const k = e => (e.key === 'Enter' || e.key === ' ') && onStart()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onStart])
  return <div onClick={onStart} className="es-scanlines" style={{ position: 'fixed', inset: 0, zIndex: 200, cursor: 'pointer', display: 'grid', placeItems: 'center', background: 'var(--bg-aura),var(--bg-pixel-grid),var(--ink-950)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center', padding: 24 }}>
      <span className="es-jp" style={{ fontSize: 14 }}>エドゥアルド・ソウザ</span>
      <h1 style={{ fontSize: 'clamp(48px,9vw,104px)', lineHeight: .9, letterSpacing: '-.02em', color: 'var(--fg-1)' }}>Eduardo<br /><span style={{ color: 'var(--fg-accent)' }}>Sousa</span></h1>
      <span className="es-kicker">Portfolio · Ver. 2026</span>
      <div style={{ marginTop: 28, fontFamily: 'var(--font-pixel)', fontSize: 18, letterSpacing: '.12em', color: 'var(--gold-500)', animation: 'es-blink 1.1s steps(1) infinite' }}>▸ PRESS START</div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>clique ou aperte Enter</span>
    </div>
  </div>
}

function Hero({ onNav }) {
  const { repos } = useRepos()
  const years = repos?.length ? yearsSince(repos) : null
  return <section id="top" className="es-bg-grid" style={{ padding: '72px 24px 96px' }}>
    <div className="es-container hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 56, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'es-pop-in 600ms var(--ease-out) both' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Badge tone="hp" live>Disponível para projetos</Badge><span className="es-jp" style={{ fontSize: 12 }}>プレイヤー 01</span></div>
        <h1 style={{ fontSize: 'clamp(52px,7vw,88px)', lineHeight: .92, letterSpacing: '-.02em' }}>Eduardo<br /><span style={{ color: 'var(--fg-accent)' }}>Sousa</span></h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--fg-1)', minHeight: 28 }}><span className="sr-only">{ROLES.join(', ')}</span><span aria-hidden><span style={{ color: 'var(--fg-accent-2)' }}>&gt; </span><Typer words={ROLES} /></span></div>
        <div style={{ maxWidth: 540, marginTop: 12 }}><Dialog inline speaker="Eduardo" showNext>Olá! Sou desenvolvedor full-stack: já trabalho na área e sigo na faculdade. Escolha uma quest abaixo para ver o que já construí.</Dialog></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}><Button size="lg" icon="play" onClick={() => onNav('quests')}>Ver quests</Button><Button size="lg" variant="secondary" onClick={() => onNav('contact')}>Fale comigo</Button></div>
        <div style={{ display: 'flex', gap: 8 }}>{SOCIALS.map(([i, l, href]) => <Tooltip key={i} content={l}><IconButton icon={i} label={l} href={href} {...(href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })} /></Tooltip>)}</div>
      </div>
      <div style={{ position: 'relative', justifySelf: 'center', width: '100%', maxWidth: 400 }}>
        <div style={{ animation: 'es-float 4s var(--ease-snap) infinite' }}>
          <div className="es-card es-card--brackets" style={{ aspectRatio: '4/5', background: 'var(--bg-pixel-grid),var(--surface-sunken)', overflow: 'hidden' }}>
            <img src={AVATAR} alt="Foto de Eduardo Sousa" fetchPriority="high" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: -28, bottom: 48, padding: '10px 14px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-pixel-violet)', display: 'flex', flexDirection: 'column', gap: 2 }}><span className="es-kicker" style={{ color: 'var(--fg-gold)' }}>Class</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--fg-1)' }}>Full-stack</span>{years && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{years} {years === 1 ? 'ano' : 'anos'} no GitHub · {repos.length} repos</span>}</div>
        {years && <div title={`LV = anos desde o primeiro repositório (${years})`} style={{ position: 'absolute', right: -18, top: 36, padding: '8px 12px', background: 'var(--violet-500)', color: '#fff', fontFamily: 'var(--font-pixel)', fontSize: 13, letterSpacing: '.1em', boxShadow: 'var(--shadow-pixel)' }}>LV {years}</div>}
      </div>
    </div>
  </section>
}

function About() {
  const { repos, error } = useRepos()
  const skills = repos ? toSkills(repos) : []
  return <section id="about" className="es-section">
    <div className="es-container two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 56 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SectionTitle index="01" kicker="Sobre" jp="プロフィール" title="Perfil do jogador" />
        <p style={{ fontSize: 18, lineHeight: 1.7 }}>Sou desenvolvedor full-stack: já trabalho na área e continuo na faculdade. Gosto de construir o sistema inteiro, do banco de dados à interface.</p>
        <p>Entre trabalhos da faculdade e projetos próprios já usei Java, C#, C++, Python e JavaScript, de sistemas MVC a uma IA para conferência logística.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{['Java', 'C#', 'JavaScript', 'TypeScript', 'Python', 'React', 'AdonisJS', 'Tailwind', 'HTML & CSS'].map(t => <Tag key={t}>{t}</Tag>)}</div>
      </div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span className="es-kicker">Stats · linguagens no GitHub</span>{repos && <span className="es-kicker" style={{ color: 'var(--fg-gold)' }}>{repos.length} repos</span>}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
          {skills.map((sk, i) => <StatBar key={sk.lang} label={sk.lang} value={sk.value} tone={sk.tone} valueText={`${sk.n} ${sk.n === 1 ? 'repo' : 'repos'}`} delay={i * 90} />)}
          {!repos && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>Buscando linguagens no GitHub…</p>}
          {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>Não consegui falar com o GitHub agora. Recarregue a página em instantes.</p>}
        </div>
      </Card>
    </div>
  </section>
}

function Quests({ onOpen }) {
  const { repos, error } = useRepos()
  const quests = repos && toQuests(repos)
  const [tab, setTab] = useState('all')
  const pick = c => (quests || []).filter(q => c === 'all' || q.cat === c)
  const list = pick(tab)
  return <section id="quests" className="es-section" style={{ background: 'var(--bg-pixel-grid)' }}>
    <div className="es-container" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <SectionTitle index="02" kicker="Quests" jp="クエスト" title="Projetos selecionados" />
        <Tabs value={tab} onChange={setTab} items={[['all', 'Todos'], ['web', 'Web'], ['games', 'Games'], ['design', 'Design']].map(([value, label]) => ({ value, label, count: pick(value).length }))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
        {list.map((q, i) => <div key={q.id} style={{ animation: `es-pop-in 400ms var(--ease-out) ${i * 60}ms both` }}>
          <Card onClick={() => onOpen(q)} style={{ height: '100%' }} mediaSlot={<img src={q.image} alt="" loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden' }} />}>
            <div style={{ display: 'flex', gap: 8 }}><Badge tone={q.tone}>{q.status}</Badge><Badge tone="outline">{q.cat}</Badge></div>
            <h3 style={{ fontSize: 20 }}>{q.title}</h3><p style={{ fontSize: 14 }}>{q.desc}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>{q.stack.map(s => <Tag key={s}>{s}</Tag>)}</div>
          </Card>
        </div>)}
      </div>
      {(!quests || error || !quests.length) && <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>{error ? 'Não consegui carregar os projetos agora. Eles estão todos no GitHub:' : quests ? 'Nenhum projeto por aqui ainda. Veja tudo no GitHub:' : 'Buscando projetos no GitHub…'}</p>}
      <div style={{ display: 'flex', justifyContent: 'center' }}><Button variant="ghost" iconRight="external-link" href={GITHUB_URL} target="_blank" rel="noreferrer">Ver tudo no GitHub</Button></div>
    </div>
  </section>
}

const EMPTY = { name: '', email: '', msg: '' }
function Contact({ onSent }) {
  const [f, setF] = useState(EMPTY), [err, setErr] = useState({})
  const set = k => e => setF({ ...f, [k]: e.target.value })
  // ponytail: no backend yet — form only validates and shows the toast. Wire to Formspree/EmailJS/API to actually send.
  const submit = e => {
    e.preventDefault()
    const er = {}
    if (!f.name.trim()) er.name = 'Diga seu nome, viajante'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Esse email não parece válido'
    if (!f.msg.trim()) er.msg = 'Escreva uma mensagem'
    setErr(er)
    if (!Object.keys(er).length) { onSent(); setF(EMPTY) }
  }
  return <section id="contact" className="es-section" style={{ paddingBottom: 120 }}>
    <div className="es-container" style={{ maxWidth: 'var(--container-narrow)', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SectionTitle align="center" index="03" kicker="Contato" jp="コンタクト" title="Pronto para a próxima quest?" description="Freelance, vaga ou só pra conversar sobre o último anime da temporada. Respondo em até 24h." />
      <Card><form noValidate onSubmit={submit} className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Input label="Nome" prefix="›" placeholder="Player 2" value={f.name} error={err.name} onChange={set('name')} />
        <Input label="Email" type="email" placeholder="voce@email.com" value={f.email} error={err.email} onChange={set('email')} />
        <div style={{ gridColumn: '1/-1' }}><Select label="Assunto" options={['Projeto freelance', 'Vaga full-time', 'Só dizer oi']} /></div>
        <div style={{ gridColumn: '1/-1' }}><Textarea label="Mensagem" placeholder="Conte sobre sua quest…" value={f.msg} error={err.msg} onChange={set('msg')} /></div>
        <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}><Checkbox label="Receber uma cópia" defaultChecked /><Button type="submit" icon="mail">Enviar mensagem</Button></div>
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
  const [quest, setQuest] = useState(null)
  const [toasts, setToasts] = useState([])
  const [active, setActive] = useState('')
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme }, [theme])
  const go = id => {
    document.getElementById(id)?.scrollIntoView()
    setActive(id)
  }
  const start = useCallback(() => { sessionStorage.setItem('es-started', '1'); setStarted(true) }, [])
  const closeQuest = useCallback(() => setQuest(null), [])
  const dropToast = useCallback(id => setToasts(x => x.filter(y => y !== id)), [])
  return <>
    {!started && <StartScreen onStart={start} />}
    <NavBar links={[{ label: 'Sobre', href: 'about' }, { label: 'Quests', href: 'quests' }, { label: 'Contato', href: 'contact' }]} active={active} onNavigate={go}
      actions={<><IconButton variant="ghost" size="sm" icon={theme === 'dark' ? 'sun' : 'moon'} label="Alternar tema" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} /><Button size="sm" onClick={() => go('contact')}>Contratar</Button></>} />
    <main><Hero onNav={go} /><About /><Quests onOpen={setQuest} /><Contact onSent={() => setToasts(t => [...t, Date.now()])} /></main>
    <Footer />
    <Dialog open={!!quest} speaker={quest && `Quest ${String(quest.id).padStart(2, '0')}`} title={quest?.title} onClose={closeQuest}
      footer={<><Button size="sm" variant="ghost" href={quest?.repo} target="_blank" rel="noreferrer">Código</Button><Button size="sm" iconRight="external-link" href={quest?.url} target="_blank" rel="noreferrer">Abrir projeto</Button></>}>
      {quest && <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><p>{quest.desc}</p><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{quest.stack.map(s => <Tag key={s}>{s}</Tag>)}</div></div>}
    </Dialog>
    <div className="es-toast-stack">{toasts.map(id => <ToastItem key={id} id={id} onDone={dropToast} />)}</div>
  </>
}

function ToastItem({ id, onDone }) {
  const close = useCallback(() => onDone(id), [id, onDone])
  return <Toast title="Mensagem enviada" description="+50 XP · respondo em até 24h" onClose={close} />
}
