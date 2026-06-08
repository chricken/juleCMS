'use strict';

import helpers from "../helpers.js";

class Page {
    constructor({
                    id = null,
                    title = '',
                    slug = '',
                    visible = true,
                    crDate = null,
                    chDate = null,
                    password = null,

                    content = [],
                    children = [],
                    description = '',
                    previewImage = '',

                    metaTitle = '',
                    metaDescription = '',
                    metaKeywords = [],

                    ogTitle = '',
                    ogDescription = '',
                    ogImage = '',

                }) {
        Object.assign(this, {
            title, slug, visible, password,
            content, children, description, previewImage,
            metaTitle, metaDescription, metaKeywords,
            ogTitle, ogDescription, ogImage
        });
        this.id = id || helpers.createID();
        this.crDate = crDate || Date.now();
        this.chDate = chDate || Date.now();

    }

    addChild(child) {
        this.children.push(child);

    }

    removeChild(childID) {
        this.children = this.children.filter(child => child.id !== childID);
    }

    moveChild(childID, index) {

    }

    addContent(content) {
        this.content.push(content);
    }

    removeContent(contentID) {
        this.content = this.content.filter(content => content.id !== contentID);
    }

    moveContent(contentID, index) {

    }
}

export default Page;
