// Estado da aplicação
let currentPage = '#home-e-loja'; // A nova página principal
let cart = []; 
let currentProductDetail = null;

// Seletores de elementos do DOM
const pageSections = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('.nav-link');
const cartCountElement = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('carrinho-itens-container');
const cartSubtotalElement = document.getElementById('carrinho-subtotal');
const cartTotalElement = document.getElementById('carrinho-total');
const checkoutResumoItens = document.getElementById('checkout-resumo-itens');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutTotal = document.getElementById('checkout-total');

const WHATSAPP_NUMBER = "559985146913"; // CONFIRME ESTE NÚMERO E DDD!

// Função para formatar input para aceitar apenas números
function formatNumericInput(event) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
}

// Função para navegar entre as seções/páginas e rolar para sub-seções
function navigateTo(targetSectionId, scrollToSubElementId = null) {
    // Esconde todas as 'page-section'
    pageSections.forEach(section => {
        section.classList.remove('active');
    });

    // Determina qual 'page-section' principal deve ser ativada
    let mainPageToShow = targetSectionId;
    if (targetSectionId === '#hero-banner-section' || targetSectionId === '#destaques-home-section' || targetSectionId === '#loja-completa-section') {
        mainPageToShow = '#home-e-loja'; // Essas são sub-seções da página principal
    } else if (targetSectionId.startsWith('#home-e-loja') && scrollToSubElementId) {
        mainPageToShow = '#home-e-loja'; // Caso o href já seja #home-e-loja e tenhamos um data-target-id
    }


    const sectionElement = document.querySelector(mainPageToShow);
    if (sectionElement) {
        sectionElement.classList.add('active');
        currentPage = mainPageToShow; // Atualiza a página principal ativa

        // Rola para o topo da seção principal ou para a sub-seção
        if (scrollToSubElementId) {
            const subElement = document.querySelector(scrollToSubElementId);
            if (subElement) {
                subElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo(0, 0); // Fallback para o topo da página
            }
        } else if (targetSectionId === mainPageToShow) { 
            // Se estamos navegando para uma seção principal (que não é sub-seção)
             window.scrollTo(0, 0); // Rola para o topo dela
        }
        // Se mainPageToShow é #home-e-loja e scrollToSubElementId não foi passado diretamente
        // mas o targetSectionId original era uma sub-seção, rola para ela.
        else if (mainPageToShow === '#home-e-loja' && (targetSectionId === '#hero-banner-section' || targetSectionId === '#destaques-home-section' || targetSectionId === '#loja-completa-section')) {
             const subElementToScroll = document.querySelector(targetSectionId);
             if (subElementToScroll) {
                subElementToScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }
        }


    } else {
        console.warn('Seção principal não encontrada para ativar:', mainPageToShow, "Verificando fallback para #home-e-loja");
        const fallbackHome = document.querySelector('#home-e-loja');
        if(fallbackHome){
            fallbackHome.classList.add('active');
            currentPage = '#home-e-loja';
            window.scrollTo(0,0);
        }
    }
}

// Função para mostrar detalhes do produto (sem alterações diretas aqui para o layout)
function showProductDetail(id, name, price, image, description) {
    currentProductDetail = { id, name, price: parseFloat(price), image, description };
    const detailImage = document.getElementById('produto-detalhe-imagem');
    const detailName = document.getElementById('produto-detalhe-nome');
    const detailDescription = document.getElementById('produto-detalhe-descricao');
    const detailPrice = document.getElementById('produto-detalhe-preco');
    const quantityInput = document.getElementById('quantidade-produto');
    
    if(detailImage) { detailImage.src = image; detailImage.alt = name; }
    if(detailName) detailName.textContent = name;
    if(detailDescription) detailDescription.textContent = description;
    if(detailPrice) detailPrice.textContent = parseFloat(price).toFixed(2).replace('.', ',');
    if(quantityInput) quantityInput.value = 1; 
    
    const addToCartBtn = document.getElementById('add-to-cart-button');
    if(addToCartBtn) {
        const newBtn = addToCartBtn.cloneNode(true);
        newBtn.textContent = "Adicionar ao Carrinho";
        addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
        newBtn.addEventListener('click', () => {
            const quantityInputDetail = document.getElementById('quantidade-produto');
            const quantity = quantityInputDetail ? (parseInt(quantityInputDetail.value) || 1) : 1;
            if (currentProductDetail && currentProductDetail.id) {
                 const productToAdd = { ...currentProductDetail, quantity: quantity };
                 addToCart(productToAdd);
            } else {
                console.error("currentProductDetail não definido ao adicionar do detalhe.");
                showCustomMessage("Erro ao obter detalhes do produto.", "error");
            }
        });
    }
    navigateTo('#produto-detalhe-secao'); // Navega para a PÁGINA de detalhe
}
 
// Adicionar item ao carrinho (sem alterações diretas aqui para o layout)
function addToCart(product) {
    if (!product || !product.id || typeof product.price !== 'number' || isNaN(product.price)) {
        console.error("Produto inválido para adicionar ao carrinho:", product);
        showCustomMessage('Erro ao adicionar produto (dados inválidos).', 'error');
        return;
    }
    const quantityToAdd = product.quantity && !isNaN(parseInt(product.quantity)) ? parseInt(product.quantity) : 1;
    if (quantityToAdd < 1) {
        showCustomMessage('Quantidade deve ser pelo menos 1.', 'error');
        return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += quantityToAdd;
    } else {
        cart.push({ 
            id: product.id, name: product.name, price: product.price, quantity: quantityToAdd,
            image: product.image || 'https://placehold.co/80x80/E9D5FF/4B0082?text=Item',
            description: product.description || `Item: ${product.name}` 
        });
    }
    updateCartDisplay();
    showCustomMessage(`${product.name} (x${quantityToAdd}) adicionado ao carrinho!`, 'success');
}

// Atualizar exibição do carrinho (sem alterações diretas aqui)
function updateCartDisplay() {
    // ... (código da função como na resposta anterior)
    if (!cartItemsContainer || !cartCountElement || !cartSubtotalElement || !cartTotalElement) return;
    let itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = itemCount;
    cartCountElement.style.display = itemCount > 0 ? 'block' : 'none';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-gray-600">Seu carrinho está vazio.</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="flex items-center justify-between border-b py-4">
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded mr-4" onerror="this.onerror=null;this.src='https://placehold.co/80x80/cccccc/969696?text=Img';">
                    <div><h4 class="font-semibold text-purple-700">${item.name}</h4><p class="text-sm text-gray-500">Quantidade: ${item.quantity}</p></div>
                </div>
                <div class="text-right"><p class="font-semibold text-purple-600">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p><button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 text-sm mt-1">Remover</button></div>
            </div>`).join('');
    }
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartSubtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    cartTotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (checkoutResumoItens && checkoutSubtotal && checkoutTotal) {
        if (cart.length > 0) {
            checkoutResumoItens.innerHTML = cart.map(item => `<div class="flex justify-between text-sm mb-1"><span>${item.name} (x${item.quantity})</span><span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span></div>`).join('');
        } else {
            checkoutResumoItens.innerHTML = '<p class="text-sm text-gray-500">Nenhum item no carrinho.</p>';
        }
        checkoutSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        checkoutTotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }
}
 
// Remover item do carrinho (sem alterações)
function removeFromCart(index) {
    // ... (código da função como na resposta anterior)
    cart.splice(index, 1);
    updateCartDisplay();
    showCustomMessage('Item removido do carrinho.', 'info');
}

// Finalizar compra (sem alterações diretas aqui para o layout, mas já foi ajustada antes)
function finalizarCompraSimulada() {
    // ... (código da função como na resposta anterior, já sem email e com cidade/estado fixos)
    const form = document.getElementById('checkout-form');
    if (!form) {
        console.error("ERRO CRÍTICO: Formulário 'checkout-form' não encontrado!");
        showCustomMessage('Erro ao processar pedido. Contate suporte.', 'error');
        return;
    }
    if (!form.checkValidity()) {
        showCustomMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        form.reportValidity();
        return;
    }
    if (cart.length === 0) {
        showCustomMessage('Seu carrinho está vazio.', 'error');
        navigateTo('#home-e-loja', '#loja-completa-section'); // Leva para a loja
        return;
    }
    const nomeCliente = document.getElementById('checkout-nome').value;
    const telefoneCliente = document.getElementById('checkout-telefone').value;
    const enderecoCliente = document.getElementById('checkout-endereco').value;
    const cidadeCliente = document.getElementById('checkout-cidade').value;
    const estadoCliente = document.getElementById('checkout-estado').value;
    const cepCliente = document.getElementById('checkout-cep').value;
    const formaPagamentoSelecionada = document.querySelector('input[name="pagamento"]:checked');
    const formaPagamento = formaPagamentoSelecionada ? formaPagamentoSelecionada.labels[0].textContent : "Não informada";

    let mensagemPedido = `*Novo Pedido - R&A Buquê de Cetim*\n\n` +
        `*Cliente:*\nNome: ${nomeCliente}\nTelefone: ${telefoneCliente}\n` +
        `Endereço: ${enderecoCliente}, ${cidadeCliente} - ${estadoCliente}, CEP: ${cepCliente}\n\n` +
        `*Itens do Pedido:*\n`;
    cart.forEach(item => {
        mensagemPedido += `- ${item.name} (Qtd: ${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    mensagemPedido += `\n*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n` +
        `*Frete:* A calcular\n` +
        `*Total (sem frete):* R$ ${subtotal.toFixed(2).replace('.', ',')}\n` +
        `*Forma de Pagamento (escolhida):* ${formaPagamento}\n\n` +
        `Por favor, confirmar o pedido e combinar o frete e pagamento.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemPedido)}`;
    console.log("URL WhatsApp:", whatsappUrl);
    showCustomMessage('Preparando seu pedido para envio via WhatsApp...', 'info');
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed == 'undefined') {
        showCustomMessage('WhatsApp não abriu. Verifique bloqueador de pop-up.', 'error');
    }
    setTimeout(() => {
        cart = []; updateCartDisplay(); if(form) form.reset(); navigateTo('#home-e-loja', '#hero-banner-section'); 
        showCustomMessage('Pedido encaminhado! Continue navegando.', 'success');
    }, 4000);
}


// Event Listeners para links de navegação MODIFICADOS
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); 
        const mainTargetId = this.getAttribute('href'); // ex: #home-e-loja, #precos, #sobre
        const subTargetId = this.dataset.targetId; // ex: #hero-banner-section, #loja-completa-section ou null

        if (mainTargetId && mainTargetId.startsWith('#')) {
            navigateTo(mainTargetId, subTargetId); // Passa o subTargetId para a função navigateTo
        }
    });
});

// Listener para botões de scroll dentro da página (ex: "Ver Coleção")
document.querySelectorAll('.scroll-to-section').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href'); // ex: #loja-completa-section
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Garante que a página principal #home-e-loja esteja ativa
            if (!document.querySelector('#home-e-loja').classList.contains('active')) {
                navigateTo('#home-e-loja', targetId);
            } else {
                // Se já estiver na página correta, apenas rola
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});
 
// Atualizar ano no rodapé
const currentYearElement = document.getElementById('currentYear');
if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();
 
// Função para mostrar mensagens customizadas (sem alterações)
function showCustomMessage(message, type = 'info') {
    // ... (código da função como na resposta anterior)
    const existingMessageBox = document.getElementById('customMessageBox');
    if (existingMessageBox) existingMessageBox.remove();
    const messageBox = document.createElement('div');
    messageBox.id = 'customMessageBox';
    Object.assign(messageBox.style, {
        position: 'fixed', left: '50%', transform: 'translateX(-50%)',
        padding: '15px 25px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: '1001', textAlign: 'center', maxWidth: '90%', color: 'white', fontSize: '0.9rem'
    });
    messageBox.textContent = message;
    if (type === 'success') { messageBox.style.backgroundColor = '#4CAF50'; messageBox.style.top = '20px'; }
    else if (type === 'error') { messageBox.style.backgroundColor = '#F44336'; messageBox.style.top = '20px'; }
    else { messageBox.style.backgroundColor = '#8A2BE2'; messageBox.style.bottom = '20px'; }
    document.body.appendChild(messageBox);
    setTimeout(() => { if (document.body.contains(messageBox)) document.body.removeChild(messageBox); }, 4000);
}

// Listener para o formulário de contato (sem alterações diretas aqui para o layout, já foi ajustado antes)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    // ... (código do listener como na resposta anterior, já sem email)
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (this.checkValidity()) {
            const nome = this.name.value;
            const mensagem = this.message.value;
            let mensagemWhatsApp = `*Nova Mensagem do Site - R&A Buquê de Cetim*\n\n` +
                `*Nome:* ${nome}\n*Mensagem:*\n${mensagem}\n\n` +
                `Por favor, responder assim que possível.`;
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsApp)}`;
            const contactWhatsappWindow = window.open(whatsappUrl, '_blank');
            if (!contactWhatsappWindow || contactWhatsappWindow.closed || typeof contactWhatsappWindow.closed == 'undefined') {
                showCustomMessage('WhatsApp não abriu. Verifique bloqueador de pop-up.', 'error');
            }
            showCustomMessage('Preparando sua mensagem para envio via WhatsApp!', 'info');
            this.reset();
            setTimeout(() => { showCustomMessage('Mensagem encaminhada!', 'success'); }, 2000);
        } else {
            showCustomMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            this.reportValidity();
        }
    });
}

// Inicializar e aplicar filtros numéricos e listeners da lista de preços quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const checkoutTelefoneInput = document.getElementById('checkout-telefone');
    if (checkoutTelefoneInput) checkoutTelefoneInput.addEventListener('input', formatNumericInput);
    
    const checkoutCepInput = document.getElementById('checkout-cep');
    if (checkoutCepInput) {
        checkoutCepInput.addEventListener('input', formatNumericInput);
        checkoutCepInput.setAttribute('maxlength', '8');
    }

    const priceListCheckboxes = document.querySelectorAll('.price-list-checkbox');
    priceListCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                const qtyInputId = 'qty-' + this.id.substring('item-'.length);
                const qtyInput = document.getElementById(qtyInputId);
                const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
                if (quantity < 1) {
                    showCustomMessage('Quantidade deve ser pelo menos 1.', 'error');
                    this.checked = false; return;
                }
                const product = {
                    id: this.dataset.id, name: this.dataset.name, price: parseFloat(this.dataset.price),
                    quantity: quantity, image: 'https://placehold.co/80x80/E9D5FF/4B0082?text=Item',
                    description: `Item personalizado: ${this.dataset.name}` 
                };
                addToCart(product);
            }
        });
    });
    
    const priceListQtyInputs = document.querySelectorAll('.price-list-qty');
    priceListQtyInputs.forEach(input => {
        input.addEventListener('input', formatNumericInput);
    });

    // Inicializar a primeira página e o carrinho
    if (cartItemsContainer && cartCountElement && cartSubtotalElement && cartTotalElement) {
        updateCartDisplay(); 
    }
    // O currentPage já é '#home-e-loja', e essa seção já tem a classe 'active' no HTML.
    // A função navigateTo não precisa ser chamada aqui se a página inicial já está correta no HTML.
    // Se precisar forçar um scroll para o topo ou para uma sub-seção específica no load:
    // navigateTo(currentPage, '#hero-banner-section'); // Exemplo para rolar para o topo do hero
    const initialSection = document.querySelector(currentPage);
    if (initialSection && !initialSection.classList.contains('active')) {
        initialSection.classList.add('active'); // Garante que está ativa se não estiver
    }
    window.scrollTo(0,0); // Garante que a página carregue no topo

});