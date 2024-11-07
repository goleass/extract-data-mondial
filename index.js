const express = require("express");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const cors = require("cors");
const { Pool } = require("pg");

dotenv.config();

// Configuração da conexão com o banco de dados
const pool = new Pool({
  connectionString: process.env.CONECTION,
  ssl: {
    rejectUnauthorized: false, // Necessário para conexões com SSL
  },
});

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

// Testando a conexão com o banco de dados
pool.connect()
  .then(() => console.log('Conectado ao PostgreSQL com sucesso!'))
  .catch(err => console.error('Erro ao conectar com o PostgreSQL', err));

app.get("/", (req, res) => {
  return res.send("ok");
});

app.get("/extract-data", async (req, res) => {

    try {
        const result = await pool.query('SELECT * FROM dadosglobais');
        
        res.json({ mortesAno: result.rows[0].mortes_ano_atual, mortesHoje: result.rows[0].mortes_ano_atual });
    } catch (error) {
        
    }

//   const browser = await puppeteer.launch({
//     headless: true,
//     // executablePath: "/usr/bin/google-chrome",
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
//   const page = await browser.newPage();

//   try {
//     // Inicializa o navegador Puppeteer

//     // Acesse o site desejado
//     await page.goto("https://www.worldometers.info/br/", {
//       waitUntil: "domcontentloaded",
//     });

//     // Aguarda até que o valor do elemento seja diferente de "carregando..."
//     await page.waitForFunction(
//       () => {
//         const element = document.querySelector(
//           '.rts-counter[rel="dth1s_this_year"]'
//         );
//         return element && element.innerText.trim() !== "carregando...";
//       },
//       { timeout: 10000 } // Tempo máximo de espera em milissegundos (ajuste conforme necessário)
//     );

//     // Extrai o texto do elemento
//     const data = await page.evaluate(() => {
//       const element = document.querySelector(
//         '.rts-counter[rel="dth1s_this_year"]'
//       );
//       return { dados: element ? element.innerText : null, element };
//     });

//     // Extrai o texto do elemento
//     const data2 = await page.evaluate(() => {
//       const element = document.querySelector('.rts-counter[rel="dth1s_today"]');
//       return { dados: element ? element.innerText : null, element };
//     });

//     // Retorna o dado extraído
//     res.json({ mortesAno: data.dados, mortesHoje: data2.dados });
//   } catch (error) {
//     console.error("Erro ao extrair os dados:", error);
//     res.status(500).json({ error: "Erro ao extrair os dados" });
//   } finally {
//     // Fecha o navegador
//     await browser.close();
//   }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
