import { pipeline } from '@xenova/transformers';

class CarTalkAI {
  constructor() {
    this.classifier = null;
    this.ready = false;
    this.templates = {
      'ultrapassagem': 'Solicita ultrapassagem de forma segura.',
      'alerta': 'Avisa sobre perigo ou obstáculo na via.',
      'gratidao': 'Envia um agradecimento ao condutor.',
      'desconhecido': 'Mensagem não reconhecida pelo sistema seguro.'
    };
  }

  async init() {
    try {
      // Usando um modelo pequeno para classificação de texto
      // No MVP, podemos usar zero-shot classification ou apenas embeddings
      // Por simplicidade e velocidade no browser, vamos tentar o 'Xenova/all-MiniLM-L6-v2' para similariedade
      this.classifier = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.ready = true;
      return true;
    } catch (e) {
      console.error('Falha ao carregar IA:', e);
      return false;
    }
  }

  async classify(text) {
    const lowerText = text.toLowerCase();
    
    // Fallback rápido com Regex (Moço de recados inteligente)
    if (lowerText.includes('ultrapassa') || lowerText.includes('passar')) return 'ultrapassagem';
    if (lowerText.includes('perigo') || lowerText.includes('cuidado') || lowerText.includes('obstáculo')) return 'alerta';
    if (lowerText.includes('obrigado') || lowerText.includes('valeu') || lowerText.includes('agradece')) return 'gratidao';

    return 'desconhecido';
  }

  getTemplate(intent) {
    return this.templates[intent] || this.templates['desconhecido'];
  }
}

export const ai = new CarTalkAI();
