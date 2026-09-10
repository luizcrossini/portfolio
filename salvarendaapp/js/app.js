// js/app.js — Salva Renda • Vídeos (v2025-08-27-03)
(function () {
  'use strict';
  if (window.__VIDEOS_APP_LOADED__) return;
  window.__VIDEOS_APP_LOADED__ = true;

  // ====== CONFIG ======
  const API_ROOT = 'https://api.luizrossini.com.br/api';
  const CLOUD_NAME = 'dgujqs7fh';
  const VIDEOS_ENDPOINT = 'videos';         // -> /api/videos
  const CATEGORIES_ENDPOINT = 'categories'; // -> /api/categories

  // ====== ESTADO ======
  let categories = [];        // [{label, key}]
  let currentKey = 'todas';
  // Dica de root detectada: '' (pastas na raiz) ou 'Uploads' (pastas dentro de Uploads/)
  let ROOT_HINT = '';

  // ====== ELEMENTOS ======
  const categorySelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('categorySelect'));
  const videoContainer = /** @type {HTMLElement|null} */ (document.getElementById('videoContainer'));

  // ====== HELPERS ======
  const norm = (s) =>
    String(s || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  function buildApiUrl(pathOrUrl, params = {}) {
    const isAbs = /^https?:\/\//i.test(pathOrUrl);
    const base = isAbs ? String(pathOrUrl) : `${API_ROOT}/${String(pathOrUrl).replace(/^\/+/, '')}`;
    const url = new URL(base);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
    url.searchParams.set('v', Date.now()); // cache-buster
    return url.toString();
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    if (!res.ok) {
      const short = text.slice(0, 200).replace(/\s+/g, ' ');
      throw new Error(`HTTP ${res.status} em ${url} → ${short}`);
    }
    try { return JSON.parse(text); }
    catch { throw new Error(`Resposta não-JSON do backend: ${text.slice(0, 200)}`); }
  }

  function normalizeItems(data) {
    const cands = [data, data?.items, data?.videos, data?.resources, data?.data, data?.data?.items, data?.result, data?.result?.items, data?.result?.resources];
    for (const c of cands) if (Array.isArray(c)) return c;
    return [];
  }

  function buildCloudinaryVideoUrl(publicId) {
    if (!publicId) return '';
    const pid = String(publicId).replace(/\.\w{2,4}$/, '');
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${pid}.mp4`;
  }

  function setLoading(isLoading, msg = 'Carregando...') {
    if (!videoContainer) return;
    if (isLoading) {
      videoContainer.innerHTML = `<p style="padding:12px;opacity:.8">${msg}</p>`;
      if (categorySelect) categorySelect.disabled = true;
    } else {
      if (categorySelect) categorySelect.disabled = false;
    }
  }

  // Verifica se um public_id pertence à categoria selecionada,
  // considerando se as pastas estão na raiz ou sob "Uploads/"
  function belongsToCategory(publicId, category, rootHint = '') {
    const pid = String(publicId || '');
    const parts = pid.split('/'); // ["Uploads","Beleza","arq"] | ["Beleza","arq"] | ["arq"]

    if (rootHint && parts.length >= 3 && parts[0] === rootHint) {
      // Ex: Uploads/Beleza/arquivo
      return parts[1] === category;
    }
    if (!rootHint && parts.length >= 2) {
      // Ex: Beleza/arquivo
      return parts[0] === category;
    }
    return false;
  }

  // ====== UI ======
  function preencherCategorias() {
    if (!categorySelect) return;
    categorySelect.innerHTML = '';

    const optAll = document.createElement('option');
    optAll.value = 'todas';
    optAll.textContent = 'Todas';
    categorySelect.appendChild(optAll);

    for (const c of categories) {
      const opt = document.createElement('option');
      opt.value = c.key;
      opt.textContent = c.label;
      categorySelect.appendChild(opt);
    }
    categorySelect.value = currentKey;
  }

  function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    const vid = document.createElement('video');
    vid.controls = true; vid.preload = 'metadata'; vid.playsInline = true;
    vid.src = item.videoUrl || buildCloudinaryVideoUrl(item.public_id);

    const title = document.createElement('div');
    title.className = 'title';
    const baseName = String(item.public_id || '').split('/').pop() || 'video';
    title.textContent = baseName;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const buy = document.createElement('button');
    buy.type = 'button'; buy.textContent = 'Link da Shopee';
    buy.disabled = !item.productLink;
    buy.onclick = () => { if (item.productLink) window.open(item.productLink, '_blank', 'noopener,noreferrer'); };

    const dl = document.createElement('a');
    dl.className = 'download';
    dl.textContent = 'Baixar vídeo';
    const dlUrl = item.downloadUrl || item.videoUrl || buildCloudinaryVideoUrl(item.public_id);
    dl.href = dlUrl;
    dl.setAttribute('download', `${baseName}.mp4`);
    dl.rel = 'noopener noreferrer';

    actions.appendChild(buy);
    actions.appendChild(dl);

    card.appendChild(vid);
    card.appendChild(title);
    card.appendChild(actions);
    return card;
  }

  function renderVideos(lista, filtroLabel) {
    if (!videoContainer) return;
    videoContainer.innerHTML = '';
    if (!lista.length) {
      videoContainer.innerHTML = `<p style="padding:12px">Nenhum vídeo encontrado para "${filtroLabel}".</p>`;
      return;
    }
    const frag = document.createDocumentFragment();
    for (const v of lista) frag.appendChild(createCard(v));
    videoContainer.appendChild(frag);
  }

  // ====== DATA ======
  // Detecta automaticamente se as categorias estão na raiz ou sob "Uploads/"
  async function carregarCategorias() {
    // 1) tenta sem root (pastas na raiz)
    try {
      const data = await fetchJSON(buildApiUrl(CATEGORIES_ENDPOINT));
      const arr = Array.isArray(data?.categories) ? data.categories.map(String) : [];
      if (arr.length) {
        categories = arr.map(label => ({ label, key: norm(label) }));
        ROOT_HINT = '';
        return;
      }
    } catch (_) { /* segue tentativa com root */ }

    // 2) tenta com root=Uploads (pastas dentro de Uploads/)
    try {
      const data = await fetchJSON(buildApiUrl(CATEGORIES_ENDPOINT, { root: 'Uploads' }));
      const arr = Array.isArray(data?.categories) ? data.categories.map(String) : [];
      if (arr.length) {
        categories = arr.map(label => ({ label, key: norm(label) }));
        ROOT_HINT = 'Uploads';
        return;
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }

    // fallback: nenhuma categoria
    categories = [];
  }

  async function carregarVideos(categoryKey = 'todas') {
    setLoading(true, 'Carregando vídeos...');
    try {
      let categoryLabel = '';
      if (categoryKey && categoryKey !== 'todas') {
        categoryLabel = categories.find(c => c.key === categoryKey)?.label || '';
      }

      const params = {};
      if (categoryLabel) params.category = categoryLabel; // ex.: "Beleza"
      if (ROOT_HINT) params.root = ROOT_HINT;             // ex.: "Uploads"

      // Busca do backend
      const data = await fetchJSON(buildApiUrl(VIDEOS_ENDPOINT, params));
      let items = normalizeItems(data).map(v => ({
        ...v,
        videoUrl: v.videoUrl || buildCloudinaryVideoUrl(v.public_id),
        downloadUrl: v.downloadUrl || v.videoUrl || buildCloudinaryVideoUrl(v.public_id)
      }));

      // Filtro local à prova de backend
      if (categoryLabel) {
        items = items.filter(it => belongsToCategory(it.public_id, categoryLabel, ROOT_HINT));
      } else {
        // "todas": se quiser excluir arquivos na Home (sem pasta), descomente:
        // items = items.filter(it => String(it.public_id || '').includes('/'));
      }

      renderVideos(items, categoryLabel || 'todas');
    } catch (err) {
      console.error('Erro ao carregar vídeos:', err);
      if (videoContainer) {
        const msg = err instanceof Error ? err.message : String(err);
        videoContainer.innerHTML = `<p style="color:#b00">Falha ao buscar vídeos: ${msg}</p>`;
      }
    } finally {
      setLoading(false);
    }
  }

  // ====== EVENTOS ======
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      const key = /** @type {HTMLSelectElement} */ (e.target).value || 'todas';
      currentKey = key;
      carregarVideos(currentKey);
    });
  }

  // ====== START ======
  (async () => {
    await carregarCategorias();
    console.log('[Videos] ROOT_HINT =', ROOT_HINT, 'Categorias:', categories.map(c => c.label));
    preencherCategorias();
    await carregarVideos('todas');
  })();
}());
