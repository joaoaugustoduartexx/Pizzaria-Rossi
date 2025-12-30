// --- 1. BANCO DE DADOS DE PRODUTOS ---
const products = [
    {
        id: 1,
        name: "Pizza Calabresa",
        description: "Mussarela, calabresa fatiada, cebola e orégano.",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=200&auto=format&fit=crop",
        category: "pizza"
    },
    {
        id: 2,
        name: "Pizza Margherita",
        description: "Molho de tomate, mussarela de búfala e manjericão fresco.",
        price: 48.00,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=200&auto=format&fit=crop",
        category: "pizza"
    },
    {
        id: 3,
        name: "Coca-Cola 2L",
        description: "Garrafa de 2 Litros bem gelada.",
        price: 12.00,
        image: "assets/cocacola2L.webp",
        category: "bebida"
    },
    {
        id: 4,
        name: "Combo Família",
        description: "2 Pizzas Grandes + 1 Refrigerante.",
        price: 89.90,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop",
        category: "promo"
    }
];

// --- 2. INICIALIZAÇÃO ---
let cart = [];
let deliveryFee = 0; // Variável global de entrega

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("store-name").innerText = CONFIG.STORE_NAME;
    checkStatus();
    loadCart(); // Carrega do LocalStorage
    renderProducts("all");
    populateHalfSelects(); // Preenche as opções do modal meia-a-meia
});

function checkStatus() {
    const hour = new Date().getHours();
    const statusText = document.getElementById("status-text");
    const statusBadge = document.getElementById("store-status");

    if (hour >= CONFIG.OPENING_HOUR && hour < CONFIG.CLOSING_HOUR) {
        statusText.innerText = "Aberto Agora";
        statusBadge.classList.remove("closed");
    } else {
        statusText.innerText = "Fechado";
        statusBadge.classList.add("closed");
    }
}

// --- 3. RENDERIZAÇÃO ---
function renderProducts(filter) {
    const grid = document.getElementById("products-grid");
    const btnHalf = document.getElementById("half-pizza-area");
    
    grid.innerHTML = "";

    // Controle do botão de meia-a-meia
    if (filter === 'all' || filter === 'pizza') {
        btnHalf.style.display = "block";
    } else {
        btnHalf.style.display = "none";
    }

    const filtered = filter === "all" ? products : products.filter(p => p.category === filter);

    filtered.forEach(product => {
        const card = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://placehold.co/100?text=Foto'">
                <div class="product-info">
                    <div>
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                    </div>
                    <div class="price-row">
                        <span class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                        <button class="btn-add" onclick="addToCart(${product.id})">
                            <i class="material-icons">add</i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

function filterMenu(category) {
    document.querySelectorAll('.sticky-nav li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');

    const productGrid = document.getElementById("products-grid");
    const aboutSection = document.getElementById("quem-somos");
    const btnHalf = document.getElementById("half-pizza-area");

    if (category === 'about') {
        productGrid.style.display = "none";
        btnHalf.style.display = "none";
        aboutSection.style.display = "block";
    } else {
        productGrid.style.display = "grid";
        aboutSection.style.display = "none";
        renderProducts(category);
    }
}

// --- 4. LÓGICA DO CARRINHO ---

function loadCart() {
    const saved = localStorage.getItem('cart_rossi');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('cart_rossi', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id && !item.isHalf);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            isHalf: false
        });
    }

    saveCart();
    
    // Feedback visual
    if(event && event.currentTarget) {
        const btn = event.currentTarget;
        const originalContent = btn.innerHTML;
        btn.style.backgroundColor = "#25D366";
        btn.innerHTML = "<i class='material-icons' style='color:white'>check</i>";
        setTimeout(() => {
            btn.style.backgroundColor = "white";
            btn.innerHTML = originalContent;
        }, 1000);
    }
}

function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
}

// --- 5. LOGICA MEIA A MEIA ---
function openHalfModal() {
    document.getElementById("half-modal").classList.add("open");
    updateHalfPricePreview();
}

function closeHalfModal() {
    document.getElementById("half-modal").classList.remove("open");
}

function populateHalfSelects() {
    const pizzaOptions = products.filter(p => p.category === 'pizza');
    const s1 = document.getElementById("half-1");
    const s2 = document.getElementById("half-2");

    s1.innerHTML = "";
    s2.innerHTML = "";

    pizzaOptions.forEach(p => {
        const option = `<option value="${p.id}" data-price="${p.price}">${p.name} (R$ ${p.price.toFixed(2)})</option>`;
        s1.innerHTML += option;
        s2.innerHTML += option;
    });

    s1.addEventListener('change', updateHalfPricePreview);
    s2.addEventListener('change', updateHalfPricePreview);
}

function updateHalfPricePreview() {
    const s1 = document.getElementById("half-1");
    const s2 = document.getElementById("half-2");
    
    const price1 = parseFloat(s1.options[s1.selectedIndex].dataset.price);
    const price2 = parseFloat(s2.options[s2.selectedIndex].dataset.price);

    const finalPrice = Math.max(price1, price2);
    
    document.getElementById("half-price-display").innerText = `Valor Final: R$ ${finalPrice.toFixed(2).replace('.', ',')}`;
}

function addHalfToCart() {
    const s1 = document.getElementById("half-1");
    const s2 = document.getElementById("half-2");
    
    const id1 = parseInt(s1.value);
    const id2 = parseInt(s2.value);
    
    const p1 = products.find(p => p.id === id1);
    const p2 = products.find(p => p.id === id2);

    if (id1 === id2) {
        addToCart(id1);
        closeHalfModal();
        return;
    }

    const price = Math.max(p1.price, p2.price);
    const idsSorted = [id1, id2].sort((a,b) => a-b); 
    const uniqueId = `half-${idsSorted[0]}-${idsSorted[1]}`;

    const existingItem = cart.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: uniqueId,
            uniqueId: uniqueId,
            name: `½ ${p1.name} / ½ ${p2.name}`,
            price: price,
            quantity: 1,
            isHalf: true,
            halfDetails: [p1.name, p2.name]
        });
    }

    saveCart();
    closeHalfModal();
}

// --- 6. INTEGRAÇÃO INTELIGENTE (BrasilAPI + OpenStreetMap) ---

function mascaraCep(input) {
    input.value = input.value.replace(/\D/g, '');
    if (input.value.length === 8) {
        buscarCep(input.value);
    }
}

async function buscarCep(cep) {
    const ruaInput = document.getElementById("client-street");
    const bairroInput = document.getElementById("client-neighborhood");
    const cidadeInput = document.getElementById("client-city");
    const numeroInput = document.getElementById("client-number");
    
    ruaInput.value = "Buscando endereço...";
    
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
        
        if (!response.ok) throw new Error("CEP não encontrado na BrasilAPI");
        
        const data = await response.json();

        ruaInput.value = data.street;
        bairroInput.value = data.neighborhood;
        cidadeInput.value = `${data.city} - ${data.state}`;
        numeroInput.focus();

        if (data.location && data.location.coordinates && data.location.coordinates.longitude) {
            const lat = parseFloat(data.location.coordinates.latitude);
            const lng = parseFloat(data.location.coordinates.longitude);
            calculateDelivery(lat, lng);
            
        } else {
            console.log("BrasilAPI sem coords. Tentando OpenStreetMap...");
            const addressString = `${data.street}, ${data.city} - ${data.state}, Brazil`;
            buscarCoordenadasFallback(addressString);
        }

    } catch (error) {
        console.error(error);
        alert("CEP não encontrado. Digite o endereço manualmente.");
        ruaInput.value = "";
        ruaInput.disabled = false;
        bairroInput.disabled = false;
        cidadeInput.disabled = false;
        definirFreteManual();
    }
}

async function buscarCoordenadasFallback(address) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.length > 0) {
            const lat = parseFloat(json[0].lat);
            const lng = parseFloat(json[0].lon);
            calculateDelivery(lat, lng);
        } else {
            throw new Error("Endereço não encontrado no mapa");
        }
    } catch (e) {
        console.warn("Falha no cálculo de rota:", e);
        definirFreteManual();
    }
}

function definirFreteManual() {
    const distDisplay = document.getElementById("distance-display");
    const deliveryPriceSpan = document.getElementById("delivery-price");
    const btnCheckout = document.querySelector(".btn-whatsapp");

    distDisplay.innerText = "? km";
    deliveryPriceSpan.innerText = "À combinar";
    deliveryPriceSpan.style.color = "#d35400";
    
    deliveryFee = 0; 
    updateCartUI();
    
    btnCheckout.disabled = false;
    btnCheckout.style.backgroundColor = "#25D366";
    btnCheckout.innerHTML = "<i class='material-icons'>whatsapp</i><span>Finalizar (Frete a combinar)</span>";
    
    alert("Endereço localizado! Porém, o sistema de mapas não conseguiu calcular a rota exata. O valor da entrega será combinado pelo WhatsApp.");
}

function calculateDelivery(latClient, lngClient) {
    if (!CONFIG.store_lat || !CONFIG.store_lng) {
        alert("ERRO: Configure as coordenadas da PIZZARIA no arquivo config.js!");
        return;
    }

    const R = 6371; // Raio da terra
    const dLat = deg2rad(latClient - CONFIG.store_lat);
    const dLng = deg2rad(lngClient - CONFIG.store_lng);
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(CONFIG.store_lat)) * Math.cos(deg2rad(latClient)) * Math.sin(dLng/2) * Math.sin(dLng/2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    
    let distance = R * c; 
    distance = distance * 1.3; // Margem de segurança de 30%

    applyDeliveryRules(distance);
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// --- 7. REGRAS DE ENTREGA E UPDATE UI (FINAL) ---

function applyDeliveryRules(km) {
    const priceDisplay = document.getElementById("delivery-price");
    const distDisplay = document.getElementById("distance-display");
    const btnCheckout = document.querySelector(".btn-whatsapp");

    if (isNaN(km)) return;

    distDisplay.innerText = `${km.toFixed(1)} km`;

    if (km > 25.0) {
        deliveryFee = 0;
        priceDisplay.innerText = "Indisponível";
        priceDisplay.style.color = "red";
        
        btnCheckout.disabled = true;
        btnCheckout.style.backgroundColor = "#ccc";
        btnCheckout.innerHTML = "<i class='material-icons'>whatsapp</i><span>Fora da área de entrega</span>";
        alert(`A distância é de ${km.toFixed(1)}km. Entregamos apenas até 25km.`);
    } else {
        btnCheckout.disabled = false;
        btnCheckout.style.backgroundColor = "#25D366";
        btnCheckout.innerHTML = "<i class='material-icons'>whatsapp</i><span>Finalizar no WhatsApp</span>";
        priceDisplay.style.color = "#333";

        if (km <= 4.9) {
            deliveryFee = 0.00;
            priceDisplay.innerText = "Grátis";
            priceDisplay.style.color = "green";
        } else if (km < 8.0) { 
            deliveryFee = 10.00;
            priceDisplay.innerText = "R$ 10,00";
        } else { 
            deliveryFee = 15.00;
            priceDisplay.innerText = "R$ 15,00";
        }
    }

    updateCartUI();
}

function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").innerText = `${totalQty} itens`;
    
    // Subtotal + Entrega
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = subtotal + deliveryFee;

    const fmtTotal = finalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Atualiza totais na tela
    document.getElementById("cart-total-price").innerText = fmtTotal;
    const modalTotal = document.getElementById("modal-total-price");
    if(modalTotal) modalTotal.innerText = fmtTotal;

    // Renderiza Itens
    const cartItemsContainer = document.getElementById("cart-items");
    cartItemsContainer.innerHTML = "";
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p class='empty-msg'>Seu carrinho está vazio 🍕</p>";
        return;
    }

    cart.forEach((item, index) => {
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div class="item-left">
                    <span class="qty-badge">${item.quantity}x</span>
                    <div>
                        <span class="cart-item-title">${item.name}</span>
                        ${item.isHalf ? '<br><small style="color:#888; font-size:11px">Cobrado pela maior</small>' : ''}
                    </div>
                </div>
                <div class="item-right">
                    <span class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    <div class="qty-controls">
                        <button onclick="changeQty(${index}, -1)">-</button>
                        <button onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function toggleCartModal() {
    document.getElementById("cart-modal").classList.toggle("open");
}

function checkout() {
    if (cart.length === 0) return alert("Seu carrinho está vazio!");

    const name = document.getElementById("client-name").value;
    const cep = document.getElementById("client-cep").value;
    const rua = document.getElementById("client-street").value;
    const numero = document.getElementById("client-number").value;
    const bairro = document.getElementById("client-neighborhood").value;
    const cidade = document.getElementById("client-city").value;
    const complement = document.getElementById("client-complement").value;

    if (!name || !cep || !rua || !numero) return alert("Por favor, preencha nome, CEP e número.");

    let message = `*NOVO PEDIDO - ${CONFIG.STORE_NAME}* 🍕\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Endereço:* ${rua}, ${numero}\n`;
    message += `*Bairro:* ${bairro} (${cidade})\n`;
    message += `*CEP:* ${cep}\n`;
    if(complement) message += `*Obs:* ${complement}\n`;
    
    message += `\n*Itens:*\n`;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        message += `${item.quantity}x ${item.name}\n`;
        message += `   (Unit: R$ ${item.price.toFixed(2)} | Sub: R$ ${subtotal.toFixed(2)})\n`;
    });

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;

    message += `\n----------------\n`;
    message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    
    if(deliveryFee === 0) {
        message += `Entrega: *GRÁTIS* 🛵\n`;
    } else {
        message += `Entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
    }
    
    message += `*TOTAL FINAL: R$ ${total.toFixed(2).replace('.', ',')}*\n`;

    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}