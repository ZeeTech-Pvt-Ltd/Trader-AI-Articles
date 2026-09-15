// Renders pool templates with per-article context.
export function render(template, ctx) {
  return template.replace(/\{(name|min|assets|rating)\}/g, (_, key) => ctx[key] ?? `{${key}}`)
}

export function renderList(list, ctx) {
  return list.map((item) => render(item, ctx))
}
