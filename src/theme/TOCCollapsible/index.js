import React, {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

function plainText(html) {
  if (typeof document === 'undefined') return '見出し';
  const element = document.createElement('span');
  element.innerHTML = html;
  return element.textContent ?? '見出し';
}

// Mobile collapsible heading navigation. Docusaurus renders TOCCollapsible
// (not theme/TOC) below the lg breakpoint, so the rail's mobile list must
// live here. Full anchor list, 44px targets, scroll-spy active state.
export default function TOCCollapsible({toc = [], className}) {
  const {pathname} = useLocation();
  const [activeId, setActiveId] = useState('');
  const [open, setOpen] = useState(false);

  const items = toc.filter((item) => item.level >= 2 && item.level <= 4);

  useEffect(() => {
    setActiveId('');
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!items.length) return undefined;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = items[0]?.id ?? '';
        for (const item of items) {
          const target = document.getElementById(item.id);
          if (target && target.getBoundingClientRect().top <= 148) current = item.id;
        }
        setActiveId(current);
      });
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [toc, pathname]);

  if (!items.length) return null;

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <details
      className={`${styles.mobileToc} ${className ?? ''}`}
      onToggle={(event) => setOpen(event.target.open)}>
      <summary aria-label="見出し一覧を開閉">
        {open ? '見出しを閉じる' : `見出し一覧 (${items.length})${activeItem ? ` — ${plainText(activeItem.value)}` : ''}`}
      </summary>
      <ol>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'location' : undefined}
                data-level={item.level}
                onClick={() => setActiveId(item.id)}>
                <span dangerouslySetInnerHTML={{__html: item.value}} />
              </a>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
