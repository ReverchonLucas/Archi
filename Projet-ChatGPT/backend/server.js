const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require("dotenv").config();

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database('./db/db.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT)`);
});

app.post('/questions', async (req, res) => {
    const { content } = req.body;
  
    db.run('INSERT INTO questions (content) VALUES (?)', [content], async function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
  
      try {
        const response = await getMessageFromAI(content);
        res.json({ message: response[0].generated_text });
      } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'appel à l'IA." });
      }
    });
});  

app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});



async function getMessageFromAI(inputText) {
  const MODEL_NAME = "mistralai/Mistral-Nemo-Instruct-2407";

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CGPT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: inputText,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}