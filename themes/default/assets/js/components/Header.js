'use strict';

import dom from '/cms/js/dom.js';
import router from '../router.js';

const Header = ({parent = null} = {}) => {
    if (!parent) return;
    parent.innerHTML = '';
    const link = dom.create({
        tagName: 'a',
        href: '/',
        parent,
        cssClassName: 'site-header-link',
        listeners: {
            click(evt) {
                evt.preventDefault();
                router.navigate('/');
            }
        }
    })
    dom.create({
        tagName: 'h1',
        content: 'Jule CMS',
        parent: link,
        cssClassName: 'site-header',
    })
}

export default Header;
