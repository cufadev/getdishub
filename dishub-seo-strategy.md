# ESTRATEGIA SEO — DISHUB
## Mercado: LATAM hispanohablante (MX, AR, CO, CL, PE, ES)
## Target: Dueños de restaurantes, bares, dark kitchens

---

## 1. KEYWORDS ESTRATÉGICAS

### Cluster 1 — Carta / Menú Digital
```
VOLUMEN ALTO (competencia media)
carta digital para restaurante
menú digital QR restaurante
menú digital sin app
carta QR gratis
menú digital restaurante México / Argentina / Colombia

VOLUMEN MEDIO (long tail, fácil de rankear)
cómo hacer una carta digital para mi restaurante
carta digital con QR para imprimir
menú online para restaurante pequeño
reemplazar carta de papel restaurante
```

### Cluster 2 — Reservas Online
```
VOLUMEN ALTO
sistema de reservas para restaurante
reservas online restaurante
app reservas restaurante
gestión de reservas restaurante

LONG TAIL
cómo tomar reservas sin WhatsApp restaurante
sistema de reservas gratis restaurante
reservas online para bar
evitar perder reservas restaurante
```

### Cluster 3 — Pago en Mesa / QR
```
VOLUMEN MEDIO (keyword emergente, poco competida)
cobro en mesa QR restaurante
pagar la cuenta desde el celular restaurante
sistema de pago QR mesa restaurante
cobro sin mozo restaurante
pago sin contacto restaurante

LONG TAIL
cómo cobrar en la mesa con QR
sistema para que el cliente pague solo en la mesa
```

### Cluster 4 — Marca / Competencia
```
alternativa a Fudo restaurante
alternativa a Menues.app
plataforma digital para restaurantes sin comisión
sistema todo en uno restaurante
software gastronomía pequeño negocio
```

---

## 2. ARQUITECTURA DE CONTENIDO

### Páginas core (ya existen o están por crearse)
```
getdishub.app/                    → Home institucional
getdishub.app/productos/carta     → Landing carta digital
getdishub.app/productos/reservas  → Landing reservas online
getdishub.app/productos/table-hub → Landing Table Hub
getdishub.app/planes              → Precios
getdishub.app/demo                → Demo interactivo
```

### Blog (contenido SEO — a crear)
```
getdishub.app/blog/

Artículos prioritarios:
→ "Cómo crear una carta digital para tu restaurante en 2025"
→ "Por qué tu restaurante necesita un menú QR"
→ "Cómo dejar de tomar reservas por WhatsApp"
→ "Qué es una dark kitchen y qué tecnología necesita"
→ "Cobro en mesa con QR: guía completa para restaurantes"
→ "Alternativas a Rappi y PedidosYa para tu restaurante"
→ "Cómo conseguir más reseñas en Google Maps para tu local"
```

### Landing pages por país (cuando escales)
```
getdishub.app/mx → México
getdishub.app/co → Colombia
getdishub.app/cl → Chile
(o subdominios: mx.getdishub.app)
```

---

## 3. ON-PAGE SEO — IMPLEMENTACIÓN TÉCNICA

### Meta tags por página

#### Home
```html
<title>Dishub — Plataforma digital para restaurantes | Carta, Reservas y Pagos QR</title>
<meta name="description" content="Digitalizá tu restaurante con carta QR, reservas online y cobro desde la mesa. Sin comisiones. Sin Rappi. Tu tecnología propia en 2-3 semanas.">
<meta name="keywords" content="carta digital restaurante, menú QR, reservas online restaurante, cobro QR mesa, sistema restaurante LATAM">
<link rel="canonical" href="https://getdishub.app/">
```

#### Carta Digital
```html
<title>Carta Digital con QR para Restaurantes | Dishub</title>
<meta name="description" content="Creá tu menú digital con QR en minutos. Actualizá precios y platos desde el admin. Sin app, sin papel. Ideal para restaurantes, bares y dark kitchens.">
```

#### Table Hub
```html
<title>Table Hub — Pedido y Pago desde la Mesa con QR | Dishub</title>
<meta name="description" content="El cliente escanea el QR, ve la carta, paga y deja reseña sin esperar al mozo. Comandas en tiempo real para tu equipo.">
```

#### Reservas
```html
<title>Reservas Online para Restaurantes sin WhatsApp | Dishub</title>
<meta name="description" content="Sistema de reservas online para restaurantes. Tus clientes reservan 24/7, vos confirmás desde el panel. Sin WhatsApp, sin llamadas.">
```

---

## 4. JSON-LD SCHEMA MARKUP

### Home — Organization
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dishub",
  "url": "https://getdishub.app",
  "logo": "https://getdishub.app/logo.png",
  "description": "Plataforma de tecnología gastronómica para restaurantes de LATAM",
  "foundingLocation": {
    "@type": "Place",
    "name": "Buenos Aires, Argentina"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "description": "América Latina y España"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "150",
    "highPrice": "800"
  },
  "sameAs": [
    "https://instagram.com/dishub.app",
    "https://linkedin.com/company/dishub"
  ]
}
```

### Página de Planes — PriceSpecification
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Dishub Table Hub",
  "description": "Suite completa de tecnología para restaurantes con carta digital, reservas, cobro QR y comandas en tiempo real",
  "offers": [
    {
      "@type": "Offer",
      "name": "Menú Digital",
      "price": "150",
      "priceCurrency": "USD",
      "description": "Carta digital con QR para dark kitchens y deliverys"
    },
    {
      "@type": "Offer",
      "name": "Starter",
      "price": "300",
      "priceCurrency": "USD"
    },
    {
      "@type": "Offer",
      "name": "PRO",
      "price": "500",
      "priceCurrency": "USD"
    },
    {
      "@type": "Offer",
      "name": "Table Hub",
      "price": "800",
      "priceCurrency": "USD"
    }
  ]
}
```

### FAQ Schema (para el home o planes)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto tarda en estar listo mi restaurante digital?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Entre 2 y 3 semanas desde que nos contactás. El tiempo depende de si tenés fotos de tus platos o necesitás sesión de fotos."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cobran comisión por cada venta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Dishub cobra un precio único de deploy y una tarifa fija mensual de mantenimiento. Sin comisiones por venta."
      }
    },
    {
      "@type": "Question",
      "name": "¿Funciona para dark kitchens y deliverys?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. El plan Menú Digital está diseñado específicamente para dark kitchens, deliverys propios y food trucks."
      }
    },
    {
      "@type": "Question",
      "name": "¿Puedo cambiar de plan después?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. Podés escalar tu plan en cualquier momento pagando la diferencia del deploy más el nuevo mantenimiento mensual."
      }
    }
  ]
}
```

---

## 5. OPEN GRAPH + TWITTER CARDS

```html
<!-- Open Graph -->
<meta property="og:title" content="Dishub — Tu restaurante, digitalizado.">
<meta property="og:description" content="Carta QR, reservas online y cobro desde la mesa. Sin comisiones. Sin Rappi.">
<meta property="og:image" content="https://getdishub.app/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://getdishub.app">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_AR">
<meta property="og:locale:alternate" content="es_MX">
<meta property="og:locale:alternate" content="es_ES">
<meta property="og:site_name" content="Dishub">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Dishub — Tu restaurante, digitalizado.">
<meta name="twitter:description" content="Carta QR, reservas y cobro QR desde la mesa. Sin comisiones.">
<meta name="twitter:image" content="https://getdishub.app/og-image.jpg">
```

### OG Image (diseño sugerido)
```
Fondo: #0d0d0d
Texto: "DISHUB" grande en blanco + naranja
Subtítulo: "Tu restaurante, digitalizado."
Tagline pequeño: "Carta · Reservas · Table Hub · WhatsApp IA"
Medidas: 1200x630px
```

---

## 6. SITEMAP.XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://getdishub.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://getdishub.app/productos/carta</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://getdishub.app/productos/reservas</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://getdishub.app/productos/table-hub</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://getdishub.app/planes</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://getdishub.app/demo</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 7. ROBOTS.TXT

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Sitemap: https://getdishub.app/sitemap.xml
```

---

## 8. VELOCIDAD Y CORE WEB VITALS

```
PRIORIDADES TÉCNICAS
─────────────────────────────────────
→ Precargar Google Fonts con preconnect
→ Lazy load en imágenes (loading="lazy")
→ Comprimir OG image y assets (WebP)
→ Minificar CSS/JS en producción
→ Lighthouse score objetivo: 90+ en todas las métricas
```

```html
<!-- En el <head>, antes de cargar fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

## 9. LINK BUILDING — PRIMERAS ACCIONES

```
QUICK WINS (gratis, esta semana)
─────────────────────────────────────
1. Google Business Profile para Dishub
   → categoría: "Empresa de software"
   → descripción con keywords
   → URL: getdishub.app

2. Directorios de SaaS LATAM
   → ProductHunt (lanzar cuando esté lista la v1)
   → Capterra (agregar listing gratis)
   → G2 (listing gratis)
   → SoftwareAdvice

3. Directorios de startups ARG/MX
   → Endeavor
   → NXTP Labs blog
   → StartupBlink

MEDIANO PLAZO
─────────────────────────────────────
→ Guest posts en blogs gastronómicos LATAM
→ Menciones en grupos de Facebook de dueños de restaurantes
   (MX tiene grupos enormes: "Restauranteros México", etc.)
→ Colaboración con fotógrafos gastronómicos
   (clientes naturales que te pueden recomendar)
```
