const API_KEY = 'b19bd1ae1c834309b7904758241110';

// Função para registrar logs localmente
function registrarLog(operacao, status) {
    const logData = {
        operacao,
        status,
        timestamp: new Date().toISOString(),
    };
    let logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.push(logData);
    localStorage.setItem('logs', JSON.stringify(logs));
}

// Função para obter dados de previsão de 7 dias
async function obterDadosPrevisao(cidade) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cidade}&days=7&lang=pt`;
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`HTTP error! status: ${resposta.status}`);
        const dados = await resposta.json();
        registrarLog(`Obter Previsão para ${cidade}`, 'Sucesso');
        return dados;
    } catch (erro) {
        registrarLog(`Obter Previsão para ${cidade}`, 'Falha');
        console.error('Erro ao obter dados de previsão:', erro.message);
    }
}

// Função para obter condições atuais
async function obterCondicoesAtuais(cidade) {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${cidade}&lang=pt`;
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`HTTP error! status: ${resposta.status}`);
        const dados = await resposta.json();
        registrarLog(`Obter Condições Atuais para ${cidade}`, 'Sucesso');
        return dados;
    } catch (erro) {
        registrarLog(`Obter Condições Atuais para ${cidade}`, 'Falha');
        console.error('Erro ao obter condições atuais:', erro.message);
    }
}

// Função para obter histórico meteorológico
async function obterHistoricoMeteorologico(cidade, data) {
    const url = `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${cidade}&dt=${data}&lang=pt`;
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`HTTP error! status: ${resposta.status}`);
        const dados = await resposta.json();
        registrarLog(`Obter Histórico para ${cidade} em ${data}`, 'Sucesso');
        return dados;
    } catch (erro) {
        registrarLog(`Obter Histórico para ${cidade} em ${data}`, 'Falha');
        console.error('Erro ao obter histórico meteorológico:', erro.message);
    }
}

// Função para exibir dados de previsão
async function exibirClima(cidade) {
    console.log('Cidade:', cidade); // Verifique se a cidade está correta
    const dadosPrevisao = await obterDadosPrevisao(cidade);
    if (!dadosPrevisao) return;

    // Atualizar informações na interface
    document.getElementById('main-location').textContent = `Localização Atual: ${dadosPrevisao.location.name}, ${dadosPrevisao.location.country}`;
    document.getElementById('main-temperature').textContent = `Temperatura: ${dadosPrevisao.current.temp_c} °C`;
    document.getElementById('main-description').textContent = `Descrição: ${dadosPrevisao.current.condition.text}`;
    document.getElementById('main-humidity').textContent = `Umidade: ${dadosPrevisao.current.humidity}%`;
    document.getElementById('main-wind').textContent = `Vento: ${dadosPrevisao.current.wind_kph} km/h`;

    // Dias da semana
    const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    dadosPrevisao.forecast.forecastday.forEach((dia) => {
        const data = new Date(dia.date);
        const nomeDia = dias[data.getDay()];
        const urlIcone = `https:${dia.day.condition.icon}`;
        document.getElementById(`${nomeDia}-icon`).style.backgroundImage = `url(${urlIcone})`;
        document.getElementById(`${nomeDia}-temperature`).textContent = `${dia.day.avgtemp_c} °C`;
        document.getElementById(`${nomeDia}-forecast`).dataset.details = JSON.stringify({
            date: dia.date,
            description: dia.day.condition.text,
            temp: `${dia.day.avgtemp_c} °C`,
            humidity: `${dia.day.avghumidity}%`,
            wind: `${dia.day.maxwind_kph} km/h`,
            minTemp: `${dia.day.mintemp_c} °C`,
            maxTemp: `${dia.day.maxtemp_c} °C`,
            sunrise: dia.astro.sunrise,
            sunset: dia.astro.sunset,
        });
    });

    // Exibir condições atuais e histórico (opcional)
    const dadosAtuais = await obterCondicoesAtuais(cidade);
    const dataHistorico = '2023-10-01'; // Exemplo de data
    const dadosHistorico = await obterHistoricoMeteorologico(cidade, dataHistorico);
}

// Função para abrir o popup com detalhes
function abrirPopup(dia) {
    const detalhes = JSON.parse(document.getElementById(`${dia}-forecast`).dataset.details);
    document.getElementById('popup-day').textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
    document.getElementById('popup-date').textContent = `Data: ${detalhes.date}`;
    document.getElementById('popup-description').textContent = `Descrição: ${detalhes.description}`;
    document.getElementById('popup-temp').textContent = `Temperatura: ${detalhes.temp}`;
    document.getElementById('popup-min-temp').textContent = `Temp. Mínima: ${detalhes.minTemp}`;
    document.getElementById('popup-max-temp').textContent = `Temp. Máxima: ${detalhes.maxTemp}`;
    document.getElementById('popup-humidity').textContent = `Umidade: ${detalhes.humidity}`;
    document.getElementById('popup-wind').textContent = `Vento: ${detalhes.wind}`;
    document.getElementById('popup-sunrise').textContent = `Nascer do Sol: ${detalhes.sunrise}`;
    document.getElementById('popup-sunset').textContent = `Pôr do Sol: ${detalhes.sunset}`;
    document.getElementById('popup').classList.add('show');
    document.body.classList.add('popup-open');
}

// Função para fechar o popup
function fecharPopup() {
    document.getElementById('popup').classList.remove('show');
    document.body.classList.remove('popup-open');
}

// Evento de submissão do formulário
document.getElementById('weather-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const cidade = document.getElementById('city-input').value;
    if (cidade) {
        exibirClima(cidade);
    }
});

// Geolocalização ao carregar a página
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            exibirClima(`${latitude},${longitude}`);
        }, () => {
            exibirClima('São Paulo'); // Fallback para São Paulo se a geolocalização falhar
        });
    } else {
        exibirClima('São Paulo'); // Fallback para São Paulo se a geolocalização não for suportada
    }
});

// Funções para gerenciar logs

// Função para exibir os logs
function exibirLogs() {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const logList = document.getElementById('log-list');
    logList.innerHTML = ''; // Limpa a lista antes de exibir
    logs.forEach(log => {
        const logItem = document.createElement('li');
        logItem.textContent = `${log.operacao} - ${log.status} - ${log.timestamp}`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('delete-log-button');
        deleteButton.addEventListener('click', () => excluirLog(logItem, log));
        logItem.appendChild(deleteButton);
        logList.appendChild(logItem);
    });
}

// Função para excluir um log
function excluirLog(logItem, log) {
    let logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs = logs.filter(l => l.timestamp !== log.timestamp); // Remove o log que está sendo excluído
    localStorage.setItem('logs', JSON.stringify(logs));
    logItem.remove(); // Remove o item da lista visual
}

// Inicializa a exibição dos logs ao carregar a página
window.addEventListener('load', () => {
    exibirLogs(); // Exibe os logs ao carregar a página
});

// Função para abrir o popup de logs
function abrirPopupLogs() {
    const popupLogs = document.getElementById('popup-logs');
    exibirLogs(); // Carrega os logs no popup ao abrir
    popupLogs.classList.add('show');
    document.body.classList.add('popup-open');
}

// Função para fechar o popup de logs
function fecharPopupLogs() {
    const popupLogs = document.getElementById('popup-logs');
    popupLogs.classList.remove('show');
    document.body.classList.remove('popup-open');
}
