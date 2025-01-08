async function temProximaPagina(page) {
    const proximo = await page.$("#ctl00_ContentBody_lkbPaginacaoTopProximo")
    return proximo !== null;
}

async function proximaPagina(page) {
    await page.click("#ctl00_ContentBody_lkbPaginacaoTopProximo") ESTÁ RETORNANDO NULL
    await page.waitForNavigation()
}

module.exports = {
    temProximaPagina,
    proximaPagina
}
