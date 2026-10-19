import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Card, Checkbox, Dialog, IconButton, Input, NavBar, SectionTitle, Select, StatBar, Tabs, Tag, Textarea, Toast, Tooltip } from './ds.jsx'
import './components.css'

// ponytail: placeholder content from the design kit — replace with real projects/bio/links.
const QUESTS = [
  { id: 1, title: 'Projeto Um', cat: 'web', status: 'Lançado', tone: 'hp', desc: 'Descrição curta do projeto em uma linha.', long: 'Espaço para contar o problema, o que você construiu e o resultado. Substitua por um projeto real.', stack: ['React', 'TypeScript', 'Vite'] },
  { id: 2, title: 'Projeto Dois', cat: 'games', status: 'In dev', tone: 'gold', live: true, desc: 'Protótipo de jogo 2D feito em Godot.', long: 'Mecânicas, aprendizados e um link para jogar. Substitua por um projeto real.', stack: ['Godot', 'GDScript'] },
  { id: 3, title: 'Projeto Três', cat: 'web', status: 'Lançado', tone: 'hp', desc: 'Dashboard com animações e tema escuro.', long: 'Detalhes técnicos, papel no time e métricas. Substitua por um projeto real.', stack: ['Next.js', 'Framer Motion'] },
  { id: 4, title: 'Projeto Quatro', cat: 'design', status: 'Case', tone: 'mana', desc: 'Design system e protótipo navegável.', long: 'Processo de design, pesquisa e entregáveis. Substitua por um projeto real.', stack: ['Figma', 'Tokens'] },
]
const SKILLS = [['React / Next.js', 86, 'mp'], ['TypeScript', 80, 'mp'], ['CSS & Motion', 90, 'sp'], ['UI Design (Figma)', 72, 'violet'], ['Node.js', 64, 'hp'], ['Godot / Game dev', 48, 'xp']]
const SOCIALS = [['github', 'GitHub', 'https://github.com/'], ['mail', 'Email', 'mailto:'], ['briefcase', 'LinkedIn', 'https://linkedin.com/'], ['download', 'Currículo', '#']]
const ROLES = ['Front-end Developer', 'UI Engineer', 'Game Dev nas horas vagas']

function useTyper(words, speed = 70, hold = 1400) {
  const [i, setI] = useState(0), [n, setN] = useState(0), [del, setDel] = useState(false)
  useEffect(() => {
    const w = words[i]
    const t = !del && n < w.length ? setTimeout(() => setN(n + 1), speed)
      : !del ? setTimeout(() => setDel(true), hold)
      : n > 0 ? setTimeout(() => setN(n - 1), speed / 2)
      : setTimeout(() => { setDel(false); setI((i + 1) % words.length) }, 0)
    return () => clearTimeout(t)
  }, [n, del, i, words, speed, hold])
  return words[i].slice(0, n)
}

function StartScreen({ onStart }) {
  useEffect(() => {
    const k = e => (e.key === 'Enter' || e.key === ' ') && onStart()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onStart])
  return <div onClick={onStart} className="es-scanlines" style={{ position: 'fixed', inset: 0, zIndex: 200, cursor: 'pointer', display: 'grid', placeItems: 'center', background: 'var(--bg-aura),var(--bg-pixel-grid),var(--ink-950)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center', padding: 24 }}>
      <span className="es-jp" style={{ color: 'var(--sakura-500)', fontSize: 14 }}>エドゥアルド・ソウザ</span>
      <h1 style={{ fontSize: 'clamp(48px,9vw,104px)', lineHeight: .9, letterSpacing: '-.02em', color: 'var(--fg-1)' }}>Eduardo<br /><span style={{ color: 'var(--violet-300)' }}>Sousa</span></h1>
      <span className="es-kicker">Portfolio · Ver. 2026</span>
      <div style={{ marginTop: 28, fontFamily: 'var(--font-pixel)', fontSize: 18, letterSpacing: '.12em', color: 'var(--gold-500)', animation: 'es-blink 1.1s steps(1) infinite' }}>▸ PRESS START</div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>click ou Enter</span>
    </div>
  </div>
}

function Hero({ onNav }) {
  const role = useTyper(ROLES)
  return <section id="top" style={{ position: 'relative', padding: '72px 24px 96px', background: 'var(--bg-aura),var(--bg-pixel-grid)' }}>
    <div className="hero-grid" style={{ maxWidth: 'var(--container)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 56, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'es-pop-in 600ms var(--ease-out) both' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Badge tone="hp" live>Disponível para projetos</Badge><span className="es-jp" style={{ fontSize: 12, color: 'var(--sakura-500)' }}>プレイヤー 01</span></div>
        <h1 style={{ fontSize: 'clamp(52px,7vw,88px)', lineHeight: .92, letterSpacing: '-.02em' }}>Eduardo<br /><span style={{ color: 'var(--violet-300)' }}>Sousa</span></h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--fg-1)', minHeight: 28 }}><span style={{ color: 'var(--sakura-500)' }}>&gt; </span><span className="es-cursor">{role}</span></div>
        <div style={{ maxWidth: 540, marginTop: 12 }}><Dialog inline speaker="Eduardo" showNext>Olá! Eu crio interfaces rápidas e animadas, com um pé no mundo dos games e dos animes. Escolha uma quest abaixo para ver o que ando construindo.</Dialog></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}><Button size="lg" icon="play" onClick={() => onNav('quests')}>Ver quests</Button><Button size="lg" variant="secondary" onClick={() => onNav('contact')}>Fale comigo</Button></div>
        <div style={{ display: 'flex', gap: 8 }}>{SOCIALS.map(([i, l, href]) => <Tooltip key={i} content={l}><IconButton icon={i} label={l} href={href} target="_blank" rel="noreferrer" /></Tooltip>)}</div>
      </div>
      <div style={{ position: 'relative', justifySelf: 'center', width: '100%', maxWidth: 400 }}>
        <div style={{ animation: 'es-float 4s var(--ease-snap) infinite' }}>
          <div className="es-card es-card--brackets" style={{ aspectRatio: '4/5', background: 'var(--bg-pixel-grid),var(--ink-950)', display: 'grid', placeItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textAlign: 'center' }}>foto / avatar<br />do Eduardo</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: -28, bottom: 48, padding: '10px 14px', background: 'var(--ink-850)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-pixel-violet)', display: 'flex', flexDirection: 'column', gap: 2 }}><span className="es-kicker" style={{ color: 'var(--gold-500)' }}>Class</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--fg-1)' }}>Front-end Mage</span></div>
        <div style={{ position: 'absolute', right: -18, top: 36, padding: '8px 12px', background: 'var(--violet-500)', color: '#fff', fontFamily: 'var(--font-pixel)', fontSize: 13, letterSpacing: '.1em', boxShadow: 'var(--shadow-pixel)' }}>LV 24</div>
      </div>
    </div>
  </section>
}

function About() {
  return <section id="about" style={{ padding: '96px 24px', borderTop: '1px solid var(--border-subtle)' }}>
    <div className="two-col" style={{ maxWidth: 'var(--container)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 56 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SectionTitle index="01" kicker="Sobre" jp="プロフィール" title="Player profile" />
        <p style={{ fontSize: 18, lineHeight: 1.7 }}>Sou desenvolvedor front-end e gosto de construir produtos que parecem vivos: transições bem cuidadas, feedback claro e um pouco de personalidade. Cresci entre RPGs, shōnen e fliperama, e isso aparece no que eu desenho.</p>
        <p>Hoje trabalho com React e TypeScript, e no tempo livre faço protótipos de jogos.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{['React', 'Next.js', 'TypeScript', 'Tailwind', 'Framer Motion', 'Node', 'Figma', 'Godot'].map(t => <Tag key={t}>{t}</Tag>)}</div>
      </div>
      <Card id="skills">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span className="es-kicker">Stats</span><span style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--gold-500)' }}>XP 6.400 / 10.000</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>{SKILLS.map(([l, v, t], i) => <StatBar key={l} label={l} value={v} tone={t} valueText={'LV ' + Math.round(v / 10)} delay={i * 90} />)}</div>
      </Card>
    </div>
  </section>
}

function Quests({ onOpen }) {
  const [tab, setTab] = useState('all')
  const count = c => QUESTS.filter(q => c === 'all' || q.cat === c).length
  const list = QUESTS.filter(q => tab === 'all' || q.cat === tab)
  return <section id="quests" style={{ padding: '96px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-pixel-grid)' }}>
    <div style={{ maxWidth: 'var(--container)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <SectionTitle index="02" kicker="Quests" jp="クエスト" title="Projetos selecionados" />
        <Tabs value={tab} onChange={setTab} items={[['all', 'Todos'], ['web', 'Web'], ['games', 'Games'], ['design', 'Design']].map(([value, label]) => ({ value, label, count: count(value) }))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
        {list.map((q, i) => <div key={q.id} style={{ animation: `es-pop-in 400ms var(--ease-out) ${i * 60}ms both` }}>
          <Card onClick={() => onOpen(q)} style={{ height: '100%' }} mediaSlot={<div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'var(--bg-scanlines),var(--ink-950)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>screenshot</div>}>
            <div style={{ display: 'flex', gap: 8 }}><Badge tone={q.tone} live={q.live}>{q.status}</Badge><Badge tone="outline">{q.cat}</Badge></div>
            <h3 style={{ fontSize: 20 }}>{q.title}</h3><p style={{ fontSize: 14 }}>{q.desc}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>{q.stack.map(s => <Tag key={s}>{s}</Tag>)}</div>
          </Card>
        </div>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}><Button variant="ghost" iconRight="external-link" href="https://github.com/" target="_blank" rel="noreferrer">Ver tudo no GitHub</Button></div>
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
  return <section id="contact" style={{ padding: '96px 24px 120px', borderTop: '1px solid var(--border-subtle)' }}>
    <div style={{ maxWidth: 'var(--container-narrow)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
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
  return <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '28px 24px' }}>
    <div style={{ maxWidth: 'var(--container)', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
      <span>© 2026 Eduardo Sousa</span><span>Feito com <span style={{ color: 'var(--sakura-500)' }}>♥</span> e muito café · <span style={{ color: 'var(--violet-300)' }}>GAME SAVED</span></span>
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
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' })
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
    <Dialog open={!!quest} speaker={quest && 'Quest #0' + quest.id} title={quest?.title} onClose={closeQuest}
      footer={<><Button size="sm" variant="ghost" onClick={closeQuest}>Voltar</Button><Button size="sm" iconRight="external-link">Abrir projeto</Button></>}>
      {quest && <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><p>{quest.long}</p><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{quest.stack.map(s => <Tag key={s}>{s}</Tag>)}</div></div>}
    </Dialog>
    <div className="es-toast-stack">{toasts.map(id => <ToastItem key={id} id={id} onDone={dropToast} />)}</div>
  </>
}

function ToastItem({ id, onDone }) {
  const close = useCallback(() => onDone(id), [id, onDone])
  return <Toast title="Mensagem enviada" description="+50 XP · respondo em até 24h" onClose={close} />
}
