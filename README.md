# 🏋️ Academia Power — Sistema de Reservas

Sistema web para reservar aulas de uma academia. O aluno preenche um formulário, a reserva é salva em um banco de dados SQLite por uma API em Python (Flask) e pode ser consultada ou cancelada em uma página de listagem.

## ✨ Funcionalidades

- Criar reserva informando nome, CPF, idade, plano (mensal, trimestral ou anual), aula, data e horário
- Aulas disponíveis: Spinning (09:00), Musculação (10:00) e Yoga (11:00)
- Impedir reservas em conflito para a mesma aula, data e horário
- Listar todas as reservas salvas
- Cancelar (excluir) uma reserva
- Se a API estiver fora do ar, a listagem usa as reservas salvas no navegador (`localStorage`)

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Front-end | HTML, CSS e JavaScript puro |
| API | Python + Flask + Flask-CORS |
| Banco de dados | SQLite |

## 🚀 Como executar

Pré-requisito: Python 3.9 ou superior.

```bash
# 1. Clonar o repositório
git clone https://github.com/Jarlisson-cpu/ACADEMIA--RESERVAS.git
cd ACADEMIA--RESERVAS

# 2. (Opcional) criar e ativar um ambiente virtual
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Instalar as dependências
pip install -r requirements.txt

# 4. Iniciar a API (cria a tabela de reservas se ela não existir)
python api.py
```

A API fica disponível em `http://127.0.0.1:5000`.

Depois, abra o arquivo `index.html` no navegador para criar uma reserva e `reservas.html` para ver a lista.

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/reservas` | Lista todas as reservas |
| `POST` | `/api/reservas` | Cria uma reserva |
| `DELETE` | `/api/reservas/<id>` | Remove uma reserva |

Exemplo de corpo para `POST /api/reservas`:

```json
{
  "nome": "Maria Silva",
  "cpf": "000.000.000-00",
  "idade": 28,
  "plano": "Mensal",
  "aula_id": 1,
  "aula_nome": "Spinning (09:00)",
  "data": "2025-11-15",
  "horario": "09:00",
  "status": "Reservado"
}
```

## 📁 Estrutura

```
├── api.py              # API Flask (rotas de reservas)
├── database.py         # Script que cria tabelas e dados de teste
├── academia.db         # Banco SQLite
├── index.html          # Formulário de nova reserva
├── reservas.html       # Lista de reservas
├── criar_reserva.js    # Lógica do formulário
├── reservas.js         # Lógica da listagem e do cancelamento
├── script.js           # Script antigo do formulário (não é carregado pelas páginas atuais)
├── style.css           # Estilos da página de reservas
└── form_style.css      # Estilos do formulário
```

## 📚 O que aprendi

- Criar uma API REST com Flask e ligar o front-end a ela com `fetch`
- Salvar e consultar dados com SQLite
- Tratar falhas da API com um plano reserva no `localStorage`
- Validar dados de formulário no navegador e no servidor

## 🔮 Próximos passos

- [ ] Validar o CPF e controlar o limite de vagas por aula
- [ ] Unificar o esquema do banco entre `database.py` e `api.py`
- [ ] Adicionar autenticação de usuários
- [ ] Publicar a API online
- [ ] Criar testes automatizados

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).

## 👤 Autor

**Jarlisson Brito** — [GitHub](https://github.com/Jarlisson-cpu) · [LinkedIn](https://www.linkedin.com/in/jarlisson-brito-602909368/)
