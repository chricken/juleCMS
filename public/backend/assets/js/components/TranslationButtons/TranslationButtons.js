'use strict';

// Manuelle Übersetzung: pro aktiver Sprache ein Ampel-Icon + Übersetzen-Button.
// rot = keine/alt, gelb = läuft, grün = aktuell.
// Icon-Klick öffnet Modal zum Editieren. Übersetzen-Button startet LLM-Anfrage.

import dom from "../../dom.js";
import ajax from "../../ajax.js";
import lang from "../../lang.js";
import Modal from "../../modal/modal.js";

// Cache mit kurzer TTL, damit Einstellungs-Änderungen ohne Reload greifen
let settingsCache = null; // {langs, spell, ts}
const LANGS_CACHE_TTL = 5000;

// Registrierte Button-Gruppen (für markOutdated ohne DOM-Referenz)
const registered = [];

const loadSettings = () => {
    if (settingsCache && (Date.now() - settingsCache.ts) < LANGS_CACHE_TTL) return Promise.resolve(settingsCache);
    return ajax.loadLlmSettings().then(
        res => {
            const at = res.autoTranslate || {};
            settingsCache = {
                langs: Object.keys(at).filter(l => at[l]),
                spell: res.spellcheck !== false,
                llmOk: !!(res.provider && res.hasApiKey),
                ts: Date.now(),
            };
            return settingsCache;
        }
    ).catch(() => ({langs: [], spell: true, llmOk: false, ts: Date.now()}));
};

const loadActiveLangs = () => loadSettings().then(s => s.langs);

const invalidateCache = () => { settingsCache = null; };

const getStatus = (data, field, langCode, isArray, index) => {
    const tf = field + '_' + langCode;
    const srcKey = tf + '_src';
    let val, src;
    if (isArray && index !== null) {
        val = (data[tf] || [])[index];
        src = (data[srcKey] || [])[index];
    } else {
        val = data[tf];
        src = data[srcKey];
    }
    if (!val) return 'red';
    const orig = isArray && index !== null ? (data[field] || [])[index] : data[field];
    if (src !== undefined && src !== orig) return 'red';
    return 'green';
};

const setStatus = (iconEl, status) => {
    iconEl.classList.remove('status-red', 'status-yellow', 'status-green');
    iconEl.classList.add('status-' + status);
};

const markOutdated = (wrap, data, field, isArray, index) => {
    if (!wrap) return;
    wrap.querySelectorAll('.trans-icon').forEach(icon => {
        const langCode = icon.dataset.lang;
        setStatus(icon, getStatus(data, field, langCode, isArray, index));
    });
};

// Aktualisiert alle registrierten Gruppen, die zu data+field passen
const markOutdatedFor = (data, field, isArray = false, index = null) => {
    registered.forEach(entry => {
        if (entry.data === data && entry.field === field && !!entry.isArray === !!isArray && entry.index === index) {
            entry.wrap.querySelectorAll('.trans-icon').forEach(icon => {
                setStatus(icon, getStatus(entry.data, entry.field, icon.dataset.lang, entry.isArray, entry.index));
            });
            const spellBtn = entry.wrap.querySelector('.spell-btn');
            if (spellBtn && !spellBtn.classList.contains('status-yellow')) setStatus(spellBtn, 'red');
        }
    });
};

const addTranslationButtons = async (opts) => {
    const {parent = null, data = {}, field = '', saveFn = () => {}, isArray = false, index = null, setValue = null} = opts;
    if (!parent) return null;

    const s = await loadSettings();
    if (!s.langs.length && !s.spell) return null;

    const wrap = dom.create({parent, cssClassName: 'translation-buttons'});

    // Kein LLM konfiguriert: Hinweis statt der Buttons
    if (!s.llmOk) {
        dom.create({
            parent: wrap,
            cssClassName: 'translation-hint',
            content: lang.getPhrase('llmNotConfigured'),
        });
        return wrap;
    }

    const langs = s.langs;
    registered.push({wrap, data, field, isArray, index});

    const getOrig = () => isArray && index !== null ? (data[field] || [])[index] : data[field];

    langs.forEach(langCode => {
        const item = dom.create({parent: wrap, cssClassName: 'trans-item'});

        const icon = dom.create({
            tagName: 'button',
            type: 'button',
            content: '文A',
            cssClassName: 'trans-icon status-' + getStatus(data, field, langCode, isArray, index),
            parent: item,
            attr: {type: 'button', tabindex: '-1', title: langCode.toUpperCase(), 'data-lang': langCode},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    openModal({data, field, langCode, saveFn, isArray, index, icon, getOrig});
                }
            }
        });
        dom.create({tagName: 'span', content: langCode, cssClassName: 'trans-lang', parent: item});

        dom.create({
            tagName: 'button',
            type: 'button',
            content: '↻',
            cssClassName: 'trans-go',
            parent: item,
            attr: {type: 'button', tabindex: '-1', title: lang.getPhrase('translateAuto') + ' (' + langCode.toUpperCase() + ')'},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    runTranslation({data, field, langCode, saveFn, isArray, index, icon, getOrig});
                }
            }
        });
    });

    // Rechtschreib-Knopf (de) im selben Container – nur wenn in den Settings aktiv
    if (s.spell) {
        const spellItem = dom.create({parent: wrap, cssClassName: 'trans-item'});
        const spellBtn = dom.create({
            tagName: 'button',
            type: 'button',
            content: '✓',
            cssClassName: 'spell-btn status-green',
            parent: spellItem,
            attr: {type: 'button', tabindex: '-1', title: lang.getPhrase('spellcheck')},
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    runSpellcheck({data, field, isArray, index, spellBtn, saveFn, getOrig, setValue});
                }
            }
        });
        dom.create({tagName: 'span', content: 'de', cssClassName: 'trans-lang', parent: spellItem});
    }

    let path = new URL(import.meta.url).pathname;
    path = path.substring(0, path.lastIndexOf('/') + 1) + 'TranslationButtons.css';
    dom.create({tagName: 'link', attr: {href: path, rel: 'stylesheet'}, parent: wrap});

    return wrap;
};

// LLM-Anfrage für ein Feld starten: gelb → grün/rot
const runTranslation = (opts) => {
    const {data, field, langCode, saveFn, isArray, index, icon, getOrig, ta} = opts;
    const orig = getOrig();
    if (!orig) return;
    setStatus(icon, 'yellow');
    if (ta) ta.value = lang.getPhrase('translateRunning');

    ajax.translate(orig, langCode).then(result => {
        const tf = field + '_' + langCode;
        const srcKey = tf + '_src';
        if (result.status === 'success' && result.translation) {
            if (isArray && index !== null) {
                if (!Array.isArray(data[tf])) data[tf] = [];
                if (!Array.isArray(data[srcKey])) data[srcKey] = [];
                data[tf][index] = result.translation;
                data[srcKey][index] = orig;
            } else {
                data[tf] = result.translation;
                data[srcKey] = orig;
            }
            setStatus(icon, 'green');
            if (ta) ta.value = result.translation;
            saveFn(data);
        } else {
            setStatus(icon, 'red');
            if (ta) ta.value = (isArray && index !== null ? (data[tf] || [])[index] : data[tf]) || '';
        }
    }).catch(() => setStatus(icon, 'red'));
};

// Rechtschreibkorrektur des deutschen Quelltextes per LLM (nur Rechtschreibung, kein Stil)
const runSpellcheck = (opts) => {
    const {data, field, isArray, index, spellBtn, saveFn, getOrig, setValue} = opts;
    const orig = getOrig();
    if (!orig || !String(orig).trim()) return;
    setStatus(spellBtn, 'yellow');
    ajax.spellcheck(String(orig)).then(
        res => {
            if (res && res.status === 'success' && res.text !== undefined) {
                if (isArray && index !== null) {
                    if (!Array.isArray(data[field])) data[field] = [];
                    data[field][index] = res.text;
                } else {
                    data[field] = res.text;
                }
                if (setValue) setValue(res.text);
                saveFn(data);
                markOutdatedFor(data, field, isArray, index); // färbt Übersetzungen rot – Spell-Button danach grün setzen
                setStatus(spellBtn, 'green');
            } else {
                setStatus(spellBtn, 'red');
            }
        }
    ).catch(() => setStatus(spellBtn, 'red'));
};

// Modal: Übersetzung anzeigen/editieren + automatisch übersetzen
const openModal = (opts) => {
    const {data, field, langCode, saveFn, isArray, index, icon, getOrig} = opts;
    const tf = field + '_' + langCode;
    let currentVal;
    if (isArray && index !== null) currentVal = (data[tf] || [])[index] || '';
    else currentVal = data[tf] || '';

    const elInner = Modal({
        legend: lang.getPhrase('translateModalTitle') + ' (' + langCode.toUpperCase() + ')',
    });

    dom.create({tagName: 'p', cssClassName: 'translation-hint', content: lang.getPhrase('translateHint'), parent: elInner});

    const origWrap = dom.create({parent: elInner, cssClassName: 'translation-original'});
    dom.create({tagName: 'span', cssClassName: 'translation-original-label', content: lang.getPhrase('translateOriginal') + ': ', parent: origWrap});
    dom.create({tagName: 'span', content: getOrig() || '', parent: origWrap});

    const ta = dom.create({tagName: 'textarea', cssClassName: 'translation-textarea', parent: elInner, attr: {rows: 6}});
    ta.value = currentVal;

    const btnRow = dom.create({parent: elInner, cssClassName: 'translation-btn-row'});

    dom.create({
        tagName: 'button',
        content: '↻ ' + lang.getPhrase('translateAuto'),
        cssClassName: 'button button-small',
        parent: btnRow,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                runTranslation({data, field, langCode, saveFn, isArray, index, icon, getOrig, ta});
            }
        }
    });

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('translateSave'),
        cssClassName: 'button button-small translation-save',
        parent: btnRow,
        listeners: {
            click(evt) {
                evt.stopPropagation();
                const val = ta.value;
                const srcKey2 = field + '_' + langCode + '_src';
                if (isArray && index !== null) {
                    if (!Array.isArray(data[tf])) data[tf] = [];
                    if (!Array.isArray(data[srcKey2])) data[srcKey2] = [];
                    data[tf][index] = val;
                    data[srcKey2][index] = getOrig();
                } else {
                    data[tf] = val;
                    data[srcKey2] = getOrig();
                }
                setStatus(icon, val ? 'green' : 'red');
                saveFn(data);
                elInner.closeModal();
            }
        }
    });
};

export default {addTranslationButtons, invalidateCache, loadActiveLangs, markOutdated, markOutdatedFor};
