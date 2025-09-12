document.addEventListener('DOMContentLoaded', () => {
    // Seleção dos elementos do DOM
    const providersGrid = document.getElementById('providersGrid');
    const searchInput = document.getElementById('searchInput');
    const categories = document.querySelectorAll('.category-item');
    const providersTitle = document.getElementById('providersTitle');
    
    // Variáveis de estado
    let allProviders = [];
    let selectedCategory = null;

    // Função para carregar os dados do JSON
    async function loadProviders() {
        try {
            const response = await fetch('data/prestadores.json');
            const data = await response.json();
            allProviders = data.filter(p => p.ativo); // Filtra apenas prestadores ativos
            
            // ALTERAÇÃO: Voltamos a exibir TODOS os prestadores ao iniciar.
            displayProviders(allProviders);

        } catch (error)
        {
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

        // Ordena para que os destaques sempre apareçam primeiro na listagem
        const sortedProviders = [...providers.filter(p => p.destaque), ...providers.filter(p => !p.destaque)];

        sortedProviders.forEach(provider => {
            const card = document.createElement('div');
            card.classList.add('provider-card');
            if (provider.destaque) {
                card.classList.add('destaque');
            }

            // ALTERAÇÃO: Lista de serviços COMPLETA, como no seu original.
            const servicesHtml = provider.servicos.map(s => `<li>${s}</li>`).join('');

            // ALTERAÇÃO: Layout do card restaurado para a sua versão original.
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
        let filteredProviders = allProviders;

        // Se a busca for limpa, volta a exibir com base na categoria selecionada (ou todos)
        if (query === '') {
            if (selectedCategory) {
                filteredProviders = allProviders.filter(provider => provider.categoria === selectedCategory);
            }
            displayProviders(filteredProviders);
            return;
        }
        
        // Filtra com base na busca
        filteredProviders = allProviders.filter(provider => {
            const nameMatch = provider.nome.toLowerCase().includes(query);
            const categoryMatch = provider.categoria.toLowerCase().includes(query);
            const servicesMatch = provider.servicos.some(s => s.toLowerCase().includes(query));
            return nameMatch || categoryMatch || servicesMatch;
        });

        providersTitle.textContent = query ? `Resultados da busca por "${e.target.value}"` : "Profissionais em Destaque";
        displayProviders(filteredProviders);
    });

    // Lógica de filtro de categorias
    categories.forEach(category => {
        category.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedCategory = e.currentTarget.dataset.category;

            categories.forEach(item => item.classList.remove('selected'));

            if (selectedCategory === clickedCategory) {
                // Desativa o filtro, voltando a mostrar TODOS os prestadores
                selectedCategory = null;
                providersTitle.textContent = "Profissionais em Destaque";
                displayProviders(allProviders);
                e.currentTarget.blur();
            } else {
                // Ativa um novo filtro de categoria
                selectedCategory = clickedCategory;
                e.currentTarget.classList.add('selected');
                const filteredProviders = allProviders.filter(provider => provider.categoria === selectedCategory);
                providersTitle.textContent = `Profissionais de ${selectedCategory}`;
                displayProviders(filteredProviders);
            }
            searchInput.value = '';
        });
    });

    // Inicia o carregamento dos dados
    loadProviders();
});