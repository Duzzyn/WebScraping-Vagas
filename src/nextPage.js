async function temProximaPagina(page) {
  const proximo = await page.$("#ctl00_ContentBody_lkbPaginacaoTopProximo");
  if (!proximo) {
    return false;
  } else {
    const botaoVisivel = await page.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.display !== "none";
    }, proximo);
    console.log(botaoVisivel)
    return botaoVisivel;
  }
}

module.exports = {
  temProximaPagina,
};