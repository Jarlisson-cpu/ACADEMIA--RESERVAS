import sys
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
except ImportError as e:
    print('Erro de importação:', e)
    print('\nProvavelmente o pacote Flask ou flask-cors não está instalado no ambiente atual.')
    print('No PowerShell do Windows, ative seu ambiente virtual e instale dependências com:')
    print('  & ".venv\\Scripts\\Activate.ps1"')
    print('  pip install flask flask-cors')
    print('\nOu sem ativar o venv, use:')
    print('  python -m pip install flask flask-cors')
    sys.exit(1)
import sqlite3

# Trecho do seu novo api.py
def criar_reserva():
    dados = request.get_json() or {}
    nome = dados.get('nome')
    cpf = dados.get('cpf')
    idade = dados.get('idade')
    plano = dados.get('plano')

app = Flask(__name__)
CORS(app)
DB_NAME = 'academia.db'

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            cpf TEXT,
            idade INTEGER,
            plano TEXT,
            aula_id INTEGER,
            aula_nome TEXT,
            data TEXT,
            horario TEXT,
            status TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/api/reservas', methods=['GET'])
def get_todas_reservas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reservas ORDER BY id DESC")
        reservas_lista = cursor.fetchall()
        reservas_json = [dict(reserva) for reserva in reservas_lista]
        conn.close()
        return jsonify(reservas_json), 200
    except Exception as e:
        print(f"Erro ao buscar reservas: {e}")
        return jsonify({"erro": "Erro interno ao buscar dados"}), 500

@app.route('/api/reservas', methods=['POST'])
def criar_reserva():
    dados = request.get_json() or {}
    nome = dados.get('nome')
    cpf = dados.get('cpf')
    idade = dados.get('idade')
    plano = dados.get('plano')
    aula_id = dados.get('aula_id')
    aula_nome = dados.get('aula_nome')
    data = dados.get('data')
    horario = dados.get('horario')
    status = dados.get('status', 'Reservado')
    if not aula_id or not data or not horario:
        return jsonify({"erro": "aula_id, data e horario são obrigatórios"}), 400
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO reservas (nome, cpf, idade, plano, aula_id, aula_nome, data, horario, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (nome, cpf, idade, plano, aula_id, aula_nome, data, horario, status)
        )
        conn.commit()
        nova_reserva_id = cursor.lastrowid
        conn.close()
        return jsonify({
            "id": nova_reserva_id,
            "nome": nome,
            "cpf": cpf,
            "idade": idade,
            "plano": plano,
            "aula_id": aula_id,
            "aula_nome": aula_nome,
            "data": data,
            "horario": horario,
            "status": status
        }), 201
    except Exception as e:
        print(f"Erro ao criar reserva: {e}")
        return jsonify({"erro": "Erro interno ao criar reserva"}), 500

@app.route('/api/reservas/<int:res_id>', methods=['DELETE'])
def deletar_reserva(res_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM reservas WHERE id = ?', (res_id,))
        conn.commit()
        affected = cursor.rowcount
        conn.close()
        if affected == 0:
            return jsonify({"erro": "Reserva não encontrada"}), 404
        return jsonify({"ok": True}), 200
    except Exception as e:
        print(f"Erro ao deletar reserva: {e}")
        return jsonify({"erro": "Erro interno ao deletar reserva"}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)