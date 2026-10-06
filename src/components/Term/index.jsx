import React, {useId, useState} from 'react';
import Link from '@docusaurus/Link';
import {useCatalog} from '@site/src/data/catalog';

export default function Term({id, children}) {
  const {terms = {}} = useCatalog();
  const term = terms[id];
  const [open, setOpen] = useState(false);
  const reactId = useId();
  const popoverId = `cc-term-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  if (!term) return <span data-term-id={id}>{children}</span>;

  return <span
    className="cc-term"
    data-term-id={id}
    data-open={open ? 'true' : 'false'}
    onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}
    onKeyDown={(event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        event.currentTarget.querySelector('.cc-term-trigger')?.focus();
      }
    }}>
    <button
      type="button"
      className="cc-term-trigger"
      aria-expanded={open}
      aria-controls={popoverId}
      onClick={() => setOpen((value) => !value)}>
      {children}
    </button>
    <span id={popoverId} className="cc-term-popover" role="note" aria-label={`${term.title}の説明`}>
      <strong>{term.title}</strong>
      <span>{term.summary}</span>
      <Link to={term.href}>詳しく見る <span aria-hidden="true">→</span></Link>
    </span>
  </span>;
}
