import React, {useEffect, useState} from 'react';
import {activateSpace, useOutline} from '@site/src/components/HeadingOutline/useOutline';
export default function TOCCollapsible({toc, className = ''}) {
  const {items, active, setActive, pathname} = useOutline(toc);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  if (!items.length) return null;
  return <details className={`cc-mobile-outline ${className}`} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}><summary>このページの目次<span>{items.find((item) => item.id === active)?.title}</span></summary><ol>{items.map((item) => <li key={item.id} data-heading-level={item.level}><a href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={() => {setActive(item.id); setOpen(false);}} onKeyDown={activateSpace}>{item.title}</a></li>)}</ol></details>;
}
