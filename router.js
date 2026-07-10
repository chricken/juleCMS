'use strict';

import express from 'express';
import manageContents from "./manageContents.js";
import Page from "./classes/Page.js";

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

    // console.log('save Content', req.body);

    manageContents.saveContent(req.body).then(
        () => res.json({
            status: 'success',
            msg: 'Inhalt gespeichert'
        })
    ).catch(
        console.warn
    )

});

router.post('/api/moveContent', (req, res) => {
    console.log(req.body);

    return manageContents.moveContent(req.body).then(
        page => res.json({
            status: 'success',
            payload: page
        })
    ).catch(
        err => res.json({
            status: 'err',
            err
        })
    )
})

router.post('/api/savePage', (req, res) => {
    // console.log('save Page', req.body);
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
            status: 'success',
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

router.post('/api/newPageAfter', (req, res) => {
    let afterMe = req.body;

    let myPage = new Page({
        title: 'Neue Seite',
    });

    manageContents.pages.push(myPage);

    // Element suchen, dessen Kind die Ausgangsseite ist
    let parent = manageContents.pages.find(page => page.children.includes(afterMe.id));
    let index = parent.children.indexOf(afterMe.id);
    parent.children.splice(index + 1, 0, myPage.id);

    manageContents.savePages().then(
        () => res.json({
            status: 'success',
            payload: manageContents.pages,
            newID: myPage.id
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

router.post('/api/newPageIn', (req, res) => {
    let inMe = req.body;

    let myPage = new Page({
        title: 'Neue Seite',
    });

    manageContents.pages.push(myPage);

    // Element suchen, dessen Kind die Ausgangsseite ist
    let parent = manageContents.pages.find(page => page.id === inMe.id);
    parent.children.push(myPage.id);

    manageContents.savePages().then(
        () => res.json({
            status: 'success',
            payload: manageContents.pages,
            newID: myPage.id
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

router.post('/api/removePage', (req, res) => {

    manageContents.removePage(req.body.id);

    manageContents.savePages().then(
        () => res.json({
            status: 'success',
            payload: manageContents.pages
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
})


router.post('/api/createContent', (req, res) => {
    // console.log('create content', req.body);
    manageContents.addContent(req.body.pageID, req.body.index).then(
        page => res.json(page)
    ).catch(
        console.warn
    )
})

router.post('/api/removeContent', (req, res) => {
    // console.log(req.body);

    manageContents.removeContent(req.body.contentID).then(
        () => res.json(manageContents.pages)
    ).catch(
        console.warn
    )

})


router.get('/', (req, res) => {
    res.send('404: Seite nicht gefunden');
})


export default router;