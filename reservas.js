document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'reservas_local';

    function loadReservationsLocal() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    function saveReservationsLocal(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    const API_BASE = 'http://127.0.0.1:5000/api';

    async function fetchReservationsAPI() {
        try {
            const res = await fetch(`${API_BASE}/reservas`);
            if (!res.ok) throw new Error('API erro');
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    function atividadeLabel(aula_id) {
        switch (String(aula_id)) {
            case '1': return 'Spinning (09:00)';
            case '2': return 'Musculação (10:00)';
            case '3': return 'Yoga (11:00)';
            default: return `Atividade ${aula_id}`;
        }
    }

    const tbody = document.getElementById('reservas-body');
    const clearAllBtn = document.getElementById('clear-all');

    async function render() {
        tbody.innerHTML = '';
        const apiList = await fetchReservationsAPI();
        let list = apiList;
        let usingLocal = false;
        if (!list) {
            list = loadReservationsLocal();
            usingLocal = true;
        }

        if (!list || list.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="9" style="text-align:center;color:#777;padding:20px;">Nenhuma reserva encontrada.</td>';
            tbody.appendChild(tr);
            return;
        }

        list.forEach(res => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';

            tr.innerHTML = `
                <td>${res.nome || ''}</td>
                <td>${res.cpf || ''}</td>
                <td>${res.idade || ''}</td>
                <td>${res.plano || ''}</td>
                <td>${res.aula_nome || atividadeLabel(res.aula_id)}</td>
                <td>${res.data || ''}</td>
                <td>${res.horario || ''}</td>
                <td>${res.status || ''}</td>
                <td>
                    <button data-id="${res.id}" class="btn-delete" style="background:#dc3545;color:#fff;border:none;padding:6px 8px;border-radius:4px;">Remover</button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (!confirm('Remover essa reserva?')) return;
                if (!usingLocal) {
                    // Tenta remover via API
                    try {
                        const res = await fetch(`${API_BASE}/reservas/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            render();
                            return;
                        }
                    } catch (err) {
                        // se falhar, cai para remoção local
                    }
                }

                // Remoção local fallback
                const newList = loadReservationsLocal().filter(r => String(r.id) !== String(id));
                saveReservationsLocal(newList);
                render();
            });
        });
    }

    clearAllBtn.addEventListener('click', () => {
        if (!confirm('Remover todas as reservas locais?')) return;
        saveReservations([]);
        render();
    });

    render();
});
// Trecho do seu criar_reserva.js (Antigo)
const dadosReserva = {
    usuario_id: 1, // Fixamos este no exemplo anterior
    aula_id: parseInt(aula_id) 
};