export default async function run(page, ui) {
  try {
    await page.waitForSelector(".splash-btn", { timeout: 15000 });
    await page.click(".splash-btn");
  } catch {
    /* splash já dispensado */
  }
  await page.waitForTimeout(1000);

  // Toast REAL do react-toastify, mesma API usada pelo app (autoClose 1200ms).
  // Não altera nada da aplicação: apenas dispara pela API pública da lib.
  await page.evaluate(() => {
    const mod = window.__gnToastify;
    if (!mod) return;
    mod.toast.success("Doação registrada com sucesso!", { autoClose: 1200 });
    mod.toast.error("Erro ao salvar doação.", { autoClose: 1200 });
    mod.toast.warning("Por favor, preencha todos os campos.", { autoClose: 1200 });
    mod.toast.info("Confirme a entrega com o PIN.", { autoClose: 1200 });
  });

  await page.waitForTimeout(500);

  const amostra = async (rotulo) =>
    page.evaluate((r) => {
      const toasts = [...document.querySelectorAll(".Toastify__toast")];
      const t = toasts[0];
      if (!t) return { rotulo: r, qtd: 0 };
      const cs = getComputedStyle(t);
      const ico = t.querySelector(".Toastify__toast-icon");
      const csIco = ico ? getComputedStyle(ico) : null;
      const bar = t.querySelector(".Toastify__progress-bar");
      const rIco = ico ? ico.getBoundingClientRect() : null;
      return {
        rotulo: r,
        qtd: toasts.length,
        classeSaida: t.className.match(/Toastify__[a-z]+-exit[^\s]*/)?.[0] || null,
        animacao: cs.animationName,
        opacity: cs.opacity,
        icone: csIco && {
          cor: csIco.color,
          bg: csIco.backgroundImage.slice(0, 44),
          borda: csIco.borderColor,
          brilho: csIco.boxShadow.slice(0, 44),
          largura: rIco && Math.round(rIco.width),
        },
        barraLargura: bar ? Math.round(bar.getBoundingClientRect().width) : null,
      };
    }, rotulo);

  const durante = await amostra("durante (barra correndo)");
  await page.waitForTimeout(1400); // passou o autoClose de 1200ms
  const naSaida = await amostra("logo apos o autoClose");

  // Aguarda o tempo real de remoção + folga
  await page.waitForTimeout(1600);
  const depois = await page.evaluate(() => ({
    toastsNoDom: document.querySelectorAll(".Toastify__toast").length,
    containersNoDom: document.querySelectorAll(".Toastify__toast-container").length,
  }));

  return { durante, naSaida, depois };
}