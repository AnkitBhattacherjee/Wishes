export function getScrapbookScale(): number {
  const container = document.getElementById('scrapbook-page-to-save');
  if (container) {
    const rect = container.getBoundingClientRect();
    const width = container.offsetWidth;
    if (width > 0 && rect.width > 0) {
      return rect.width / width;
    }
  }
  return 0.85;
}

