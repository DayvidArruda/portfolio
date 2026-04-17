// ========== VALIDAÇÃO DE FORMULÁRIO ==========
const form = document.querySelector('form');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensagem = document.getElementById('mensagem').value.trim();
        
        // Validação básica
        if (nome === '' || email === '' || mensagem === '') {
            alert('Por favor, preencha todos os campos!');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, digite um email válido!');
            return;
        }
        
        // Se tudo está OK, submeter o formulário
        alert('Mensagem enviada com sucesso! ✓');
        form.submit();
    });
}

// ========== MENU RESPONSIVO ==========
function criarMenuResponsivo() {
    const nav = document.querySelector('nav');
    const container = nav.querySelector('.container');
    
    // Criar botão hamburger
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '☰';
    hamburger.setAttribute('aria-label', 'Menu');
    
    // Inserir no canto superior direito
    nav.appendChild(hamburger);
    
    // Adicionar evento ao hamburger
    hamburger.addEventListener('click', function() {
        const ul = container.querySelector('ul');
        ul.classList.toggle('ativo');
        hamburger.classList.toggle('ativo');
        document.body.classList.toggle('menu-aberto');
    });
    
    // Fechar menu ao clicar em um link
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            const ul = container.querySelector('ul');
            ul.classList.remove('ativo');
            hamburger.classList.remove('ativo');
            document.body.classList.remove('menu-aberto');
        });
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target)) {
            const ul = container.querySelector('ul');
            ul.classList.remove('ativo');
            hamburger.classList.remove('ativo');
            document.body.classList.remove('menu-aberto');
        }
    });
}

// ========== ATUALIZAR LINK ATIVO NA NAVEGAÇÃO ==========
function atualizarNavegacaoAtiva() {
    const links = document.querySelectorAll('nav a');
    const caminhoAtual = window.location.pathname;
    
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === caminhoAtual.split('/').pop() || 
            (caminhoAtual.endsWith('/') && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ========== EFEITO DE SCROLL SUAVE PARA LINKS ÂNCORA ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const alvo = document.querySelector(href);
        if (alvo) {
            alvo.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========== ANIMAÇÃO AO SCROLL ==========
function animarElementosAoScroll() {
    const projetos = document.querySelectorAll('.projeto');
    const skills = document.querySelectorAll('.skill');
    const elementosParaAnimar = [...projetos, ...skills];
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, {
        threshold: 0.1
    });
    
    elementosParaAnimar.forEach(el => {
        el.style.animation = 'fadeInUp 0.6s ease forwards';
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}

// ========== ADICIONAR CSS PARA ANIMAÇÕES ==========
function adicionarCSSAnimacoes() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Hamburger - Oculto por padrão (desktop) */
        .hamburger {
            display: none !important;
        }
        
        /* Menu Responsivo */
        @media (max-width: 768px) {
            .hamburger {
                display: block !important;
                position: fixed;
                top: 20px;
                right: 20px;
                background: #00aaff;
                border: none;
                color: #fff;
                font-size: 1.8rem;
                cursor: pointer;
                padding: 10px 15px;
                border-radius: 5px;
                transition: all 0.3s;
                z-index: 1001;
            }
            
            .hamburger:hover {
                background: #008ecc;
                transform: scale(1.1);
            }
            
            .hamburger.ativo {
                background: #005f87;
            }
            
            nav ul {
                display: none;
                position: fixed;
                top: 0;
                left: -100%;
                width: 70%;
                max-width: 300px;
                height: 100vh;
                background: #333;
                flex-direction: column;
                align-items: flex-start;
                padding-top: 80px;
                padding-left: 20px;
                z-index: 1000;
                transition: left 0.3s ease;
                overflow-y: auto;
            }
            
            nav ul.ativo {
                display: flex;
                left: 0;
            }
            
            nav ul li {
                width: 100%;
                margin: 15px 0;
                padding-bottom: 15px;
                border-bottom: 1px solid #555;
            }
            
            nav ul li:last-child {
                border-bottom: none;
            }
            
            nav ul li a {
                display: block;
                padding: 10px 0;
            }
            
            body.menu-aberto {
                overflow: hidden;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== CONTADOR DE ESTATÍSTICAS ==========
function criarContadorEstatisticas() {
    const skillsSection = document.querySelector('#skills');
    if (!skillsSection) return;
    
    // Contar projetos - se não houver na página, usar 7 como padrão
    let numProjetos = document.querySelectorAll('.projeto').length;
    if (numProjetos === 0) {
        numProjetos = 7; // Total de projetos no site
    }
    
    const numSkills = document.querySelectorAll('.skill').length;
    
    const stats = document.createElement('div');
    stats.className = 'stats-container';
    stats.innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${numProjetos}</span>
            <span class="stat-label">Projetos</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${numSkills}</span>
            <span class="stat-label">Skills</span>
        </div>
    `;
    
    skillsSection.querySelector('.container').insertBefore(stats, skillsSection.querySelector('h2'));
    
    // Adicionar CSS
    const style = document.createElement('style');
    style.textContent = `
        .stats-container {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            display: block;
            font-size: 2.5rem;
            font-weight: bold;
            color: #0077b6;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

// ========== INICIALIZAR TUDO ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript iniciado! ✓');
    
    // Executar todas as funções
    adicionarCSSAnimacoes();
    atualizarNavegacaoAtiva();
    criarMenuResponsivo();
    animarElementosAoScroll();
    criarContadorEstatisticas();
});
