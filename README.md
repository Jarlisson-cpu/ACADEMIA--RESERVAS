# 🏋️ Academia Power — Sistema de Reservas

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

Sistema web para **reservar aulas em uma academia** (Spinning, Musculação, Yoga), ajudando a controlar a quantidade de alunos por horário. O front-end em HTML/CSS/JavaScript conversa com uma **API REST em Python (Flask)** que salva os dados em **SQLite**.

## ✨ Funcionalidades

- 📝 Formulário de reserva com nome, CPF, idade, plano, atividade, data e horário
- ⚠️ Verificação de disponibilidade: avisa quando o horário já está reservado
- 📋 Página com a lista de todas as reservas feitas
- 🗑️ Cancelamento (exclusão) de reservas
- 🔌 API REST com respostas em JSON e tratamento de erros

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/reservas` | Lista todas as reservas |
| `POST` | `/api/reservas` | Cria uma reserva (`aula_id`, `data` e `horario` obrigatórios) |
| `DELETE` | `/api/reservas/<id>` | Remove uma reserva |

## 📁 Estrutura

```
├── api.py              # API Flask (rotas /api/reservas)
├── database.py         # Cria o banco e insere dados de teste
├── index.html          # Formulário de nova reserva
├── criar_reserva.js    # Envio do formulário e checagem de conflitos
├── reservas.html       # Lista de reservas
├── reservas.js         # Busca e exibe as reservas da API
├── script.js
├── style.css / form_style.css
└── academia.db         # Banco SQLite
```

## 🚀 Como executar

```bash
pip install flask flask-cors
python database.py   # (opcional) cria tabelas e dados de teste
python api.py        # API em http://127.0.0.1:5000
```

Depois abra o `index.html` no navegador.

## 🧠 Conceitos praticados

API REST · CRUD · Flask · SQLite · `fetch` assíncrono · CORS · validação de formulários

## 🔮 Melhorias futuras

- [ ] Limitar reservas pelo número de vagas de cada aula
- [ ] Login de alunos
- [ ] Publicar o front-end e a API online

---

👤 Feito por **[Jarlisson Brito](https://github.com/Jarlisson-cpu)** · [LinkedIn](https://www.linkedin.com/in/jarlisson-brito-602909368/)
