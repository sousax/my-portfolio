// Design-system primitives (Eduardo Sousa DS, claude.ai/design). Styles in components.css.
import { useEffect, useId, useRef } from 'react'

const cx = (...a) => a.filter(Boolean).join(' ')
const ICON_BASE = 'https://unpkg.com/pixelarticons@1.8.1/svg/'

export function Icon({ name, size = 20 }) {
  return <span aria-hidden className="es-icon" style={{ width: size, height: size, '--es-icon': `url(${ICON_BASE}${name}.svg)` }} />
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, href, children, className, ...rest }) {
  const cls = cx('es-btn', 'es-btn--' + variant, 'es-btn--' + size, className)
  const s = size === 'sm' ? 16 : size === 'lg' ? 24 : 18
  const inner = <>{icon && <Icon name={icon} size={s} />}<span>{children}</span>{iconRight && <Icon name={iconRight} size={s} />}</>
  if (href) return <a className={cls} href={href} {...rest}>{inner}</a>
  return <button className={cls} {...rest}>{inner}</button>
}

export function IconButton({ icon, label, variant, size = 'md', href, className, ...rest }) {
  const cls = cx('es-iconbtn', 'es-iconbtn--' + size, variant && 'es-iconbtn--' + variant, className)
  const ic = <Icon name={icon} size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
  if (href) return <a aria-label={label} className={cls} href={href} {...rest}>{ic}</a>
  return <button aria-label={label} className={cls} {...rest}>{ic}</button>
}

export function Badge({ tone = 'violet', live, children }) {
  return <span className={'es-badge es-badge--' + tone}>{live && <span className="es-badge__dot" />}{children}</span>
}

export function Tag({ children }) {
  return <span className="es-tag">{children}</span>
}

export function Card({ mediaSlot, children, style, onClick }) {
  const cls = cx('es-card', 'es-card--brackets', onClick && 'es-card--interactive')
  const keys = onClick && { role: 'button', tabIndex: 0, onKeyDown: e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) }
  return <div className={cls} style={style} onClick={onClick} {...keys}>
    {mediaSlot && <div className="es-card__media">{mediaSlot}</div>}
    <div className="es-card__body">{children}</div>
  </div>
}

const TONES = { violet: 'var(--stat-violet)', hp: 'var(--stat-hp)', mp: 'var(--stat-mp)', xp: 'var(--stat-xp)', sp: 'var(--stat-sp)' }
export function StatBar({ label, value, tone = 'violet', valueText, delay = 0 }) {
  const c = TONES[tone]
  return <div className="es-stat">
    <div className="es-stat__row"><span className="es-stat__label">{label}</span><span className="es-stat__value">{valueText}</span></div>
    <div className="es-stat__track" role="progressbar" aria-valuenow={value} aria-valuemax={100} aria-valuetext={valueText} aria-label={label}>
      <div className="es-stat__fill" style={{ width: `calc(${value}% - 4px)`, background: c, boxShadow: `0 0 10px ${c}`, animationDelay: delay + 'ms' }} />
    </div>
  </div>
}

export function SectionTitle({ index, kicker, jp, title, description, align }) {
  return <div className={cx('es-section-title', align === 'center' && 'es-section-title--center')}>
    <div className="es-section-title__kicker"><span>{index}</span><span>/</span><span>{kicker}</span></div>
    {jp && <div className="es-section-title__jp">{jp}</div>}
    <h2 className="es-section-title__title">{title}</h2>
    {description && <p className="es-section-title__desc">{description}</p>}
  </div>
}

function Field({ label, error, children }) {
  const id = useId(), errId = id + '-err'
  return <div className="es-field">
    <label className="es-label" htmlFor={id}>{label}</label>
    <div className={cx('es-control', error && 'es-control--error')}>{children(id, error ? errId : undefined)}</div>
    {error && <span id={errId} className="es-help es-help--error">{error}</span>}
  </div>
}
export function Input({ label, error, prefix, ...rest }) {
  return <Field label={label} error={error}>{(id, errId) => <>
    {prefix && <span aria-hidden className="es-control__prefix">{prefix}</span>}<input id={id} className="es-input" aria-invalid={!!error} aria-describedby={errId} {...rest} />
  </>}</Field>
}
export function Textarea({ label, error, ...rest }) {
  return <Field label={label} error={error}>{(id, errId) => <textarea id={id} rows={5} className="es-input es-textarea" aria-invalid={!!error} aria-describedby={errId} {...rest} />}</Field>
}
export function Select({ label, options, ...rest }) {
  return <Field label={label}>{id => <>
    <select id={id} className="es-input es-select" {...rest}>{options.map(o => <option key={o}>{o}</option>)}</select>
    <span className="es-control__chev"><Icon name="chevron-down" size={18} /></span>
  </>}</Field>
}
export function Checkbox({ label, ...rest }) {
  return <label className="es-check"><input type="checkbox" {...rest} /><span className="es-check__box"><Icon name="check" size={16} /></span><span>{label}</span></label>
}

export function Tabs({ items, value, onChange }) {
  return <div role="tablist" className="es-tabs">{items.map(it =>
    <button key={it.value} role="tab" aria-selected={value === it.value} className="es-tab" onClick={() => onChange(it.value)}>
      {it.label}<span className="es-tab__count">{it.count}</span>
    </button>)}</div>
}

export function NavBar({ links, active, actions, onNavigate }) {
  const go = v => e => { e.preventDefault(); onNavigate(v) }
  const items = cls => links.map((l, i) =>
    <a key={l.href} href={'#' + l.href} aria-current={active === l.href ? 'location' : undefined} className={cx(cls, active === l.href && cls + '--active')} onClick={go(l.href)}>
      <span className="es-nav__num">{String(i + 1).padStart(2, '0')}.</span>{l.label}
    </a>)
  return <>
    <nav className="es-nav" aria-label="Principal"><div className="es-nav__inner">
      <a className="es-nav__brand es-cursor" href="#top" onClick={go('top')}>Eduardo<b>.sousa</b></a>
      <div className="es-nav__links">{items('es-nav__link')}</div>
      <div className="es-nav__actions">{actions}</div>
    </div></nav>
    {/* Phones: same links as a thumb-reach bar at the bottom (outside .es-nav, whose backdrop-filter would trap position:fixed). */}
    <nav className="es-tabbar" aria-label="Seções">{items('es-tabbar__link')}</nav>
  </>
}

export function Dialog({ open = true, speaker, title, children, footer, onClose, inline, showNext }) {
  const ref = useRef(null)
  // Native modal gives focus trap, Esc and an inert page; we return focus to the opener ourselves.
  useEffect(() => {
    const d = ref.current
    if (!open || inline || !d) return
    const opener = document.activeElement
    d.showModal()
    return () => { d.close(); opener?.focus?.() }
  }, [open, inline])
  if (!open) return null
  const box = <div className={cx('es-dialog', inline && 'es-dialog--inline')}>
    {speaker && <div className="es-dialog__plate">{speaker}</div>}
    {onClose && <IconButton className="es-dialog__close" icon="close" label="Fechar" variant="ghost" size="sm" onClick={onClose} />}
    <div className="es-dialog__body">{title && <h2 className="es-dialog__title">{title}</h2>}<div className="es-dialog__text">{children}</div></div>
    {footer && <div className="es-dialog__footer">{footer}</div>}
    {showNext && <span aria-hidden className="es-dialog__next">▼</span>}
  </div>
  if (inline) return box
  return <dialog ref={ref} className="es-modal" aria-label={title} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => e.target === e.currentTarget && onClose()}>{box}</dialog>
}

export function Toast({ title, description, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4200); return () => clearTimeout(t) }, [onClose])
  return <div role="status" className="es-toast">
    <span className="es-toast__icon"><Icon name="trophy" size={24} /></span>
    <span className="es-toast__text"><span className="es-toast__eyebrow">Achievement unlocked</span><span className="es-toast__title">{title}</span><span className="es-toast__desc">{description}</span></span>
  </div>
}

export function Tooltip({ content, children }) {
  return <span className="es-tooltip-wrap">{children}<span role="tooltip" className="es-tooltip">{content}</span></span>
}
