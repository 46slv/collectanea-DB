import React from 'react';
import Link from '@docusaurus/Link';

export default function FluidCard({to, title, children}) {
  return (
    <Link to={to}>
      <strong>{title}</strong>
      <span>{children}</span>
    </Link>
  );
}
