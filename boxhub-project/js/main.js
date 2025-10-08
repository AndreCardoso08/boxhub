// BOXHUB - Comunidade de Boxe - JavaScript Principal

// Gerenciamento de abas
function showTab(tabName, evt) {
    // Mapeamento de abas para arquivos
    const map = {
        'feed': 'index.html',
        'discussions': 'discussions.html',
        'rankings': 'rankings.html',
        'fighters': 'fighters.html',
        'events': 'events.html'
    };
    
    const targetPage = map[tabName];
    if (!targetPage) {
        return;
    }

    // Se evento for passado e não estivermos na página correta, redirecionar
    if (evt) {
        evt.preventDefault();
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== targetPage) {
            window.location.href = targetPage;
            return;
        }
    }
    
    // Atualizar navegação
    document.querySelectorAll('.nav-tabs a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === map[tabName]) {
            link.classList.add('active');
        }
    });

    // Tenta encontrar a aba na página atual
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        // Esconder todas as abas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });

        // Mostrar aba selecionada
        selectedTab.style.display = 'block';
    }
}

// Gerenciamento de modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden'; // Previne scroll
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaura scroll
}

// Sistema de controle de votos (armazena no localStorage)
let userVotes = JSON.parse(localStorage.getItem('boxhub_votes') || '{}');

// Controle de usuário logado
let isUserLoggedIn = localStorage.getItem('boxhub_logged_in') === 'true';
let currentUser = localStorage.getItem('boxhub_username') || null;

// Controle de curtidas por post
let userLikes = JSON.parse(localStorage.getItem('boxhub_likes') || '{}');

// Função para gerar ID seguro
function generateSafeFighterId(name) {
    return name.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove acentos
              .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
              .replace(/\s+/g, '_') // Substitui espaços por underscore
              .replace(/_+/g, '_') // Remove underscores duplicados
              .replace(/^_|_$/g, ''); // Remove underscores no início/fim
}

// Sistema de votação com controle único
function vote(fighter, direction, btn) {
    // Verificar se usuário está logado
    if (!isUserLoggedIn) {
        showNotification('Faça login para votar nos lutadores!', 'error');
        openModal('loginModal');
        return;
    }
    
    // Verificar se já votou neste lutador
    if (userVotes[fighter]) {
        showNotification('Você já votou neste lutador! Use "Remover Voto" para trocar.', 'error');
        return;
    }
    
    // Animação visual
    btn.style.transform = 'scale(1.3)';
    btn.style.boxShadow = '0 0 15px rgba(211, 47, 47, 0.5)';
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = 'none';
    }, 300);
    
    // Registrar o voto
    userVotes[fighter] = direction;
    localStorage.setItem('boxhub_votes', JSON.stringify(userVotes));
    
    // Atualizar votos
    const voteSection = btn.closest('.vote-section');
    const voteCount = voteSection.querySelector('.vote-count');
    const currentVotes = parseInt(voteCount.textContent.match(/\d+/)[0]);
    const newVotes = direction === 'up' ? currentVotes + 1 : Math.max(0, currentVotes - 1);
    voteCount.textContent = `${newVotes} votos`;
    
    // Desabilitar botões de voto para este lutador
    const voteButtons = voteSection.querySelectorAll('.vote-btn');
    voteButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    });
    
    // Destacar o botão votado
    btn.style.opacity = '1';
    btn.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.8)';
    
    // Mostrar botão de remover voto
    const removeBtn = voteSection.querySelector('.remove-vote-btn');
    if (removeBtn) {
        removeBtn.style.display = 'block';
    }
    
    // Feedback visual
    const message = direction === 'up' ? 'Voto positivo registrado!' : 'Voto negativo registrado!';
    showNotification(message);
}

// Função para remover voto
function removeVote(fighter, btn) {
    // Verificar se usuário está logado
    if (!isUserLoggedIn) {
        showNotification('Faça login para gerenciar seus votos!', 'error');
        openModal('loginModal');
        return;
    }
    
    // Verificar se realmente votou
    if (!userVotes[fighter]) {
        showNotification('Você não votou neste lutador!', 'error');
        return;
    }
    
    // Obter direção do voto anterior
    const previousVote = userVotes[fighter];
    
    // Remover o voto
    delete userVotes[fighter];
    localStorage.setItem('boxhub_votes', JSON.stringify(userVotes));
    
    // Atualizar contagem de votos
    const voteSection = btn.closest('.vote-section');
    const voteCount = voteSection.querySelector('.vote-count');
    const currentVotes = parseInt(voteCount.textContent.match(/\d+/)[0]);
    const newVotes = previousVote === 'up' ? Math.max(0, currentVotes - 1) : currentVotes + 1;
    voteCount.textContent = `${newVotes} votos`;
    
    // Reabilitar botões de voto
    const voteButtons = voteSection.querySelectorAll('.vote-btn');
    voteButtons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.style.boxShadow = 'none';
    });
    
    // Esconder botão de remover voto
    btn.style.display = 'none';
    
    showNotification('Voto removido! Agora você pode votar novamente.');
}

// Sistema de curtidas com controle único
function likePost(btn) {
    // Verificar se usuário está logado
    if (!isUserLoggedIn) {
        showNotification('Faça login para curtir posts!', 'error');
        openModal('loginModal');
        return;
    }
    
    // Gerar ID único para o post baseado no conteúdo
    const post = btn.closest('.post');
    const postTitle = post.querySelector('h4').textContent;
    const postId = generateSafeFighterId(postTitle);
    
    // Verificar se já curtiu este post
    if (userLikes[postId]) {
        showNotification('Você já curtiu este post!', 'error');
        return;
    }
    
    // Registrar a curtida
    userLikes[postId] = true;
    localStorage.setItem('boxhub_likes', JSON.stringify(userLikes));
    
    const countSpan = btn.querySelector('.count');
    const currentLikes = parseInt(countSpan.textContent.match(/\d+/)[0]);
    const newLikes = currentLikes + 1;
    countSpan.textContent = `(${newLikes})`;
    
    // Animação e desabilitar botão
    btn.style.color = '#d32f2f';
    btn.style.transform = 'scale(1.1)';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.style.cursor = 'not-allowed';
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
    
    showNotification('Post curtido!');
}

// Sistema de comentários
function commentPost(btn) {
    // Verificar se usuário está logado
    if (!isUserLoggedIn) {
        showNotification('Faça login para comentar!', 'error');
        openModal('loginModal');
        return;
    }
    
    const post = btn.closest('.post');
    // Alternar a visibilidade da secção de comentários
    const commentsSection = post.querySelector('.comments-section');
    if (commentsSection) {
        const hidden = commentsSection.style.display === 'none' || !commentsSection.style.display;
        commentsSection.style.display = hidden ? 'block' : 'none';
    }
}

// Sistema de compartilhamento
function sharePost(btn) {
    // Verificar se usuário está logado
    if (!isUserLoggedIn) {
        showNotification('Faça login para compartilhar!', 'error');
        openModal('loginModal');
        return;
    }
    
    // Simular compartilhamento
    const post = btn.closest('.post');
    const postTitle = post.querySelector('h4').textContent;
    
    // Copiar para área de transferência (simulado)
    showNotification('Post compartilhado!');
    
    // Animação no botão
    btn.style.transform = 'scale(1.1)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
}

// Criar novo post
function createPost(event) {
    event.preventDefault();
    
    // Verificar se usuário está logado
    if (!isUserLoggedIn) {
        showNotification('Faça login para criar posts!', 'error');
        closeModal('createPostModal');
        openModal('loginModal');
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;
    
    if (!title.trim() || !content.trim()) {
    showNotification('Preencha todos os campos!', 'error');
        return;
    }
    
    // Criar o novo post
    addNewPost(title, content, category);
    
    // Simular criação do post
    showNotification('Post criado com sucesso!');
    closeModal('createPostModal');
    
    // Limpar formulário
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
}

// Função para adicionar novo post ao feed
function addNewPost(title, content, category) {
    const categoryIcons = {
        'geral': '<img class="ui-icon" src="assets/images/icons/chat.svg" alt="" aria-hidden="true">',
        'rankings': '<img class="ui-icon" src="assets/images/icons/trophy.svg" alt="" aria-hidden="true">',
        'analise': '<img class="ui-icon" src="assets/images/icons/tv.svg" alt="" aria-hidden="true">',
        'noticias': '<img class="ui-icon" src="assets/images/icons/newspaper.svg" alt="" aria-hidden="true">',
        'tecnica': '<img class="ui-icon" src="assets/images/icons/boxing-glove.svg" alt="" aria-hidden="true">'
    };
    
    const categoryNames = {
        'geral': 'Discussão Geral',
        'rankings': 'Rankings',
        'analise': 'Análise de Luta',
        'noticias': 'Notícias',
        'tecnica': 'Técnica'
    };
    
    // Obter iniciais do usuário atual
    const userInitials = currentUser ? currentUser.substring(0, 2).toUpperCase() : 'EU';
    const userName = currentUser || 'Você';
    
    // HTML do novo post
    const newPostHTML = `
        <div class="post" style="border-left: 4px solid #4caf50;">
            <div class="post-header">
                <div class="user-avatar" style="background: linear-gradient(135deg, #4caf50, #66bb6a);">${userInitials}</div>
                <div>
                    <div><strong>${userName}</strong> • agora mesmo</div>
                    <div style="font-size: 0.9rem; color: #666;">${categoryIcons[category]} ${categoryNames[category]}</div>
                </div>
            </div>
            <div class="post-content">
                <h4>${title}</h4>
                <p>${content}</p>
            </div>
            <div class="post-actions">
                <button class="post-action" onclick="likePost(this)"><img class=\"ui-icon\" src=\"assets/images/icons/thumb-up.svg\" alt=\"\" aria-hidden=\"true\">Curtir <span class=\"count\">(0)</span></button>
                <button class="post-action" onclick="commentPost(this)"><img class=\"ui-icon\" src=\"assets/images/icons/chat.svg\" alt=\"\" aria-hidden=\"true\">Comentar (0)</button>
                <button class="post-action" onclick="sharePost(this)"><img class=\"ui-icon\" src=\"assets/images/icons/share.svg\" alt=\"\" aria-hidden=\"true\">Compartilhar</button>
            </div>
            <div class="comments-section" style="display:none;">
                <div class="comments-header">Comentários</div>
                <div class="comments-list"></div>
            </div>
        </div>
    `;
    
    // Adicionar o post no início do feed
    const feedContent = document.getElementById('feed-tab');
    const createPostDiv = feedContent.querySelector('.create-post');
    createPostDiv.insertAdjacentHTML('afterend', newPostHTML);
    
    // Scroll suave para o novo post
    setTimeout(() => {
        const newPost = createPostDiv.nextElementSibling;
        newPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Destacar o novo post temporariamente
        newPost.style.animation = 'newPostHighlight 2s ease';
    }, 100);
}

// Login
function login(event) {
    event.preventDefault();
    
    // Pegar o nome/email do formulário
    const loginInput = document.querySelector('#loginModal input[type="text"], #loginModal input[type="email"]');
    const loginValue = loginInput.value.trim();
    
    if (!loginValue) {
        showNotification('Preencha o campo de usuário/email!', 'error');
        return;
    }
    
    // Extrair nome de usuário do email ou usar o valor diretamente
    let username;
    if (loginValue.includes('@')) {
        // Se for email, pegar a parte antes do @
        username = loginValue.split('@')[0];
    } else {
        // Se for nome de usuário, usar diretamente
        username = loginValue;
    }
    
    // Capitalizar primeira letra
    username = username.charAt(0).toUpperCase() + username.slice(1);
    
    // Simular login bem-sucedido
    isUserLoggedIn = true;
    currentUser = username;
    
    // Salvar estado no localStorage
    localStorage.setItem('boxhub_logged_in', 'true');
    localStorage.setItem('boxhub_username', currentUser);
    
    showNotification(`Bem-vindo, ${currentUser}!`);
    closeModal('loginModal');
    
    // Atualizar interface para usuário logado
    updateUserInterface();
}

// Registro
function register(event) {
    event.preventDefault();
    
    // Pegar o nome de usuário do formulário
    const usernameInput = document.querySelector('#registerModal input[type="text"]');
    const username = usernameInput.value.trim();
    
    if (!username) {
        showNotification('Preencha o nome de usuário!', 'error');
        return;
    }
    
    // Capitalizar primeira letra
    const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1);
    
    // Simular registro bem-sucedido
    isUserLoggedIn = true;
    currentUser = formattedUsername;
    
    // Salvar estado no localStorage
    localStorage.setItem('boxhub_logged_in', 'true');
    localStorage.setItem('boxhub_username', currentUser);
    
    showNotification(`Conta criada! Bem-vindo, ${currentUser}!`);
    closeModal('registerModal');
    
    // Atualizar interface
    updateUserInterface();
}

// Sistema de notificações
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    
    const bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #4caf50, #45a049)'
        : 'linear-gradient(135deg, #f44336, #d32f2f)';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        font-weight: bold;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Atualizar interface do usuário baseada no estado de login
function updateUserInterface() {
    const userActions = document.querySelector('.user-actions');
    if (!userActions) return;
    
    if (isUserLoggedIn && currentUser) {
        // Usuário logado - mostrar botão de logout e nome do usuário
        userActions.innerHTML = `
            <span style="color: #4caf50; font-weight: bold; margin-right: 1rem;">${currentUser}</span>
            <a href="#" class="btn btn-secondary" onclick="logout()">Sair</a>
        `;
    } else {
        // Usuário não logado - mostrar botões de login/registro
        userActions.innerHTML = `
            <a href="#" class="btn btn-secondary" onclick="openModal('loginModal')">Entrar</a>
            <a href="#" class="btn btn-primary" onclick="openModal('registerModal')">Registrar</a>
        `;
    }
}

// Logout
function logout() {
    isUserLoggedIn = false;
    currentUser = null;
    
    // Remover do localStorage
    localStorage.removeItem('boxhub_logged_in');
    localStorage.removeItem('boxhub_username');
    localStorage.removeItem('boxhub_votes'); // Limpar votos também
    
    showNotification('Até logo!');
    updateUserInterface();
    
    // Recarregar página para limpar estado
    location.reload();
}

// Adicionar novo lutador
function addFighter(event) {
    event.preventDefault();
    
    // Verificar se usuário está logado
    if (!isUserLoggedIn) {
        showNotification('Faça login para adicionar lutadores!', 'error');
        closeModal('addFighterModal');
        openModal('loginModal');
        return;
    }
    
    const name = document.getElementById('fighterName').value.trim();
    const category = document.getElementById('fighterCategory').value;
    const record = document.getElementById('fighterRecord').value.trim();
    const country = document.getElementById('fighterCountry').value.trim();
    
    if (!name || !category || !record || !country) {
        showNotification('Preencha todos os campos!', 'error');
        return;
    }
    
    // Gerar iniciais do lutador
    const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    
    // Criar ID único para o lutador usando a nova função
    const fighterId = generateSafeFighterId(name);
    
    const flag = '';
    
    // HTML do novo lutador
    const newFighterHTML = `
        <div class="ranking-item" style="border-left: 4px solid #4caf50; animation: newPostHighlight 2s ease;">
            <div class="ranking-position">#${getNextRankingPosition()}</div>
            <div class="fighter-avatar">${initials}</div>
            <div class="fighter-info">
                <div class="fighter-name">${name}</div>
                <div class="fighter-stats">${category} • ${record} • ${country}</div>
            </div>
            <div class="vote-section">
                <div class="vote-buttons">
                    <button class="vote-btn vote-up" onclick="vote('${fighterId}', 'up', this)">↑</button>
                    <button class="vote-btn vote-down" onclick="vote('${fighterId}', 'down', this)">↓</button>
                </div>
                <div class="vote-count">0 votos</div>
                <button class="remove-vote-btn" onclick="removeVote('${fighterId}', this)" style="display: none;">Remover Voto</button>
            </div>
        </div>
    `;
    
    // Adicionar ao final da lista de rankings, ou enfileirar se não estiver na página
    const rankingsTab = document.getElementById('rankings-tab');
    if (rankingsTab) {
        const lastRankingItem = rankingsTab.querySelector('.ranking-item:last-child');
        if (lastRankingItem) {
            lastRankingItem.insertAdjacentHTML('afterend', newFighterHTML);
        } else {
            // Se não houver itens, apenas inserir no container
            rankingsTab.insertAdjacentHTML('beforeend', newFighterHTML);
        }
    } else {
        // Enfileirar dados do lutador no localStorage para processamento na página de rankings
        const pending = JSON.parse(localStorage.getItem('boxhub_pending_fighters') || '[]');
        pending.push({ name, category, record, country });
        localStorage.setItem('boxhub_pending_fighters', JSON.stringify(pending));
    showNotification('Lutador enfileirado. Redirecionando para Rankings...', 'success');
        closeModal('addFighterModal');
        // Redirecionar para a página de rankings onde os itens pendentes serão processados
        setTimeout(() => { window.location.href = 'rankings.html'; }, 600);
        return;
    }
    
    // Limpar formulário e fechar modal
    document.getElementById('fighterName').value = '';
    document.getElementById('fighterCategory').value = '';
    document.getElementById('fighterRecord').value = '';
    document.getElementById('fighterCountry').value = '';
    
    closeModal('addFighterModal');
    showNotification(`${name} adicionado ao ranking!`);
    
    // Ir para a aba de rankings se não estiver nela
    showTab('rankings');
    
    // Scroll para o novo lutador
    setTimeout(() => {
        const newFighter = rankingsTab.querySelector('.ranking-item:last-child');
        newFighter.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// Funções de verificação de login
function checkLoginAndCreatePost() {
    if (!isUserLoggedIn) {
        showNotification('Faça login para criar posts!', 'error');
        openModal('loginModal');
        return;
    }
    openModal('createPostModal');
}

function checkLoginAndAddFighter() {
    if (!isUserLoggedIn) {
        showNotification('Faça login para adicionar lutadores!', 'error');
        openModal('loginModal');
        return;
    }
    openModal('addFighterModal');
}

// Função auxiliar para obter próxima posição no ranking
function getNextRankingPosition() {
    const rankingItems = document.querySelectorAll('#rankings-tab .ranking-item');
    return rankingItems.length + 1;
}

// Aplicar estado visual dos votos já realizados
function applyVoteStates() {
    Object.keys(userVotes).forEach(fighter => {
        // Buscar pelo atributo onclick que contém o ID do lutador
        const voteButtons = document.querySelectorAll(`[onclick*="'${fighter}'"]`);
        if (voteButtons.length > 0) {
            const firstButton = voteButtons[0];
            const voteSection = firstButton.closest('.vote-section');
            if (voteSection) {
                const allVoteButtons = voteSection.querySelectorAll('.vote-btn');
                allVoteButtons.forEach(button => {
                    button.disabled = true;
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                });
                
                // Destacar o botão que foi votado
                const votedDirection = userVotes[fighter];
                const votedButton = voteSection.querySelector(`.vote-${votedDirection}`);
                if (votedButton) {
                    votedButton.style.opacity = '1';
                    votedButton.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.8)';
                }
                
                // Mostrar botão de remover voto
                const removeBtn = voteSection.querySelector('.remove-vote-btn');
                if (removeBtn) {
                    removeBtn.style.display = 'block';
                }
            }
        }
    });
}

// Aplicar estado das curtidas já realizadas
function applyLikeStates() {
    Object.keys(userLikes).forEach(postId => {
        // Buscar posts por título
        const posts = document.querySelectorAll('.post h4');
        posts.forEach(titleElement => {
            const title = titleElement.textContent;
            const currentPostId = generateSafeFighterId(title);
            
            if (currentPostId === postId) {
                const post = titleElement.closest('.post');
                const likeButton = post.querySelector('.post-action[onclick*="likePost"]');
                if (likeButton) {
                    likeButton.style.color = '#d32f2f';
                    likeButton.disabled = true;
                    likeButton.style.opacity = '0.7';
                    likeButton.style.cursor = 'not-allowed';
                }
            }
        });
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verificar estado do localStorage
    if (!localStorage.getItem('boxhub_initialized')) {
        // Primeira visita - inicializar dados
        localStorage.setItem('boxhub_votes', '{}');
        localStorage.setItem('boxhub_likes', '{}');
        localStorage.setItem('boxhub_preferences', '{}');
        localStorage.setItem('boxhub_initialized', 'true');
    }
    
    // Carregar estado salvo
    isUserLoggedIn = localStorage.getItem('boxhub_logged_in') === 'true';
    currentUser = localStorage.getItem('boxhub_username');
    userVotes = JSON.parse(localStorage.getItem('boxhub_votes') || '{}');
    userLikes = JSON.parse(localStorage.getItem('boxhub_likes') || '{}');

    // Atualizar interface do usuário
    updateUserInterface();
    
    // Aplicar estados salvos
    if (isUserLoggedIn) {
        applyVoteStates();
        applyLikeStates();
    }
    
    // Mostrar notificação de boas-vindas apenas uma vez por sessão
    if (!sessionStorage.getItem('boxhub_welcome_shown')) {
        showNotification('Bem-vindo ao BOXHUB!');
        sessionStorage.setItem('boxhub_welcome_shown', 'true');
    }
    
    // Configurar eventos da interface
    setupEventListeners();
    
    // Processar pendências
    processPendingFighters();
    processPendingDiscussions();

    // Agendar atividade automática (configurável)
    if (typeof CONFIG !== 'undefined' && CONFIG.ENABLE_AUTO_ACTIVITY) {
        scheduleAutoActivity();
    }
});

// Configurar todos os event listeners
function setupEventListeners() {
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Navegação
    document.querySelectorAll('.nav-tabs a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href) return;

            let tab = null;
            if (href.startsWith('#')) {
                tab = href.substring(1) || 'feed';
            } else if (href.endsWith('.html')) {
                const fileName = href.split('/').pop().replace('.html', '');
                tab = fileName === 'index' ? 'feed' : fileName;
            }

            if (tab) {
                showTab(tab, e);
            }
        });
    });
    
    // Simular atividade em tempo real
    setInterval(() => {
        const onlineCount = Math.floor(Math.random() * 50) + 200;
        const onlineHeader = document.querySelector('.widget h3');
        if (onlineHeader) {
            const hasUsuarios = /Usuários Online/.test(onlineHeader.textContent) || /Usuários Online/.test(onlineHeader.innerText);
            if (hasUsuarios) {
                const base = onlineHeader.innerHTML.replace(/\s*\(\d+\)\s*$/, '');
                onlineHeader.innerHTML = `${base} (${onlineCount})`;
            }
        }
    }, 10000);
}

// Processa lutadores enfileirados quando redirecionados para a página de rankings
function processPendingFighters() {
    const pending = JSON.parse(localStorage.getItem('boxhub_pending_fighters') || '[]');
    if (!pending || pending.length === 0) return;

    const rankingsTab = document.getElementById('rankings-tab');
    if (!rankingsTab) return;

    pending.forEach(f => {
        // Reaproveitar addFighter logic but insert directly
        const name = f.name;
        const category = f.category;
        const record = f.record;
        const country = f.country;

        const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
        const fighterId = generateSafeFighterId(name);
    const flag = '';

        const newFighterHTML = `
            <div class="ranking-item" style="border-left: 4px solid #4caf50; animation: newPostHighlight 2s ease;">
                <div class="ranking-position">#${getNextRankingPosition()}</div>
                <div class="fighter-avatar">${initials}</div>
                <div class="fighter-info">
                    <div class="fighter-name">${name}</div>
                    <div class="fighter-stats">${category} • ${record} • ${country}</div>
                </div>
                <div class="vote-section">
                    <div class="vote-buttons">
                        <button class="vote-btn vote-up" onclick="vote('${fighterId}', 'up', this)">↑</button>
                        <button class="vote-btn vote-down" onclick="vote('${fighterId}', 'down', this)">↓</button>
                    </div>
                    <div class="vote-count">0 votos</div>
                    <button class="remove-vote-btn" onclick="removeVote('${fighterId}', this)" style="display: none;">Remover Voto</button>
                </div>
            </div>
        `;

        const last = rankingsTab.querySelector('.ranking-item:last-child');
        if (last) last.insertAdjacentHTML('afterend', newFighterHTML);
        else rankingsTab.insertAdjacentHTML('beforeend', newFighterHTML);
    });

    // Limpar fila
    localStorage.removeItem('boxhub_pending_fighters');
    showNotification(`${pending.length} lutador(es) adicionados ao ranking!`);
}

// Processa tópicos de discussão enfileirados quando a página de discussões é carregada
function processPendingDiscussions() {
    const pending = JSON.parse(localStorage.getItem('boxhub_pending_topics') || '[]');
    if (!pending || pending.length === 0) return;

    const discussionsTab = document.getElementById('discussions-tab');
    if (!discussionsTab) return;

    pending.forEach(t => {
        const participants = t.participants || (Math.floor(Math.random() * 50) + 20);
        const messages = t.messages || (Math.floor(Math.random() * 200) + 20);
        const minutes = t.minutes || (Math.floor(Math.random() * 15) + 1);
        const topicHTML = `
            <div class="discussion-topic">
                <div class="topic-title">${t.title}</div>
                <p>${t.body}</p>
                <div class="topic-meta">
                    <span><img class="ui-icon" src="assets/images/icons/users.svg" alt="" aria-hidden="true">${participants} participantes</span>
                    <span><img class="ui-icon" src="assets/images/icons/chat.svg" alt="" aria-hidden="true">${messages} mensagens</span>
                    <span>Ativo há ${minutes} min</span>
                </div>
            </div>
        `;
        discussionsTab.insertAdjacentHTML('afterbegin', topicHTML);
    });

    localStorage.removeItem('boxhub_pending_topics');
}

// Agendar atividade automática (comentários, rankings, debates) a cada 2 minutos
function scheduleAutoActivity() {
    const interval = (typeof CONFIG !== 'undefined' && CONFIG.AUTO_ACTIVITY_INTERVAL_MS) ? CONFIG.AUTO_ACTIVITY_INTERVAL_MS : 120000;
    setInterval(() => {
        try { incrementRandomPostCommentCount(); } catch (e) {}
        try { autoAddFighterToRankings(); } catch (e) {}
        try { autoAddDiscussionTopic(); } catch (e) {}
    }, interval);
}

// Incrementa aleatoriamente o contador de comentários de uma publicação no feed
function incrementRandomPostCommentCount() {
    const posts = document.querySelectorAll('#feed-tab .post');
    if (!posts || posts.length === 0) return;
    const idx = Math.floor(Math.random() * posts.length);
    const post = posts[idx];
    const commentBtn = post.querySelector('.post-actions .post-action[onclick*="commentPost"]');
    if (!commentBtn) return;
    const txt = commentBtn.textContent;
    const match = txt.match(/Comentar\s*\((\d+)\)/);
    const current = match ? parseInt(match[1], 10) : 0;
    const newCount = current + 1;
    commentBtn.innerHTML = `<img class="ui-icon" src="assets/images/icons/chat.svg" alt="" aria-hidden="true">Comentar (${newCount})`;

    // Inserir um comentário visível se existir lista de comentários
    const list = post.querySelector('.comments-list');
    if (list) {
        const author = generateRandomUser();
        const initials = author.substring(0, 2).toUpperCase();
        const avatarBg = (typeof UTILS !== 'undefined') ? UTILS.generateAvatarColor(author) : 'linear-gradient(135deg, #4caf50, #8bc34a)';
        const nowText = (typeof UTILS !== 'undefined') ? UTILS.formatTimeAgo(new Date()) : 'agora mesmo';
        const commentText = generateRandomCommentText();
        const itemHTML = `
            <div class="comment-item">
                <div class="comment-avatar" style="background:${avatarBg}">${initials}</div>
                <div class="comment-content">
                    <div class="comment-meta"><strong>${author}</strong> • ${nowText}</div>
                    <div class="comment-text">${commentText}</div>
                </div>
            </div>
        `;
        const section = post.querySelector('.comments-section');
        if (section) section.style.display = 'block';
        list.insertAdjacentHTML('beforeend', itemHTML);
    }
}

function generateRandomUser() {
    const names = ['JoaoP', 'MariaS', 'NunoBox', 'AnaR', 'TiagoL', 'SofiaM', 'RuiC', 'CarlaD'];
    return names[Math.floor(Math.random() * names.length)];
}

function generateRandomCommentText() {
    const texts = [
        'Boa análise, concordo com os pontos principais.',
        'Não estou totalmente de acordo, acho que falta considerar o jab.',
        'Excelente tópico, vale a pena rever a última luta.',
        'Para mim, a defesa foi o fator decisivo.',
        'A gestão de distância fez a diferença nesta luta.',
        'Quem mais reparou na mudança de ritmo no 5º round?',
        'Taticamente, o plano foi muito bem executado.'
    ];
    return texts[Math.floor(Math.random() * texts.length)];
}

// Adiciona automaticamente um lutador aos rankings ou enfileira se não estiver na página
function autoAddFighterToRankings() {
    const candidates = [
        { name: 'Naoya Inoue', category: 'Galo', record: '26-0', country: 'Japão' },
        { name: 'Oleksandr Usyk', category: 'Peso Pesado', record: '21-0', country: 'Ucrânia' },
        { name: 'Artur Beterbiev', category: 'Meio-Pesado', record: '19-0', country: 'Rússia' },
        { name: 'Shakur Stevenson', category: 'Leve', record: '21-0', country: 'EUA' },
        { name: 'Dmitry Bivol', category: 'Meio-Pesado', record: '22-0', country: 'Rússia' }
    ];
    const pick = candidates[Math.floor(Math.random() * candidates.length)];

    const rankingsTab = document.getElementById('rankings-tab');
    const initials = pick.name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0,2);
    const fighterId = generateSafeFighterId(pick.name);

    const fighterHTML = `
        <div class="ranking-item" style="border-left: 4px solid #4caf50; animation: newPostHighlight 2s ease;">
            <div class="ranking-position">#${getNextRankingPosition()}</div>
            <div class="fighter-avatar">${initials}</div>
            <div class="fighter-info">
                <div class="fighter-name">${pick.name}</div>
                <div class="fighter-stats">${pick.category} • ${pick.record} • ${pick.country}</div>
            </div>
            <div class="vote-section">
                <div class="vote-buttons">
                    <button class="vote-btn vote-up" onclick="vote('${fighterId}', 'up', this)">↑</button>
                    <button class="vote-btn vote-down" onclick="vote('${fighterId}', 'down', this)">↓</button>
                </div>
                <div class="vote-count">0 votos</div>
                <button class="remove-vote-btn" onclick="removeVote('${fighterId}', this)" style="display: none;">Remover Voto</button>
            </div>
        </div>
    `;

    if (rankingsTab) {
        rankingsTab.insertAdjacentHTML('beforeend', fighterHTML);
    } else {
        const pending = JSON.parse(localStorage.getItem('boxhub_pending_fighters') || '[]');
        pending.push({ name: pick.name, category: pick.category, record: pick.record, country: pick.country });
        localStorage.setItem('boxhub_pending_fighters', JSON.stringify(pending));
    }
}

// Adiciona automaticamente um tópico de discussão ou enfileira se não estiver na página
function autoAddDiscussionTopic() {
    const subjects = [
        { title: 'Quem tem o melhor jab atualmente?', body: 'Vamos comparar técnica, velocidade e precisão entre os tops.' },
        { title: 'Luta dos sonhos: Crawford vs Canelo?', body: 'Hipótese interessante: como achas que se desenrolaria taticamente?' },
        { title: 'Treino: Rotinas para melhorar o footwork', body: 'Partilha exercícios e dicas para movimentação eficiente.' },
        { title: 'História: Os maiores underdogs do boxe', body: 'Quais foram as maiores surpresas e reviravoltas que já viste?' },
        { title: 'Estratégia: Como quebrar guardas altas', body: 'Discussão técnica sobre variações de ataque ao tronco e ângulos.' }
    ];
    const pick = subjects[Math.floor(Math.random() * subjects.length)];

    const discussionsTab = document.getElementById('discussions-tab');
    if (discussionsTab) {
        const participants = Math.floor(Math.random() * 50) + 20;
        const messages = Math.floor(Math.random() * 200) + 20;
        const minutes = Math.floor(Math.random() * 15) + 1;
        const topicHTML = `
            <div class="discussion-topic">
                <div class="topic-title">${pick.title}</div>
                <p>${pick.body}</p>
                <div class="topic-meta">
                    <span><img class="ui-icon" src="assets/images/icons/users.svg" alt="" aria-hidden="true">${participants} participantes</span>
                    <span><img class="ui-icon" src="assets/images/icons/chat.svg" alt="" aria-hidden="true">${messages} mensagens</span>
                    <span>Ativo há ${minutes} min</span>
                </div>
            </div>
        `;
        discussionsTab.insertAdjacentHTML('afterbegin', topicHTML);
    } else {
        const pending = JSON.parse(localStorage.getItem('boxhub_pending_topics') || '[]');
        pending.push({ title: pick.title, body: pick.body });
        localStorage.setItem('boxhub_pending_topics', JSON.stringify(pending));
    }
}