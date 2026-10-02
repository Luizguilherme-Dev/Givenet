export default async function run(page, ui) {
  await page.setViewportSize({ width: 412, height: 900 });
  await page.waitForTimeout(2000);

  // Hero
  await page.screenshot({ path: 'qa-hero.png' });

  const botoes = await page.evaluate(() => {
    const find = (t) =>
      Array.from(document.querySelectorAll('*')).find((n) => n.textContent?.trim() === t);
    const r = (el) => {
      const b = el?.getBoundingClientRect();
      return b ? { w: Math.round(b.width), h: Math.round(b.height) } : null;
    };
    return { fazerDoacao: r(find('Fazer doação')), verOngs: r(find('Ver ONGs')) };
  });

  // Rola até o bloco de impacto / como funciona
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(
      (n) => n.textContent?.trim() === 'Nosso impacto'
    );
    el?.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'qa-impacto.png' });

  // Mede o espaço entre o último stat e o cabeçalho "Como funciona"
  const espaco = await page.evaluate(() => {
    const find = (t) =>
      Array.from(document.querySelectorAll('*')).find((n) => n.textContent?.trim() === t);
    const stat = find('Gratuito e seguro')?.closest('div');
    const cf = find('Como funciona');
    const a = stat?.getBoundingClientRect();
    const b = cf?.getBoundingClientRect();
    return a && b ? Math.round(b.top - a.bottom) : null;
  });

  return { botoes, gapStatParaComoFunciona: espaco };
}