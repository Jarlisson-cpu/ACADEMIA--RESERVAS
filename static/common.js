// Funções compartilhadas entre as páginas

// Se a página for aberta direto do arquivo (file://), aponta para a API local
const API_BASE = location.protocol === 'file:' ? 'http://127.0.0.1:5000/api' : '/api';

const ICONES_AULA = {
    'Spinning': 'fa-person-biking',
    'Musculação': 'fa-dumbbell',
    'Yoga': 'fa-spa',
    'Funcional': 'fa-fire'
};

async function api(caminho, opcoes = {}) {
    const res = await fetch(`${API_BASE}${caminho}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opcoes
    });
    const corpo = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(corpo.erro || `Erro ${res.status}`);
    return corpo;
}

// Evita que dados digitados virem HTML na página
function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

function formatarCpf(cpf) {
    const d = String(cpf || '').replace(/\D/g, '').slice(0, 11);
    return d
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function cpfValido(cpf) {
    const d = String(cpf).replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
    for (const tamanho of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
        if ((soma * 10) % 11 % 10 !== Number(d[tamanho])) return false;
    }
    return true;
}

function formatarData(iso) {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function hojeIso() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

function mostrarToast(mensagem, tipo = 'success') {
    let area = document.querySelector('.toast-area');
    if (!area) {
        area = document.createElement('div');
        area.className = 'toast-area';
        document.body.appendChild(area);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.setAttribute('role', 'status');
    const icone = tipo === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
    toast.innerHTML = `<i class="fa-solid ${icone}"></i><span>${escapeHtml(mensagem)}</span>`;
    area.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
