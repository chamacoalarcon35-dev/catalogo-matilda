/**
 * MATILDA Boutique - Configuración General
 * Datos de contacto oficial, tienda física, redes sociales y plantillas.
 */

const CONFIG = {
  brandName: 'MATILDA',
  brandTagline: 'Boutique Femenina',
  catalogSubtitle: 'Nueva Colección • Catálogo Digital Exclusivo',
  
  // Enlace oficial de WhatsApp de la asesora
  officialWaLink: 'https://wa.link/5y71ui',

  // Número comercial verificado asociado a wa.link/5y71ui (+57 320 255 1542)
  whatsappPhone: localStorage.getItem('matilda_whatsapp_phone') || '573202551542',

  // Tienda Física Real
  store: {
    name: 'MATILDA | ROPA FEMENINA',
    address: 'Cl. 10 # 0-51',
    city: 'Cúcuta, Norte de Santander, Colombia',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cl.+10+%23+0-51%2C+C%C3%BAcuta%2C+Norte+de+Santander%2C+Colombia'
  },

  // Redes Sociales Oficiales
  social: {
    facebookName: 'Matildaesmoda',
    facebookUrl: 'https://www.facebook.com/Matildaesmoda'
  },

  // Configuración de Moneda
  currency: {
    locale: 'es-CO',
    currency: 'COP',
    symbol: '$',
    fractionDigits: 0
  },

  // Plantilla para consulta contextualizada por WhatsApp
  generateWhatsAppMessage: (product, selectedSize) => {
    const sizeText = selectedSize ? selectedSize : (product.tallas && product.tallas.length > 0 ? product.tallas.join(', ') : 'Por confirmar');
    const refLine = product.referencia ? `\nRef. ${product.referencia}` : '';
    return `Hola, estoy interesada en la prenda ${product.nombre.toUpperCase()}.${refLine}
Color: ${product.color}
Talla: ${sizeText}
¿Me pueden confirmar precio y disponibilidad?`;
  },

  // URL directa contextualizada hacia la asesora
  generateWhatsAppUrl: (product, selectedSize) => {
    if (!product) return CONFIG.officialWaLink;
    const msg = CONFIG.generateWhatsAppMessage(product, selectedSize);
    return `https://wa.me/${CONFIG.whatsappPhone}?text=${encodeURIComponent(msg)}`;
  },

  // Plantilla para copiar información limpia al portapapeles
  generateCleanCopyText: (product, selectedSize) => {
    const sizeText = selectedSize ? selectedSize : (product.tallas && product.tallas.length > 0 ? product.tallas.join(', ') : 'Por confirmar');
    const refLine = product.referencia ? `Ref. ${product.referencia}\n` : '';
    const priceLine = (typeof product.precio === 'number' && product.precio > 0)
      ? `Precio: ${CONFIG.formatPrice(product.precio)}\n`
      : 'Precio: Por consultar\n';
    const baseUrl = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && (!window.location.href || !window.location.href.startsWith('file:')))
      ? `${window.location.origin}${window.location.pathname || ''}`
      : (typeof window !== 'undefined' && window.location && window.location.href ? window.location.href.split('#')[0] : '');
    const hashRef = product.referencia ? `#ref=${product.referencia}` : (product.slug ? `#p=${product.slug}` : '');
    const linkLine = (baseUrl && hashRef) ? `\nCatálogo MATILDA: ${baseUrl}${hashRef}` : '';
    return `${product.nombre.toUpperCase()}
${refLine}${priceLine}Color: ${product.color}
Talla: ${sizeText}${linkLine}`;
  },

  // Formateador de precios en moneda local COP
  formatPrice: (amount) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return amount || 'Consultar precio';
    return new Intl.NumberFormat(CONFIG.currency.locale, {
      style: 'currency',
      currency: CONFIG.currency.currency,
      maximumFractionDigits: CONFIG.currency.fractionDigits
    }).format(amount).replace(/\s+/g, '');
  },

  // Actualizar número de WhatsApp
  setWhatsAppPhone: (newPhone) => {
    const cleanPhone = newPhone.replace(/\D/g, '');
    localStorage.setItem('matilda_whatsapp_phone', cleanPhone);
    CONFIG.whatsappPhone = cleanPhone;
  }
};
