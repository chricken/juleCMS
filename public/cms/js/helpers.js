'use strict';

let counter = 0;

const helpers = {

    createID() {
        return Date.now().toString(36) + '_' + (counter++)
    },

    debouncer(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args)
            }, delay);
        };
    },
}

export default helpers;
