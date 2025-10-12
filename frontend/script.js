// Array para armazenar os agendamentos
// Um array é como uma lista que pode crescer dinamicamente
let agendamentos = [];

// URL base da API (vai apontar para o backend)
const API_BASE_URL = window.location.origin + '/api';

// Variáveis do calendário
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Função que é executada quando a página carrega
// document.addEventListener significa "quando algo acontecer"
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de agendamento carregado!');
    
    // Pega o formulário pelo ID e adiciona um "escutador" de eventos
    const formulario = document.getElementById('agendamentoForm');
    formulario.addEventListener('submit', criarAgendamento);
    
    // Carrega agendamentos salvos quando a página abre
    carregarAgendamentos();
    
    // Inicializa o calendário
    inicializarCalendario();
});

/**
 * Função para criar um novo agendamento via API
 * @param {Event} event - O evento de submit do formulário
 */
async function criarAgendamento(event) {
    // Previne o comportamento padrão do formulário (recarregar a página)
    event.preventDefault();
    
    console.log('Criando novo agendamento...');
    
    // Pega os valores dos campos do formulário
    // document.getElementById pega um elemento pelo seu ID
    const nomeCliente = document.getElementById('nomeCliente').value;
    const telefone = document.getElementById('telefone').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const servico = document.getElementById('servico').value;
    
    // Valida se todos os campos foram preenchidos
    if (!nomeCliente || !telefone || !data || !horario || !servico) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Cria um objeto representando o agendamento
    // Um objeto é como um "recipiente" que guarda várias informações relacionadas
    const novoAgendamento = {
        nomeCliente: nomeCliente,
        telefone: telefone,
        data: data,
        horario: horario,
        servico: servico
    };
    
    try {
        // Faz requisição POST para a API
        const response = await fetch(`${API_BASE_URL}/agendamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoAgendamento)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('Agendamento criado:', result);
            
            // Atualiza a lista na tela
            await carregarAgendamentos();
            
            // Atualiza o calendário
            renderizarCalendario();
            
            // Limpa o formulário
            document.getElementById('agendamentoForm').reset();
            
            // Mostra mensagem de sucesso
            alert('Agendamento criado com sucesso!');
        } else {
            // Se houve erro, mostra a mensagem
            alert(`Erro: ${result.error}`);
        }
        
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        alert('Erro ao conectar com o servidor. Tente novamente.');
    }
}

/**
 * Função para exibir todos os agendamentos na tela
 */
function exibirAgendamentos() {
    const listaElement = document.getElementById('listaAgendamentos');
    
    // Se não há agendamentos, mostra mensagem
    if (agendamentos.length === 0) {
        listaElement.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
        return;
    }
    
    // Cria HTML para cada agendamento
    // map() percorre o array e transforma cada elemento
    let html = agendamentos.map(agendamento => {
        return `
            <div class="agendamento-item">
                <h3>${agendamento.nome_cliente}</h3>
                <p><strong>Telefone:</strong> ${agendamento.telefone}</p>
                <p><strong>Data:</strong> ${formatarData(agendamento.data)}</p>
                <p><strong>Horário:</strong> ${formatarHorario(agendamento.horario)}</p>
                <p><strong>Serviço:</strong> ${agendamento.servico}</p>
                <button onclick="removerAgendamento(${agendamento.id})" class="btn-remover">Remover</button>
            </div>
        `;
    }).join(''); // join('') junta todas as strings em uma só
    
    listaElement.innerHTML = html;
}

/**
 * Função para remover um agendamento via API
 * @param {number} id - ID do agendamento a ser removido
 */
async function removerAgendamento(id) {
    // Confirma se o usuário realmente quer remover
    if (confirm('Tem certeza que deseja remover este agendamento?')) {
        try {
            // Faz requisição DELETE para a API
            const response = await fetch(`${API_BASE_URL}/agendamentos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                console.log('Agendamento removido:', id);
                // Atualiza a lista na tela
                await carregarAgendamentos();
                
                // Atualiza o calendário
                renderizarCalendario();
            } else {
                const result = await response.json();
                alert(`Erro: ${result.error}`);
            }
            
        } catch (error) {
            console.error('Erro ao remover agendamento:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
        }
    }
}

/**
 * Função para formatar a data para exibição
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {string} Data formatada
 */
function formatarData(data) {
    try {
        // Se a data já vem como string ISO completa, usa diretamente
        const dataObj = new Date(data);
        
        // Verifica se a data é válida
        if (isNaN(dataObj.getTime())) {
            return 'Data inválida';
        }
        
        // toLocaleDateString() formata a data no padrão brasileiro
        return dataObj.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
}

/**
 * Função para formatar o horário para exibição
 * @param {string} horario - Horário no formato HH:MM
 * @returns {string} Horário formatado
 */
function formatarHorario(horario) {
    return horario.substring(0, 5); // Remove os segundos se existirem
}

/**
 * Função para carregar agendamentos da API
 */
async function carregarAgendamentos() {
    try {
        // Faz requisição GET para a API
        const response = await fetch(`${API_BASE_URL}/agendamentos`);
        
        if (response.ok) {
            // Converte a resposta JSON para array
            agendamentos = await response.json();
            console.log('Agendamentos carregados:', agendamentos);
            
            // Exibe os agendamentos na tela
            exibirAgendamentos();
            
            // Atualiza o calendário
            renderizarCalendario();
        } else {
            console.error('Erro ao carregar agendamentos');
            // Se der erro, mostra mensagem na tela
            const listaElement = document.getElementById('listaAgendamentos');
            listaElement.innerHTML = '<p>Erro ao carregar agendamentos. Verifique se o servidor está rodando.</p>';
        }
        
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        // Se der erro, mostra mensagem na tela
        const listaElement = document.getElementById('listaAgendamentos');
            listaElement.innerHTML = '<p>Erro ao conectar com o servidor. Verifique se o backend está rodando.</p>';
    }
}

// ===== FUNCIONALIDADES DO CALENDÁRIO =====

/**
 * Inicializa o calendário com os event listeners
 */
function inicializarCalendario() {
    // Event listeners para navegação do calendário
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderizarCalendario();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderizarCalendario();
    });
    
    // Renderiza o calendário inicial
    renderizarCalendario();
}

/**
 * Renderiza o calendário na tela
 */
function renderizarCalendario() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    
    // Atualiza o título do mês
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Limpa o calendário
    calendarGrid.innerHTML = '';
    
    // Adiciona os dias da semana
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdays.forEach(day => {
        const weekdayElement = document.createElement('div');
        weekdayElement.className = 'calendar-weekdays';
        weekdayElement.textContent = day;
        weekdayElement.style.gridColumn = 'span 1';
        weekdayElement.style.background = '#4caf50';
        weekdayElement.style.color = 'white';
        weekdayElement.style.padding = '10px';
        weekdayElement.style.textAlign = 'center';
        weekdayElement.style.fontWeight = 'bold';
        calendarGrid.appendChild(weekdayElement);
    });
    
    // Calcula o primeiro dia do mês e quantos dias tem
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Adiciona dias do mês anterior (se necessário)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayElement = criarElementoDia(prevLastDay - i, true);
        calendarGrid.appendChild(dayElement);
    }
    
    // Adiciona dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = criarElementoDia(day, false);
        calendarGrid.appendChild(dayElement);
    }
    
    // Adiciona dias do próximo mês (se necessário)
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 semanas × 7 dias
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = criarElementoDia(day, true);
        calendarGrid.appendChild(dayElement);
    }
}

/**
 * Cria um elemento de dia para o calendário
 * @param {number} day - Número do dia
 * @param {boolean} isOtherMonth - Se é de outro mês
 * @returns {HTMLElement} Elemento do dia
 */
function criarElementoDia(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    // Verifica se é hoje
    const today = new Date();
    if (!isOtherMonth && 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear()) {
        dayElement.classList.add('today');
    }
    
    // Verifica se tem agendamentos neste dia
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const appointmentsOnDay = agendamentos.filter(ag => {
        const agDate = new Date(ag.data);
        return agDate.toISOString().split('T')[0] === dateString;
    });
    
    if (appointmentsOnDay.length > 0) {
        dayElement.classList.add('has-appointments');
    }
    
    // Conteúdo do dia
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    if (appointmentsOnDay.length > 0) {
        const appointmentsInfo = document.createElement('div');
        appointmentsInfo.className = 'calendar-appointments';
        appointmentsInfo.textContent = `${appointmentsOnDay.length} agendamento${appointmentsOnDay.length > 1 ? 's' : ''}`;
        dayElement.appendChild(appointmentsInfo);
    }
    
    // Event listener para clicar no dia
    dayElement.addEventListener('click', () => {
        if (!isOtherMonth) {
            mostrarAgendamentosDia(dateString);
        }
    });
    
    return dayElement;
}

/**
 * Mostra os agendamentos de um dia específico
 * @param {string} dateString - Data no formato YYYY-MM-DD
 */
function mostrarAgendamentosDia(dateString) {
    const appointmentsOnDay = agendamentos.filter(ag => {
        const agDate = new Date(ag.data);
        return agDate.toISOString().split('T')[0] === dateString;
    });
    
    if (appointmentsOnDay.length === 0) {
        alert('Nenhum agendamento neste dia.');
        return;
    }
    
    let message = `Agendamentos do dia ${formatarData(dateString)}:\n\n`;
    appointmentsOnDay.forEach((appointment, index) => {
        message += `${index + 1}. ${appointment.nome_cliente}\n`;
        message += `   Horário: ${formatarHorario(appointment.horario)}\n`;
        message += `   Serviço: ${appointment.servico}\n\n`;
    });
    
    alert(message);
}
