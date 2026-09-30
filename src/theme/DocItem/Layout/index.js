import React from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';

export default function DocItemLayoutWrapper(props) {
  return (
    <div className="collectanea-doc-shell">
      <DocItemLayout {...props} />
    </div>
  );
}
