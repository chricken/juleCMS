'use strict';

import dom from "../../dom.js";
import elements from "../../elements.js";
import settings from "../../data.js";
import cfg from "../../settings.js";
import lang from "../../lang.js";
import helpers from "../../helpers.js";
import ajax from "../../ajax.js";

import CompSelect from "../Select/Select.js";
import CompInput from "../Input/Input.js";
import CompImage from "./Image.js";

import ModalUploadImages from "../../modal/UploadImages/UploadImages.js";
import ModalAddImage from '../../modal/AddImage/AddImage.js';

import CompLink from './Link.js';
import GridEditor from './GridEditor.js';
import TranslationButtons from '../TranslationButtons/TranslationButtons.js';

// Lookup-Table: welche Felder zeigt welcher Content-Typ?
const typeFields = {
    titleOnly: [],
    textOnly: ['content', 'links', 'tags'],
    textImageLeft: ['content', 'images', 'links', 'tags'],
    textImageRight: ['content', 'images', 'links', 'tags'],
    textImageBottom: ['content', 'images', 'links', 'tags'],
    gallery: ['images', 'layout', 'tags'],
    slideshow: ['images', 'tags'],
    contactForm: ['content', 'tags'],
    divider: [],
    newsletter: ['content', 'tags'],
    fileDownload: ['file', 'tags'],
    default: ['content', 'images', 'links', 'tags'],
};

// 5 Layout-Vorschläge für Bildraster (2/4/9 Bilder)

// Baut ein Grid aus einer Liste von [cs, rs]-Spannen (zeilenweise, erstes freies Rechteck)
const buildGrid = (cols, spans) => {
    const cells = [];
    let rows = 1;
    const fits = (c, r, cs, rs) => {
        if (c < 1 || c + cs - 1 > cols) return false;
        return !cells.some(o => !(c + cs <= o.c || c >= o.c + o.cs || r + rs <= o.r || r >= o.r + o.rs));
    };
    spans.forEach(([cs, rs]) => {
        let placed = false;
        for (let r = 1; r <= rows + rs && !placed; r++) {
            for (let c = 1; c <= cols && !placed; c++) {
                if (fits(c, r, cs, rs)) {
                    cells.push({c, r, cs, rs});
                    rows = Math.max(rows, r + rs - 1);
                    placed = true;
                }
            }
        }
        if (!placed) {
            const r = rows + 1;
            cells.push({c: 1, r, cs: Math.min(cs, cols), rs});
            rows = r + rs - 1;
        }
    });
    cells.sort((a, b) => (a.r - b.r) || (a.c - b.c));
    return {cols, rows, cells};
};

const spansFor = (n, fn) => Array.from({length: Math.max(1, n)}, (_, i) => fn(i, n));

const galleryLayouts = [
    {id: 'grid-equal', label: 'Gleichmäßig', icon: '▦', build: n => buildGrid(4, spansFor(n, () => [1, 1]))},
    {id: 'grid-first-big', label: 'Erstes groß', icon: '▣', build: n => buildGrid(4, spansFor(n, i => (i === 0 ? [2, 2] : [1, 1])))},
    {id: 'grid-last-big', label: 'Letztes groß', icon: '▤', build: n => buildGrid(4, spansFor(n, (i, m) => (i === m - 1 ? [2, 2] : [1, 1])))},
    {id: 'grid-center-big', label: 'Mitte groß', icon: '▩', build: n => buildGrid(4, spansFor(n, i => (i === Math.floor((n - 1) / 2) ? [2, 2] : [1, 1])))},
    {id: 'grid-mixed', label: 'Gemischt', icon: '▥', build: n => buildGrid(4, spansFor(n, i => (i % 3 === 0 ? [2, 1] : [1, 1])))},
    {id: 'grid-cols3', label: 'Spalten à 3 Zeilen', icon: '▮', build: n => buildGrid(Math.max(1, n), spansFor(n, () => [1, 3]))},
    {id: 'custom', label: 'Eigenes Raster', icon: '✥', build: null},
];

const Content = ({
                     data = {},
                     parent = null,
                     index = null,
                     onRemove = () => {},
                     onDragStart = () => {},
                     onDragEnd = () => {},
                 } = {}) => {

    const saveContent = helpers.debouncer(ajax.saveContent, 1000)

    const container = dom.create({
        parent,
        cssClassName: 'container content edit transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                if (evt.target.closest('input, textarea, select, button, a, .type-icon, .btn-delete, .dragger, .content-opener, .container-inner, img')) return;
                if (!container.classList.contains('open')) {
                    container.classList.add('open');
                    rescale();
                }
            },
            mousedown(evt) { evt.stopPropagation(); },
            dragstart(evt) {
                settings.dragID = data.id;
                onDragStart();
                evt.dataTransfer.setDragImage(container, 0, 0);
            },
            dragend() {
                container.draggable = false;
                onDragEnd();
            }
        }
    })

    const elInner = dom.create({ parent: container })

    dom.create({
        content: '⯈',
        parent: elInner,
        cssClassName: 'content-opener transit',
        listeners: {
            click(evt) {
                evt.stopPropagation();
                if (container.classList.contains('open')) {
                    container.classList.remove('open');
                    container.style.height = null;
                } else {
                    container.classList.add('open');
                    rescale();
                }
            }
        }
    })

    dom.create({
        parent: elInner,
        content: '✖',
        cssClassName: 'btn-delete transit',
        listeners: {
            click(evt) { evt.stopPropagation(); onRemove(data); }
        }
    })

    dom.create({
        parent: elInner,
        cssClassName: 'dragger transit',
        listeners: {
            mousedown(evt) { evt.stopPropagation(); container.draggable = true; },
        }
    })


    // ===== Titel (immer ganz oben) =====
    CompInput({
        parent: elInner,
        legend: lang.getPhrase('title'),
        value: data.title,
        isTitle: true,
        translation: {data, field: 'title', saveFn: (d) => saveContent(d)},
        onInput(value) { data.title = value; saveContent(data); }
    })

    // ===== Typ-Auswahl =====
    const typeRow = dom.create({ parent: elInner, cssClassName: 'type-row' })
    dom.create({ parent: typeRow, tagName: 'span', cssClassName: 'type-legend', content: lang.getPhrase('type') })
    const typeSelector = dom.create({ parent: typeRow, cssClassName: 'type-selector' })

    cfg.elementTypes.forEach(type => {
        const btn = dom.create({
            parent: typeSelector,
            cssClassName: 'type-icon' + (data.type === type ? ' selected' : ''),
            attr: {title: lang.getPhrase(type)},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    data.type = type;
                    typeSelector.querySelectorAll('.type-icon').forEach(el => el.classList.remove('selected'));
                    btn.classList.add('selected');
                    saveContent(data);
                    renderFields();
                }
            }
        })
        dom.create({
            parent: btn,
            tagName: 'img',
            attr: { src: `/backend/assets/img/icons/${type}.svg`, alt: lang.getPhrase(type) },
        })
    })

    // ===== Dynamische Felder je nach Typ =====
    const fieldsEl = dom.create({ parent: elInner, cssClassName: 'content-fields' })

    let imagesOpen = false; // klappt die Bilder-Box auch nach renderFields() nicht zu

    // Skalierung (Höhe) des Elements neu ausführen, wenn es offen ist
    const rescale = () => {
        if (container.classList.contains('open')) {
            container.style.height = elInner.getBoundingClientRect().height + 30 + 'px';
        }
    };

    const renderImages = (parent) => {
        const containerImages = dom.create({
            parent,
            cssClassName: 'container container-inner container-collapsable container-images' + (imagesOpen ? ' open' : '')
        })

        dom.create({
            cssClassName: 'indicatorOpen-links',
            parent: containerImages,
            content: '⯈',
            listeners: {
                click() {
                    containerImages.classList.toggle('open');
                    imagesOpen = containerImages.classList.contains('open');
                    rescale();
                }
            }
        })

        dom.create({
            parent: containerImages,
            tagName: 'h3',
            content: lang.getPhrase('images'),
            cssClassName: 'container-inner-title transit',
            listeners: {
                click() {
                    containerImages.classList.toggle('open');
                    imagesOpen = containerImages.classList.contains('open');
                    rescale();
                }
            }
        })

        const elementsDraggers = [];
        let draggedElement = null;

        data.images.forEach((imageID, index) => {
            const elImage = CompImage({
                parent: containerImages,
                imageID,
                index,
                numbered: data.type === 'gallery',
                draggable: true,
                onDelete: () => {
                    data.images.splice(index, 1);
                    renderFields();
                    rescale();
                    saveContent(data);
                },
                onStartDrag(evt, elImg) {
                    const dragContainer = dom.create({
                        parent: document.body,
                        style: { background: 'white', padding: '10px', border: '1px solid #ccc', position: 'absolute', left: '-9999px' }
                    })
                    draggedElement = { imageID, index }
                    const dragImage = elImg.cloneNode(true);
                    dragImage.style.width = '100px';
                    dragImage.style.height = 'auto';
                    dragContainer.appendChild(dragImage);
                    evt.dataTransfer.setDragImage(dragContainer, 0, 0);
                    setTimeout(() => document.body.removeChild(dragContainer), 50);
                },
                onDragOver(evt) { evt.currentTarget.classList.add('drag-over'); },
                onDragLeave(evt) { evt.currentTarget.classList.remove('drag-over'); },
                onEndDrag(evt) { elementsDraggers.forEach(el => el.classList.remove('drag-over')) },
                onDrop(evt) {
                    data.images.splice(draggedElement.index, 1);
                    if (draggedElement.index < index) {
                        data.images.splice(index, 0, draggedElement.imageID);
                    } else {
                        data.images.splice(index + 1, 0, draggedElement.imageID);
                    }
                    saveContent(data);
                    renderFields();
                    rescale();
                },
                onImageLoaded(evt) { rescale(); }
            })
            elementsDraggers.push(elImage)
        })

        const elButtons = dom.create({ parent: containerImages })

        dom.create({
            parent: elButtons,
            tagName: 'button',
            content: lang.getPhrase('addImage'),
            cssClassName: 'button button-small',
            listeners: {
                click: () => {
                    ModalAddImage({
                        onSelected(id) {
                            data.images.push(id);
                            renderFields();
                            rescale();
                            saveContent(data);
                        }
                    })
                }
            }
        })

        dom.create({
            parent: elButtons,
            tagName: 'button',
            content: lang.getPhrase('uploadImages'),
            cssClassName: 'button button-small',
            listeners: {
                click: () => {
                    ModalUploadImages({
                        onUploaded(ids) {
                            if (ids && ids.length) {
                                data.images.push(...ids);
                                renderFields();
                                rescale();
                                saveContent(data);
                            }
                        }
                    })
                }
            }
        })
    }

    const renderLinks = (parent) => {
        const containerLinks = dom.create({
            parent,
            cssClassName: 'container container-inner container-collapsable'
        })

        dom.create({
            cssClassName: 'indicatorOpen-links transit',
            parent: containerLinks,
            content: '⯈',
            listeners: {
                click() {
                    containerLinks.classList.toggle('open');
                    rescale();
                }
            }
        })

        dom.create({
            parent: containerLinks,
            tagName: 'h3',
            content: lang.getPhrase('links'),
            cssClassName: 'container-inner-title',
            listeners: {
                click() {
                    containerLinks.classList.toggle('open');
                    rescale();
                }
            }
        })

        data.links.forEach((link, index) => CompLink({
            link,
            index,
            numGesamt: data.links.length,
            parent: containerLinks,
            saveContent: () => { saveContent(data); },
            renderLinks: () => {
                renderFields();
                rescale();
            },
            removeLink: () => { data.links = data.links.filter(l => l !== link); },
            moveUp: () => {
                data.links.splice(index - 1, 0, data.links.splice(index, 1)[0]);
                renderFields();
                rescale();
            },
            moveDown: () => {
                data.links.splice(index + 1, 0, data.links.splice(index, 1)[0]);
                renderFields();
                rescale();
            }
        }))

        dom.create({
            parent: containerLinks,
            tagName: 'button',
            content: lang.getPhrase('addLink'),
            cssClassName: 'button button-small',
            listeners: {
                click: () => {
                    data.links.push({ legend: '', url: '', target: '_blank' })
                    saveContent(data);
                    renderFields();
                    rescale();
                }
            }
        })
    }

    // Rendert nur die Felder, die zum aktuellen Typ passen
    const renderFields = () => {
        fieldsEl.innerHTML = '';
        const fields = typeFields[data.type] || typeFields.default;

        fields.forEach(f => {
            if (f === 'content') {
                CompInput({
                    parent: fieldsEl,
                    legend: lang.getPhrase('text'),
                    value: data.content,
                    multiline: true,
                    translation: {data, field: 'content', saveFn: (d) => saveContent(d)},
                    onInput(value) { data.content = value; saveContent(data); }
                })
            }
            if (f === 'images') renderImages(fieldsEl);
            if (f === 'links') renderLinks(fieldsEl);
            if (f === 'layout') {
                const layoutRow = dom.create({ parent: fieldsEl, cssClassName: 'type-row' })
                dom.create({ parent: layoutRow, tagName: 'span', cssClassName: 'type-legend', content: lang.getPhrase('layout') })
                const layoutSel = dom.create({ parent: layoutRow, cssClassName: 'type-selector' })
                galleryLayouts.forEach(l => {
                    const btn = dom.create({
                        parent: layoutSel,
                        cssClassName: 'type-icon' + ((data.layout || 'grid-equal') === l.id ? ' selected' : ''),
                        content: l.icon,
                        attr: {title: l.label, style: 'font-size:20px;'},
                        listeners: {
                            click(evt) {
                                evt.stopPropagation();
                                data.layout = l.id;
                                if (l.build) data.grid = l.build((data.images || []).length || 1); // feste Vorlage anwenden
                                layoutSel.querySelectorAll('.type-icon').forEach(el => el.classList.remove('selected'));
                                btn.classList.add('selected');
                                saveContent(data);
                                renderFields(); // Grid-Editor ein-/ausblenden
                                rescale();
                            }
                        }
                    })
                })
            }
            if (f === 'layout') {
                // Raster-Editor bei jedem Layout anzeigen (Preset wird direkt angewendet und gezeigt)
                const geWrap = dom.create({ parent: fieldsEl, cssClassName: 'grid-editor-wrap' })
                GridEditor({
                    parent: geWrap,
                    data,
                    saveFn: (d) => {
                        if (d.layout !== 'custom') d.layout = 'custom'; // manuelle Änderung = eigenes Raster
                        saveContent(d);
                    }
                })
                let p2 = new URL(import.meta.url).pathname;
                p2 = p2.substring(0, p2.lastIndexOf('/') + 1) + 'GridEditor.css';
                dom.create({tagName: 'link', attr: {href: p2, rel: 'stylesheet'}, parent: geWrap})
            }
            if (f === 'file') {
                const fileRow = dom.create({ parent: fieldsEl, cssClassName: 'container-input' })
                dom.create({ parent: fileRow, tagName: 'span', cssClassName: 'legendInput', content: lang.getPhrase('file') })
                const inpFile = dom.create({
                    parent: fileRow,
                    tagName: 'input',
                    type: 'file',
                    attr: {style: 'display:block;margin-top:6px;'},
                    listeners: {
                        change(evt) {
                            const f = evt.target.files[0];
                            if (!f) return;
                            const fd = new FormData();
                            fd.append('file', f);
                            fd.append('itemID', data.id);
                            ajax.uploadFile(fd).then(res => {
                                if (res && res.status === 'success') {
                                    data.file = res.file;
                                    saveContent(data);
                                    renderFields();
                                }
                            });
                        }
                    }
                })
                if (data.file && data.file.filename) {
                    dom.create({
                        parent: fileRow,
                        content: '📎 ' + data.file.filename + (data.file.size ? ' (' + Math.round(data.file.size/1024) + ' KB)' : ''),
                        cssClassName: 'info',
                    })
                }
                dom.create({ parent: fileRow, tagName: 'p', cssClassName: 'settings-hint', content: lang.getPhrase('fileHint') })
            }
            if (f === 'tags') {
                CompInput({
                    parent: fieldsEl,
                    legend: lang.getPhrase('tags'),
                    value: data.tags,
                    valueIsArray: true,
                    translation: {data, field: 'tags', saveFn: (d) => saveContent(d), isArray: true},
                    onInput(value) { data.tags = value; saveContent(data); }
                })
            }
        })

        // Info (ID, Datum) immer unten
        dom.create({ parent: fieldsEl, content: 'ID: ' + data.id, cssClassName: 'info' })
        dom.create({ parent: fieldsEl, content: `${lang.getPhrase('createdAt')}: ` + new Date(data.crDate).toLocaleDateString(), cssClassName: 'info' })
        dom.create({ parent: fieldsEl, content: `${lang.getPhrase('changedAt')}: ` + new Date(data.chDate).toLocaleDateString(), cssClassName: 'info' })

        if (container.classList.contains('open')) {
            rescale();
        }
    }

    renderFields();

    let path = new URL(import.meta.url).pathname;
    path = `${path.substring(0, path.lastIndexOf('/') + 1)}Content.css`;

    dom.create({
        tagName: 'link',
        attr: { href: path, rel: 'stylesheet' },
        parent: elements.page
    })

};

export default Content;
