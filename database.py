import sqlite3
import os

DB_NAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'academia.db')

# Grade de aulas: (id, modalidade, horário, vagas por dia)
AULAS_INICIAIS = [
    (1, 'Spinning', '07:00', 20),
    (2, 'Spinning', '18:30', 20),
    (3, 'Musculação', '06:00', 30),
    (4, 'Musculação', '12:00', 30),
    (5, 'Musculação', '19:00', 30),
    (6, 'Yoga', '08:00', 15),
    (7, 'Yoga', '20:00', 15),
    (8, 'Funcional', '17:30', 18),
]


def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def _colunas(cursor, tabela):
    return {row[1] for row in cursor.execute(f'PRAGMA table_info({tabela})')}


def criar_banco():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Versões antigas do banco tinham tabelas com outro formato; recria se for o caso
    if 'horario' not in _colunas(cursor, 'aulas'):
        cursor.execute('DROP TABLE IF EXISTS aulas')
    if 'nome' not in _colunas(cursor, 'reservas'):
        cursor.execute('DROP TABLE IF EXISTS reservas')
    cursor.execute('DROP TABLE IF EXISTS usuarios')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS aulas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        horario TEXT NOT NULL,
        vagas INTEGER NOT NULL
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL,
        idade INTEGER NOT NULL,
        plano TEXT NOT NULL,
        aula_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Reservado',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aula_id) REFERENCES aulas(id)
    )
    ''')

    cursor.executemany(
        'INSERT OR IGNORE INTO aulas (id, nome, horario, vagas) VALUES (?, ?, ?, ?)',
        AULAS_INICIAIS
    )

    conn.commit()
    conn.close()
    print(f"Banco de dados '{os.path.basename(DB_NAME)}' pronto para uso.")


if __name__ == '__main__':
    criar_banco()
