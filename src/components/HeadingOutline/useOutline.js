import {useEffect, useMemo, useState} from 'react';
import {useLocation} from '@docusaurus/router';
export function plainText(value) {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
export function useOutline(toc = []) {
  const {pathname} = useLocation();
  const [title, setTitle] = useState(null), [active, setActive] = useState('');
  useEffect(() => {
    const h1 = document.querySelector('main .theme-doc-markdown h1, main article h1, main h1');
    if (h1) {if (!h1.id) h1.id = 'cc-page-top'; setTitle({id: h1.id, value: h1.textContent, level: 1});}
    else setTitle(null);
  }, [pathname, toc]);
  const items = useMemo(() => {
    const seen = new Set();
    return [...(title ? [title] : []), ...toc].filter((h) => h.id && h.level <= 4 && !seen.has(h.id) && seen.add(h.id)).map((h) => ({...h, title: plainText(h.value)}));
  }, [toc, title]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const targets = items.map((item) => ({item, element: document.getElementById(item.id)})).filter((x) => x.element);
      const offset = (document.querySelector('.navbar')?.getBoundingClientRect().height || 60) + 28;
      let current = targets[0]?.item.id || '';
      for (const {item, element} of targets) if (element.getBoundingClientRect().top <= offset) current = item.id;
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2 && targets.length) current = targets.at(-1).item.id;
      setActive(current);
    };
    const schedule = () => {if (!frame) frame = requestAnimationFrame(update);};
    update(); window.addEventListener('scroll', schedule, {passive: true}); window.addEventListener('resize', schedule); window.addEventListener('hashchange', schedule);
    return () => {cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.removeEventListener('hashchange', schedule);};
  }, [items, pathname]);
  return {items, active, setActive, pathname};
}
export function activateSpace(event) {
  if (event.key === ' ' && !event.isComposing) {event.preventDefault(); event.currentTarget.click();}
}
