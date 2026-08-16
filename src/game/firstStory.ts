export const firstStory = {
  id: 'midnight-login',
  caseNumber: '001',
  title: 'O Login da Meia-Noite',
  subtitle: 'Uma mensagem urgente. Uma câmera desligada. Cinco pessoas e alguém escondendo a verdade.',
  location: 'Condomínio Aurora',
  opening: [
    '23:42 — todos recebem uma mensagem supostamente enviada pela administração do condomínio.',
    '23:52 — a câmera 03 fica offline sem aviso.',
    '23:58 — uma conta de morador começa a enviar mensagens que ninguém reconhece.',
  ],
};

export const inspectorSignals = [
  { id: 'domain-age', label: 'Domínio criado hoje', detail: 'aurora-acesso-seguro.net foi registrado às 21:16.' },
  { id: 'https', label: 'Cadeado HTTPS', detail: 'A conexão é criptografada, mas isso não comprova a identidade do site.' },
  { id: 'unknown-org', label: 'Organização não identificada', detail: 'O certificado não aponta para a administração do condomínio.' },
  { id: 'urgent-copy', label: 'Urgência antes da meia-noite', detail: 'A mensagem tenta forçar uma decisão rápida.' },
];

export const timelineEvents = [
  { id: 'message', at: '23:42', label: 'Mensagem de atualização chega ao grupo' },
  { id: 'link', at: '23:44', label: 'O link é aberto por um dispositivo da rede' },
  { id: 'login', at: '23:46', label: 'Um login desconhecido aparece na conta' },
  { id: 'camera', at: '23:52', label: 'A câmera 03 fica offline' },
];

export const phoneApps = [
  { id: 'security', label: 'Segurança', icon: '◉' },
  { id: 'mail', label: 'E-mail', icon: '✉' },
  { id: 'messages', label: 'Mensagens', icon: '◆' },
  { id: 'files', label: 'Arquivos', icon: '▤' },
];
