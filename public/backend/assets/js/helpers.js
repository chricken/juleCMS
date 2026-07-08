'use strict';


const helpers = {
     debouncer (func, delay)  {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // console.log('debouncer', args);
                func(...args)
            }, delay);
        };
    },

    collapse  (el, elInner) {
        el.classList.toggle('open');

        if (el.classList.contains('open')) {
            el.style.height = 80 + elInner.getBoundingClientRect().height + 'px';
        } else {
            el.style.height = 50 + 'px';
        }
    }

}

export default helpers;
export const collapse = helpers.collapse;