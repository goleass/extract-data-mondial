const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const { CronJob } = require("cron");

dotenv.config();

const pool = new Pool({
    connectionString: process.env.CONECTION,
    ssl: {
      rejectUnauthorized: false, // Necessário para conexões com SSL
    },
  });

async function run () {
      const browser = await puppeteer.launch({
    headless: true,
    // executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    // Inicializa o navegador Puppeteer

    // Acesse o site desejado
    await page.goto("https://www.worldometers.info/br/", {
      waitUntil: "domcontentloaded",
    });

    // Aguarda até que o valor do elemento seja diferente de "carregando..."
    await page.waitForFunction(
      () => {
        const element = document.querySelector(
          '.rts-counter[rel="dth1s_this_year"]'
        );
        return element && element.innerText.trim() !== "carregando...";
      },
      { timeout: 10000 } // Tempo máximo de espera em milissegundos (ajuste conforme necessário)
    );

    // Extrai o texto do elemento
    const data = await page.evaluate(() => {
      const element = document.querySelector(
        '.rts-counter[rel="dth1s_this_year"]'
      );
      return { dados: element ? element.innerText : null, element };
    });

    // Extrai o texto do elemento
    const data2 = await page.evaluate(() => {
      const element = document.querySelector('.rts-counter[rel="dth1s_today"]');
      return { dados: element ? element.innerText : null, element };
    });

    // Retorna o dado extraído
    console.log({ mortesAno: data.dados, mortesHoje: data2.dados });

    const result = await pool.query(
        'UPDATE dadosglobais SET mortes_ano_atual = $1, mortes_hoje = $2 WHERE id = $3 RETURNING *',
        [data.dados, data2.dados, 1]
      );

  } catch (error) {
    console.error("Erro ao extrair os dados:", error);
    // res.status(500).json({ error: "Erro ao extrair os dados" });
  } finally {
    // Fecha o navegador
    await browser.close();
  }
}

let emExecucao = false

const job = new CronJob(
	'* * * * * *', // cronTime
	async function () {

    if(emExecucao) {
      console.log('em execução')
      return
    }

    emExecucao = true

		console.log('You will see this message every second');

    run().then(() => {
      console.log('ok'); 
      emExecucao = false})
	}, // onTick
	null, // onComplete
	true, // start
	'America/Sao_Paulo' // timeZone
);