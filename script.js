// ... (seu código JS existente para as abas) ...

// Nova função para buscar e exibir os dados da API
async function carregarReservas() {
    const listaReservas = document.querySelector('.reservas-list');
    
    try {
        // --- AQUI É O ACESSO ---
        // O JS chama a URL da sua API Python
        const response = await fetch('http://127.0.0.1:5000/api/reservas');
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        
        const reservas = await response.json();

        // Limpa o estado de "Nenhuma reserva"
        listaReservas.innerHTML = ''; 

        if (reservas.length === 0) {
            // Se o JSON estiver vazio, mostra a mensagem de "vazio"
            listaReservas.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-calendar-days"></i>
                    <p class="empty-title">Nenhuma reserva encontrada</p>
                    <p><a href="#" class="empty-link">Comece criando uma nova reserva</a></p>
                </div>`;
            return;
        }

        // Se tiver reservas, cria o HTML para cada uma
        reservas.forEach(reserva => {
            const reservaElement = document.createElement('div');
            reservaElement.className = 'reserva-item'; // (Você precisará estilizar isso no CSS)
            reservaElement.innerHTML = `
                <h4>${reserva.nome_aula}</h4>
                <p>Usuário: ${reserva.usuario_nome}</p>
                <p>Data: ${new Date(reserva.data_hora).toLocaleString('pt-BR')}</p>
                <p>Status: <span class="status-${reserva.status.toLowerCase()}">${reserva.status}</span></p>
            `;
            listaReservas.appendChild(reservaElement);
        });

    } catch (error) {
        console.error("Falha ao carregar reservas:", error);
        listaReservas.innerHTML = '<p style="color: red;">Erro ao carregar dados do servidor.</p>';
    }
}

// Modifica o evento de carregar a página para chamar a nova função
document.addEventListener('DOMContentLoaded', () => {
    
    // (seu código JS existente para as abas)
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(clickedTab => {
        clickedTab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
            
            // Aqui você pode adicionar a lógica de filtro
            // Por enquanto, apenas recarregamos tudo
            carregarReservas(); 
        });
    });

    // Carrega as reservas assim que a página abrir
    carregarReservas();
});
// Aguarda o documento HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('reservation-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 1. CAPTURAR TODOS OS NOVOS DADOS DO FORMULÁRIO (Deve corresponder ao api.py)
        const selectAtividade = document.getElementById('tipo-atividade');
        
        const dadosReserva = {
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            idade: parseInt(document.getElementById('idade').value),
            plano: document.getElementById('plano').value,
            
            // Dados da Aula
            aula_id: parseInt(selectAtividade.value),
            aula_nome: selectAtividade.options[selectAtividade.selectedIndex].text.split('(')[0].trim(), // Pega o texto antes do parêntese
            
            // Dados de Data/Hora
            data: document.getElementById('data').value,
            horario: document.getElementById('horario').value,
            
            // O status é definido pelo backend, mas podemos incluir para consistência
            status: 'Reservado' 
        };

        console.log('Dados prontos para envio:', dadosReserva);

        // 2. ENVIAR PARA A API
        try {
            const response = await fetch('http://127.0.0.1:5000/api/reservas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(dadosReserva)
            });
            
            // 3. TRATAR RESPOSTA
            if (response.ok) {
                const novaReserva = await response.json();
                console.log('Reserva criada com sucesso!', novaReserva);
                
                alert('Reserva criada com sucesso e salva no servidor!');
                
                // Redireciona o usuário de volta para o dashboard
                window.location.href = 'index.html';

            } else {
                // A API RETORNOU ERRO (400, 500, etc.)
                const erro = await response.json();
                console.error('Falha na API (Status:', response.status, '):', erro);
                alert(`ERRO AO CRIAR RESERVA: ${erro.erro} (Verifique o terminal do Flask)`);
            }

        } catch (error) {
            // FALHA DE CONEXÃO DE REDE (Servidor Python Desligado)
            console.error('Erro de rede (Servidor Flask offline?):', error);
            alert('Falha ao conectar à API. Verifique se o servidor Flask está rodando (python api.py).');
        }
    });
});
