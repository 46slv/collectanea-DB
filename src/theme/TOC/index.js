import React, {useEffect, useMemo, useState} from 'react';
import styles from './styles.module.css';

function plainText(html) {
  if (typeof document === 'undefined') return html;
  const element = document.createElement('span');
  element.innerHTML = html;
  return element.textContent ?? html;
}

export default function TOC({toc = [], className}) {
  const [pageTitle, setPageTitle] = useState(null);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const heading = document.querySelector('.theme-doc-markdown h1, article header h1');
    if (!heading) return;
    if (!heading.id) heading.id = 'page-title';
    setPageTitle({id: heading.id, value: heading.textContent ?? 'Page', level: 1});
  }, []);

  const items = useMemo(() => {
    const source = pageTitle ? [pageTitle, ...toc] : toc;
    return source.filter((item) => item.level <= 4);
  }, [pageTitle, toc]);

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
  }, [items]);

  if (!items.length) return null;

  const onNavigate = (event, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      event.preventDefault();
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const lengthFor = (level) => {
    if (level <= 1) return 34;
    if (level === 2) return 24;
    if (level === 3) return 16;
    return 11;
  };

  return (
    <nav className={`${styles.rail} ${className ?? ''}`} aria-label="このページの見出し">
      <span className={styles.railLabel}>On this page</span>
      <ol>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={active ? styles.linkActive : styles.link}
                aria-current={active ? 'location' : undefined}
                aria-label={plainText(item.value)}
                onClick={(event) => onNavigate(event, item.id)}
                style={{'--rail-length': `${lengthFor(item.level)}px`}}>
                <span className={styles.tooltip} dangerouslySetInnerHTML={{__html: item.value}} />
                <span className={styles.line} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
