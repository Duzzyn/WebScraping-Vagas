const pup = require("puppeteer")
const readline = require("node:readline");
const { temProximaPagina, proximaPagina } = require("./nextPage.js")

const url = 'https://www.empregos.com.br/';
let count = 1;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question("Digite um cargo para buscar: ", async (answerVaga) => {
    rl.question("Digite um local para sua vaga: ", async (answerLocal) => {
        const searchForVaga = answerVaga;
        const searchForLocal = answerLocal;
        console.log(`Você buscou por: ${answerVaga} na cidade: ${answerLocal}`)
    
        const browser = await pup.launch({ headless: false }); // inicializa o navegador e define que veremos isso por baixo do pano, com o true, não veremos nada acontecer.
        const page = await browser.newPage(); // abre uma nova aba/pagina
    
        try {
            await page.goto(url); // navega para a url desejada
            await page.waitForSelector('#ctl00_ContentBody_ucSuggestCargo_txtCargo'); // se não usar ese metodo, irá dar erro, pois a página não vai esperar carregar e executar
            // o próximo código pra redirecionar
            await page.type("#ctl00_ContentBody_ucSuggestCargo_txtCargo", searchForVaga); // pesquisa "Desenvolvedor" no input com o id "#ctl00_ContentBody_ucSuggestCargo_txtCargo"
            await page.type("#ctl00_ContentBody_ucSuggestCidade_txtCidade", searchForLocal);
    
            await Promise.all([ // vai conseguir navegar entre as paginas corretamente, pois o puppeteer tem o problema de esperar a navegação entre páginas
                page.waitForNavigation(),
                await page.click('#ctl00_ContentBody_lnkBuscar') // clica em pesquisar no input com o id "#ctl00_ContentBody_lnkBuscar"
            ])
    
            const links = await page.$$eval('.descricao > h2 > a', el => el.map(link => link.href)); // o $$eval é uma função que funciona como o querySelectorAll,
            // ele passa por todos elementos e pega o href do link 
            console.log(links)
    
            // enquanto o botão de próximo existir, clica e pega cada info de cada pag.
            while (await temProximaPagina(page)) {
                // pra cada vaga, clica na vaga e pega as informações subsequentes
                for (const link of links) {
                    console.log('Página', count);
                    await page.goto(link);
    
                    const titulo = await page.$eval('.flex > h1', element => element.innerText);
                    const empresa = await page.$eval('.flex > h2 > a', element => element.innerText);
                    const local = await page.$eval('.grow > h2', element => element.textContent);
                    const salario = await page.$eval('.grow > h2:nth-of-type(2)', element => element.textContent)
                    const descricao = await page.$eval('.info > p', element => element.textContent);
    
                    const obj = { titulo, empresa, local, salario, descricao }
                    console.log(obj)
    
                    count++;
                }
                await Promise.all([
                    page.waitForNavigation(),
                    page.goBack()
                ]);
                await proximaPagina(page);
            }
        } catch (error) {
            console.error(`Erro durante a execução: ${error}`)
        } finally {
            await browser.close();
            rl.close();
        }
    })
});