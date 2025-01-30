const pup = require("puppeteer");
const readline = require("node:readline");
const { temProximaPagina } = require("./nextPage.js");

const url = 'https://www.empregos.com.br/';
let count = 1;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Digite um cargo para buscar: ", async (answerVaga) => {
  rl.question("Digite um local para sua vaga: ", async (answerLocal) => {
    const searchForVaga = "programador";
    const searchForLocal = "rj";
    console.log(`Você buscou por: "${answerVaga.toUpperCase()}" na cidade: "${answerLocal.toUpperCase()}"`);

    const browser = await pup.launch({ headless: false }); // Inicializa o navegador
    const page = await browser.newPage(); // Abre uma nova aba/página

    try {
      await page.goto(url + `vagas/${searchForLocal}/${searchForVaga}`); // Navega para a URL desejada      

      while (await temProximaPagina(page)) {
        console.log('Página', count);
        
        // Coleta os links das vagas da página atual
        const links = await page.$$eval('.descricao > h2 > a', el => el.map(link => link.href));
        console.log(links);
        
        // Para cada vaga, coleta as informações
        for (const link of links) {
          const paginaVagas = await browser.newPage()
          await paginaVagas.goto(link, { waitUntil: 'networkidle2' });
          
          const titulo = await paginaVagas.$eval('.flex > h1', element => element.innerText);
          const empresa = await paginaVagas.$eval('.flex > h2 > a', element => element.innerText);
          const local = await paginaVagas.$eval('.grow > h2', element => element.textContent);
          const salario = await paginaVagas.$eval('.grow > h2:nth-of-type(2)', element => element.textContent);
          const descricao = await paginaVagas.$eval('.info > p', element => element.textContent);
          
          const obj = { titulo, empresa, local, salario, descricao };
          console.log(obj);
          
          await paginaVagas.close()
        }

        await page.locator("#ctl00_ContentBody_lkbPaginacaoTopProximo").click() // ESTÁ RETORNANDO UNDEFINED!!
       
        count++;
      }
    } catch (error) {
      console.error(`Erro durante a execução: ${error}`);
    } finally {
      // await browser.close();
      rl.close();
    }
  });
});