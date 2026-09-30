import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function FluidCard({to, eyebrow, title, body, meta}) {
  return (
    <Link className={styles.card} to={to}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <span className={styles.titleRow}>
        <strong className={styles.title}>{title}</strong>
        <span className={styles.arrow} aria-hidden="true">↗</span>
      </span>
      <span className={styles.body}>{body}</span>
      {meta ? <span className={styles.meta}>{meta}</span> : null}
    </Link>
  );
}
