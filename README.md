# 🏋️ Academia Power — Sistema de Reservas

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

Sistema web para **reservar aulas em uma academia** (Spinning, Musculação, Yoga), ajudando a controlar a quantidade de alunos por horário. O front-end em HTML/CSS/JavaScript conversa com uma **API REST em Python (Flask)** que salva os dados em **SQLite**.

## ✨ Funcionalidades

- 🗓️ Grade de aulas (Spinning, Musculação, Yoga, Funcional) com **vagas em tempo real** por dia
- 🚦 Limite de vagas por aula: aulas lotadas aparecem como esgotadas e a API recusa novas reservas
- 📝 Formulário em etapas com máscara e validação de CPF, resumo da reserva e notificações
- 🚫 Impede reservas em datas passadas e reservas duplicadas do mesmo aluno na mesma aula
- 📋 Painel de reservas com estatísticas, busca por nome/CPF e filtros por aula e período
- 🔒 CPF mascarado na listagem e dados escapados contra injeção de HTML
- 📱 Layout responsivo com tema escuro
- 🔌 API REST com respostas em JSON e tratamento de erros

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/aulas?data=AAAA-MM-DD` | Lista as aulas e as vagas restantes no dia |
| `GET` | `/api/reservas` | Lista todas as reservas |
| `POST` | `/api/reservas` | Cria uma reserva (`nome`, `cpf`, `idade`, `plano`, `aula_id`, `data`) |
| `DELETE` | `/api/reservas/<id>` | Remove uma reserva |

## 📁 Estrutura

```
├── api.py              # API Flask (rotas /api) e servidor do front-end
├── database.py         # Cria o banco SQLite e a grade de aulas
├── requirements.txt
└── static/
    ├── index.html      # Nova reserva
    ├── criar_reserva.js
    ├── reservas.html   # Painel de reservas
    ├── reservas.js
    ├── common.js       # Funções compartilhadas (API, CPF, notificações)
    └── styles.css
```

## 🚀 Como executar

```bash
pip install -r requirements.txt
python api.py        # cria o banco e sobe o site em http://127.0.0.1:5000
```

Depois abra **http://127.0.0.1:5000** no navegador.

## 🧠 Conceitos praticados

API REST · CRUD · Flask · SQLite · `fetch` assíncrono · CORS · validação de formulários

## 🔮 Melhorias futuras

- [x] Limitar reservas pelo número de vagas de cada aula
- [ ] Login de alunos
- [ ] Publicar o front-end e a API online

---

👤 Feito por **[Jarlisson Brito](https://github.com/Jarlisson-cpu)** · [LinkedIn](https://www.linkedin.com/in/jarlisson-brito-602909368/)
