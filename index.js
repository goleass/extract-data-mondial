const express = require("express");
// const puppeteer = require('puppeteer');
const cors = require('cors');
// const dotenv = require('dotenv');
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

// dotenv.config()

const PORT = 3000;
const app = express();
app.use(express.json());
app.use(cors())

app.get("/", (req, res) => {
  return res.send("ok");
});

app.get('/extract-data', async (req, res) => {
    try {
        // Inicializa o navegador Puppeteer
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
          });

        const page = await browser.newPage();

        // Acesse o site desejado
        await page.goto('https://www.worldometers.info/br/', { waitUntil: 'domcontentloaded' });

        // Aguarda até que o valor do elemento seja diferente de "carregando..."
        await page.waitForFunction(
            () => {
                const element = document.querySelector('.rts-counter[rel="dth1s_this_year"]');
                return element && element.innerText.trim() !== 'carregando...';
            },
            { timeout: 10000 } // Tempo máximo de espera em milissegundos (ajuste conforme necessário)
        );

        // Extrai o texto do elemento
        const data = await page.evaluate(() => {
            const element = document.querySelector('.rts-counter[rel="dth1s_this_year"]');
            return element ? element.innerText : null;
        });

        // Fecha o navegador
        await browser.close();

        // Retorna o dado extraído
        res.json({ mortesAno: data, mortesHoje: data });
    } catch (error) {
        console.error('Erro ao extrair os dados:', error);
        res.status(500).json({ error: 'Erro ao extrair os dados' });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
