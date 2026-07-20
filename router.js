'use strict';


import express from 'express';
import formidable from 'formidable';
import {promises as fs} from 'fs';
import manageContents from "./manageContents.js";
import Page from "./classes/Page.js";

const router = express.Router();

router.use(express.json());

router.get('/pages', (req, res) => {
    // console.log('pages', manageContents.pages);
    res.send(manageContents.pages);
});

router.get('/page/:id', (req, res) => {
    console.log(req.params.id);
});

router.get('/content/:contentID', (req, response) => {
    // console.log('contentID', req.params.contentID);
    manageContents.getContent(req.params.contentID).then(
        res => response.json({
            status: 'success',
            payload: res
        })
    ).catch(
        err => {
            response.status(404).json({
                status: 'err',
                msg: err
            })
        }
    )
})

router.post('/saveContent', (req, res) => {

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

router.post('/moveContent', (req, res) => {
    // console.log(req.body);

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

router.post('/savePage', (req, res) => {
    // console.log('save Page', req.body);
    let page = manageContents.pages.find(page => page.id === req.body.id);
    // console.log(page);
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

router.post('/saveMedia', (req, response) => {
    const form = formidable({
        multiples: true,
        uploadDir: './contents/media',
        keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.warn(err)
            response.json({
                status: 'error',
                payload: err
            })
        } else {
            Object.entries(fields).forEach(([key, value]) => {
                fields[key] = value[0];
            })
            // Die AddMedia-Oberfläche soll nur ein Bild übertragen, daher genügt dieser Ansatz
            fields.filename = Object.values(files)[0][0].newFilename;

            fields.id = fields.filename.split('.')[0];

            fields.tags = fields.tags.replaceAll(' ', ',');
            fields.tags = fields.tags.replaceAll(',,', ',');
            fields.tags = fields.tags.split(',');
            fields.tags = fields.tags.filter(tag => (tag !== '') && (tag !== ' '));
            fields.tags = fields.tags.map(tag => tag.toLowerCase());

            manageContents.saveMedia(fields).then(
                res =>
                    response.json({
                        status: 'success',
                        payload: res
                    })
            )
        }
    })
})

router.post('/deleteMedia', (req, response) => {

    manageContents.deleteMedia(req.body).then(
        res => {
            console.log(Object.keys(manageContents.media));
            response.json({
                status: 'success',
                payload: res
            })
        }
    ).catch(
        console.warn
    )

})

router.get('/getImg/:filename', (req, response) => {
    let filename = req.params.filename;

    response.sendFile(filename, {root: './contents/media'});
})

router.get('/loadMediaOverview', (req, response) => {
    response.json(manageContents.media);
})

router.post('/newPageAfter', (req, res) => {
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

router.post('/newPageIn', (req, res) => {
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

router.post('/removePage', (req, res) => {

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

router.post('/createContent', (req, res) => {
    // console.log('create content', req.body);
    manageContents.addContent(req.body.pageID, req.body.index).then(
        page => res.json(page)
    ).catch(
        console.warn
    )
})

router.post('/removeContent', (req, res) => {
    // console.log(req.body);

    manageContents.removeContent(req.body.contentID).then(
        () => res.json(manageContents.pages)
    ).catch(
        console.warn
    )

})


export default router;