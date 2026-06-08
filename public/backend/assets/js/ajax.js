'use strict';

const ajax = {
    loadJSON(url){
        console.log(url);
        return fetch(url).then(res => res.json());
    }
}

export default ajax;