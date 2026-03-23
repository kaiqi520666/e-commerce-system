export function sanitizeHtml(html) {
  if (!html) {
    return ''
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return String(html)
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(String(html), 'text/html')
  const blockedTags = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']

  blockedTags.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((node) => node.remove())
  })

  doc.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()

      if (name.startsWith('on')) {
        element.removeAttribute(attr.name)
      }

      if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) {
        element.removeAttribute(attr.name)
      }
    })
  })

  return doc.body.innerHTML
}
