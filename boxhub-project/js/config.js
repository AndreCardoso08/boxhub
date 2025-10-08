// BOXHUB - Configurações e Constantes

// Configurações do aplicativo
const CONFIG = {
    APP_NAME: 'BOXHUB',
    VERSION: '1.0.0',
    AUTHOR: 'BoxHub Development Team',
    
    // Configurações de interface
    NOTIFICATION_DURATION: 3000,
    ANIMATION_DURATION: 300,
    AUTO_SAVE_INTERVAL: 5000,
    AUTO_ACTIVITY_INTERVAL_MS: 120000, // 2 minutos por omissão
    ENABLE_AUTO_ACTIVITY: true,
    
    // Configurações de dados
    LOCAL_STORAGE_KEYS: {
        USER_LOGGED_IN: 'boxhub_logged_in',
        USERNAME: 'boxhub_username',
        USER_VOTES: 'boxhub_votes',
        USER_LIKES: 'boxhub_likes',
        USER_PREFERENCES: 'boxhub_preferences'
    },
    
    // Limites
    MAX_POST_LENGTH: 500,
    MAX_TITLE_LENGTH: 100,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20
};

// Categorias de posts
const POST_CATEGORIES = {
    'geral': {
        icon: 'chat',
        name: 'Discussão Geral',
        color: '#2196f3'
    },
    'rankings': {
        icon: 'trophy',
        name: 'Rankings',
        color: '#ff9800'
    },
    'analise': {
        icon: 'tv',
        name: 'Análise de Luta',
        color: '#9c27b0'
    },
    'noticias': {
        icon: 'newspaper',
        name: 'Notícias',
        color: '#f44336'
    },
    'tecnica': {
        icon: 'boxing-glove',
        name: 'Técnica',
        color: '#4caf50'
    }
};

// Categorias de peso do boxe
const WEIGHT_CATEGORIES = [
    'Peso Mosca',
    'Peso Galo',
    'Peso Pena',
    'Peso Leve',
    'Peso Meio-Médio',
    'Peso Médio',
    'Peso Super Médio',
    'Peso Meio-Pesado',
    'Peso Pesado'
];

// Países com bandeiras
const COUNTRY_FLAGS = {
    'brasil': '',
    'brazil': '',
    'eua': '',
    'usa': '',
    'estados unidos': '',
    'méxico': '',
    'mexico': '',
    'reino unido': '',
    'inglaterra': '',
    'uk': '',
    'irlanda': '',
    'ireland': '',
    'argentina': '',
    'espanha': '',
    'spain': '',
    'frança': '',
    'france': '',
    'alemanha': '',
    'germany': '',
    'rússia': '',
    'russia': '',
    'japão': '',
    'japan': '',
    'filipinas': '',
    'philippines': '',
    'cuba': '',
    'porto rico': '',
    'puerto rico': '',
    'austrália': '',
    'australia': '',
    'canadá': '',
    'canada': '',
    'ucrânia': '',
    'ukraine': '',
    'cazaquistão': '',
    'kazakhstan': ''
};

// Mensagens do sistema
const MESSAGES = {
    WELCOME: 'Bem-vindo ao BOXHUB!',
    LOGIN_REQUIRED: 'Faça login para acessar esta funcionalidade!',
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    LOGOUT_SUCCESS: 'Até logo!',
    POST_CREATED: 'Post criado com sucesso!',
    VOTE_SUCCESS_UP: 'Voto positivo registrado!',
    VOTE_SUCCESS_DOWN: 'Voto negativo registrado!',
    VOTE_REMOVED: 'Voto removido! Agora você pode votar novamente.',
    ALREADY_VOTED: 'Você já votou neste lutador! Use "Remover Voto" para trocar.',
    ALREADY_LIKED: 'Você já curtiu este post!',
    POST_LIKED: 'Post curtido!',
    POST_SHARED: 'Post compartilhado!',
    FIGHTER_ADDED: 'Lutador adicionado ao ranking!',
    FORM_INCOMPLETE: 'Preencha todos os campos!',
    COMMENTS_DEVELOPMENT: 'Área de comentários em desenvolvimento!'
};

// Funções utilitárias
const UTILS = {
    // Formatar tempo relativo
    formatTimeAgo: (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'agora mesmo';
        if (minutes < 60) return `há ${minutes} min`;
        if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
        return `há ${days} dia${days > 1 ? 's' : ''}`;
    },
    
    // Gerar cor aleatória para avatar
    generateAvatarColor: (name) => {
        const colors = [
            'linear-gradient(135deg, #d32f2f, #f57c00)',
            'linear-gradient(135deg, #2196f3, #21cbf3)',
            'linear-gradient(135deg, #4caf50, #8bc34a)',
            'linear-gradient(135deg, #9c27b0, #e91e63)',
            'linear-gradient(135deg, #ff9800, #ffc107)',
            'linear-gradient(135deg, #795548, #a1887f)',
            'linear-gradient(135deg, #607d8b, #90a4ae)'
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    },
    
    // Validar entrada de usuário
    validateInput: (type, value) => {
        switch (type) {
            case 'username':
                return value.length >= CONFIG.MIN_USERNAME_LENGTH && 
                       value.length <= CONFIG.MAX_USERNAME_LENGTH &&
                       /^[a-zA-Z0-9_]+$/.test(value);
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'post_title':
                return value.length > 0 && value.length <= CONFIG.MAX_TITLE_LENGTH;
            case 'post_content':
                return value.length > 0 && value.length <= CONFIG.MAX_POST_LENGTH;
            default:
                return true;
        }
    },
    
    // Sanitizar texto
    sanitizeText: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Gerar ID único
    generateUniqueId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Exportar para uso global (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, POST_CATEGORIES, WEIGHT_CATEGORIES, COUNTRY_FLAGS, MESSAGES, UTILS };
}