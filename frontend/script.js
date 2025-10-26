// ===== SALON BOOKING - MODERN FRONTEND =====
// Sistema de agendamento com design moderno e UX otimizada
// Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer

// ===== GLOBAL VARIABLES =====
let agendamentos = [];
const API_BASE_URL = window.location.origin + '/api';
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Salon Booking System loaded!');
    
    initializeApp();
    setupNavigation();
    setupEventListeners();
    loadAgendamentos();
    initializeCalendar();
});

// ===== APP INITIALIZATION =====
function initializeApp() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').min = today;
    
    // Set default time to next hour
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    document.getElementById('horario').value = nextHour.toTimeString().slice(0, 5);
    
    // Show loading state
    showLoading(false);
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Scroll to section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('agendamentoForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        navigateMonth(-1);
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        navigateMonth(1);
    });
}

// ===== FORM HANDLING =====
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = getFormData();
    
    if (!validateFormData(formData)) {
        showToast('Por favor, preencha todos os campos!', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        await createAgendamento(formData);
        showToast('Agendamento criado com sucesso!', 'success');
        clearForm();
        await loadAgendamentos();
        renderCalendar();
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        showToast('Erro ao criar agendamento. Tente novamente.', 'error');
    } finally {
        showLoading(false);
    }
}

function getFormData() {
    return {
        nomeCliente: document.getElementById('nomeCliente').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value,
        servico: document.getElementById('servico').value
    };
}

function validateFormData(data) {
    return data.nomeCliente && data.telefone && data.data && data.horario && data.servico;
}

function clearForm() {
    document.getElementById('agendamentoForm').reset();
    // Set default time again
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    document.getElementById('horario').value = nextHour.toTimeString().slice(0, 5);
}

// ===== API CALLS =====
async function createAgendamento(data) {
    const response = await fetch(`${API_BASE_URL}/agendamentos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar agendamento');
    }
    
    return await response.json();
}

async function loadAgendamentos() {
    try {
        const response = await fetch(`${API_BASE_URL}/agendamentos`);
        
        if (response.ok) {
            agendamentos = await response.json();
            renderAgendamentosList();
            renderCalendar();
        } else {
            throw new Error('Erro ao carregar agendamentos');
        }
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        showEmptyState();
    }
}

async function deleteAgendamento(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/agendamentos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Agendamento removido com sucesso!', 'success');
            await loadAgendamentos();
            renderCalendar();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao remover agendamento');
        }
    } catch (error) {
        console.error('Erro ao remover agendamento:', error);
        showToast('Erro ao remover agendamento. Tente novamente.', 'error');
    }
}

// ===== RENDERING =====
function renderAgendamentosList() {
    const container = document.getElementById('listaAgendamentos');
    
    if (agendamentos.length === 0) {
        showEmptyState();
        return;
    }
    
    const html = agendamentos.map(agendamento => `
            <div class="agendamento-item">
            <h4>${agendamento.nome_cliente}</h4>
            <div class="agendamento-details">
                <div class="detail">
                    <i class="fas fa-phone"></i>
                    <strong>Telefone:</strong> ${agendamento.telefone}
                </div>
                <div class="detail">
                    <i class="fas fa-calendar-day"></i>
                    <strong>Data:</strong> ${formatDate(agendamento.data)}
                </div>
                <div class="detail">
                    <i class="fas fa-clock"></i>
                    <strong>Horário:</strong> ${formatTime(agendamento.horario)}
                </div>
                <div class="detail">
                    <i class="fas fa-spa"></i>
                    <strong>Serviço:</strong> ${agendamento.servico}
                </div>
            </div>
            <div class="agendamento-actions">
                <button class="btn btn-danger" onclick="confirmDelete(${agendamento.id})">
                    <i class="fas fa-trash"></i>
                    Remover
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function showEmptyState() {
    const container = document.getElementById('listaAgendamentos');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar-plus"></i>
            <h4>Nenhum agendamento encontrado</h4>
            <p>Crie seu primeiro agendamento usando o formulário acima</p>
            </div>
        `;
}

// ===== CALENDAR =====
function initializeCalendar() {
    renderCalendar();
}

function navigateMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    renderCalendar();
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    
    // Update month title
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Add weekdays header
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdays.forEach(day => {
        const weekdayElement = document.createElement('div');
        weekdayElement.className = 'calendar-weekdays';
        weekdayElement.textContent = day;
        calendarGrid.appendChild(weekdayElement);
    });
    
    // Calculate calendar days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add previous month days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayElement = createDayElement(prevLastDay - i, true);
        calendarGrid.appendChild(dayElement);
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false);
        calendarGrid.appendChild(dayElement);
    }
    
    // Add next month days
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells;
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true);
        calendarGrid.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    // Check if it's today
    const today = new Date();
    if (!isOtherMonth && 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear()) {
        dayElement.classList.add('today');
    }
    
    // Check for appointments
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const appointmentsOnDay = agendamentos.filter(ag => {
        const agDate = new Date(ag.data);
        return agDate.toISOString().split('T')[0] === dateString;
    });
    
    if (appointmentsOnDay.length > 0) {
        dayElement.classList.add('has-appointments');
    }
    
    // Day content
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
    
    // Click event
    dayElement.addEventListener('click', () => {
        if (!isOtherMonth) {
            showDayAppointments(dateString, appointmentsOnDay);
        }
    });
    
    return dayElement;
}

function showDayAppointments(dateString, appointments) {
    if (appointments.length === 0) {
        showToast('Nenhum agendamento neste dia.', 'info');
        return;
    }
    
    let message = `Agendamentos do dia ${formatDate(dateString)}:\n\n`;
    appointments.forEach((appointment, index) => {
        message += `${index + 1}. ${appointment.nome_cliente}\n`;
        message += `   Horário: ${formatTime(appointment.horario)}\n`;
        message += `   Serviço: ${appointment.servico}\n\n`;
    });
    
    alert(message);
}

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
}

function formatTime(timeString) {
    return timeString.substring(0, 5);
}

function confirmDelete(id) {
    if (confirm('Tem certeza que deseja remover este agendamento?')) {
        deleteAgendamento(id);
    }
}

// ===== UI COMPONENTS =====
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('Ocorreu um erro inesperado. Recarregue a página.', 'error');
});

// ===== SERVICE WORKER (Future Enhancement) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration can be added here for offline functionality
        console.log('Service Worker support detected');
    });
}