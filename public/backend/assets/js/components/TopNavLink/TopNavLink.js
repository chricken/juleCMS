'use strict';

import elements from "../../elements.js";
import dom from "../../dom.js";
import TopNav from "../../views/TopNav.js";

const TopNavLink = ({
                        legend = '',
                        callback = () => {
                        },
                    }) => {


    const elNavLink = dom.create({
        tagName: 'span',
        cssClassName: 'top-nav-link transit',
        parent: elements.nav,
        content: legend,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                callback();
                // elNavLink.highlight();
            }
        }
    })

    // Dateiname der JS-Datei durch den Namen der CSS-Datei ersetzen
    let localURL = new URL(import.meta.url).pathname;
    let indexLastSlash = localURL.lastIndexOf('/');
    localURL = localURL.substring(0, indexLastSlash + 1);
    localURL += 'styles.css';


    dom.create({
        tagName: 'link',
        attr: {
            rel: 'stylesheet',
            href: localURL,
        },
        parent: elNavLink,

    })

    elNavLink.highlight = () => {
        TopNav.clearAll();
        elNavLink.classList.add('active');
    }

    return elNavLink;
};

export default TopNavLink;