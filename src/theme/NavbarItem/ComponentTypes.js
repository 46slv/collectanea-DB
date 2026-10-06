import React from 'react';
import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import {useSiteUI} from '@site/src/components/SiteUI';
function SearchControl() {
  const {setSearchOpen} = useSiteUI();
  return <button type="button" className="cc-button cc-navbar-search" aria-label="サイト内検索" onClick={() => setSearchOpen(true)}><span aria-hidden="true">⌕</span><span>検索</span></button>;
}
export default {...ComponentTypes, 'custom-collectanea-search': SearchControl};
