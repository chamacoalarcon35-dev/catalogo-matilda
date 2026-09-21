/**
 * MATILDA Boutique - Lógica Principal de la Aplicación
 * Manejo de catálogo, categorías dinámicas, búsqueda, filtros, vista individual,
 * compartir por WhatsApp, copia limpia al portapapeles y navegación por URL.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global de la aplicación
  const state = {
    products: PRODUCTS || [],
    activeCategory: 'Todos',
    searchQuery: '',
    filters: {
      color: null,
      talla: null,
      disponibilidad: null
    },
    currentProduct: null,
    selectedSize: null
  };

  // Referencias a elementos del DOM
  const dom = {
    headerWhatsAppBtn: document.getElementById('headerWhatsAppBtn'),
    categoriesContainer: document.getElementById('categoriesContainer'),
    productsGrid: document.getElementById('productsGrid'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    filterBtnTrigger: document.getElementById('filterBtnTrigger'),
    filterBadge: document.getElementById('filterBadge'),
    resultsCount: document.getElementById('resultsCount'),
    activeFiltersContainer: document.getElementById('activeFiltersContainer'),
    
    // Vista individual de producto
    productModalBackdrop: document.getElementById('productModalBackdrop'),
    backToCatalogBtn: document.getElementById('backToCatalogBtn'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    detailMainImage: document.getElementById('detailMainImage'),
    detailCategoryBadge: document.getElementById('detailCategoryBadge'),
    detailTitle: document.getElementById('detailTitle'),
    detailRef: document.getElementById('detailRef'),
    detailAvailability: document.getElementById('detailAvailability'),
    detailPrice: document.getElementById('detailPrice'),
    detailColorSwatch: document.getElementById('detailColorSwatch'),
    detailColorName: document.getElementById('detailColorName'),
    detailSizesContainer: document.getElementById('detailSizesContainer'),
    detailDescText: document.getElementById('detailDescText'),
    detailBulletsList: document.getElementById('detailBulletsList'),
    btnPrimaryWhatsApp: document.getElementById('btnPrimaryWhatsApp'),
    btnSecondaryCopy: document.getElementById('btnSecondaryCopy'),
    btnSecondaryShare: document.getElementById('btnSecondaryShare'),

    // Drawer de filtros
    filterDrawerBackdrop: document.getElementById('filterDrawerBackdrop'),
    filterDrawer: document.getElementById('filterDrawer'),
    filterDrawerCloseBtn: document.getElementById('filterDrawerCloseBtn'),
    filterColorsContainer: document.getElementById('filterColorsContainer'),
    filterSizesContainer: document.getElementById('filterSizesContainer'),
    btnDrawerClear: document.getElementById('btnDrawerClear'),
    btnDrawerApply: document.getElementById('btnDrawerApply'),

    // Modal de WhatsApp Config
    btnConfigWhatsApp: document.getElementById('btnConfigWhatsApp'),
    configModalBackdrop: document.getElementById('configModalBackdrop'),
    configModalCloseBtn: document.getElementById('configModalCloseBtn'),
    configPhoneInput: document.getElementById('configPhoneInput'),
    btnSaveConfigPhone: document.getElementById('btnSaveConfigPhone'),

    // Contenedor de Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // Normalizador de texto para búsquedas sin acentos
  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  };

  // ==========================================
  // 1. GESTIÓN Y RENDERIZADO DE CATEGORÍAS
  // ==========================================
  const initCategories = () => {
    // Extraer categorías dinámicas reales
    const categoriesSet = new Set();
    state.products.forEach(p => {
      if (p.categoria) categoriesSet.add(p.categoria);
    });
    const categories = ['Todos', ...Array.from(categoriesSet)];

    dom.categoriesContainer.innerHTML = '';
    categories.forEach(cat => {
      const count = cat === 'Todos' 
        ? state.products.length 
        : state.products.filter(p => p.categoria === cat).length;

      const chip = document.createElement('button');
      chip.className = `category-chip ${cat === state.activeCategory ? 'active' : ''}`;
      chip.innerHTML = `<span>${cat}</span><span class="category-count">(${count})</span>`;
      chip.addEventListener('click', () => {
        state.activeCategory = cat;
        updateCategoriesUI();
        applyFiltersAndRender();
      });
      dom.categoriesContainer.appendChild(chip);
    });
  };

  const updateCategoriesUI = () => {
    const chips = dom.categoriesContainer.querySelectorAll('.category-chip');
    chips.forEach(chip => {
      const catName = chip.querySelector('span').textContent;
      if (catName === state.activeCategory) {
        chip.classList.add('active');
        chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        chip.classList.remove('active');
      }
    });
  };

  // ==========================================
  // 2. FILTRADO Y MOTOR DE BÚSQUEDA
  // ==========================================
  const getFilteredProducts = () => {
    const query = normalize(state.searchQuery);

    return state.products.filter(p => {
      // Filtro de Categoría
      if (state.activeCategory !== 'Todos' && p.categoria !== state.activeCategory) {
        return false;
      }

      // Filtro de Búsqueda
      if (query) {
        const matchName = normalize(p.nombre).includes(query);
        const matchRef = normalize(p.referencia).includes(query);
        const matchCat = normalize(p.categoria).includes(query);
        const matchColor = normalize(p.color).includes(query);
        const matchDesc = normalize(p.descripcion).includes(query);
        if (!matchName && !matchRef && !matchCat && !matchColor && !matchDesc) {
          return false;
        }
      }

      // Filtro de Color
      if (state.filters.color && p.color !== state.filters.color) {
        return false;
      }

      // Filtro de Talla
      if (state.filters.talla && (!p.tallas || !p.tallas.includes(state.filters.talla))) {
        return false;
      }

      // Filtro de Disponibilidad
      if (state.filters.disponibilidad && p.disponibilidad !== state.filters.disponibilidad) {
        return false;
      }

      return true;
    });
  };

  const applyFiltersAndRender = () => {
    const filtered = getFilteredProducts();
    renderProductGrid(filtered);
    updateFilterBadge();
    renderActiveFiltersChips();
  };

  const updateFilterBadge = () => {
    let count = 0;
    if (state.filters.color) count++;
    if (state.filters.talla) count++;
    if (state.filters.disponibilidad) count++;

    if (count > 0) {
      dom.filterBadge.style.display = 'inline-flex';
      dom.filterBadge.textContent = count;
    } else {
      dom.filterBadge.style.display = 'none';
    }
  };

  const renderActiveFiltersChips = () => {
    dom.activeFiltersContainer.innerHTML = '';
    const chips = [];

    if (state.filters.color) {
      chips.push({ label: `Color: ${state.filters.color}`, key: 'color' });
    }
    if (state.filters.talla) {
      chips.push({ label: `Talla: ${state.filters.talla}`, key: 'talla' });
    }
    if (state.filters.disponibilidad) {
      chips.push({ label: state.filters.disponibilidad, key: 'disponibilidad' });
    }

    chips.forEach(c => {
      const el = document.createElement('div');
      el.className = 'active-chip';
      el.innerHTML = `<span>${c.label}</span> <span class="active-chip-remove">&times;</span>`;
      el.querySelector('.active-chip-remove').addEventListener('click', () => {
        state.filters[c.key] = null;
        syncFilterDrawerInputs();
        applyFiltersAndRender();
      });
      dom.activeFiltersContainer.appendChild(el);
    });
  };

  // ==========================================
  // 3. RENDERIZADO DEL CATÁLOGO DE PRODUCTOS
  // ==========================================
  const renderProductGrid = (items) => {
    dom.productsGrid.innerHTML = '';
    dom.resultsCount.textContent = `Mostrando ${items.length} ${items.length === 1 ? 'prenda' : 'prendas'}`;

    if (items.length === 0) {
      dom.productsGrid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h3>No encontramos prendas con esos criterios</h3>
          <p>Prueba buscando con otro término o restablece los filtros aplicados.</p>
          <button id="btnResetFilters" class="action-btn" style="padding: 10px 24px; font-size: 0.9rem;">Restablecer filtros</button>
        </div>
      `;
      document.getElementById('btnResetFilters')?.addEventListener('click', () => {
        state.searchQuery = '';
        dom.searchInput.value = '';
        dom.searchClearBtn.classList.remove('visible');
        state.activeCategory = 'Todos';
        state.filters = { color: null, talla: null, disponibilidad: null };
        updateCategoriesUI();
        syncFilterDrawerInputs();
        applyFiltersAndRender();
      });
      return;
    }

    items.forEach(product => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${product.nombre}, Referencia ${product.referencia}`);

      const sizesHtml = product.tallas 
        ? product.tallas.map(t => `<span class="size-pill-mini">${t}</span>`).join('')
        : '';

      card.innerHTML = `
        <div class="card-image-wrapper">
          ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
          <span class="card-color-dot" style="background-color: ${product.colorHex || '#ccc'};" title="${product.color}"></span>
          <img 
            src="${product.imagen}" 
            alt="${product.nombre}" 
            class="card-image"
            loading="lazy"
            width="600"
            height="800"
          />
          <div class="card-hover-overlay">
            <span class="card-quick-action">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Ver prenda
            </span>
          </div>
        </div>
        <div class="card-content">
          <span class="card-ref-badge">Ref. ${product.referencia}</span>
          <h3 class="card-title">${product.nombre}</h3>
          <div class="card-footer">
            <span class="card-price">${CONFIG.formatPrice(product.precio)}</span>
            <div class="card-sizes">${sizesHtml}</div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openProductModal(product);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProductModal(product);
        }
      });

      dom.productsGrid.appendChild(card);
    });
  };

  // ==========================================
  // 4. VISTA INDIVIDUAL DE PRODUCTO
  // ==========================================
  const openProductModal = (product, updateHash = true) => {
    state.currentProduct = product;
    state.selectedSize = (product.tallas && product.tallas.length > 0) ? product.tallas[0] : null;

    // Actualizar URL hash para permitir compartir directamente
    if (updateHash) {
      window.location.hash = `ref=${product.referencia}`;
    }

    // Datos principales
    dom.detailMainImage.src = product.imagen;
    dom.detailMainImage.alt = product.nombre;
    dom.detailCategoryBadge.textContent = product.categoria;
    dom.detailTitle.textContent = product.nombre;
    dom.detailRef.textContent = `Ref. ${product.referencia}`;
    
    // Disponibilidad
    dom.detailAvailability.textContent = product.disponibilidad || 'Disponible';
    if (product.disponibilidad === 'Últimas unidades') {
      dom.detailAvailability.className = 'detail-availability-badge warning';
    } else {
      dom.detailAvailability.className = 'detail-availability-badge';
    }

    // Precio
    dom.detailPrice.textContent = CONFIG.formatPrice(product.precio);

    // Color
    dom.detailColorSwatch.style.backgroundColor = product.colorHex || '#ccc';
    dom.detailColorName.textContent = product.color;

    // Tallas
    dom.detailSizesContainer.innerHTML = '';
    if (product.tallas && product.tallas.length > 0) {
      product.tallas.forEach(talla => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `size-btn ${talla === state.selectedSize ? 'active' : ''}`;
        btn.textContent = talla;
        btn.addEventListener('click', () => {
          state.selectedSize = talla;
          dom.detailSizesContainer.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updateWhatsAppLink();
        });
        dom.detailSizesContainer.appendChild(btn);
      });
    }

    // Descripción
    dom.detailDescText.textContent = product.descripcion;

    // Detalles / Viñetas
    dom.detailBulletsList.innerHTML = '';
    if (product.detalles && product.detalles.length > 0) {
      product.detalles.forEach(detalle => {
        const li = document.createElement('li');
        li.className = 'detail-bullet-item';
        li.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${detalle}</span>
        `;
        dom.detailBulletsList.appendChild(li);
      });
    }

    // Actualizar botón WhatsApp
    updateWhatsAppLink();

    // Mostrar modal y bloquear scroll de fondo
    dom.productModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeProductModal = (clearHash = true) => {
    dom.productModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    state.currentProduct = null;
    if (clearHash && window.location.hash.startsWith('#ref=')) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  const updateWhatsAppLink = () => {
    // El botón del header siempre apunta al enlace oficial de la asesora
    if (dom.headerWhatsAppBtn) {
      dom.headerWhatsAppBtn.href = CONFIG.officialWaLink;
    }
    if (!state.currentProduct) return;
    // El botón del modal de producto usa la consulta contextualizada
    const url = CONFIG.generateWhatsAppUrl(state.currentProduct, state.selectedSize);
    if (dom.btnPrimaryWhatsApp) {
      dom.btnPrimaryWhatsApp.href = url;
    }
  };

  // ==========================================
  // 5. COMPARTIR Y COPIAR INFORMACIÓN
  // ==========================================
  // Copiar información limpia del producto para pegar en chat
  dom.btnSecondaryCopy?.addEventListener('click', async () => {
    if (!state.currentProduct) return;
    const text = CONFIG.generateCleanCopyText(state.currentProduct, state.selectedSize);
    try {
      await navigator.clipboard.writeText(text);
      showToast('Información de prenda copiada para WhatsApp');
    } catch (err) {
      fallbackCopyText(text);
    }
  });

  // Botón Compartir (Web Share API con fallback)
  dom.btnSecondaryShare?.addEventListener('click', async () => {
    if (!state.currentProduct) return;
    const baseUrl = (window.location.origin && window.location.origin !== 'null' && !window.location.href.startsWith('file:'))
      ? `${window.location.origin}${window.location.pathname}`
      : window.location.href.split('#')[0];
    const shareUrl = `${baseUrl}#ref=${state.currentProduct.referencia}`;
    const shareData = {
      title: `${state.currentProduct.nombre} | MATILDA Boutique`,
      text: `Mira esta prenda en el catálogo de MATILDA: ${state.currentProduct.nombre} (Ref. ${state.currentProduct.referencia})`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyShareLink(shareUrl);
        }
      }
    } else {
      copyShareLink(shareUrl);
    }
  });

  const copyShareLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Enlace de la prenda copiado al portapapeles');
    } catch (err) {
      fallbackCopyText(url);
    }
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Copiado al portapapeles');
    } catch (err) {
      alert('Por favor copia el siguiente texto:\n\n' + text);
    }
    document.body.removeChild(textArea);
  };

  // Toast Notification
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3200);
  };

  // ==========================================
  // 6. DRAWER DE FILTROS AVANZADOS
  // ==========================================
  const initFilterDrawer = () => {
    // Colores únicos reales
    const colorsSet = new Set(state.products.map(p => p.color).filter(Boolean));
    dom.filterColorsContainer.innerHTML = '';
    colorsSet.forEach(color => {
      const sampleProduct = state.products.find(p => p.color === color);
      const hex = sampleProduct ? sampleProduct.colorHex : '#ccc';

      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'filter-color-chip';
      chip.dataset.color = color;
      chip.innerHTML = `
        <span class="color-swatch" style="background-color: ${hex}; width: 14px; height: 14px;"></span>
        <span>${color}</span>
      `;
      chip.addEventListener('click', () => {
        if (state.filters.color === color) {
          state.filters.color = null;
          chip.classList.remove('active');
        } else {
          state.filters.color = color;
          dom.filterColorsContainer.querySelectorAll('.filter-color-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
      });
      dom.filterColorsContainer.appendChild(chip);
    });

    // Tallas únicas reales
    const sizesSet = new Set();
    state.products.forEach(p => {
      if (p.tallas) p.tallas.forEach(t => sizesSet.add(t));
    });
    dom.filterSizesContainer.innerHTML = '';
    ['S', 'M', 'L'].forEach(talla => {
      if (sizesSet.has(talla)) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'size-btn';
        btn.dataset.talla = talla;
        btn.textContent = talla;
        btn.addEventListener('click', () => {
          if (state.filters.talla === talla) {
            state.filters.talla = null;
            btn.classList.remove('active');
          } else {
            state.filters.talla = talla;
            dom.filterSizesContainer.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          }
        });
        dom.filterSizesContainer.appendChild(btn);
      }
    });

    // Botones del Drawer
    dom.btnDrawerClear.addEventListener('click', () => {
      state.filters = { color: null, talla: null, disponibilidad: null };
      syncFilterDrawerInputs();
      applyFiltersAndRender();
      closeFilterDrawer();
    });

    dom.btnDrawerApply.addEventListener('click', () => {
      applyFiltersAndRender();
      closeFilterDrawer();
    });
  };

  const syncFilterDrawerInputs = () => {
    dom.filterColorsContainer.querySelectorAll('.filter-color-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.color === state.filters.color);
    });
    dom.filterSizesContainer.querySelectorAll('.size-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.talla === state.filters.talla);
    });
  };

  const openFilterDrawer = () => {
    syncFilterDrawerInputs();
    dom.filterDrawerBackdrop.classList.add('active');
    dom.filterDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeFilterDrawer = () => {
    dom.filterDrawerBackdrop.classList.remove('active');
    dom.filterDrawer.classList.remove('active');
    if (!dom.productModalBackdrop.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };

  // ==========================================
  // 7. EVENT LISTENERS GENERALES
  // ==========================================
  // Búsqueda
  dom.searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    dom.searchClearBtn.classList.toggle('visible', state.searchQuery.length > 0);
    applyFiltersAndRender();
  });

  dom.searchClearBtn?.addEventListener('click', () => {
    state.searchQuery = '';
    dom.searchInput.value = '';
    dom.searchClearBtn.classList.remove('visible');
    dom.searchInput.focus();
    applyFiltersAndRender();
  });

  // Disparador de Filtros
  dom.filterBtnTrigger?.addEventListener('click', openFilterDrawer);
  dom.filterDrawerCloseBtn?.addEventListener('click', closeFilterDrawer);
  dom.filterDrawerBackdrop?.addEventListener('click', closeFilterDrawer);

  // Modal Producto
  dom.backToCatalogBtn?.addEventListener('click', () => closeProductModal(true));
  dom.modalCloseBtn?.addEventListener('click', () => closeProductModal(true));
  dom.productModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === dom.productModalBackdrop) {
      closeProductModal(true);
    }
  });

  // Modal Configuración de WhatsApp
  dom.btnConfigWhatsApp?.addEventListener('click', () => {
    dom.configPhoneInput.value = CONFIG.whatsappPhone;
    dom.configModalBackdrop.classList.add('active');
  });

  dom.configModalCloseBtn?.addEventListener('click', () => {
    dom.configModalBackdrop.classList.remove('active');
  });

  dom.configModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === dom.configModalBackdrop) {
      dom.configModalBackdrop.classList.remove('active');
    }
  });

  dom.btnSaveConfigPhone?.addEventListener('click', () => {
    const val = dom.configPhoneInput.value.trim();
    if (val) {
      CONFIG.setWhatsAppPhone(val);
      showToast('Número de WhatsApp actualizado');
      dom.configModalBackdrop.classList.remove('active');
      updateWhatsAppLink();
    }
  });

  // Clic en la marca MATILDA para resetear filtros e ir arriba
  document.querySelector('.brand-title')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.activeCategory = 'Todos';
    state.searchQuery = '';
    dom.searchInput.value = '';
    dom.searchClearBtn.classList.remove('visible');
    state.filters = { color: null, talla: null, disponibilidad: null };
    updateCategoriesUI();
    syncFilterDrawerInputs();
    applyFiltersAndRender();
    closeProductModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Soporte de Teclado (Escape para cerrar modales)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (dom.productModalBackdrop.classList.contains('active')) {
        closeProductModal(true);
      } else if (dom.filterDrawer.classList.contains('active')) {
        closeFilterDrawer();
      } else if (dom.configModalBackdrop.classList.contains('active')) {
        dom.configModalBackdrop.classList.remove('active');
      }
    }
  });

  // ==========================================
  // 8. DEEP LINKING POR HASH (#ref=MAT-COR-001)
  // ==========================================
  const checkUrlHash = () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#ref=')) {
      const ref = decodeURIComponent(hash.replace('#ref=', '')).trim();
      const product = state.products.find(p => p.referencia.toLowerCase() === ref.toLowerCase());
      if (product) {
        openProductModal(product, false);
      }
    } else if (dom.productModalBackdrop.classList.contains('active')) {
      closeProductModal(false);
    }
  };

  window.addEventListener('hashchange', checkUrlHash);

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  initCategories();
  initFilterDrawer();
  applyFiltersAndRender();
  updateWhatsAppLink();
  checkUrlHash();
});
