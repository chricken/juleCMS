'use strict';


import express from 'express';
import crypto from 'crypto';
import formidable from 'formidable';
import {promises as fs} from 'fs';
import manageContents from "./manageContents.js";
import Page from "./classes/Page.js";
import settings from "./settings.js";

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
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/juleToken=([A-Za-z0-9_-]+.[A-Za-z0-9_-]+.[A-Za-z0-9_-]+)/);
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
                    res.setHeader('Set-Cookie', `juleToken=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${30 * 24 * 60 * 60}`);
                    res.json({status: 'success', authenticated: true});
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
        res.setHeader('Set-Cookie', 'juleToken=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
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

export default router;