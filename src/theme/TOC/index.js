import React, {useEffect, useRef, useState} from 'react';
import {activateSpace, useOutline} from '@site/src/components/HeadingOutline/useOutline';
export default function TOC({toc}) {
  const {items, active, setActive, pathname} = useOutline(toc);
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => setOpen(false), [pathname]);
  if (!items.length) return null;
  return <nav className="cc-rail" ref={root} aria-label="このページの見出し" data-cc-rail onMouseEnter={() => setOpen(true)} onMouseLeave={() => {if (!root.current.contains(document.activeElement)) setOpen(false);}} onFocus={() => setOpen(true)} onBlur={(e) => {if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);}} onKeyDown={(e) => {if (e.key === 'Escape') {e.preventDefault(); setOpen(false);}}}>
    <ol className="cc-rail-lines">{items.map((item) => <li key={item.id}><a href={`#${item.id}`} aria-label={item.title} aria-current={active === item.id ? 'location' : undefined} onClick={() => setActive(item.id)} onKeyDown={activateSpace} data-heading-level={item.level}><span aria-hidden="true" className={`cc-rail-line cc-rail-line--${item.level}`} /></a></li>)}</ol>
    {open && <div className="cc-outline" data-cc-outline><strong>このページ</strong><ol>{items.map((item) => <li key={item.id} data-heading-level={item.level}><a href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={() => {setActive(item.id); setOpen(false);}} onKeyDown={activateSpace}>{item.title}</a></li>)}</ol></div>}
  </nav>;
}
