document.addEventListener('DOMContentLoaded', () => {
    // Seleção dos elementos do DOM
    const providersGrid = document.getElementById('providersGrid');
    const searchInput = document.getElementById('searchInput');
    const categories = document.querySelectorAll('.category-item');
    const providersTitle = document.getElementById('providersTitle');
    
    // Variáveis de estado
    let allProviders = [];
    let selectedCategory = null; // Ótimo para controlar o filtro ativo

    // Função assíncrona para carregar os dados do JSON.
    // O uso de async/await é uma prática moderna e correta.
    async function loadProviders() {
        try {
            const response = await fetch('data/prestadores.json');
            const data = await response.json();
            allProviders = data.filter(p => p.ativo); // Filtra apenas prestadores ativos
            displayProviders(allProviders);
        } catch (error) {
            console.error('Erro ao carregar os dados dos prestadores:', error);
            providersGrid.innerHTML = '<p>Não foi possível carregar os prestadores no momento. Tente novamente mais tarde.</p>';
        }
    }

    // Função para renderizar os cards na tela.
    // A lógica para separar destaques dos regulares está perfeita.
    function displayProviders(providers) {
        providersGrid.innerHTML = '';
        if (providers.length === 0) {
            providersGrid.innerHTML = '<p class="no-results">Nenhum prestador encontrado para esta busca.</p>';
            return;
        }

        const featuredProviders = providers.filter(p => p.destaque);
        const regularProviders = providers.filter(p => !p.destaque);
        const sortedProviders = [...featuredProviders, ...regularProviders];

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
                    <a href="https://wa.me/${provider.whatsapp}" class="btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i> Falar no WhatsApp
                    </a>
                    <a href="provider.html?id=${provider.id}" class="btn-profile">
                        Ver Perfil
                    </a>
                </div>
            `;
            providersGrid.appendChild(card);
        });
    }

    // Lógica de busca em tempo real, que já está funcional.
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        // Se a busca for limpa, e um filtro estiver ativo, mantenha o filtro
        if (query === '' && selectedCategory) {
            const filteredProviders = allProviders.filter(provider => provider.categoria === selectedCategory);
            displayProviders(filteredProviders);
            return;
        }
        
        const filteredProviders = allProviders.filter(provider => {
            const nameMatch = provider.nome.toLowerCase().includes(query);
            const categoryMatch = provider.categoria.toLowerCase().includes(query);
            const servicesMatch = provider.servicos.some(s => s.toLowerCase().includes(query));
            return nameMatch || categoryMatch || servicesMatch;
        });

        providersTitle.textContent = query ? `Resultados da busca por "${e.target.value}"` : "Profissionais em Destaque";
        displayProviders(filteredProviders);
    });

    // --- LÓGICA DE FILTRO DE CATEGORIAS (IMPLEMENTAÇÃO CORRETA) ---
    categories.forEach(category => {
        // O evento 'click' funciona bem em desktop e mobile nos navegadores modernos.
        category.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedCategory = e.currentTarget.dataset.category;

            // PONTO-CHAVE #1: Remove a classe 'selected' de TODOS os itens.
            // Isso garante que, não importa o que aconteça, o estado visual é resetado a cada clique.
                categories.forEach(item => {
                    item.classList.remove('selected');
                    item.classList.remove('active');
                    item.classList.remove('destaque');
                });

            if (selectedCategory === clickedCategory) {
                // Cenário 1: Clicou na categoria que já estava ativa (desativar filtro).
                selectedCategory = null; // Limpa a variável de estado.
                providersTitle.textContent = "Profissionais em Destaque";
                displayProviders(allProviders); // Mostra todos os prestadores.
                    // Remove o foco do elemento para evitar efeito visual travado no mobile
                    e.currentTarget.blur();
            } else {
                // Cenário 2: Clicou em uma nova categoria.
                selectedCategory = clickedCategory; // Atualiza o estado para a nova categoria.
                e.currentTarget.classList.add('selected'); // PONTO-CHAVE #2: Adiciona a classe APENAS ao item clicado.
                const filteredProviders = allProviders.filter(provider => provider.categoria === selectedCategory);
                providersTitle.textContent = `Profissionais de ${selectedCategory}`;
                displayProviders(filteredProviders);
            }

            // Boa prática: Limpa o campo de busca ao usar um filtro de categoria.
            searchInput.value = '';
        });
    });

    // Inicia o carregamento dos dados
    loadProviders();

        // Garante que nenhuma categoria fique com 'selected' ao carregar
        categories.forEach(item => item.classList.remove('selected'));
});
