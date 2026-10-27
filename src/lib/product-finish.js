const dtfKeys = new Set(['ninja', 'japones', 'juggernaut', 'muertos']);

export function finishTypeFor(product) {
  if (product.finishType) return product.finishType;
  if (product.key === 'espadas') return 'Con bordado';
  return dtfKeys.has(product.key) ? 'Solo DTF' : 'Por confirmar';
}

export function finishFor(product) {
  if (product.finish?.trim()) return product.finish.trim();
  if (product.key === 'espadas') return 'Bordados de pecho y manga incluidos.';
  if (finishTypeFor(product) === 'Solo DTF') return 'Acabado incluido: solo DTF.';
  if (finishTypeFor(product) === 'Con bordado') return 'Con bordado incluido en este diseño.';
  return 'Consulta el acabado de este diseño antes de pedir.';
}
