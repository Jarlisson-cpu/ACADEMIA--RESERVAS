document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservation-form');
    const inputData = document.getElementById('data');
    const grid = document.getElementById('class-grid');
    const filtro = document.getElementById('class-filter');
    const inputCpf = document.getElementById('cpf');
    const btnSubmit = document.getElementById('btn-submit');
    const submitHint = document.getElementById('submit-hint');

    let aulas = [];
    let aulaSelecionada = null;
    let modalidade = 'Todas';

    inputData.min = hojeIso();
    inputData.value = hojeIso();

    async function carregarAulas() {
        try {
            aulas = await api(`/aulas?data=${inputData.value}`);
            // Mantém a seleção atualizada com as vagas do novo dia
            if (aulaSelecionada) {
                aulaSelecionada = aulas.find(a => a.id === aulaSelecionada.id && a.disponiveis > 0) || null;
            }
            renderFiltro();
            renderAulas();
        } catch (e) {
            grid.innerHTML = `<p class="hint"><i class="fa-solid fa-plug-circle-xmark"></i>
                Não foi possível conectar ao servidor. Verifique se a API está rodando (<code>python api.py</code>).</p>`;
        }
        atualizarResumo();
    }

    function renderFiltro() {
        const nomes = ['Todas', ...new Set(aulas.map(a => a.nome))];
        filtro.innerHTML = nomes.map(n =>
            `<button type="button" class="chip ${n === modalidade ? 'active' : ''}" data-nome="${escapeHtml(n)}">${escapeHtml(n)}</button>`
        ).join('');
    }

    function renderAulas() {
        const visiveis = aulas.filter(a => modalidade === 'Todas' || a.nome === modalidade);
        grid.innerHTML = visiveis.map(a => {
            const pct = Math.round((a.disponiveis / a.vagas) * 100);
            const nivel = a.disponiveis === 0 ? 'full' : pct <= 25 ? 'low' : '';
            const vagasTxt = a.disponiveis === 0 ? 'Esgotada' : `${a.disponiveis} de ${a.vagas} vagas`;
            const selecionada = aulaSelecionada && aulaSelecionada.id === a.id;
            return `
                <button type="button" class="class-card ${selecionada ? 'selected' : ''}" data-id="${a.id}"
                        role="radio" aria-checked="${selecionada}" ${a.disponiveis === 0 ? 'disabled' : ''}>
                    <i class="fa-solid ${ICONES_AULA[a.nome] || 'fa-person-running'} class-icon"></i>
                    <span class="class-name">${escapeHtml(a.nome)}</span>
                    <span class="class-time">${escapeHtml(a.horario)}</span>
                    <span class="class-spots">${vagasTxt}</span>
                    <div class="spots-bar ${nivel}"><span style="width:${pct}%"></span></div>
                </button>`;
        }).join('');
    }

    function atualizarResumo() {
        const plano = form.querySelector('input[name="plano"]:checked').value;
        document.getElementById('resumo-aula').textContent = aulaSelecionada ? aulaSelecionada.nome : '—';
        document.getElementById('resumo-horario').textContent = aulaSelecionada ? aulaSelecionada.horario : '—';
        document.getElementById('resumo-vagas').textContent = aulaSelecionada ? aulaSelecionada.disponiveis : '—';
        document.getElementById('resumo-data').textContent = formatarData(inputData.value) || '—';
        document.getElementById('resumo-plano').textContent = plano;
        btnSubmit.disabled = !aulaSelecionada;
        submitHint.style.display = aulaSelecionada ? 'none' : 'block';
    }

    function setErro(campo, mensagem) {
        document.getElementById(campo).classList.toggle('invalid', !!mensagem);
        form.querySelector(`.field-error[data-for="${campo}"]`).textContent = mensagem || '';
    }

    function validar() {
        const nome = document.getElementById('nome').value.trim();
        const idade = Number(document.getElementById('idade').value);
        const erros = {
            nome: nome.split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : '',
            cpf: !cpfValido(inputCpf.value) ? 'CPF inválido.' : '',
            idade: !(idade >= 12 && idade <= 120) ? 'Idade deve estar entre 12 e 120.' : ''
        };
        Object.entries(erros).forEach(([campo, msg]) => setErro(campo, msg));
        const primeiro = Object.keys(erros).find(c => erros[c]);
        if (primeiro) document.getElementById(primeiro).focus();
        return !primeiro;
    }

    // ----- Eventos -----
    inputData.addEventListener('change', carregarAulas);

    filtro.addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        modalidade = chip.dataset.nome;
        renderFiltro();
        renderAulas();
    });

    grid.addEventListener('click', e => {
        const card = e.target.closest('.class-card');
        if (!card || card.disabled) return;
        aulaSelecionada = aulas.find(a => a.id === Number(card.dataset.id));
        renderAulas();
        atualizarResumo();
    });

    form.querySelectorAll('input[name="plano"]').forEach(r => r.addEventListener('change', atualizarResumo));

    inputCpf.addEventListener('input', () => {
        inputCpf.value = formatarCpf(inputCpf.value);
        if (inputCpf.classList.contains('invalid') && cpfValido(inputCpf.value)) setErro('cpf', '');
    });

    ['nome', 'idade'].forEach(id =>
        document.getElementById(id).addEventListener('input', () => setErro(id, ''))
    );

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!aulaSelecionada || !validar()) return;

        const dadosReserva = {
            nome: document.getElementById('nome').value.trim(),
            cpf: inputCpf.value,
            idade: Number(document.getElementById('idade').value),
            plano: form.querySelector('input[name="plano"]:checked').value,
            aula_id: aulaSelecionada.id,
            data: inputData.value
        };

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
        try {
            await api('/reservas', { method: 'POST', body: JSON.stringify(dadosReserva) });
            mostrarToast(`Reserva confirmada: ${aulaSelecionada.nome} às ${aulaSelecionada.horario}!`);
            form.reset();
            inputData.value = dadosReserva.data;
            aulaSelecionada = null;
            await carregarAulas();
        } catch (e) {
            mostrarToast(e.message === 'Failed to fetch' ? 'Servidor indisponível. Tente novamente.' : e.message, 'error');
            btnSubmit.disabled = false;
        } finally {
            btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Confirmar reserva';
        }
    });

    carregarAulas();
});
