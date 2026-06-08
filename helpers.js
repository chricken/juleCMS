'use strict';

let counter = 0;

const helpers = {
    createID() {
        return Date.now().toString(36) + '_' + (counter++)
    }
};

export default helpers;