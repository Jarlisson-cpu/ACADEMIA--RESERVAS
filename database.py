import sqlite3

def criar_banco():
    conn = sqlite3.connect('academia.db')
    cursor = conn.cursor()

    print("Conectado ao banco de dados...")

    # --- 1. Criação das Tabelas (mesmo código anterior) ---
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS aulas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_aula TEXT NOT NULL,
        data_hora DATETIME NOT NULL,
        vagas_totais INTEGER NOT NULL
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        aula_id INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Reservado', 'Confirmado', 'Concluído', 'Cancelado')),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (aula_id) REFERENCES aulas(id)
    )
    ''')
    
    # --- 2. Inserção de Dados Essenciais para Teste ---
    
    # Insere o Usuário ID=1, que é o que o formulário está usando
    try:
        cursor.execute("INSERT INTO usuarios (id, nome, email) VALUES (?, ?, ?)", (1, 'Usuario de Teste Fixo', 'teste@academia.com'))
        print("Usuário de teste inserido.")
    except sqlite3.IntegrityError:
        print("Usuário de teste já existe.") # Evita erro se você rodar o script mais de uma vez

    # Insere as Aulas ID=1, 2 e 3 para corresponderem ao seu <select>
    try:
        aulas_iniciais = [
            (1, 'Aula de Spinning', '2025-11-15 09:00:00', 20),
            (2, 'Aula de Musculação', '2025-11-15 10:00:00', 30),
            (3, 'Aula de Yoga', '2025-11-15 11:00:00', 15),
        ]
        cursor.executemany("INSERT INTO aulas (id, nome_aula, data_hora, vagas_totais) VALUES (?, ?, ?, ?)", aulas_iniciais)
        print(f"{len(aulas_iniciais)} aulas de teste inseridas.")
    except sqlite3.IntegrityError:
        print("Aulas de teste já existem.")

    # --- Fim do Código ---
    conn.commit()
    conn.close()
    print("Banco de dados 'academia.db' pronto para uso.")

if __name__ == '__main__':
    criar_banco()