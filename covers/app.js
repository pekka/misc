'use strict';

const EDITIONS = [
    { key: 'ebook', name: 'Ebook', shape: 'front' },
    { key: 'paperback', name: 'Paperback', shape: 'front' },
    { key: 'hardcover', name: 'Hardcover', shape: 'wrap' },
];

const SIZES = {
    front: { draft: '800 × 1,280 px', print: '1,600 × 2,560 px' },
    wrap: { draft: '2,090 × 1,563 px', print: '4,181 × 3,126 px' },
};

const PRICES = {
    front: { draft: 40, tweak: 45, upscale: 230 },
    wrap: { draft: 60, tweak: 65, upscale: 480 },
    analyse: 5,
};

const PRINT_PICTURES = new Set([
    'ac-ornate', 'ac-yellow', 'ac-sunset', 'ac-wrap', 'ac-wrap-alt', 'lv-front', 'lv-wrap',
    'or-a', 'or-b', 'or-wrap', 'or-wrap-alt', 'pe-a', 'pe-b', 'pe-wrap',
    'qu-a', 'qu-b', 'qu-wrap', 'qu-wrap-alt', 'ta-a', 'ta-b', 'ta-wrap',
]);

const PRINT_OVERRIDES = { 'ac-yellow-plain-draft': 'ac-yellow' };

const DRAFT_STAGES = ['Reading your brief', 'Sketching the layout', 'Painting the scene', 'Setting the type', 'Final touches'];
const TWEAK_STAGES = ['Reading your notes', 'Repainting the details', 'Checking the type', 'Final touches'];
const UPSCALE_STAGES = ['Upscaling', 'Sharpening detail', 'Checking final size'];

const ANALYSIS_NOTES = {
    'ac-oranges': { warn: 'The basket holds oranges, not apples. Readers of a cider book will notice.', fix: 'Replace the oranges with red and yellow apples' },
    'ac-niederbayern': { warn: 'The cover says “Niederbayern”, but the book title is “Lower Bavaria”.', fix: 'Change the title line back to “Lower Bavaria”' },
    'ac-ornate': { warn: 'The author name gets thin and faint at thumbnail size.', fix: 'Make the author name larger and bolder' },
    'or-a': { warn: 'The author name at the top blends into the sky.', fix: 'Move the author name to the bottom, under the subtitle' },
    'ta-b': { warn: 'The microphone, the subject of the book, is not visible.', fix: 'Bring the microphone into the foreground' },
};

const TWEAK_RESULTS = {
    'ac-oranges-draft': 'ac-dusk-draft',
    'ac-niederbayern-draft': 'ac-ornate-draft',
};

const TWEAK_CHIPS = {
    front: ['Make the title larger', 'Make the author name bolder', 'Warm up the colours', 'More contrast behind the title', 'Remove the subtitle'],
    wrap: ['Shorten the back cover text', 'Make the spine text larger', 'Match the front to the ebook cover', 'Darken the back panel'],
};

let fileCounter = 0;

function file(picture, kind, made, cost, options = {}) {
    fileCounter += 1;
    return { uid: `f${fileCounter}`, picture, kind, made, cost, state: 'done', brief: null, ...options };
}

function edition(files, pool) {
    const current = files.find(entry => entry.current);
    return { files, pool, poolIndex: 0, current: current ? current.uid : null };
}

const books = [
    {
        id: 'apple-cider',
        title: 'Apple Cider Making in Lower Bavaria',
        author: 'George Guttenberg',
        editions: {
            ebook: edition([
                file('ac-ornate', 'print', '19 Nov', 275, { current: true }),
                file('ac-yellow', 'print', '19 Nov', 279),
                file('ac-sunset', 'print', '29 Oct', 268),
                file('ac-niederbayern-draft', 'draft', '19 Nov', 44, { brief: 'Same cover, but use the German region name' }),
                file('ac-yellow-draft', 'draft', '19 Nov', 55),
                file('ac-dusk-draft', 'draft', '29 Oct', 38),
                file('ac-oranges-draft', 'draft', '29 Oct', 36, { brief: 'Golden hour, a basket of fresh fruit on the table' }),
            ], ['ac-sunset-draft', 'ac-yellow-plain-draft', 'ac-ornate-draft', 'ac-dusk-draft']),
            paperback: edition([
                file('ac-sunset', 'print', '29 Oct', 268, { current: true }),
                file('ac-yellow-plain-draft', 'draft', '28 Oct', 40),
                file('ac-dusk-draft', 'draft', '28 Oct', 40),
            ], ['ac-ornate-draft', 'ac-yellow-draft', 'ac-sunset-draft']),
            hardcover: edition([
                file('ac-wrap', 'print', '19 Nov', 547, { current: true }),
                file('ac-wrap-alt-draft', 'draft', '19 Nov', 60),
            ], ['ac-wrap-alt-draft', 'ac-wrap-draft']),
        },
    },
    {
        id: 'laravel-agents',
        title: 'Using Laravel, coding agents, and speech to build safe, scalable web sites',
        author: 'Pekka',
        editions: {
            ebook: edition([
                file('lv-front', 'print', '2 Nov', 262, { current: true }),
            ], ['lv-front-draft']),
            paperback: edition([
                file('lv-front', 'print', '2 Nov', 262, { current: true }),
                file('lv-front-draft', 'draft', '1 Nov', 40),
            ], ['lv-front-draft']),
            hardcover: edition([], ['lv-wrap-draft']),
        },
    },
    {
        id: 'no-covers',
        title: 'Book Example with No Covers',
        author: 'Pekka',
        editions: {
            ebook: edition([], ['ex-a-draft', 'ex-b-draft']),
            paperback: edition([], ['ex-b-draft', 'ex-a-draft']),
            hardcover: edition([], ['ex-wrap-draft']),
        },
    },
    {
        id: 'orchard',
        title: 'Traditional Orchard: A Year in Photographs',
        author: 'George Guttenberg',
        editions: {
            ebook: edition([
                file('or-a', 'print', '12 Nov', 270, { current: true }),
                file('or-b-draft', 'draft', '12 Nov', 40),
            ], ['or-b-draft', 'or-a-draft']),
            paperback: edition([
                file('or-a-draft', 'draft', '14 Nov', 40),
                file('or-b-draft', 'draft', '14 Nov', 40),
            ], ['or-b-draft', 'or-a-draft']),
            hardcover: edition([
                file('or-wrap', 'print', '15 Nov', 540, { current: true }),
                file('or-wrap-alt-draft', 'draft', '15 Nov', 60),
            ], ['or-wrap-alt-draft', 'or-wrap-draft']),
        },
    },
    {
        id: 'perry',
        title: 'Perry and Pear Brandy',
        author: 'George Guttenberg',
        editions: {
            ebook: edition([
                file('pe-a', 'print', '8 Nov', 266, { current: true }),
                file('pe-b-draft', 'draft', '8 Nov', 40),
            ], ['pe-b-draft', 'pe-a-draft']),
            paperback: edition([], ['pe-a-draft', 'pe-b-draft']),
            hardcover: edition([
                file('pe-wrap-draft', 'draft', '9 Nov', 60),
            ], ['pe-wrap-draft']),
        },
    },
    {
        id: 'queues',
        title: 'Queues, Jobs and Reverb',
        author: 'Pekka',
        editions: {
            ebook: edition([
                file('qu-a', 'print', '4 Nov', 270, { current: true }),
                file('qu-b', 'print', '4 Nov', 270),
            ], ['qu-b-draft', 'qu-a-draft']),
            paperback: edition([
                file('qu-b', 'print', '4 Nov', 270, { current: true }),
            ], ['qu-a-draft', 'qu-b-draft']),
            hardcover: edition([
                file('qu-wrap', 'print', '5 Nov', 540, { current: true }),
                file('qu-wrap-alt-draft', 'draft', '5 Nov', 60),
            ], ['qu-wrap-alt-draft', 'qu-wrap-draft']),
        },
    },
    {
        id: 'talk',
        title: 'Talk to Your Codebase',
        author: 'Pekka',
        editions: {
            ebook: edition([
                file('ta-a-draft', 'draft', '20 Nov', 40, { brief: 'A studio microphone on a desk, calm night colours, bold sans title' }),
                file('ta-b-draft', 'draft', '20 Nov', 40, { brief: 'A studio microphone on a desk, calm night colours, bold sans title' }),
            ], ['ta-a-draft', 'ta-b-draft']),
            paperback: edition([], ['ta-a-draft', 'ta-b-draft']),
            hardcover: edition([], ['ta-wrap-draft']),
        },
    },
];

const state = {
    credits: 4037,
    route: { view: 'library' },
    preview: {},
    analysis: {},
    openMenu: null,
};

const app = document.getElementById('app');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Helpers */

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function formatCredits(amount) {
    return amount.toLocaleString('en-US');
}

function source(picture) {
    return `img/${picture}.webp`;
}

function printPictureFor(picture) {
    if (PRINT_OVERRIDES[picture]) return PRINT_OVERRIDES[picture];
    const base = picture.replace(/-draft$/, '');
    return PRINT_PICTURES.has(base) ? base : picture;
}

function tweakedPicture(picture) {
    if (TWEAK_RESULTS[picture]) return TWEAK_RESULTS[picture];
    return picture.endsWith('-draft') ? picture : `${picture}-draft`;
}

function editionMeta(editionKey) {
    return EDITIONS.find(entry => entry.key === editionKey);
}

function findBook(bookId) {
    return books.find(book => book.id === bookId);
}

function findFile(editionData, uid) {
    return editionData.files.find(entry => entry.uid === uid);
}

function previewKey(bookId, editionKey) {
    return `${bookId}/${editionKey}`;
}

function currentFile(editionData) {
    return editionData.current ? findFile(editionData, editionData.current) : null;
}

function stagedFile(book, editionKey) {
    const editionData = book.editions[editionKey];
    const previewUid = state.preview[previewKey(book.id, editionKey)];
    const preview = previewUid ? findFile(editionData, previewUid) : null;
    if (preview && preview.state === 'done') return preview;
    return currentFile(editionData);
}

function editionStatus(editionData) {
    const working = editionData.files.filter(entry => entry.state === 'working').length;
    if (working) return { tone: 'working', label: working === 1 ? 'Working on 1 file' : `Working on ${working} files` };
    if (editionData.current) return { tone: 'ready', label: 'Production-ready' };
    const drafts = editionData.files.filter(entry => entry.kind === 'draft').length;
    const prints = editionData.files.filter(entry => entry.kind === 'print').length;
    if (prints) return { tone: 'drafts', label: 'No cover chosen' };
    if (drafts) return { tone: 'drafts', label: drafts === 1 ? '1 draft, no cover' : `${drafts} drafts, no cover` };
    return { tone: 'none', label: 'No cover yet' };
}

function nextPoolPicture(editionData) {
    const picture = editionData.pool[editionData.poolIndex % editionData.pool.length];
    editionData.poolIndex += 1;
    return picture;
}

function spend(amount) {
    state.credits -= amount;
    const balance = document.getElementById('credit-balance');
    balance.textContent = formatCredits(state.credits);
    balance.parentElement.classList.add('is-spending');
    window.setTimeout(() => balance.parentElement.classList.remove('is-spending'), 900);
}

function glass(uid) {
    const bowl = 'M9 5 H31 C31.5 21 27.5 30 20 31.5 C12.5 30 8.5 21 9 5 Z';
    return `<svg class="glass" viewBox="0 0 40 64" aria-hidden="true">
        <defs><clipPath id="clip-${uid}"><path d="${bowl}"/></clipPath></defs>
        <g clip-path="url(#clip-${uid})">
            <g class="glass-wine-group">
                <rect class="glass-wine" x="-10" y="33" width="60" height="34"/>
                <path class="glass-wave" d="M-10 33 Q0 30.5 10 33 T30 33 T50 33 V37 H-10 Z"/>
            </g>
        </g>
        <path class="glass-bowl" d="${bowl}"/>
        <path class="glass-stem" d="M20 31.5 V55 M12 58 Q20 54 28 58"/>
    </svg>`;
}

/* Toasts */

function toast(message, action) {
    const region = document.getElementById('toasts');
    const element = document.createElement('div');
    element.className = 'toast';
    const text = document.createElement('span');
    text.textContent = message;
    element.append(text);
    if (action) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = action.label;
        button.addEventListener('click', () => {
            action.run();
            element.remove();
        });
        element.append(button);
    }
    region.append(element);
    window.setTimeout(() => element.remove(), action ? 7000 : 4000);
}

/* Library */

function renderLibrary() {
    const editionCount = books.length * EDITIONS.length;
    const readyCount = books.reduce((total, book) => total + EDITIONS.filter(meta => book.editions[meta.key].current).length, 0);

    const rows = books.map(book => {
        const readyHere = EDITIONS.filter(meta => book.editions[meta.key].current).length;
        const summary = readyHere === EDITIONS.length
            ? 'Every edition has a production-ready cover.'
            : `${readyHere} of ${EDITIONS.length} editions have a production-ready cover.`;
        const slots = EDITIONS.map(meta => renderSlot(book, meta)).join('');
        return `<div class="shelf-row">
            <div class="shelf-book">
                <a href="#/book/${book.id}/ebook">${escapeHtml(book.title)}</a>
                <p>${escapeHtml(book.author)}</p>
                <p class="summary">${summary}</p>
            </div>
            ${slots}
        </div>`;
    }).join('');

    app.innerHTML = `<div class="page">
        <div class="library-head">
            <div>
                <h1>Your books</h1>
                <p>${books.length} books, ${editionCount} editions. ${readyCount} editions have a production-ready cover.</p>
            </div>
            <button class="btn" type="button" data-action="add-book">Add book</button>
        </div>
        <div class="shelf" role="table" aria-label="Books and their editions">
            <div class="shelf-columns" role="row">
                <span role="columnheader">Book</span>
                ${EDITIONS.map(meta => `<span role="columnheader">${meta.name}</span>`).join('')}
            </div>
            ${rows}
        </div>
    </div>`;
}

function renderSlot(book, meta) {
    const editionData = book.editions[meta.key];
    const status = editionStatus(editionData);
    const current = currentFile(editionData);
    const fallback = editionData.files.find(entry => entry.state === 'done');
    let cover;
    if (current) {
        cover = `<img src="${source(current.picture)}" alt="" loading="lazy">`;
    } else if (fallback) {
        cover = `<img src="${source(fallback.picture)}" alt="" loading="lazy">`;
    } else {
        cover = `<span class="slot-empty ${meta.shape === 'wrap' ? 'is-wrap' : ''}">Create a cover</span>`;
    }
    const dim = !current && fallback ? 'slot-draft-only' : '';
    return `<a class="slot ${dim}" href="#/book/${book.id}/${meta.key}" aria-label="${escapeHtml(book.title)}, ${meta.name}: ${status.label}">
        <span class="slot-label">${meta.name}</span>
        <span class="slot-cover">${cover}</span>
        <span class="status status-${status.tone}">${status.label}</span>
    </a>`;
}

/* Book detail */

function renderBook(book, editionKey) {
    const meta = editionMeta(editionKey);
    const editionData = book.editions[editionKey];

    const tabs = EDITIONS.map(entry => {
        const data = book.editions[entry.key];
        const current = currentFile(data);
        const status = editionStatus(data);
        const thumb = current
            ? `<img class="tab-thumb" src="${source(current.picture)}" alt="">`
            : `<span class="tab-thumb-empty ${entry.shape === 'wrap' ? 'is-wrap' : ''}"></span>`;
        const selected = entry.key === editionKey;
        return `<button class="tab" type="button" role="tab" aria-selected="${selected}" tabindex="${selected ? 0 : -1}" data-action="tab" data-edition="${entry.key}">
            ${thumb}
            <span><span class="tab-name">${entry.name}</span><span class="status status-${status.tone}">${status.label}</span></span>
        </button>`;
    }).join('');

    app.innerHTML = `<div class="page">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">All books</a><span aria-hidden="true">/</span><span>${meta.name}</span></nav>
        <div class="book-head">
            <div>
                <h1 class="book-title">${escapeHtml(book.title)}</h1>
                <p class="book-author">${escapeHtml(book.author)}</p>
            </div>
            <div class="book-links">
                <button class="btn-discreet" type="button" data-action="edit-book">Edit book details</button>
                <a class="external-link" href="https://publishferret.example/books/${book.id}" target="_blank" rel="noopener">
                    Open this book in PublishFerret
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2.5h4.5V7M13.5 2.5 7 9M11.5 9.5v3.5a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h3.5"/></svg>
                    <span class="visually-hidden">(opens in a new window)</span>
                </a>
            </div>
        </div>

        <div class="tabs" role="tablist" aria-label="Editions">${tabs}</div>
        <div class="workbench ${stagedFile(book, editionKey) ? '' : 'is-empty'}" role="tabpanel" aria-label="${meta.name} cover">
            ${renderStage(book, editionKey)}
            ${renderInspector(book, editionKey)}
        </div>

        ${renderFiles(book, editionKey, 'draft')}
        ${renderFiles(book, editionKey, 'print')}
    </div>`;
    applyWorkingStyles(editionData);
}

function renderStage(book, editionKey) {
    const meta = editionMeta(editionKey);
    const editionData = book.editions[editionKey];
    const staged = stagedFile(book, editionKey);
    const wrapClass = meta.shape === 'wrap' ? 'is-wrap' : '';

    if (!staged) {
        return `<section class="stage ${wrapClass}" aria-label="Stage">${renderEmptyStage(book, editionKey)}</section>`;
    }

    const isCurrent = staged.uid === editionData.current;
    const flag = isCurrent ? '' : `<div class="stage-flag">
        <span>Previewing ${staged.kind === 'draft' ? 'a draft' : 'a production-ready file'}${editionData.current ? '' : '. This edition has no cover yet'}</span>
        ${editionData.current ? '<button type="button" data-action="back-to-current">Back to current cover</button>' : ''}
    </div>`;
    const caption = isCurrent
        ? `Current ${meta.name.toLowerCase()} cover · ${SIZES[meta.shape].print}`
        : `${staged.kind === 'draft' ? 'Draft' : 'Production-ready'} · ${SIZES[meta.shape][staged.kind]}`;

    return `<section class="stage ${wrapClass}" aria-label="Stage">
        ${flag}
        <div class="stage-cover"><img src="${source(staged.picture)}" alt="${escapeHtml(book.title)}, ${meta.name} ${isCurrent ? 'cover' : staged.kind}"></div>
        <p class="stage-caption">${caption}</p>
    </section>`;
}

function renderEmptyStage(book, editionKey) {
    const meta = editionMeta(editionKey);
    const editionData = book.editions[editionKey];
    const prints = editionData.files.filter(entry => entry.kind === 'print' && entry.state === 'done');
    const drafts = editionData.files.filter(entry => entry.kind === 'draft' && entry.state === 'done');
    const price = PRICES[meta.shape].draft;

    if (prints.length) {
        return `<div class="stage-empty">
            <h2>No cover chosen</h2>
            <p>This edition has ${prints.length === 1 ? 'a production-ready file' : `${prints.length} production-ready files`}. Pick one as the cover.</p>
            <div class="actions"><button class="btn btn-primary" type="button" data-action="use" data-uid="${prints[0].uid}">Use the latest production-ready file</button></div>
        </div>`;
    }

    if (drafts.length) {
        return `<div class="stage-empty">
            <h2>Only drafts so far</h2>
            <p>Click a draft below to see it here. Upscale the one you like, then use it as the cover.</p>
            <div class="actions">
                <button class="btn btn-primary" type="button" data-action="preview" data-uid="${drafts[0].uid}">Show the newest draft</button>
                <button class="btn" type="button" data-action="new-draft">Create another draft <span class="price">${price} cr</span></button>
            </div>
        </div>`;
    }

    const siblingActions = EDITIONS
        .filter(entry => entry.key !== editionKey && currentFile(book.editions[entry.key]))
        .map(entry => {
            const sibling = currentFile(book.editions[entry.key]);
            if (entry.shape === meta.shape) {
                return `<button class="btn btn-primary" type="button" data-action="copy-from" data-from="${entry.key}">Use the ${entry.name.toLowerCase()} cover here too</button>`;
            }
            const label = meta.shape === 'wrap' ? `Build a wrap from the ${entry.name.toLowerCase()} cover` : `Make a front cover from the ${entry.name.toLowerCase()} wrap`;
            return `<button class="btn btn-primary" type="button" data-action="adapt-from" data-from="${entry.key}" data-uid="${sibling.uid}">${label} <span class="price">${price} cr</span></button>`;
        });

    const firstSibling = siblingActions.length ? [siblingActions[0]] : [];
    return `<div class="stage-empty">
        <h2>The ${meta.name.toLowerCase()} has no cover yet</h2>
        <p>${firstSibling.length ? 'Start from a cover you already have, or describe a new one.' : 'Describe the cover you want and get a few low-resolution drafts to choose from.'}</p>
        <div class="actions">
            ${firstSibling.join('')}
            <button class="btn ${firstSibling.length ? '' : 'btn-primary'}" type="button" data-action="new-draft">Describe a new cover <span class="price">from ${price} cr</span></button>
        </div>
    </div>`;
}

function renderInspector(book, editionKey) {
    const meta = editionMeta(editionKey);
    const editionData = book.editions[editionKey];
    const staged = stagedFile(book, editionKey);
    const prices = PRICES[meta.shape];

    if (!staged) return '';

    const isCurrent = staged.uid === editionData.current;
    const heading = isCurrent ? 'Current cover' : staged.kind === 'draft' ? 'Draft' : 'Production-ready file';
    const brief = staged.brief ? `<dt>Brief</dt><dd>${escapeHtml(staged.brief)}</dd>` : '';
    const facts = `<dl class="facts">
        <dt>Size</dt><dd>${SIZES[meta.shape][staged.kind]}</dd>
        <dt>Made</dt><dd>${staged.made}, ${formatCredits(staged.cost)} credits</dd>
        <dt>Quality</dt><dd>${staged.kind === 'draft' ? 'Low resolution, for choosing' : 'Full resolution, ready to publish'}</dd>
        ${brief}
    </dl>`;

    const analyse = `<button class="btn" type="button" data-action="analyse" data-uid="${staged.uid}">Analyse <span class="price">${PRICES.analyse} cr</span></button>`;
    const tweak = `<button class="btn" type="button" data-action="tweak" data-uid="${staged.uid}">Make minor tweaks <span class="price">${prices.tweak} cr</span></button>`;
    const fresh = `<button class="btn" type="button" data-action="new-draft" data-uid="${staged.uid}">Create new draft from this ${staged.kind === 'draft' ? 'draft' : 'cover'} <span class="price">from ${prices.draft} cr</span></button>`;

    let primary = '';
    let danger = '';
    if (isCurrent) {
        danger = `<button class="btn-danger-quiet" type="button" data-action="remove-cover">Remove cover</button>`;
    } else if (staged.kind === 'draft') {
        primary = `<p class="action-hint">Drafts are cheap and low resolution. Upscale this one to use it as a cover.</p>
            <button class="btn btn-primary" type="button" data-action="upscale" data-uid="${staged.uid}">Upscale <span class="price">${prices.upscale} cr</span></button>`;
        danger = `<button class="btn-danger-quiet" type="button" data-action="delete" data-uid="${staged.uid}">Delete draft</button>`;
    } else {
        primary = `<button class="btn btn-primary" type="button" data-action="use" data-uid="${staged.uid}">Use as ${meta.name.toLowerCase()} cover</button>`;
        danger = `<button class="btn-danger-quiet" type="button" data-action="delete" data-uid="${staged.uid}">Delete file</button>`;
    }

    return `<aside class="inspector" aria-label="Cover actions">
        <h2>${heading}</h2>
        ${facts}
        <div class="actions-list">
            ${primary}
            ${analyse}
            ${tweak}
            ${fresh}
        </div>
        ${renderAnalysis(staged, meta)}
        <div class="danger-zone">${danger}</div>
    </aside>`;
}

function renderAnalysis(staged, meta) {
    const analysis = state.analysis[staged.uid];
    if (!analysis) return '';

    if (analysis.status === 'working') {
        return `<section class="analysis" aria-live="polite">
            <div class="analysis-working" data-analysis="${staged.uid}">${glass(`an-${staged.uid}`)}<span>Looking at the cover the way a shopper would…</span></div>
        </section>`;
    }

    const key = staged.picture.replace(/-draft$/, '');
    const note = ANALYSIS_NOTES[key];
    const checks = meta.shape === 'wrap'
        ? [
            ['ok', 'Spine text fits the spine width'],
            ['ok', 'Barcode area on the back is clear'],
            ['ok', 'Nothing important within 3 mm of the trim'],
        ]
        : [
            ['ok', 'Title reads clearly at thumbnail size'],
            ['ok', 'Genre is clear at a glance'],
            note ? ['warn', note.warn] : ['ok', 'Author name is legible'],
        ];
    if (meta.shape === 'wrap' && note) checks.push(['warn', note.warn]);

    const suggestions = [note ? note.fix : null, 'Add a little more contrast behind the title', 'Warm up the colours slightly'].filter(Boolean);

    return `<section class="analysis" aria-live="polite">
        <h3>Analysis</h3>
        ${meta.shape === 'front' ? `<div class="thumb-test">
            <img src="${source(staged.picture)}" alt="">
            <img src="${source(staged.picture)}" alt="">
            <p>How it looks in store search results and on a phone.</p>
        </div>` : ''}
        <ul class="checks">${checks.map(([tone, text]) => `<li class="${tone}">${escapeHtml(text)}</li>`).join('')}</ul>
        <div class="suggestions" data-suggestions="${staged.uid}">
            ${suggestions.map((text, index) => `<label><input type="checkbox" value="${escapeHtml(text)}" ${index === 0 && note ? 'checked' : ''}> ${escapeHtml(text)}</label>`).join('')}
        </div>
        <button class="btn btn-small" type="button" data-action="tweak-from-analysis" data-uid="${staged.uid}">Make these tweaks <span class="price">${PRICES[meta.shape].tweak} cr</span></button>
    </section>`;
}

function renderFiles(book, editionKey, kind) {
    const meta = editionMeta(editionKey);
    const editionData = book.editions[editionKey];
    const files = editionData.files.filter(entry => entry.kind === kind);
    const staged = stagedFile(book, editionKey);
    const prices = PRICES[meta.shape];

    const head = kind === 'draft'
        ? `<div class="files-head">
            <div>
                <h2>Drafts</h2>
                <p>Low resolution and cheap to make, so try a few. Upscale the one you like.</p>
            </div>
            <button class="btn" type="button" data-action="new-draft">New draft <span class="price">from ${prices.draft} cr</span></button>
        </div>`
        : `<div class="files-head">
            <div>
                <h2>Production-ready</h2>
                <p>Upscaled to full resolution. Any of these can be the ${meta.name.toLowerCase()} cover.</p>
            </div>
        </div>`;

    if (!files.length) {
        const empty = kind === 'draft'
            ? '<p>No drafts for this edition. Every new idea starts here as a low-resolution draft.</p>'
            : '<p>Nothing upscaled yet. Upscale a draft and it lands here.</p>';
        return `<section class="files">${head}<div class="files-empty">${empty}</div></section>`;
    }

    const tiles = files.map(entry => renderTile(entry, editionData, meta, staged)).join('');
    return `<section class="files">${head}<div class="file-grid ${meta.shape === 'wrap' ? 'is-wrap' : ''}">${tiles}</div></section>`;
}

function renderTile(entry, editionData, meta, staged) {
    const prices = PRICES[meta.shape];

    if (entry.state === 'working') {
        return `<div class="file is-working" data-uid="${entry.uid}">
            <div class="file-preview" role="img" aria-label="${entry.label}">
                <img src="${source(entry.picture)}" alt="">
                <div class="develop">
                    ${glass(entry.uid)}
                    <span class="develop-label">${entry.label}</span>
                    <span class="develop-percent">${Math.round(entry.progress * 100)}%</span>
                </div>
            </div>
            <div class="file-meta"><span>${entry.kind === 'draft' ? 'New draft' : 'Upscaling'}</span><span class="price">${entry.cost} cr</span></div>
        </div>`;
    }

    const isCurrent = entry.uid === editionData.current;
    const onStage = staged && staged.uid === entry.uid;
    let primary;
    if (entry.kind === 'draft') {
        primary = `<button class="btn btn-small" type="button" data-action="upscale" data-uid="${entry.uid}">Upscale <span class="price">${prices.upscale} cr</span></button>`;
    } else if (isCurrent) {
        primary = '';
    } else {
        primary = `<button class="btn btn-small" type="button" data-action="use" data-uid="${entry.uid}">Use as cover</button>`;
    }
    const menuOpen = state.openMenu === entry.uid;
    const menu = isCurrent ? '' : `<div class="menu">
        <button class="btn btn-small" type="button" aria-haspopup="true" aria-expanded="${menuOpen}" aria-label="More actions" data-action="menu" data-uid="${entry.uid}">⋯</button>
        ${menuOpen ? `<div class="menu-list">
            <button type="button" data-action="preview" data-uid="${entry.uid}">Show on stage</button>
            <button type="button" data-action="download" data-uid="${entry.uid}">Download</button>
            <button type="button" class="is-danger" data-action="delete" data-uid="${entry.uid}">Delete</button>
        </div>` : ''}
    </div>`;

    return `<div class="file ${onStage ? 'is-on-stage' : ''}" data-uid="${entry.uid}">
        <button class="file-preview" type="button" data-action="preview" data-uid="${entry.uid}" aria-label="Show this ${entry.kind === 'draft' ? 'draft' : 'file'} on the stage">
            <img src="${source(entry.picture)}" alt="" loading="lazy">
        </button>
        <div class="file-meta">
            <span>${entry.made}</span>
            ${isCurrent ? '<span class="file-tag-current">Current cover</span>' : ''}
        </div>
        ${primary || menu ? `<div class="file-actions">${primary}${menu}</div>` : ''}
    </div>`;
}

/* Working jobs */

const jobs = [];

function startJob({ book, editionKey, kind, picture, cost, duration, stages, brief, label }) {
    const editionData = book.editions[editionKey];
    const entry = file(picture, kind, 'Just now', cost, { state: 'working', progress: 0, label: stages[0], brief });
    editionData.files.unshift(entry);
    jobs.push({ entry, book, editionKey, duration: duration * (0.85 + Math.random() * 0.3), stages, started: performance.now(), doneLabel: label });
    spend(cost);
    return entry;
}

function tickJobs() {
    const now = performance.now();
    for (let index = jobs.length - 1; index >= 0; index -= 1) {
        const job = jobs[index];
        const linear = Math.min(1, (now - job.started) / job.duration);
        const eased = 1 - Math.pow(1 - linear, 1.6);
        job.entry.progress = eased;
        job.entry.label = job.stages[Math.min(job.stages.length - 1, Math.floor(eased * job.stages.length))];
        updateWorkingTile(job.entry);
        if (linear >= 1) {
            jobs.splice(index, 1);
            finishJob(job);
        }
    }
}

function updateWorkingTile(entry) {
    const tile = app.querySelector(`.file[data-uid="${entry.uid}"]`);
    if (!tile) return;
    tile.style.setProperty('--p', entry.progress.toFixed(3));
    tile.style.setProperty('--blur', `${(24 * Math.pow(1 - entry.progress, 1.4)).toFixed(1)}px`);
    tile.style.setProperty('--sat', (0.3 + entry.progress * 0.7).toFixed(2));
    const label = tile.querySelector('.develop-label');
    const percent = tile.querySelector('.develop-percent');
    if (label) label.textContent = entry.label;
    if (percent) percent.textContent = `${Math.round(entry.progress * 100)}%`;
}

function applyWorkingStyles(editionData) {
    editionData.files.filter(entry => entry.state === 'working').forEach(updateWorkingTile);
}

function finishJob(job) {
    const { entry, book, editionKey } = job;
    entry.state = 'done';
    const editionName = editionMeta(editionKey).name.toLowerCase();
    const viewing = state.route.view === 'book' && state.route.bookId === book.id && state.route.editionKey === editionKey;

    if (entry.kind === 'print') {
        toast(`Upscaled. The file is production-ready.`, {
            label: 'Use as cover',
            run: () => useAsCover(book, editionKey, entry.uid),
        });
    } else if (job.doneLabel) {
        toast(job.doneLabel);
    } else {
        toast(`New ${editionName} draft is ready.`, viewing ? null : {
            label: 'Show',
            run: () => { location.hash = `#/book/${book.id}/${editionKey}`; },
        });
    }

    if (viewing || state.route.view === 'library') render();
}

window.setInterval(tickJobs, 120);

/* Actions */

function currentContext() {
    const book = findBook(state.route.bookId);
    return { book, editionKey: state.route.editionKey, editionData: book.editions[state.route.editionKey], meta: editionMeta(state.route.editionKey) };
}

function scrollToFile(uid) {
    window.requestAnimationFrame(() => {
        const tile = app.querySelector(`.file[data-uid="${uid}"]`);
        if (tile) tile.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    });
}

function useAsCover(book, editionKey, uid) {
    const editionData = book.editions[editionKey];
    editionData.current = uid;
    delete state.preview[previewKey(book.id, editionKey)];
    toast(`Cover updated for the ${editionMeta(editionKey).name.toLowerCase()} edition.`);
    render();
}

function confirmDialog({ title, body, action }) {
    const dialog = document.getElementById('confirm-dialog');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-body').innerHTML = body;
    document.getElementById('confirm-submit').innerHTML = action;
    dialog.returnValue = '';
    dialog.showModal();
    return new Promise(resolve => {
        dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
    });
}

async function upscale(uid) {
    const { book, editionKey, editionData, meta } = currentContext();
    const draft = findFile(editionData, uid);
    const price = PRICES[meta.shape].upscale;
    const confirmed = await confirmDialog({
        title: 'Upscale this draft?',
        body: `Makes a ${SIZES[meta.shape].print} file you can use as the ${meta.name.toLowerCase()} cover. Uses <strong>${price} credits</strong>; you have ${formatCredits(state.credits)}.`,
        action: `Upscale <span class="price">${price} cr</span>`,
    });
    if (!confirmed) return;

    editionData.files.splice(editionData.files.indexOf(draft), 1);
    const entry = startJob({
        book, editionKey, kind: 'print', picture: printPictureFor(draft.picture), cost: price,
        duration: 5200, stages: UPSCALE_STAGES, brief: draft.brief,
    });
    editionData.files.splice(editionData.files.indexOf(entry), 1);
    const firstPrint = editionData.files.findIndex(file => file.kind === 'print');
    editionData.files.splice(firstPrint === -1 ? editionData.files.length : firstPrint, 0, entry);
    delete state.preview[previewKey(book.id, editionKey)];
    render();
    scrollToFile(entry.uid);
}

function analyse(uid) {
    const { meta } = currentContext();
    state.analysis[uid] = { status: 'working' };
    spend(PRICES.analyse);
    render();
    const progress = { value: 0 };
    const interval = window.setInterval(() => {
        progress.value = Math.min(1, progress.value + 0.06);
        const holder = app.querySelector(`[data-analysis="${uid}"]`);
        if (holder) holder.style.setProperty('--p', progress.value.toFixed(2));
    }, 120);
    window.setTimeout(() => {
        window.clearInterval(interval);
        state.analysis[uid] = { status: 'done' };
        render();
    }, meta.shape === 'wrap' ? 2600 : 2200);
}

function removeCover() {
    const { book, editionKey, editionData, meta } = currentContext();
    confirmDialog({
        title: `Remove the ${meta.name.toLowerCase()} cover?`,
        body: 'The edition will have no cover. The file stays under Production-ready, so you can put it back any time.',
        action: 'Remove cover',
    }).then(confirmed => {
        if (!confirmed) return;
        const removed = editionData.current;
        editionData.current = null;
        delete state.preview[previewKey(book.id, editionKey)];
        render();
        toast(`Cover removed from the ${meta.name.toLowerCase()} edition.`, {
            label: 'Undo',
            run: () => { editionData.current = removed; render(); },
        });
    });
}

function deleteFile(uid) {
    const { book, editionKey, editionData } = currentContext();
    const index = editionData.files.findIndex(entry => entry.uid === uid);
    const [removed] = editionData.files.splice(index, 1);
    state.openMenu = null;
    if (state.preview[previewKey(book.id, editionKey)] === uid) delete state.preview[previewKey(book.id, editionKey)];
    render();
    toast(removed.kind === 'draft' ? 'Draft deleted.' : 'File deleted.', {
        label: 'Undo',
        run: () => { editionData.files.splice(index, 0, removed); render(); },
    });
}

function copyFrom(fromKey) {
    const { book, editionKey, editionData, meta } = currentContext();
    const sibling = currentFile(book.editions[fromKey]);
    const copy = file(sibling.picture, 'print', 'Just now', 0);
    editionData.files.unshift(copy);
    editionData.current = copy.uid;
    toast(`The ${editionMeta(fromKey).name.toLowerCase()} cover is now the ${meta.name.toLowerCase()} cover too. No credits used.`);
    render();
}

function adaptFrom(fromKey) {
    const { book, editionKey, editionData, meta } = currentContext();
    const entry = startJob({
        book, editionKey, kind: 'draft', picture: nextPoolPicture(editionData), cost: PRICES[meta.shape].draft,
        duration: 7000, stages: meta.shape === 'wrap' ? ['Reading the front cover', 'Extending the scene', 'Laying out spine and back', 'Setting the back cover text'] : DRAFT_STAGES,
        brief: `Adapted from the ${editionMeta(fromKey).name.toLowerCase()} cover`,
    });
    render();
    scrollToFile(entry.uid);
}

/* Draft dialog */

const draftDialog = document.getElementById('draft-dialog');
const draftForm = document.getElementById('draft-form');
let draftContext = null;

function openDraftDialog(sourceUid) {
    const { book, editionKey, editionData, meta } = currentContext();
    const sourceFile = sourceUid ? findFile(editionData, sourceUid) : stagedFile(book, editionKey);
    const select = document.getElementById('draft-start');
    const options = [];
    if (sourceFile) {
        const label = sourceFile.uid === editionData.current ? `This ${meta.name.toLowerCase()} cover` : `The ${sourceFile.kind === 'draft' ? 'draft' : 'file'} on the stage`;
        options.push({ value: `file:${sourceFile.uid}`, label, picture: sourceFile.picture });
    }
    EDITIONS.filter(entry => entry.key !== editionKey).forEach(entry => {
        const sibling = currentFile(book.editions[entry.key]);
        if (!sibling) return;
        const adapted = entry.shape !== meta.shape ? (meta.shape === 'wrap' ? ', extended to a wrap' : ', front panel only') : '';
        options.push({ value: `sibling:${entry.key}`, label: `The ${entry.name.toLowerCase()} cover${adapted}`, picture: sibling.picture });
    });
    options.push({ value: 'none', label: 'Nothing, just my description', picture: null });

    select.innerHTML = options.map(option => `<option value="${option.value}">${escapeHtml(option.label)}</option>`).join('');
    draftContext = { book, editionKey, options };

    document.getElementById('draft-dialog-title').textContent = sourceFile ? 'Create new draft from this cover' : `Create a new ${meta.name.toLowerCase()} draft`;
    document.getElementById('draft-dialog-sub').textContent = `${book.title}, ${meta.name}. Drafts are low resolution so you can try ideas cheaply.`;
    document.getElementById('draft-prompt').value = '';
    draftForm.querySelector('input[name="count"][value="2"]').checked = true;
    syncDraftDialog();
    draftDialog.returnValue = '';
    draftDialog.showModal();
}

function syncDraftDialog() {
    if (!draftContext) return;
    const meta = editionMeta(draftContext.editionKey);
    const select = document.getElementById('draft-start');
    const option = draftContext.options.find(entry => entry.value === select.value);
    const thumb = document.getElementById('draft-source-thumb');
    thumb.hidden = !option.picture;
    if (option.picture) thumb.src = source(option.picture);
    document.getElementById('draft-keep').disabled = !option.picture;
    const count = Number(draftForm.querySelector('input[name="count"]:checked').value);
    const total = count * PRICES[meta.shape].draft;
    document.getElementById('draft-cost-note').innerHTML = `${count} ${count === 1 ? 'draft' : 'drafts'} × ${PRICES[meta.shape].draft} = <span class="price">${total} credits</span>`;
    document.getElementById('draft-submit').textContent = count === 1 ? 'Create draft' : `Create ${count} drafts`;
}

draftForm.addEventListener('change', syncDraftDialog);

draftDialog.addEventListener('close', () => {
    if (draftDialog.returnValue !== 'confirm' || !draftContext) return;
    const { book, editionKey } = draftContext;
    const editionData = book.editions[editionKey];
    const meta = editionMeta(editionKey);
    const count = Number(draftForm.querySelector('input[name="count"]:checked').value);
    const prompt = document.getElementById('draft-prompt').value.trim();
    const created = [];
    for (let index = 0; index < count; index += 1) {
        created.push(startJob({
            book, editionKey, kind: 'draft', picture: nextPoolPicture(editionData), cost: PRICES[meta.shape].draft,
            duration: 6500 + index * 1400, stages: DRAFT_STAGES, brief: prompt || null,
        }));
    }
    render();
    scrollToFile(created[created.length - 1].uid);
});

/* Tweak dialog */

const tweakDialog = document.getElementById('tweak-dialog');
let tweakContext = null;

function openTweakDialog(uid, prefill = '') {
    const { book, editionKey, editionData, meta } = currentContext();
    const sourceFile = findFile(editionData, uid);
    tweakContext = { book, editionKey, sourceFile };
    document.getElementById('tweak-source-thumb').src = source(sourceFile.picture);
    document.getElementById('tweak-prompt').value = prefill;
    document.getElementById('tweak-chips').innerHTML = TWEAK_CHIPS[meta.shape]
        .map(text => `<button class="chip" type="button" data-chip="${escapeHtml(text)}">${escapeHtml(text)}</button>`).join('');
    document.getElementById('tweak-cost-note').innerHTML = `1 draft · <span class="price">${PRICES[meta.shape].tweak} credits</span>`;
    tweakDialog.returnValue = '';
    tweakDialog.showModal();
}

document.getElementById('tweak-chips').addEventListener('click', event => {
    const chip = event.target.closest('[data-chip]');
    if (!chip) return;
    const field = document.getElementById('tweak-prompt');
    field.value = field.value.trim() ? `${field.value.trim()}\n${chip.dataset.chip}` : chip.dataset.chip;
    field.focus();
});

tweakDialog.addEventListener('close', () => {
    if (tweakDialog.returnValue !== 'confirm' || !tweakContext) return;
    const { book, editionKey, sourceFile } = tweakContext;
    const meta = editionMeta(editionKey);
    const notes = document.getElementById('tweak-prompt').value.trim();
    const entry = startJob({
        book, editionKey, kind: 'draft', picture: tweakedPicture(sourceFile.picture),
        cost: PRICES[meta.shape].tweak, duration: 6000, stages: TWEAK_STAGES, brief: `Tweak: ${notes.replace(/\n/g, '; ')}`,
    });
    render();
    scrollToFile(entry.uid);
});

/* Event wiring */

app.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) {
        if (state.openMenu) { state.openMenu = null; render(); }
        return;
    }
    const { action, uid } = target.dataset;

    if (action === 'add-book') {
        toast('Adding books lives in the manuscript app. This mockup covers the cover studio only.');
        return;
    }

    if (state.route.view !== 'book') return;
    if (action === 'edit-book') {
        toast('Book details (title, author, blurb) open here. Not part of this mockup.');
        return;
    }
    const { book, editionKey } = currentContext();

    if (action === 'tab') {
        location.hash = `#/book/${book.id}/${target.dataset.edition}`;
        return;
    }
    if (action === 'menu') {
        state.openMenu = state.openMenu === uid ? null : uid;
        render();
        return;
    }
    if (action === 'preview') {
        state.openMenu = null;
        state.preview[previewKey(book.id, editionKey)] = uid;
        render();
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        return;
    }
    if (action === 'back-to-current') {
        delete state.preview[previewKey(book.id, editionKey)];
        render();
        return;
    }
    if (action === 'use') { useAsCover(book, editionKey, uid); return; }
    if (action === 'upscale') { upscale(uid); return; }
    if (action === 'analyse') { analyse(uid); return; }
    if (action === 'tweak') { openTweakDialog(uid); return; }
    if (action === 'tweak-from-analysis') {
        const picked = [...app.querySelectorAll(`[data-suggestions="${uid}"] input:checked`)].map(input => input.value);
        openTweakDialog(uid, picked.join('\n'));
        return;
    }
    if (action === 'new-draft') { openDraftDialog(uid); return; }
    if (action === 'remove-cover') { removeCover(); return; }
    if (action === 'delete') { deleteFile(uid); return; }
    if (action === 'copy-from') { copyFrom(target.dataset.from); return; }
    if (action === 'adapt-from') { adaptFrom(target.dataset.from); return; }
    if (action === 'download') {
        state.openMenu = null;
        render();
        toast('Download started.');
    }
});

app.addEventListener('keydown', event => {
    const tab = event.target.closest('.tab');
    if (!tab || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const tabs = [...app.querySelectorAll('.tab')];
    const index = tabs.indexOf(tab);
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    location.hash = `#/book/${state.route.bookId}/${next.dataset.edition}`;
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.openMenu) {
        state.openMenu = null;
        render();
    }
});

/* Routing */

function parseRoute() {
    const match = location.hash.match(/^#\/book\/([\w-]+)\/(ebook|paperback|hardcover)$/);
    if (match && findBook(match[1])) return { view: 'book', bookId: match[1], editionKey: match[2] };
    return { view: 'library' };
}

function render() {
    if (state.route.view === 'book') {
        renderBook(findBook(state.route.bookId), state.route.editionKey);
        return;
    }
    renderLibrary();
}

window.addEventListener('hashchange', () => {
    const previous = state.route;
    state.route = parseRoute();
    state.openMenu = null;
    render();
    if (previous.view !== state.route.view || previous.bookId !== state.route.bookId) {
        window.scrollTo(0, 0);
        app.focus({ preventScroll: true });
    } else {
        const selectedTab = app.querySelector('.tab[aria-selected="true"]');
        if (selectedTab) selectedTab.focus({ preventScroll: true });
    }
});

state.route = parseRoute();
render();
