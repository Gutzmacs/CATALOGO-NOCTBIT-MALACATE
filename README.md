# NOCTBIT × Malacate

Catálogo de ropa de Seb y Nai. Astro estático, fotos ampliables, animaciones por colección, juego y pedidos por WhatsApp.

## Desarrollo

Node.js 24. `npm ci` y `npm run build`. Salida: `dist/`. `npm run dev:astro` inicia el entorno de desarrollo.

## Editar sin programar

1. Abre https://app.pagescms.org y entra con GitHub.
2. Autoriza Pages CMS únicamente para este repositorio.
3. Selecciona `Gutzmacs/CATALOGO-NOCTBIT-MALACATE`, rama `main`.
4. En **Productos y precios**, edita nombres, descripciones, precios por talla y fotos. La primera foto es la portada de galería. Los identificadores deben ser únicos, en minúsculas y sin espacios. Marca y creador deben corresponder (NOCTBIT/Seb o Malacate/Nai).
5. Guarda. El flujo de GitHub Actions valida y compila el catálogo. Los campos vacíos de precio se muestran como «Consultar».

Las dimensiones y las versiones WebP de fotos se calculan durante la compilación. No borres imágenes usadas por logos, fondos, música o animaciones.

## Publicación

El sitio existente https://catalogo-oversize.exactmorel2.chatgpt.site permanece independiente: un commit en GitHub NO lo actualiza automáticamente.

Este repositorio incluye un flujo para GitHub Pages. Para activarlo: Settings → Pages → Source → GitHub Actions. Si Pages todavía no está habilitado, la compilación entrega un artefacto descargable `catalogo-web`, pero no publica. Una vez habilitado, ejecuta de nuevo el flujo.

La web utiliza rutas relativas para funcionar bajo el subdirectorio del repositorio. El nuevo alojamiento conserva el catálogo y las animaciones; revisa su URL antes de compartirla. Los cambios futuros guardados con Pages CMS vuelven a compilar y publicar en GitHub Pages.

Los precios originales publicados se han conservado. PDFs descargables históricos son documentos independientes y no cambian al editar el panel.

## Créditos

Se conservan los archivos de licencia y créditos del juego y de PhotoSwipe incluidos en el proyecto original. Las ilustraciones de prendas y logotipos pertenecen a sus respectivos creadores/titulares; este repositorio no concede licencia sobre ellas.
