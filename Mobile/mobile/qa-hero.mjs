export default async function run(page, ui) {
  await page.setViewportSize({ width: 412, height: 900 });
  await page.waitForTimeout(1500);

  // Descobre qual elemento realmente rola a página (no web do RN é um div interno)
  const scroller = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('div'));
    const target = candidates.find(
      (el) => el.scrollHeight > el.clientHeight + 50 && el.clientHeight > 300
    );
    if (!target) return null;
    target.setAttribute('data-qa-scroller', '1');
    return { scrollHeight: target.scrollHeight, clientHeight: target.clientHeight };
  });

  const scrollTop = await page.evaluate(() => {
    const el = document.querySelector('[data-qa-scroller="1"]');
    if (el) el.scrollTop = 0;
    return el ? el.scrollTop : null;
  });
  await page.waitForTimeout(800);

  await page.screenshot({ path: 'qa-hero.png' });

  const botoes = await page.evaluate(() => {
    const find = (t) =>
      Array.from(document.querySelectorAll('*')).find((n) => n.textContent?.trim() === t);
    const r = (el) => {
      const b = el?.getBoundingClientRect();
      return b ? { w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top) } : null;
    };
    return { fazerDoacao: r(find('Fazer doação')), verOngs: r(find('Ver ONGs')) };
  });

  return { scroller, scrollTop, botoes };
}