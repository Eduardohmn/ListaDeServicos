document.addEventListener('DOMContentLoaded', () => {
    // Seleção dos elementos do DOM
    const providersGrid = document.getElementById('providersGrid');
    const searchInput = document.getElementById('searchInput');
    const categories = document.querySelectorAll('.category-item');
    const providersTitle = document.getElementById('providersTitle');
    const toggleCategoriesBtn = document.getElementById('toggleCategoriesBtn');
    const moreCategories = document.getElementById('moreCategories');
    const categoriesSection = document.querySelector('.categories-section'); // Seleciona a seção inteira das categorias

    // --- LÓGICA CORRIGIDA PARA CATEGORIAS EXPANSÍVEIS ---
    if (toggleCategoriesBtn && moreCategories) {
        // Garante que o estado inicial esteja correto usando a classe 'hidden'
        if (moreCategories.classList.contains('hidden-categories')) {
            moreCategories.classList.remove('hidden-categories');
            moreCategories.classList.add('hidden');
        }

        toggleCategoriesBtn.addEventListener('click', () => {
            // Alterna a classe 'hidden' para mostrar ou esconder as categorias
            moreCategories.classList.toggle('hidden');

            // Atualiza o texto do botão com base na visibilidade das categorias
            if (moreCategories.classList.contains('hidden')) {
                toggleCategoriesBtn.innerHTML = '<i class="fa fa-plus"></i> Ver Mais Categorias';
            } else {
                toggleCategoriesBtn.innerHTML = '<i class="fa fa-minus"></i> Ver Menos';
            }
        });
    }

    // Variáveis de estado
    let allProviders = [];
    let selectedCategory = null;

    // Função para carregar os dados do JSON
    async function loadProviders() {
        try {
            const response = await fetch('data/prestadores.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allProviders = data.filter(p => p.ativo);
            const featuredProviders = allProviders.filter(p => p.destaque);
            providersTitle.textContent = "Profissionais em Destaque";
            
            // ADICIONADO: Garante que a classe do carrossel seja aplicada no carregamento inicial
            providersGrid.classList.add('providers-carousel');

            displayProviders(featuredProviders);
        } catch (error) {
            console.error('Erro ao carregar os dados dos prestadores:', error);
            providersGrid.innerHTML = '<p>Não foi possível carregar os prestadores no momento. Tente novamente mais tarde.</p>';
        }
    }

    // Função para renderizar os cards na tela
    function displayProviders(providers) {
        providersGrid.innerHTML = '';
        if (providers.length === 0) {
            providersGrid.innerHTML = '<p class="no-results">Nenhum prestador encontrado para esta busca.</p>';
            return;
        }
        const sortedProviders = [...providers.filter(p => p.destaque), ...providers.filter(p => !p.destaque)];
        sortedProviders.forEach(provider => {
            const card = document.createElement('div');
            card.classList.add('provider-card');
            if (provider.destaque) {
                card.classList.add('destaque');
            }
            const servicesHtml = provider.servicos.map(s => `<li>${s}</li>`).join('');
            card.innerHTML = `
                <h3>${provider.nome}</h3>
                <p><strong>Categoria:</strong> ${provider.categoria}</p>
                <p>${provider.descricao}</p>
                <h4>Serviços:</h4>
                <ul class="services-list">
                    ${servicesHtml}
                </ul>
                <div class="contact-links">
                    <a href="https://wa.me/${(provider.whatsapp || '').replace(/\D/g, '')}" class="btn-whatsapp" target="_blank" rel="nofollow noopener">
                        <i class="fab fa-whatsapp"></i> Falar no WhatsApp
                    </a>
                    <a href="provider.html?slug=${provider.slug}" class="btn-profile">
                        Ver Perfil
                    </a>
                </div>
            `;
            providersGrid.appendChild(card);
        });
    }

    // Lógica de busca em tempo real
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query === '') {
            // Se a busca for limpa, MOSTRA as categorias novamente
            categoriesSection.classList.remove('hidden');

            let providersToShow;
            if (selectedCategory) {
                providersToShow = allProviders.filter(provider => provider.categoria === selectedCategory);
                providersTitle.textContent = `Profissionais de ${selectedCategory}`;
                // ALTERADO: Remove a classe do carrossel para a lista de categoria
                providersGrid.classList.remove('providers-carousel');
            } else {
                providersToShow = allProviders.filter(p => p.destaque);
                providersTitle.textContent = "Profissionais em Destaque";
                // ALTERADO: Adiciona a classe do carrossel de volta para a lista de destaques
                providersGrid.classList.add('providers-carousel');
            }
            displayProviders(providersToShow);
            return;
        }

        // Se o usuário está digitando, ESCONDE as categorias e remove o carrossel
        categoriesSection.classList.add('hidden');
        // ALTERADO: Remove a classe do carrossel para os resultados da busca
        providersGrid.classList.remove('providers-carousel');

        const filteredProviders = allProviders.filter(provider => {
            const nameMatch = provider.nome.toLowerCase().includes(query);
            const categoryMatch = provider.categoria.toLowerCase().includes(query);
            const servicesMatch = provider.servicos.some(s => s.toLowerCase().includes(query));
            return nameMatch || categoryMatch || servicesMatch;
        });

        providersTitle.textContent = `Resultados da busca por "${e.target.value}"`;
        categories.forEach(item => item.classList.remove('selected'));
        selectedCategory = null;
        displayProviders(filteredProviders);
    });

    // Lógica de filtro de categorias
    categories.forEach(category => {
        category.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedCategory = e.currentTarget.dataset.category;
            categories.forEach(item => item.classList.remove('selected'));
            if (selectedCategory === clickedCategory) {
                selectedCategory = null;
                providersTitle.textContent = "Profissionais em Destaque";
                const featuredProviders = allProviders.filter(p => p.destaque);
                // ALTERADO: Adiciona a classe do carrossel de volta para a lista de destaques
                providersGrid.classList.add('providers-carousel');
                displayProviders(featuredProviders);
                e.currentTarget.blur();
            } else {
                selectedCategory = clickedCategory;
                e.currentTarget.classList.add('selected');
                const filteredProviders = allProviders.filter(provider => provider.categoria === selectedCategory);
                providersTitle.textContent = `Profissionais de ${selectedCategory}`;
                // ALTERADO: Remove a classe do carrossel para a lista filtrada por categoria
                providersGrid.classList.remove('providers-carousel');
                displayProviders(filteredProviders);

                // Faz a página descer suavemente até o título da seção de prestadores
                providersTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            searchInput.value = '';
        });
    });

    // Inicia o carregamento dos dados
    loadProviders();

    // --- Carrossel automático no mobile ---
    (function setupAutoSlide() {
        const carousel = document.getElementById('providersGrid');
        if (!carousel) return; // nada a fazer se o container não existir

        let scrollIndex = 0;
        let intervalId = null;
        
        // ALTERADO: A função de slide agora verifica se a classe 'providers-carousel' está presente
        function autoSlide() {
            if (window.innerWidth > 768 || !carousel.classList.contains('providers-carousel')) return;

            const cards = carousel.querySelectorAll('.provider-card');
            if (cards.length <= 1) return; // Não faz sentido girar se tiver 1 ou 0 cards

            scrollIndex = (scrollIndex + 1) % cards.length;
            const scrollAmount = cards[0].offsetWidth * scrollIndex;

            carousel.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        }

        function start() {
            // Só inicia se o carrossel estiver ativo e em mobile
            if (intervalId || window.innerWidth > 768 || !carousel.classList.contains('providers-carousel')) return;
            intervalId = setInterval(autoSlide, 3000);
        }

        function stop() {
            if (!intervalId) return;
            clearInterval(intervalId);
            intervalId = null;
        }

        // Observador para reiniciar ou parar o carrossel quando a classe for alterada
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const hasCarouselClass = mutation.target.classList.contains('providers-carousel');
                    if (hasCarouselClass && window.innerWidth <= 768) {
                        start();
                    } else {
                        stop();
                    }
                }
            });
        });

        observer.observe(carousel, { attributes: true });

        // Pausa o auto-slide quando o usuário interage
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('touchstart', stop, { passive: true });
        carousel.addEventListener('mouseleave', start);
        carousel.addEventListener('touchend', start, { passive: true });

        // Reinicia/para ao redimensionar
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 || !carousel.classList.contains('providers-carousel')) {
                stop();
            } else {
                start();
            }
        });

        // Inicia automaticamente se estiver em mobile e com a classe correta
        if (window.innerWidth <= 768 && carousel.classList.contains('providers-carousel')) start();
    })();
});