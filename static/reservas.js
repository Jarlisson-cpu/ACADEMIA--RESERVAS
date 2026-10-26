document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('reservas-body');
    const busca = document.getElementById('busca');
    const filtroAula = document.getElementById('filtro-aula');
    const filtroPeriodo = document.getElementById('filtro-periodo');
    const alerta = document.getElementById('api-alert');

    let reservas = [];
    const hoje = hojeIso();

    // Mostra só o começo e o fim do CPF na listagem
    function mascararCpf(cpf) {
        const f = formatarCpf(cpf);
        return f.length === 14 ? `${f.slice(0, 4)}***.***${f.slice(11)}` : f;
    }

    async function carregar() {
        try {
            reservas = await api('/reservas');
            alerta.classList.remove('show');
        } catch (e) {
            reservas = [];
            alerta.classList.add('show');
        }
        preencherFiltroAulas();
        atualizarStats();
        render();
    }

    function preencherFiltroAulas() {
        const atual = filtroAula.value;
        const nomes = [...new Set(reservas.map(r => r.aula_nome))].sort();
        filtroAula.innerHTML = '<option value="">Todas as aulas</option>' +
            nomes.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
        filtroAula.value = nomes.includes(atual) ? atual : '';
    }

    function atualizarStats() {
        document.getElementById('stat-total').textContent = reservas.length;
        document.getElementById('stat-hoje').textContent = reservas.filter(r => r.data === hoje).length;
        document.getElementById('stat-proximas').textContent = reservas.filter(r => r.data >= hoje).length;

        const contagem = {};
        reservas.forEach(r => { contagem[r.aula_nome] = (contagem[r.aula_nome] || 0) + 1; });
        const top = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
        document.getElementById('stat-top').textContent = top ? top[0] : '—';
    }

    function filtrar() {
        const termo = busca.value.trim().toLowerCase();
        const termoCpf = termo.replace(/\D/g, '');
        return reservas
            .filter(r => !filtroAula.value || r.aula_nome === filtroAula.value)
            .filter(r => {
                switch (filtroPeriodo.value) {
                    case 'hoje': return r.data === hoje;
                    case 'proximas': return r.data >= hoje;
                    case 'passadas': return r.data < hoje;
                    default: return true;
                }
            })
            .filter(r => !termo || r.nome.toLowerCase().includes(termo) || (termoCpf && r.cpf.includes(termoCpf)))
            // Próximas primeiro em ordem cronológica; passadas da mais recente para a mais antiga
            .sort((a, b) => {
                const ka = `${a.data} ${a.horario}`, kb = `${b.data} ${b.horario}`;
                return filtroPeriodo.value === 'passadas' ? kb.localeCompare(ka) : ka.localeCompare(kb);
            });
    }

    function render() {
        const lista = filtrar();
        if (lista.length === 0) {
            const semNada = reservas.length === 0;
            tbody.innerHTML = `
                <tr><td colspan="9" class="empty-state">
                    <i class="fa-solid fa-calendar-xmark"></i>
                    <p>${semNada ? 'Nenhuma reserva cadastrada ainda.' : 'Nenhuma reserva encontrada com esses filtros.'}</p>
                    ${semNada ? '<a href="index.html" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Criar reserva</a>' : ''}
                </td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map(r => {
            const passada = r.data < hoje;
            return `
                <tr>
                    <td><strong>${escapeHtml(r.nome)}</strong></td>
                    <td>${escapeHtml(mascararCpf(r.cpf))}</td>
                    <td>${escapeHtml(r.idade)}</td>
                    <td>${escapeHtml(r.plano)}</td>
                    <td><i class="fa-solid ${ICONES_AULA[r.aula_nome] || 'fa-person-running'}" style="color: var(--accent)"></i> ${escapeHtml(r.aula_nome)}</td>
                    <td>${formatarData(r.data)}</td>
                    <td>${escapeHtml(r.horario)}</td>
                    <td><span class="badge ${passada ? 'badge-past' : 'badge-reservado'}">${passada ? 'Concluída' : escapeHtml(r.status)}</span></td>
                    <td><button class="btn btn-danger" data-id="${r.id}" aria-label="Cancelar reserva de ${escapeHtml(r.nome)}">
                        <i class="fa-solid fa-trash"></i> Cancelar</button></td>
                </tr>`;
        }).join('');
    }

    tbody.addEventListener('click', async e => {
        const btn = e.target.closest('button[data-id]');
        if (!btn) return;
        const reserva = reservas.find(r => String(r.id) === btn.dataset.id);
        if (!confirm(`Cancelar a reserva de ${reserva.nome} (${reserva.aula_nome}, ${formatarData(reserva.data)})?`)) return;
        try {
            await api(`/reservas/${reserva.id}`, { method: 'DELETE' });
            mostrarToast('Reserva cancelada.');
            carregar();
        } catch (err) {
            mostrarToast(err.message, 'error');
        }
    });

    busca.addEventListener('input', render);
    filtroAula.addEventListener('change', render);
    filtroPeriodo.addEventListener('change', render);

    carregar();
});
