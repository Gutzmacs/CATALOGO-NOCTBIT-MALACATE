// Keep the recognizable cover independent from the order of the gallery views.
export function coverPhotoFor(product) {
  return product.photos.find(photo => photo.cover)
    || product.photos.find(photo => /^Vista (frontal|trasera)/i.test(photo.alt))
    || product.photos[0];
}
