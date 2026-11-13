'use strict';

// Rendert ein Inhaltselement je nach Typ.
// Bilder werden "as is" eingebunden: groesstes verfuegbares resized
// (das Original wird serverseitig nach dem Resize geloescht).

import dom from '/cms/js/dom.js';
import ajax from '/cms/js/ajax.js';
import renderMD from '/cms/js/markdown.js';

const imageURL = (meta) => {
    if (!meta || !meta.resized || !meta.resized.length) return '';
    return `/api/getImg/media/${meta.resized[0].filename}`; // resized ist absteigend sortiert
}

const renderImage = ({parent, imageID, cssClassName = ''}) => {
    ajax.loadJSON(`/api/getImgMetaData/media/${imageID}`).then(
        res => {
            const meta = res.payload;
            dom.create({
                tagName: 'img',
                parent,
                src: imageURL(meta),
                attr: {alt: meta.altName || meta.title || ''},
                cssClassName: 'content-image ' + cssClassName,
            })
        }
    ).catch(
        console.warn
    )
}

const renderImages = ({parent, images = [], cssClassName = ''}) => {
    const wrap = dom.create({parent, cssClassName: 'content-images ' + cssClassName})
    images.forEach(imageID => renderImage({parent: wrap, imageID}))
}

// pdf.js wird dynamisch per CDN geladen (nur bei Bedarf, z.B. PDF-Vorschau)
let pdfjsPromise = null;
const loadPdfjs = () => {
    if (pdfjsPromise) return pdfjsPromise;
    pdfjsPromise = new Promise((resolve, reject) => {
        if (window.pdfjsLib) return resolve(window.pdfjsLib);
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(window.pdfjsLib);
        };
        s.onerror = () => reject(new Error('pdf.js konnte nicht geladen werden'));
        document.head.append(s);
    });
    return pdfjsPromise;
}

// Rendert Seite 1 eines PDFs als Canvas-Vorschau
const renderPdfPreview = ({parent, file}) => {
    const wrap = dom.create({parent, cssClassName: 'content-pdf-preview'});
    loadPdfjs().then(
        pdfjs => {
            fetch(`/api/getFile/${file.id}/${encodeURIComponent(file.filename)}`).then(
                r => r.arrayBuffer()
            ).then(
                buf => pdfjs.getDocument({data: buf}).promise
            ).then(
                pdf => pdf.getPage(1)
            ).then(
                page => {
                    const base = page.getViewport({scale: 1});
                    const maxW = wrap.clientWidth || 600;
                    const scale = Math.min(1.5, Math.max(0.5, maxW / base.width));
                    const vp = page.getViewport({scale});
                    const canvas = dom.create({tagName: 'canvas', parent: wrap});
                    canvas.width = vp.width;
                    canvas.height = vp.height;
                    return page.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise;
                }
            ).catch(
                err => {
                    console.warn('PDF-Vorschau fehlgeschlagen', err);
                    wrap.remove();
                }
            );
        }
    ).catch(
        () => { /* pdf.js nicht verfuegbar – nur Download-Link bleibt */ }
    );
}

const renderContactForm = ({parent, item, pageID}) => {
    if (item.title) dom.create({tagName: 'h2', content: item.title, parent});
    if (item.content) dom.create({parent, cssClassName: 'content-md', content: renderMD(item.content)});

    const form = dom.create({tagName: 'form', parent, cssClassName: 'contact-form'});
    const mkField = (labelText, input) => {
        const w = dom.create({parent: form, cssClassName: 'form-field'});
        dom.create({tagName: 'label', content: labelText, parent: w});
        w.append(input);
        return w;
    };
    const nameIn = dom.create({tagName: 'input', attr: {type: 'text', name: 'name', required: 'required'}});
    const mailIn = dom.create({tagName: 'input', attr: {type: 'email', name: 'email', required: 'required'}});
    const msgIn = dom.create({tagName: 'textarea', attr: {name: 'message', rows: '6', required: 'required'}});
    mkField('Name', nameIn);
    mkField('E-Mail', mailIn);
    mkField('Nachricht', msgIn);

    const consentWrap = dom.create({parent: form, cssClassName: 'form-field form-consent'});
    const consent = dom.create({tagName: 'input', attr: {type: 'checkbox', id: 'contact-consent', name: 'consent', required: 'required'}});
    consentWrap.append(consent);
    dom.create({
        tagName: 'label',
        parent: consentWrap,
        content: 'Ich stimme der Verarbeitung meiner Daten zum Zweck der Kontaktaufnahme zu.',
        attr: {for: 'contact-consent'},
    });

    const status = dom.create({parent: form, cssClassName: 'form-status'});
    const submitBtn = dom.create({tagName: 'button', parent: form, type: 'submit', content: 'Nachricht senden', cssClassName: 'button'});

    form.addEventListener('submit', evt => {
        evt.preventDefault();
        submitBtn.disabled = true;
        status.textContent = '';
        status.className = 'form-status';
        ajax.sendContact({
            name: nameIn.value,
            email: mailIn.value,
            message: msgIn.value,
            consent: consent.checked,
            pageID: pageID || '',
        }).then(
            res => {
                submitBtn.disabled = false;
                if (res && res.status === 'success') {
                    status.textContent = 'Vielen Dank! Ihre Nachricht wurde übermittelt.';
                    status.classList.add('ok');
                    form.reset();
                } else {
                    status.textContent = (res && res.msg) ? res.msg : 'Beim Senden ist ein Fehler aufgetreten.';
                    status.classList.add('err');
                }
            }
        ).catch(
            () => {
                submitBtn.disabled = false;
                status.textContent = 'Beim Senden ist ein Fehler aufgetreten.';
                status.classList.add('err');
            }
        );
    });
}

const renderNewsletter = ({parent, item}) => {
    if (item.title) dom.create({tagName: 'h2', content: item.title, parent});
    if (item.content) dom.create({parent, cssClassName: 'content-md', content: renderMD(item.content)});

    // Nur FE-Element: editierbarer Text, die Anmeldung selbst kommt später
    const form = dom.create({tagName: 'form', parent, cssClassName: 'newsletter-form'});
    const mailIn = dom.create({tagName: 'input', attr: {type: 'email', name: 'email', placeholder: 'E-Mail-Adresse', required: 'required'}});
    dom.create({tagName: 'button', parent: form, type: 'submit', content: 'Anmelden', cssClassName: 'button'});
    form.prepend(mailIn);
    const status = dom.create({parent: form, cssClassName: 'form-status'});
    form.addEventListener('submit', evt => {
        evt.preventDefault();
        status.textContent = 'Danke für Ihre Anmeldung!';
        status.className = 'form-status ok';
        form.reset();
    });
}

const renderFileDownload = ({parent, item}) => {
    if (item.title) dom.create({tagName: 'h2', content: item.title, parent});
    if (item.content) dom.create({parent, cssClassName: 'content-md', content: renderMD(item.content)});

    const f = item.file;
    if (!f || !f.id) return;

    const isPdf = (f.filename || '').toLowerCase().endsWith('.pdf');
    const sizeKb = f.size ? Math.round(f.size / 1024) : null;

    const box = dom.create({parent, cssClassName: 'content-filedownload'});
    dom.create({
        tagName: 'a',
        parent: box,
        href: `/api/getFile/${f.id}/${encodeURIComponent(f.filename)}?download=1`,
        content: '📎 ' + (f.filename || 'Datei') + (sizeKb !== null ? ' (' + sizeKb + ' KB)' : ''),
        cssClassName: 'file-download-link',
    });
    if (isPdf) renderPdfPreview({parent: box, file: f});
}

// Eigenes Raster (Backend-Layout-Engine): Bild i landet in Zelle i (Lese-Reihenfolge)
const renderCustomGallery = ({parent, item}) => {
    const g = item.grid || {cols: 4, cells: []};
    const wrap = dom.create({parent, cssClassName: 'content-images gallery-custom'});
    wrap.style.display = 'grid';
    wrap.style.gridTemplateColumns = `repeat(${g.cols || 4}, 1fr)`;
    wrap.style.gridAutoRows = '160px';
    wrap.style.gap = '10px';
    (item.images || []).forEach((imageID, i) => {
        const cell = (g.cells || [])[i] || {c: i + 1, r: 1, cs: 1, rs: 1};
        const cellEl = dom.create({parent: wrap, cssClassName: 'gallery-custom-cell'});
        cellEl.style.gridColumn = `${cell.c} / span ${cell.cs}`;
        cellEl.style.gridRow = `${cell.r} / span ${cell.rs}`;
        renderImage({parent: cellEl, imageID});
    });
    return wrap;
}

const Content = ({item = {}, parent = null, pageID = ''} = {}) => {
    if (!parent) return;
    if (item.visible === false) return;

    const container = dom.create({
        parent,
        cssClassName: `content content-${item.type || 'default'}`,
    })

    switch (item.type) {
        case 'titleOnly':
            dom.create({tagName: 'h2', content: item.title, parent: container})
            break;

        case 'divider':
            dom.create({tagName: 'hr', parent: container, cssClassName: 'content-divider'})
            break;

        case 'textImageLeft':
        case 'textImageRight': {
            const row = dom.create({parent: container, cssClassName: 'content-row ' + item.type})
            const text = dom.create({cssClassName: 'content-text'})
            dom.create({tagName: 'h2', content: item.title, parent: text})
            dom.create({parent: text, cssClassName: 'content-md', content: renderMD(item.content)})
            const media = dom.create({cssClassName: 'content-media'})
            renderImages({parent: media, images: item.images})
            // Left: Text dann Bild – Right: Bild dann Text
            if (item.type === 'textImageRight') {
                row.append(media, text);
            } else {
                row.append(text, media);
            }
            break;
        }

        case 'textImageBottom': {
            dom.create({tagName: 'h2', content: item.title, parent: container})
            dom.create({parent: container, cssClassName: 'content-md', content: renderMD(item.content)})
            renderImages({parent: container, images: item.images})
            break;
        }

        case 'gallery': {
            if (item.title) dom.create({tagName: 'h2', content: item.title, parent: container})
            if (item.content) dom.create({parent: container, cssClassName: 'content-md', content: renderMD(item.content)})
            if (item.grid && Array.isArray(item.grid.cells) && item.grid.cells.length) {
                renderCustomGallery({parent: container, item})
            } else {
                renderImages({
                    parent: container,
                    images: item.images,
                    cssClassName: 'gallery-layout-' + (item.layout || 'grid-equal'),
                })
            }
            break;
        }

        case 'slideshow': {
            if (item.title) dom.create({tagName: 'h2', content: item.title, parent: container})
            if (item.content) dom.create({parent: container, cssClassName: 'content-md', content: renderMD(item.content)})
            renderImages({parent: container, images: item.images})
            break;
        }

        case 'contactForm':
            renderContactForm({parent: container, item, pageID})
            break;

        case 'newsletter':
            renderNewsletter({parent: container, item})
            break;

        case 'fileDownload':
            renderFileDownload({parent: container, item})
            break;

        case 'textOnly':
        default:
            if (item.title) dom.create({tagName: 'h2', content: item.title, parent: container})
            if (item.content) dom.create({parent: container, cssClassName: 'content-md', content: renderMD(item.content)})
            if (item.images && item.images.length) renderImages({parent: container, images: item.images})
            break;
    }

    // Links
    if (item.links && item.links.length) {
        const ul = dom.create({tagName: 'ul', parent: container, cssClassName: 'content-links'})
        item.links.forEach(link => {
            const li = dom.create({tagName: 'li', parent: ul})
            dom.create({
                tagName: 'a',
                href: link.url,
                target: link.target || '_self',
                content: link.legend || link.url,
                parent: li,
            })
        })
    }

    return container;
}

export default Content;
