'use strict';

import express from 'express';
import manageContents from "./manageContents.js";

const router = express.Router();

router.use(express.json());

router.get('/api/pages', (req, res) => {
    res.send(manageContents.pages);
});

router.get('/api/page/:id', (req, res) => {
    console.log(req.params.id);

});

router.get('/api/content/:contentID', (req, response) => {
    // console.log('contentID', req.params.contentID);
    manageContents.getContent(req.params.contentID).then(
        res => response.json(res)
    ).catch(
        console.warn
    )
})

router.get('/', (req, res) => {
    res.send('404: Seite nicht gefunden');
})


export default router;