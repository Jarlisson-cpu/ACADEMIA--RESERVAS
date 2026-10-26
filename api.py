import re
import sys
from datetime import date

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
except ImportError as e:
    print('Erro de importação:', e)
    print('\nInstale as dependências com:')
    print('  python -m pip install -r requirements.txt')
    sys.exit(1)

from database import get_db_connection, criar_banco

PLANOS = {'Mensal', 'Trimestral', 'Anual'}

# O front-end (pasta static/) é servido pelo próprio Flask em http://127.0.0.1:5000
app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)


def cpf_valido(cpf):
    """Valida os dígitos verificadores do CPF (recebe apenas números)."""
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    for tamanho in (9, 10):
        soma = sum(int(cpf[i]) * (tamanho + 1 - i) for i in range(tamanho))
        digito = (soma * 10) % 11 % 10
        if digito != int(cpf[tamanho]):
            return False
    return True


def contar_reservas(cursor, aula_id, data):
    cursor.execute(
        "SELECT COUNT(*) FROM reservas WHERE aula_id = ? AND data = ? AND status != 'Cancelado'",
        (aula_id, data)
    )
    return cursor.fetchone()[0]


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/aulas', methods=['GET'])
def listar_aulas():
    """Lista a grade de aulas. Com ?data=AAAA-MM-DD informa as vagas restantes do dia."""
    data = request.args.get('data')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM aulas ORDER BY nome, horario')
    aulas = [dict(a) for a in cursor.fetchall()]
    if data:
        for aula in aulas:
            ocupadas = contar_reservas(cursor, aula['id'], data)
            aula['ocupadas'] = ocupadas
            aula['disponiveis'] = max(aula['vagas'] - ocupadas, 0)
    conn.close()
    return jsonify(aulas), 200


@app.route('/api/reservas', methods=['GET'])
def get_todas_reservas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT r.*, a.nome AS aula_nome, a.horario
            FROM reservas r JOIN aulas a ON a.id = r.aula_id
            ORDER BY r.data DESC, a.horario DESC
        ''')
        reservas_json = [dict(reserva) for reserva in cursor.fetchall()]
        conn.close()
        return jsonify(reservas_json), 200
    except Exception as e:
        print(f"Erro ao buscar reservas: {e}")
        return jsonify({"erro": "Erro interno ao buscar dados"}), 500


@app.route('/api/reservas', methods=['POST'])
def criar_reserva():
    dados = request.get_json(silent=True) or {}
    nome = str(dados.get('nome') or '').strip()
    cpf = re.sub(r'\D', '', str(dados.get('cpf') or ''))
    plano = dados.get('plano')
    data = str(dados.get('data') or '')
    try:
        idade = int(dados.get('idade'))
        aula_id = int(dados.get('aula_id'))
    except (TypeError, ValueError):
        return jsonify({"erro": "Idade e aula precisam ser números válidos"}), 400

    if len(nome) < 3:
        return jsonify({"erro": "Informe o nome completo do aluno"}), 400
    if not cpf_valido(cpf):
        return jsonify({"erro": "CPF inválido"}), 400
    if not 12 <= idade <= 120:
        return jsonify({"erro": "A idade deve estar entre 12 e 120 anos"}), 400
    if plano not in PLANOS:
        return jsonify({"erro": "Plano inválido"}), 400
    try:
        if date.fromisoformat(data) < date.today():
            return jsonify({"erro": "Não é possível reservar para uma data passada"}), 400
    except ValueError:
        return jsonify({"erro": "Data inválida"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        aula = cursor.execute('SELECT * FROM aulas WHERE id = ?', (aula_id,)).fetchone()
        if aula is None:
            conn.close()
            return jsonify({"erro": "Aula não encontrada"}), 404

        if contar_reservas(cursor, aula_id, data) >= aula['vagas']:
            conn.close()
            return jsonify({"erro": "Não há mais vagas para essa aula nessa data"}), 409

        cursor.execute(
            "SELECT 1 FROM reservas WHERE cpf = ? AND aula_id = ? AND data = ? AND status != 'Cancelado'",
            (cpf, aula_id, data)
        )
        if cursor.fetchone():
            conn.close()
            return jsonify({"erro": "Esse aluno já tem reserva nessa aula e data"}), 409

        cursor.execute(
            "INSERT INTO reservas (nome, cpf, idade, plano, aula_id, data, status) VALUES (?, ?, ?, ?, ?, ?, 'Reservado')",
            (nome, cpf, idade, plano, aula_id, data)
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
            "aula_nome": aula['nome'],
            "horario": aula['horario'],
            "data": data,
            "status": "Reservado"
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
    criar_banco()
    print('Abra http://127.0.0.1:5000 no navegador')
    app.run(debug=True, port=5000)
