// Aguarda o documento HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    const API_BASE = 'http://127.0.0.1:5000/api';

    async function fetchReservationsFromAPI() {
        try {
            const res = await fetch(`${API_BASE}/reservas`);
            if (!res.ok) throw new Error('API erro');
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async function findConflicts(aula_id, data, horario) {
        const apiList = await fetchReservationsFromAPI();
        if (apiList === null) {
            return [];
        }
        return apiList.filter(r => String(r.aula_id) === String(aula_id) && r.data === data && r.horario === horario);
    }

    async function updateAvailabilityUI() {
        const aula = document.getElementById('tipo-atividade').value;
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;
        const statusEl = document.getElementById('availability-status');

        if (!aula || !data || !horario) {
            statusEl.textContent = 'Selecione atividade, data e horário para verificar disponibilidade.';
            statusEl.style.color = '#333';
            return;
        }

        const conflicts = await findConflicts(aula, data, horario);
        if (conflicts.length > 0) {
            statusEl.textContent = `Horário já reservado (${conflicts.length})`;
            statusEl.style.color = '#dc3545';
        } else {
            statusEl.textContent = 'Horário disponível';
            statusEl.style.color = '#28a745';
        }
    }

    const form = document.getElementById('reservation-form');

    ['tipo-atividade', 'data', 'horario'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => updateAvailabilityUI());
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nomeAluno = document.getElementById('nome-aluno').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const idade = document.getElementById('idade').value.trim();
        const plano = document.getElementById('plano').value;
        const aula_id = document.getElementById('tipo-atividade').value;
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;

        if (!nomeAluno || !cpf || !idade || !plano || !aula_id || !data || !horario) {
            alert('Preencha todos os campos.');
            return;
        }

        const conflicts = await findConflicts(aula_id, data, horario);
        if (conflicts.length > 0) {
            alert('Já existe pelo menos uma reserva para esse horário. Verifique disponibilidade antes de criar.');
            return;
        }

        function atividadeLabel(aula_id) {
            switch (String(aula_id)) {
                case '1': return 'Spinning (09:00)';
                case '2': return 'Musculação (10:00)';
                case '3': return 'Yoga (11:00)';
                default: return `Atividade ${aula_id}`;
            }
        }

        const aula_nome = atividadeLabel(aula_id);

        const dadosReserva = {
            nome: nomeAluno,
            cpf: cpf,
            idade: parseInt(idade, 10),
            plano: plano,
            aula_id: parseInt(aula_id, 10),
            aula_nome: aula_nome,
            data: data,
            horario: horario,
            status: 'Reservado'
        };

        try {
            const response = await fetch(`${API_BASE}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosReserva)
            });

            if (response.ok) {
                alert('Reserva criada com sucesso! (no banco)');
                window.location.href = 'reservas.html';
            } else {
                const err = await response.json().catch(() => ({}));
                const STORAGE_KEY = 'reservas_local';
                const raw = localStorage.getItem(STORAGE_KEY);
                const lista = raw ? JSON.parse(raw) : [];
                lista.push(Object.assign({ id: Date.now() }, dadosReserva));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
                alert('A API retornou erro. Reserva salva localmente.');
                window.location.href = 'reservas.html';
            }
        } catch (e) {
            const STORAGE_KEY = 'reservas_local';
            const raw = localStorage.getItem(STORAGE_KEY);
            const lista = raw ? JSON.parse(raw) : [];
            lista.push(Object.assign({ id: Date.now() }, dadosReserva));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
            alert('Não foi possível conectar ao servidor. Reserva salva localmente.');
            window.location.href = 'reservas.html';
        }
    });

    updateAvailabilityUI();
});