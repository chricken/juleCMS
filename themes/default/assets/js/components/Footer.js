'use strict';

import dom from '/cms/js/dom.js';

const Footer = ({parent = null} = {}) => {
    if (!parent) return;
    parent.innerHTML = '';
    dom.create({
        content: '© ' + new Date().getFullYear() + ' Jule CMS',
        parent,
        cssClassName: 'site-footer',
    })
}

export default Footer;
