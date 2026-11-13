'use strict';


import express from 'express';
import crypto from 'crypto';
import formidable from 'formidable';
import {promises as fs} from 'fs';
import manageContents from "./manageContents.js";
import Page from "./classes/Page.js";
import settings from "./settings.js";
import themes from "./themes.js";
import llm from "./llm.js";

const router = express.Router();

router.use(express.json());

// --- JWT-basierte Authentifizierung ---
// Secret wird in credentials.json gespeichert (beim ersten Login generiert)
let jwtSecret = null;
let tokenVersion = 0;
const loadJwtSecret = () => {
    if (jwtSecret) return Promise.resolve(jwtSecret);
    return fs.readFile('./credentials.json', 'utf8').then(
        raw => {
            try {
                const creds = JSON.parse(raw);
                if (creds.jwtSecret) jwtSecret = creds.jwtSecret;
                tokenVersion = creds.tokenVersion || 0;
                if (jwtSecret) return jwtSecret;
            } catch(e) {}
            jwtSecret = crypto.randomBytes(32).toString('hex');
            return fs.readFile('./credentials.json', 'utf8').catch(() => '{}').then(
                raw2 => {
                    let creds = {};
                    try { creds = JSON.parse(raw2); } catch(e) {}
                    creds.jwtSecret = jwtSecret;
                    return fs.writeFile('./credentials.json', JSON.stringify(creds, null, 2)).then(() => jwtSecret);
                }
            );
        }
    ).catch(() => {
        jwtSecret = crypto.randomBytes(32).toString('hex');
        return fs.writeFile('./credentials.json', JSON.stringify({jwtSecret}, null, 2)).then(() => jwtSecret);
    });
};

const b64urlEncode = (str) => Buffer.from(str).toString('base64url');
const signJWT = (payload, secret) => {
    const header = b64urlEncode(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
    const body = b64urlEncode(JSON.stringify(payload));
    const sig = crypto.createHmac('sha256', secret).update(header + '.' + body).digest('base64url');
    return header + '.' + body + '.' + sig;
};
const verifyJWT = (token, secret) => {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const expected = crypto.createHmac('sha256', secret).update(h + '.' + p).digest();
    let sigBuf;
    try { sigBuf = Buffer.from(s, 'base64url'); } catch(e) { return null; }
    if (sigBuf.length !== expected.length || !crypto.timingSafeEqual(sigBuf, expected)) return null;
    try { return JSON.parse(Buffer.from(p, 'base64url').toString('utf8')); } catch(e) { return null; }
};

const getToken = (req) => {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/);
    return match ? match[1] : null;
};

const getLoginValidityDays = () => {
    let days = settings.get('loginValidityDays');
    if (typeof days !== 'number' || days <= 0) days = 3;
    return days;
};

// Auth: JWT gültig UND lastLogin innerhalb der konfigurierten Tage
loadJwtSecret(); // Secret beim Serverstart laden

const isAuthenticated = (req) => {
    const token = getToken(req);
    if (!token || !jwtSecret) return false;
    const payload = verifyJWT(token, jwtSecret);
    if (!payload || !payload.lastLogin) return false;
    if ((payload.v || 0) !== tokenVersion) return false;
    const maxAge = getLoginValidityDays() * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.lastLogin > maxAge) return false;
    return true;
};

// Middleware: blockiert alle /api/* Routen außer login, checkAuth und
// savePassword (nur für initiales Setup, solange kein Passwort existiert)
let hasPassword = null;
const checkHasPassword = () => {
    if (hasPassword !== null) return Promise.resolve(hasPassword);
    return fs.readFile('./credentials.json', 'utf8').then(
        raw => {
            try {
                const creds = JSON.parse(raw);
                hasPassword = !!(creds.passwordHash && creds.salt);
            } catch(e) { hasPassword = false; }
            return hasPassword;
        }
    ).catch(() => { hasPassword = false; return false; });
};

router.use((req, res, next) => {
    if (req.path === '/login' || req.path === '/checkAuth') return next();
    // Bilder werden per <img src> geladen – ohne Header möglich, daher öffentlich
    if (req.path.startsWith('/getImg/')) return next();
    // Seitenstruktur + Inhalte + Bild-Metadaten fürs Frontend-Routing öffentlich
    if (req.path === '/structure') return next();
    if (req.path.startsWith('/content/')) return next();
    if (req.path.startsWith('/getImgMetaData/')) return next();
    // Kontaktformular (Frontend) und Datei-Download öffentlich
    if (req.path === '/contact') return next();
    if (req.path.startsWith('/getFile/')) return next();
    if (req.path === '/savePassword') {
        // Erlaubt nur wenn noch kein Passwort gesetzt (initiales Setup)
        return checkHasPassword().then(
            has => {
                if (!has) return next();
                if (!isAuthenticated(req)) {
                    return res.status(401).json({status: 'err', msg: 'Nicht eingeloggt', authenticated: false});
                }
                next();
            }
        );
    }
    if (!isAuthenticated(req)) {
        return res.status(401).json({status: 'err', msg: 'Nicht eingeloggt', authenticated: false});
    }
    next();
});


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

router.post('/movePage', (req, res) => {

    manageContents.movePage(req.body).then(
        pages => res.json({
            status: 'success',
            payload: pages
        })
    ).catch(
        err => res.status(400).json({
            status: 'err',
            msg: err
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
            fields.crDate = Date.now();
            fields.chDate = Date.now();

            fields.tags = fields.tags.replaceAll(' ', ',');
            fields.tags = fields.tags.replaceAll(',,', ',');
            fields.tags = fields.tags.split(',');
            fields.tags = fields.tags.filter(tag => (tag !== '') && (tag !== ' '));
            fields.tags = fields.tags.map(tag => tag.toLowerCase());
            // Übersetzte Tag-Arrays auch konvertieren
            ['tags_en', 'tags_nl', 'tags_fr'].forEach(tk => {
                if (fields[tk]) {
                    fields[tk] = String(fields[tk]).split(',').filter(t => t.trim() !== '').map(t => t.trim());
                }
            });

            manageContents.saveMedia(fields).then(
                res =>
                    response.json({
                        status: 'success',
                        payload: res
                    })
            ).catch(
                err => {
                    console.warn(err);
                    response.status(500).json({
                        status: 'error',
                        payload: err
                    })
                }
            )
        }
    })
})

router.post('/saveWatermark', (req, response) => {

    const form = formidable({
        multiples: true,
        uploadDir: './contents/watermarks',
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
            console.log('save Watermark', fields, files);

            Object.entries(fields).forEach(([key, value]) => {
                fields[key] = value[0];
            })
            // Die AddMedia-Oberfläche soll nur ein Bild übertragen, daher genügt dieser Ansatz
            fields.filename = Object.values(files)[0][0].newFilename;
            fields.crDate = Date.now();
            fields.chDate = Date.now();
            fields.id = fields.filename.split('.')[0];

            console.log('save Watermark', fields, files);
            manageContents.saveWatermark(fields).then(
                res =>
                    response.json({
                        status: 'success',
                        payload: res
                    })
            ).catch(
                err => {
                    console.warn(err);
                    response.status(500).json({
                        status: 'error',
                        payload: err
                    })
                }
            )

            // response.json({
            //     status: 'success',
            // })
        }
    })

})

router.post('/updateMedia', (req, response) => {
    // Updatemedia braucht eine eigene Funktion, weil
    // die Daten anders strukturiert sind

    const form = formidable({
        multiples: true,
        uploadDir: './contents/media',
        keepExtensions: true,
        minFileSize: 0,
        allowEmptyFiles: true,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log('err', err);
            response.json({
                status: 'error',
                payload: err
            })
        } else {

            Object.entries(fields).forEach(([key, value]) => {
                fields[key] = value[0];
            })

            fields.tags = fields.tags.replaceAll(' ', ',');
            fields.tags = fields.tags.replaceAll(',,', ',');
            fields.tags = fields.tags.split(',');
            fields.tags = fields.tags.filter(tag => (tag !== '') && (tag !== ' '));
            fields.tags = fields.tags.map(tag => tag.toLowerCase());
            // Übersetzte Tag-Arrays auch konvertieren
            ['tags_en', 'tags_nl', 'tags_fr'].forEach(tk => {
                if (fields[tk]) {
                    fields[tk] = String(fields[tk]).split(',').filter(t => t.trim() !== '').map(t => t.trim());
                }
            });

            fields.chDate = +fields.chDate;

            // Neu hochgeladene Bilder haben eine andere ID als Das Media-Objekt.
            // Ggf vorhandene Verknüpfungen und die alten (überschriebenen) Bilder
            // bleiben dadurch erhalten.
            if (files['image[0]']) {
                // console.log(files);
                fields.filename = Object.values(files)[0][0].newFilename;
            }

            manageContents.updateMedia(fields).then(
                payload => response.json({
                    status: 'success',
                    payload
                })
            ).catch(
                err => response.status(500).json({
                    status: 'error',
                    payload: err
                })
            )
        }
    })


})

router.post('/updateWatermark', (req, response) => {
    console.log('Update Media', req.body);

    const form = formidable({
        multiples: true,
        uploadDir: './contents/watermarks',
        keepExtensions: true,
        minFileSize: 0,
        allowEmptyFiles: true,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log('err', err);
            response.json({
                status: 'error',
                payload: err
            })
        } else {

            Object.entries(fields).forEach(([key, value]) => {
                fields[key] = value[0];
            })

            fields.crDate = +fields.crDate;
            fields.chDate = +fields.chDate;

            // Neu hochgeladene Bilder haben eine andere ID als Das Media-Objekt.
            // Ggf vorhandene Verknüpfungen und die alten (überschriebenen) Bilder
            // bleiben dadurch erhalten.
            if (files['image[0]']) {
                // console.log(files);
                fields.filename = Object.values(files)[0][0].newFilename;
            }

            manageContents.updateWatermark(fields).then(
                payload => response.json({
                    status: 'success',
                    payload
                })
            ).catch(
                err => response.status(500).json({
                    status: 'error',
                    payload: err
                })
            )


        }
    })


})

router.post('/deleteMedia', (req, response) => {

    manageContents.deleteMedia(req.body).then(
        res => {
            console.log(Object.keys(manageContents.media || {}));
            response.json({
                status: 'success',
                payload: res
            })
        }
    ).catch(
        console.warn
    )

})

router.post('/deleteWatermark', (req, response) => {

    manageContents.deleteWatermark(req.body).then(
        res => {
            console.log(Object.keys(manageContents.watermarks || {}));
            response.json({
                status: 'success',
                payload: res
            })
        }
    ).catch(
        console.warn
    )

})

router.get('/getImg/:folder/:filename', (req, response) => {
    let filename = req.params.filename;
    let folder = req.params.folder;

    console.log('getImg', folder, filename);

    fs.access(`./contents/${folder}/${filename}`).then(
        () => {
            console.log('gefunden', filename);
            response.sendFile(filename, {root: `./contents/${folder}`})
        }
    ).catch(
        () => {
            console.log('nicht gefunden', filename);
            response.sendFile('404.jpg', {root: './contents/media/errors'})
        }
    )

})

router.get('/getImgMetaData/:folder/:id', (req, response) => {
    let filename = req.params.id + '.json';
    let folder = req.params.folder;

    fs.access(`./contents/${folder}/${filename}`).then(
        () => fs.readFile(`./contents/${folder}/${filename}`, 'utf8')
    ).then(
        payload => JSON.parse(payload)
    ).then(
        payload => {
            response.json({
                status: 'success',
                payload
            })
        }
    ).catch(
        err => {
            response.json({
                status: 'error',
                payload: err
            })
        }
    )


})

router.get('/loadMediaOverview', (req, response) => {

    // console.log('load media overview', manageContents.media);
    // response.json(manageContents.media);
    fs.readdir('./contents/media').then(
        files => files.filter(file => file.endsWith('.json'))
    ).then(
        files => Promise.all(files.map(
            file => fs.readFile(`./contents/media/${file}`, 'utf8')
        ))
    ).then(
        media => media.map(media => JSON.parse(media))
    ).then(
        media => {
            let mediaObj = {};
            media.forEach(media => mediaObj[media.id] = media);
            // Nach order sortieren (fehlt -> chDate), dann als Array zurück
            return Object.values(mediaObj).sort((a, b) => {
                const oa = (a.order !== undefined) ? a.order : Number.MAX_SAFE_INTEGER;
                const ob = (b.order !== undefined) ? b.order : Number.MAX_SAFE_INTEGER;
                if (oa !== ob) return oa - ob;
                return (b.chDate || 0) - (a.chDate || 0);
            });
        }
    ).then(
        media => {
            // console.log('media', media);
            response.json(media);
        }
    ).catch(
        console.warn
    )

})

router.get('/loadWatermarkOverview', (req, response) => {

    response.json(manageContents.watermarks);
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

router.post('/newPageBefore', (req, res) => {
    let beforeMe = req.body;

    let myPage = new Page({
        title: 'Neue Seite',
    });

    manageContents.pages.push(myPage);

    // Element suchen, dessen Kind die Ausgangsseite ist
    let parent = manageContents.pages.find(page => page.children.includes(beforeMe.id));
    let index = parent.children.indexOf(beforeMe.id);
    parent.children.splice(index, 0, myPage.id);

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

router.post('/savePassword', (req, res) => {

    const {password} = req.body;

    if (!password || typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({
            status: 'err',
            msg: 'Kein Passwort übertragen'
        });
    }

    // Salt generieren und Passwort hashen (PBKDF2 mit SHA-256, 100000 Iterationen)
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');

    const credentials = {
        passwordHash: hash,
        salt: salt,
        algorithm: 'pbkdf2',
        iterations: 100000,
        hashAlgorithm: 'sha256',
        chDate: Date.now()
    };

    fs.writeFile('./credentials.json', JSON.stringify(credentials, null, 2)).then(
        () => { hasPassword = true; }
    ).then(
        () => res.json({
            status: 'success',
            msg: 'Passwort gespeichert'
        })
    ).catch(
        err => {
            console.warn(err);
            res.status(500).json({
                status: 'err',
                msg: String(err)
            });
        }
    );
});

router.post('/removeContent', (req, res) => {
    // console.log(req.body);

    manageContents.removeContent(req.body.contentID).then(
        () => res.json(manageContents.pages)
    ).catch(
        console.warn
    )

})



// --- Auth-Endpunkte ---
router.post('/login', (req, res) => {
    const {password} = req.body;
    if (!password) return res.status(400).json({status: 'err', msg: 'Kein Passwort'});

    fs.readFile('./credentials.json', 'utf8').then(
        raw => {
            const creds = JSON.parse(raw);
            if (!creds.passwordHash || !creds.salt) {
                return res.status(401).json({status: 'err', msg: 'Kein Passwort gesetzt'});
            }
            const hash = crypto.pbkdf2Sync(password, creds.salt, creds.iterations || 100000, 64, creds.hashAlgorithm || 'sha256');
            const stored = Buffer.from(creds.passwordHash, 'hex');
            if (hash.length !== stored.length || !crypto.timingSafeEqual(hash, stored)) {
                return res.status(401).json({status: 'err', msg: 'Falsches Passwort'});
            }
            // JWT erstellen (lastLogin = jetzt, Secret aus credentials.json)
            return loadJwtSecret().then(
                secret => {
                    const token = signJWT({lastLogin: Date.now(), iat: Date.now(), v: tokenVersion}, secret);
                    res.json({status: 'success', authenticated: true, token});
                }
            );
        }
    ).catch(
        err => res.status(500).json({status: 'err', msg: String(err)})
    );
});

router.post('/logout', (req, res) => {
    tokenVersion++;
    fs.readFile('./credentials.json', 'utf8').catch(() => '{}').then(
        raw => {
            let creds = {};
            try { creds = JSON.parse(raw); } catch(e) {}
            creds.tokenVersion = tokenVersion;
            return fs.writeFile('./credentials.json', JSON.stringify(creds, null, 2));
        }
    ).finally(() => {
        res.json({status: 'success', authenticated: false});
    });
});

router.get('/checkAuth', (req, res) => {
    res.json({authenticated: isAuthenticated(req)});
});

// --- Login-Gültigkeit (Tage) ---
router.get('/loginValidityDays', (req, res) => {
    res.json({loginValidityDays: getLoginValidityDays()});
});

router.post('/saveLoginValidityDays', (req, res) => {
    let days = parseInt(req.body.loginValidityDays, 10);
    if (isNaN(days) || days < 1) days = 3;
    if (days > 365) days = 365;
    settings.set('loginValidityDays', days);
    res.json({status: 'success', loginValidityDays: days});
});

// --- Testmail senden ---

// Datei-Upload für FileDownload-Content (Backend, auth-geschützt)
router.post('/uploadFile', (req, response) => {
    fs.mkdir('./contents/files', {recursive: true}).then(
        () => {
            const form = formidable({
                multiples: false,
                uploadDir: './contents/files',
                keepExtensions: true,
            });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.warn(err);
                    return response.status(500).json({status: 'err', msg: String(err)});
                }
                const fileArr = Object.values(files);
                if (!fileArr.length || !fileArr[0].length) {
                    return response.status(400).json({status: 'err', msg: 'Keine Datei empfangen'});
                }
                const f = fileArr[0][0];
                const id = f.newFilename.split('.')[0];
                const original = f.originalFilename || f.newFilename;
                response.json({
                    status: 'success',
                    file: {
                        id: id,
                        filename: original,
                        storedFilename: f.newFilename,
                        size: f.size,
                        mimetype: f.mimetype
                    }
                });
            });
        }
    ).catch(
        err => response.status(500).json({status: 'err', msg: String(err)})
    );
});

// Kontaktformular (öffentlich, aus dem Frontend)
router.post('/contact', (req, res) => {
    // express.json() hat den Body bereits geparst
    {
        const data = req.body || {};
        const name = String(data.name || '').trim().slice(0, 200);
        const email = String(data.email || '').trim().slice(0, 200);
        const message = String(data.message || '').trim().slice(0, 5000);
        const consent = !!data.consent;
        if (!name || !email || !message) {
            return res.status(400).json({status: 'err', msg: 'Name, E-Mail und Nachricht sind Pflichtfelder'});
        }
        if (!consent) {
            return res.status(400).json({status: 'err', msg: 'Bitte die Datenschutzerklärung bestätigen'});
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            return res.status(400).json({status: 'err', msg: 'Ungültige E-Mail-Adresse'});
        }

        let adminEmail = '';
        try { adminEmail = settings.get('adminEmail') || ''; } catch(e) {}

        const subject = 'Kontaktanfrage von ' + name + ' (' + email + ')';
        const text = 'Name: ' + name + '\nE-Mail: ' + email + '\nSeite: ' + String(data.pageID || '') + '\n\n' + message + '\n\nZeitstempel: ' + new Date().toISOString();

        const sendViaFile = () => {
            return fs.mkdir('./contents/mails', {recursive: true}).then(
                () => {
                    const file = './contents/mails/contact_' + Date.now() + '.eml';
                    const eml = 'From: ' + (adminEmail || 'noreply@julecms.local') + '\nTo: ' + (adminEmail || 'noreply@julecms.local') + '\nSubject: ' + subject + '\nDate: ' + new Date().toUTCString() + '\nContent-Type: text/plain; charset=utf-8\n\n' + text;
                    return fs.writeFile(file, eml).then(
                        () => res.json({status: 'success', msg: 'Nachricht gespeichert (kein SMTP konfiguriert)', sent: false})
                    );
                }
            );
        };

        let smtpHost = null, smtpPort = 587, smtpUser = null, smtpPass = null, smtpSecure = false;
        try {
            smtpHost = settings.get('smtpHost');
            smtpPort = settings.get('smtpPort') || 587;
            smtpUser = settings.get('smtpUser');
            smtpPass = settings.get('smtpPass');
            smtpSecure = settings.get('smtpSecure') || false;
        } catch(e) {}

        if (!smtpHost || !adminEmail) return sendViaFile();

        import('nodemailer').then(
            nodemailer => {
                const transporter = nodemailer.default.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpSecure,
                    auth: smtpUser ? {user: smtpUser, pass: smtpPass} : undefined
                });
                return transporter.sendMail({
                    from: adminEmail,
                    to: adminEmail,
                    replyTo: email,
                    subject: subject,
                    text: text
                }).then(
                    () => res.json({status: 'success', msg: 'Nachricht gesendet', sent: true})
                ).catch(
                    err => {
                        console.warn('Kontaktmail fehlgeschlagen:', err);
                        sendViaFile();
                    }
                );
            }
        ).catch(() => sendViaFile());
    }
});

// Datei ausliefern (öffentlich) – PDFs inline für Vorschau, sonst als Download
router.get('/getFile/:id/:filename', (req, res) => {
    const id = String(req.params.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = String(req.params.filename || '').replace(/[^a-zA-Z0-9._-]/g, '');
    if (!id || !filename) return res.status(400).json({status: 'err', msg: 'Ungültige Anfrage'});
    const dir = './contents/files';
    fs.readdir(dir).then(
        files => {
            const match = files.find(f => f.startsWith(id + '.'));
            if (!match) return res.status(404).json({status: 'err', msg: 'Datei nicht gefunden'});
            const filePath = dir + '/' + match;
            const isPdf = match.toLowerCase().endsWith('.pdf');
            const wantDownload = req.query.download === '1';
            const mime = isPdf ? 'application/pdf' : 'application/octet-stream';
            return fs.readFile(filePath).then(
                buf => {
                    res.setHeader('Content-Type', mime);
                    res.setHeader('Content-Length', buf.length);
                    res.setHeader('Content-Disposition', (wantDownload || !isPdf ? 'attachment' : 'inline') + '; filename="' + filename.replace(/"/g, '') + '"');
                    res.end(buf);
                }
            );
        }
    ).catch(
        () => res.status(404).json({status: 'err', msg: 'Datei nicht gefunden'})
    );
});

router.post('/sendTestMail', (req, res) => {
    let email = '';
    try { email = settings.get('adminEmail') || ''; } catch(e) {}
    if (!email) return res.status(400).json({status: 'err', msg: 'Keine Admin-E-Mail in den Einstellungen hinterlegt'});

    const subject = 'JuleCMS Testmail';
    let extraMsg = '';
    try { extraMsg = settings.get('testMailMessage') || ''; } catch(e) {}
    let text = 'Hallo,\n\ndies ist eine Testmail vom JuleCMS.\n\nZeitstempel: ' + new Date().toISOString() + '\n\nViele Gruesse\nJuleCMS';
    if (extraMsg) text = text + '\n\n---\n' + extraMsg;

    // SMTP aus settings.json (optional)
    let smtpHost = null, smtpPort = 587, smtpUser = null, smtpPass = null, smtpSecure = false;
    try {
        smtpHost = settings.get('smtpHost');
        smtpPort = settings.get('smtpPort') || 587;
        smtpUser = settings.get('smtpUser');
        smtpPass = settings.get('smtpPass');
        smtpSecure = settings.get('smtpSecure') || false;
    } catch(e) {}

    const sendViaFile = () => {
        return fs.mkdir('./contents/mails', {recursive: true}).then(
            () => {
                const file = './contents/mails/test_' + Date.now() + '.eml';
                const eml = 'From: ' + email + '\nTo: ' + email + '\nSubject: ' + subject + '\nDate: ' + new Date().toUTCString() + '\nContent-Type: text/plain; charset=utf-8\n\n' + text;
                return fs.writeFile(file, eml).then(
                    () => res.json({status: 'success', msg: 'Testmail gespeichert (kein SMTP konfiguriert)', file: file, sent: false, to: email})
                );
            }
        );
    };

    if (!smtpHost) return sendViaFile();

    import('nodemailer').then(
        nodemailer => {
            const transporter = nodemailer.default.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: smtpUser ? {user: smtpUser, pass: smtpPass} : undefined
            });
            return transporter.sendMail({
                from: email,
                to: email,
                subject: subject,
                text: text
            }).then(
                () => res.json({status: 'success', msg: 'Testmail versendet an ' + email, sent: true, to: email})
            ).catch(
                err => res.status(500).json({status: 'err', msg: 'SMTP-Fehler: ' + String(err)})
            );
        }
    ).catch(
        () => sendViaFile() // nodemailer nicht verfügbar -> Datei-Fallback
    );
});

// --- SMTP-Einstellungen ---
router.get('/smtpSettings', (req, res) => {
    let s = {};
    try {
        s = {
            smtpHost: settings.get('smtpHost') || '',
            smtpPort: settings.get('smtpPort') || 587,
            smtpUser: settings.get('smtpUser') || '',
            smtpSecure: settings.get('smtpSecure') || false,
            smtpPassSet: !!settings.get('smtpPass')
        };
    } catch(e) {}
    res.json(s);
});

router.post('/saveSmtpSettings', (req, res) => {
    const {smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure} = req.body;
    settings.set('smtpHost', smtpHost || '');
    settings.set('smtpPort', parseInt(smtpPort, 10) || 587);
    settings.set('smtpUser', smtpUser || '');
    settings.set('smtpSecure', !!smtpSecure);
    // Passwort nur überschreiben wenn nicht leer
    if (smtpPass && smtpPass.length > 0) {
        settings.set('smtpPass', smtpPass);
    }
    res.json({status: 'success', msg: 'SMTP gespeichert'});
});

// --- Test-Nachricht ---
router.get('/testMailMessage', (req, res) => {
    let msg = '';
    try { msg = settings.get('testMailMessage') || ''; } catch(e) {}
    res.json({testMailMessage: msg});
});

router.post('/saveTestMailMessage', (req, res) => {
    settings.set('testMailMessage', req.body.testMailMessage || '');
    res.json({status: 'success', testMailMessage: req.body.testMailMessage || ''});
});

// --- Max Bild-Auflösung ---
router.get('/maxImageResolution', (req, res) => {
    let val = 2200;
    try { val = settings.get('maxImageResolution') || 2200; } catch(e) {}
    res.json({maxImageResolution: val});
});

router.post('/saveMaxImageResolution', (req, res) => {
    let val = parseInt(req.body.maxImageResolution, 10);
    if (isNaN(val) || val < 160) val = 160;
    if (val > 8000) val = 8000;
    settings.set('maxImageResolution', val);
    res.json({status: 'success', maxImageResolution: val});
});

// --- Medien-Reihenfolge (DnD) ---
router.post('/saveMediaOrder', (req, res) => {
    const {order} = req.body;
    if (!Array.isArray(order)) return res.status(400).json({status: 'err', msg: 'order muss Array sein'});
    Promise.all(order.map((id, index) => {
        const file = `./contents/media/${id}.json`;
        return fs.readFile(file, 'utf8').then(
            raw => JSON.parse(raw)
        ).then(
            meta => {
                meta.order = index;
                meta.chDate = meta.chDate || Date.now();
                return fs.writeFile(file, JSON.stringify(meta));
            }
        ).catch(() => {}); // fehlende Datei ignorieren
    })).then(
        () => res.json({status: 'success', order})
    ).catch(
        err => res.status(500).json({status: 'err', msg: String(err)})
    );
});

// --- Admin-E-Mail ---
router.get('/adminEmail', (req, res) => {
    let email = '';
    try { email = settings.get('adminEmail') || ''; } catch(e) { email = ''; }
    res.json({adminEmail: email});
});

router.post('/saveAdminEmail', (req, res) => {
    const {adminEmail} = req.body;
    settings.set('adminEmail', adminEmail || '');
    res.json({status: 'success', adminEmail: adminEmail || ''});
});

// --- LLM API-Einstellungen ---
router.get('/llmSettings', (req, res) => {
    let llm = {};
    try { llm = settings.get('llm') || {}; } catch(e) { llm = {}; }
    res.json({
        provider: llm.provider || '',
        model: llm.model || '',
        hasApiKey: !!(llm.apiKey && llm.apiKey.length > 0),
        autoTranslate: llm.autoTranslate || {en: false, nl: false, fr: false},
        spellcheck: llm.spellcheck !== false
    });
});

router.post('/saveLlmSettings', (req, res) => {
    const {provider, model, apiKey, autoTranslate, spellcheck} = req.body;
    let llm = {};
    try { llm = settings.get('llm') || {}; } catch(e) { llm = {}; }
    llm.provider = provider || '';
    llm.model = model || '';
    // API-Key nur überschreiben wenn nicht leer
    if (apiKey && apiKey.length > 0) {
        llm.apiKey = apiKey;
    }
    if (autoTranslate && typeof autoTranslate === 'object') {
        llm.autoTranslate = {en: !!autoTranslate.en, nl: !!autoTranslate.nl, fr: !!autoTranslate.fr};
    }
    llm.spellcheck = spellcheck !== false;
    settings.set('llm', llm);
    res.json({status: 'success', provider: llm.provider, model: llm.model, hasApiKey: !!llm.apiKey, autoTranslate: llm.autoTranslate, spellcheck: llm.spellcheck});
});

// --- Manuelle Übersetzung (einmalig pro Klick) ---
router.post('/translate', (req, res) => {
    const {text, lang} = req.body;
    if (!text || !lang) return res.status(400).json({status: 'err', msg: 'text und lang erforderlich'});
    llm.translate(text, lang).then(
        translation => {
            if (translation === null || translation === '') {
                res.json({status: 'err', msg: 'Keine Übersetzung erhalten'});
            } else {
                res.json({status: 'success', translation});
            }
        }
    ).catch(
        err => res.status(500).json({status: 'err', msg: String(err.message || err)})
    );
});

// Rechtschreibkorrektur (nur Rechtschreibung, kein Stil) – manuell per Knopf
router.post('/spellcheck', (req, res) => {
    const {text} = req.body;
    if (!text || !String(text).trim()) return res.status(400).json({status: 'err', msg: 'text erforderlich'});
    llm.spellcheck(String(text)).then(
        corrected => {
            if (corrected === null || corrected === '') {
                res.json({status: 'err', msg: 'Keine Korrektur erhalten'});
            } else {
                res.json({status: 'success', text: corrected});
            }
        }
    ).catch(
        err => res.status(500).json({status: 'err', msg: String(err.message || err)})
    );
});

// --- Öffentliche Seitenstruktur fürs Frontend ---
router.get('/structure', (req, res) => {
    fs.readFile('./contents/structure.json', 'utf8').then(
        raw => res.json(JSON.parse(raw))
    ).catch(
        err => res.status(500).json({status: 'err', msg: String(err)})
    );
});

// --- Themes ---
router.get('/themes', (req, res) => {
    themes.list().then(
        list => res.json({
            themes: list,
            current: settings.get('theme') || 'default'
        })
    ).catch(
        err => res.status(500).json({status: 'err', msg: String(err)})
    );
});

router.post('/selectTheme', (req, res) => {
    const {theme} = req.body;
    if (!theme) return res.status(400).json({status: 'err', msg: 'Kein Theme angegeben'});
    themes.list().then(
        list => {
            if (!list.includes(theme)) {
                return res.status(404).json({status: 'err', msg: `Theme "${theme}" nicht gefunden`});
            }
            settings.set('theme', theme);
            res.json({status: 'success', theme, msg: 'Theme gespeichert – wird beim nächsten Server-Start übernommen'});
        }
    ).catch(
        err => res.status(500).json({status: 'err', msg: String(err)})
    );
});

export default router;