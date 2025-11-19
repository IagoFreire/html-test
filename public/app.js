const API_BASE_URL = 'http://localhost:3000/api';

// Elementos do DOM
const dateInput = document.getElementById('date-input');
const searchBtn = document.getElementById('search-btn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');
const emptyState = document.getElementById('empty-state');
const resultsTitle = document.getElementById('results-title');
const totalFiles = document.getElementById('total-files');
const totalCameras = document.getElementById('total-cameras');
const recordingsContainer = document.getElementById('recordings-container');

// Definir data padrão como hoje
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
dateInput.value = todayStr;

// Event listeners
searchBtn.addEventListener('click', handleSearch);
dateInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
});

async function handleSearch() {
  const selectedDate = dateInput.value;
  
  if (!selectedDate) {
    showError('Por favor, selecione uma data');
    return;
  }

  // Extrair ano, mês e dia
  const [year, month, day] = selectedDate.split('-');
  
  // Mostrar loading
  showLoading();
  hideError();
  hideResults();
  hideEmptyState();

  try {
    const response = await fetch(`${API_BASE_URL}/recordings/${year}/${month}/${day}`);
    const data = await response.json();

    if (data.success) {
      displayResults(data);
    } else {
      showError(data.message || 'Nenhuma gravação encontrada para esta data');
      showEmptyState();
    }
  } catch (err) {
    console.error('Erro ao buscar gravações:', err);
    showError('Erro ao conectar com o servidor. Verifique se o servidor está rodando.');
    showEmptyState();
  } finally {
    hideLoading();
  }
}

function displayResults(data) {
  resultsTitle.textContent = `Gravações de ${data.date}`;
  totalFiles.textContent = `📁 ${data.totalFiles} arquivo(s)`;
  totalCameras.textContent = `📹 ${data.totalCameras} câmera(s)`;

  recordingsContainer.innerHTML = '';

  const cameras = Object.keys(data.recordings).sort();

  if (cameras.length === 0) {
    showEmptyState();
    return;
  }

  cameras.forEach(camera => {
    const cameraGroup = createCameraGroup(camera, data.recordings[camera]);
    recordingsContainer.appendChild(cameraGroup);
  });

  showResults();
}

function createCameraGroup(cameraName, recordings) {
  const group = document.createElement('div');
  group.className = 'camera-group';

  const header = document.createElement('div');
  header.className = 'camera-header';
  header.innerHTML = `
    <span class="camera-icon">📹</span>
    <span>${cameraName}</span>
    <span style="margin-left: auto; font-size: 0.9rem; opacity: 0.9;">
      ${recordings.length} gravação(ões)
    </span>
  `;

  const list = document.createElement('div');
  list.className = 'recordings-list';

  recordings.forEach(recording => {
    const item = createRecordingItem(recording);
    list.appendChild(item);
  });

  group.appendChild(header);
  group.appendChild(list);

  return group;
}

function createRecordingItem(recording) {
  const item = document.createElement('div');
  item.className = 'recording-item';

  const info = document.createElement('div');
  info.className = 'recording-info';

  const name = document.createElement('div');
  name.className = 'recording-name';
  name.textContent = recording.name;

  const details = document.createElement('div');
  details.className = 'recording-details';
  details.innerHTML = `
    <span>📏 ${recording.sizeFormatted}</span>
    <span>🕒 ${formatDateTime(recording.modified)}</span>
  `;

  info.appendChild(name);
  info.appendChild(details);

  const actions = document.createElement('div');
  actions.className = 'recording-actions';
  
  const openBtn = document.createElement('button');
  openBtn.className = 'btn-action';
  openBtn.textContent = 'Abrir';
  openBtn.onclick = () => openFile(recording);
  
  actions.appendChild(openBtn);

  item.appendChild(info);
  item.appendChild(actions);

  return item;
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function openFile(recording) {
  // Construir URL para o endpoint de arquivo
  const url = `${API_BASE_URL}/file/${recording.year}/${recording.month}/${recording.day}/${encodeURIComponent(recording.name)}`;
  
  // Abrir em nova aba
  window.open(url, '_blank');
}

function showLoading() {
  loading.classList.remove('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

function showError(message) {
  error.textContent = message;
  error.classList.remove('hidden');
}

function hideError() {
  error.classList.add('hidden');
}

function showResults() {
  results.classList.remove('hidden');
  emptyState.classList.add('hidden');
}

function hideResults() {
  results.classList.add('hidden');
}

function showEmptyState() {
  emptyState.classList.remove('hidden');
  results.classList.add('hidden');
}

function hideEmptyState() {
  emptyState.classList.add('hidden');
}
