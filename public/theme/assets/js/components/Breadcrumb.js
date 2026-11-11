'use strict';

// Klickbares Breadcrumb: Home / Vorfahr / … / aktuelle Seite (letzter ohne Link)

import dom from '/cms/js/dom.js';
import router, {pageURL, ancestorsOf} from '../router.js';

const Breadcrumb = ({page = null, parent = null} = {}) => {
    if (!parent || !page) return;
    parent.innerHTML = '';

    const ol = dom.create({
        tagName: 'ol',
        parent,
        cssClassName: 'breadcrumb',
        attr: {'aria-label': 'Breadcrumb'},
    })

    // Home
    const liHome = dom.create({tagName: 'li', parent: ol})
    dom.create({
        tagName: 'a',
        href: '/',
        content: 'Home',
        parent: liHome,
        listeners: {
            click(evt) {
                evt.preventDefault();
                router.navigate('/');
            }
        }
    })

    const chain = ancestorsOf(page).filter(p => p.id !== 'root');
    chain.forEach((p, i) => {
        const li = dom.create({tagName: 'li', parent: ol})
        const isLast = i === chain.length - 1;
        if (isLast) {
            dom.create({tagName: 'span', content: p.title, parent: li, cssClassName: 'breadcrumb-current'})
        } else {
            dom.create({
                tagName: 'a',
                href: pageURL(p),
                content: p.title,
                parent: li,
                listeners: {
                    click(evt) {
                        evt.preventDefault();
                        router.navigate(pageURL(p));
                    }
                }
            })
        }
    })
}

export default Breadcrumb;
