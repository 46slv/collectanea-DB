import React, {useEffect} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {SiteUIProvider} from '@site/src/components/SiteUI';
import GlobalSearch from '@site/src/components/GlobalSearch';

function OptionalFonts() {
  useEffect(() => {
    if (document.getElementById('collectanea-fonts')) return;
    // Loaded after the first render; system fallbacks remain usable if unavailable.
    const link = document.createElement('link');
    link.id = 'collectanea-fonts'; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);
  return null;
}
export default function Root({children}) {
  return <SiteUIProvider><OptionalFonts />{children}<BrowserOnly fallback={null}>{() => <GlobalSearch />}</BrowserOnly></SiteUIProvider>;
}
