import { ai } from './ai';

const micBtn = document.getElementById('mic-btn');
const mainView = document.getElementById('main-view');
const aiStatus = document.getElementById('ai-status');
const statusDot = document.getElementById('status-dot');
const sttPreview = document.getElementById('stt-preview');
const p2pNotif = document.getElementById('p2p-notif');
const btnAccept = document.getElementById('btn-accept');
const btnIgnore = document.getElementById('btn-ignore');

let recognition;
let isRecording = false;

// 1. Inicializar IA
async function init() {
  const success = await ai.init();
  if (success) {
    aiStatus.textContent = 'IA: Pronta (Local)';
    statusDot.style.background = 'var(--success)';
    statusDot.style.boxShadow = '0 0 10px var(--success)';
  } else {
    aiStatus.textContent = 'IA: Modo Fallback (Regex)';
  }
}

// 2. Configurar Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-PT';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
    sttPreview.textContent = transcript;

    if (event.results[0].isFinal) {
      processVoice(transcript);
    }
  };

  recognition.onerror = () => {
    stopRecording();
  };
} else {
  aiStatus.textContent = 'STT não suportado no browser';
}

function startRecording() {
  if (isRecording) return;
  isRecording = true;
  micBtn.classList.add('recording');
  sttPreview.textContent = 'Ouvindo...';
  try {
    recognition.start();
  } catch (e) {}
}

function stopRecording() {
  if (!isRecording) return;
  isRecording = false;
  micBtn.classList.remove('recording');
  try {
    recognition.stop();
  } catch (e) {}
}

async function processVoice(text) {
  stopRecording();
  
  // Criar Card do Utilizador
  addMessageCard('Você (Voz)', text, 'transmitting');

  // AI interpreta
  const intent = await ai.classify(text);
  const normalized = ai.getTemplate(intent);
  
  // Atualizar Card com o "Moço de Recados"
  updateLastCard(intent, normalized);

  // Simular envio P2P (Nearby Connections Mock)
  setTimeout(() => {
    simulateP2PIncoming();
  }, 3000);
}

function addMessageCard(label, text, type) {
  const card = document.createElement('div');
  card.className = `card ${type}`;
  card.innerHTML = `
    <span class="label">${label}</span>
    <p class="message-text">"${text}"</p>
    <div class="template-indicator" style="margin-top:0.5rem; font-style:italic; font-size:0.8rem; color: var(--accent-color)">Normalizando...</div>
  `;
  mainView.prepend(card);
}

function updateLastCard(intent, normalized) {
  const firstCard = mainView.firstChild;
  const indicator = firstCard.querySelector('.template-indicator');
  const textEl = firstCard.querySelector('.message-text');
  
  indicator.innerHTML = `
    <span class="template-badge">${intent.toUpperCase()}</span>
    <p style="margin-top:0.5rem; font-size:0.85rem; color:var(--text-secondary)">Padrão: ${normalized}</p>
  `;
  textEl.style.opacity = '0.7';
}

function simulateP2PIncoming() {
  p2pNotif.classList.add('show');
  // Feedback hápitco se disponível
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// Event Listeners
micBtn.addEventListener('click', () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

btnAccept.addEventListener('click', () => {
  p2pNotif.classList.remove('show');
  addMessageCard('Condutor Próximo', 'Solicitação aceite. Canal aberto.', 'system');
});

btnIgnore.addEventListener('click', () => {
  p2pNotif.classList.remove('show');
});

init();
