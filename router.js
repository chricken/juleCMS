'use strict';

import express from 'express';
import manageContents from "./manageContents.js";

const router = express.Router();

router.use(express.json());

router.get('/api/pages', (req, res) => {
    // console.log('pages', manageContents.pages);
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

router.post('/api/saveContent', (req, res) => {
    // console.log(req.body);
    manageContents.saveContent(req.body).then(
        () => res.send('Inhalt gespeichert')
    ).catch(
        console.warn
    )

});

router.post('/api/savePage', (req, res) => {
    console.log(req.body);
    let page = manageContents.pages.find(page => page.id === req.body.id);
    console.log(page);
    // Attribute übertragen, Referenz behalten
    // Object.assign(page, req.body)

    manageContents.pages = [
        ...manageContents.pages.filter(page => page.id !== req.body.id),
        req.body
    ]

    // console.log(manageContents.pages);
    manageContents.savePages().then(
        msg => res.json({
            type: 'success',
            msg: 'Seite gespeichert'
        })
    ).catch(
        err => {
            console.warn(err)
            res.json({
                type: 'err',
                msg: err
            })
        }
    )

});

router.post('/api/createContent', (req, res) => {
    console.log('create content', req.body);
    manageContents.addContent(req.body.pageID, req.body.index).then(
        page => res.json(page)
    ).catch(
        console.warn
    )
})

router.post('/api/removeContent', (req, res) => {

    console.log('remove content', req.body);

    manageContents.removeContent(req.body.contentID).then(
        () => res.send()
    ).catch(
        console.warn
    )

})

router.get('/', (req, res) => {
    res.send('404: Seite nicht gefunden');
})


export default router;