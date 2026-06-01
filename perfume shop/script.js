const CART_STORAGE_KEY = "essenceCart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const totalItems = getCart().reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((count) => {
    count.textContent = totalItems;
  });
}

function parsePrice(priceText) {
  return Number(priceText.replace(/[^0-9.]/g, ""));
}

function showCartMessage(message, type = "success") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `cart-message ${type}`;
  messageDiv.innerHTML = `
    <div class="message-content">
      <i class="fas fa-info-circle"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => messageDiv.remove(), 300);
  }, 2200);
}

function addProductToCart(button) {
  const productCard = button.closest(".box");
  if (!productCard) return;

  const name = productCard.querySelector("h3")?.textContent.trim() || "Product";
  const image = productCard.querySelector("img")?.getAttribute("src") || "";
  const priceNode = productCard.querySelector(".price");
  const oldPriceNode = productCard.querySelector(".price span");
  const price = parsePrice(priceNode?.childNodes[0]?.textContent || "0");
  const oldPrice = oldPriceNode ? parsePrice(oldPriceNode.textContent) : null;
  const id = button.dataset.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, image, price, oldPrice, quantity: 1 });
  }

  saveCart(cart);
  showCartMessage(`${name} added to cart`);
}

function renderCartPage() {
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartSummary = document.getElementById("cartSummary");
  if (!cartItemsContainer || !cartSummary) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started.</p>
        <a href="dashboard.html" class="btn">Continue Shopping</a>
      </div>
    `;
    cartSummary.style.display = "none";
    return;
  }

  cartSummary.style.display = "block";
  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <div class="cart-item-price">
              $${item.price.toFixed(2)}
              ${
                item.oldPrice && item.oldPrice > item.price
                  ? `<span class="cart-item-old-price">$${item.oldPrice.toFixed(2)}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="quantity-control">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
            <input class="qty-input" type="number" min="1" value="${item.quantity}" data-id="${item.id}">
            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>
          <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
          <button class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
    )
    .join("");

  updateOrderSummary(cart);
}

function updateOrderSummary(cart) {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 5 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  document.getElementById("summarySubtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("summaryShipping").textContent = `$${shipping.toFixed(2)}`;
  document.getElementById("summaryTax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("summaryTotal").textContent = `$${total.toFixed(2)}`;
}

function updateCartItem(productId, quantity) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;

  item.quantity = Math.max(1, quantity);
  saveCart(cart);
  renderCartPage();
}

function removeCartItem(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
  renderCartPage();
  showCartMessage("Item removed from cart", "info");
}

function clearCart() {
  if (getCart().length === 0) return;
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartCount();
  renderCartPage();
  showCartMessage("Cart cleared successfully", "info");
}

function proceedToCheckout() {
  if (getCart().length === 0) {
    showCartMessage("Your cart is empty", "warning");
    return;
  }

  showCartMessage("Checkout page can be added next", "info");
}

function navigateTo(pageUrl) {
  window.location.href = pageUrl;
}

function scrollToCategory(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("navLinks");
  const searchInput = document.getElementById("searchInput");
  const cartButton = document.querySelector(".cart-btn");

  menuToggle?.addEventListener("click", () => navLinks?.classList.toggle("show"));

  searchInput?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const searchTerm = searchInput.value.trim().toLowerCase();
      const match = Array.from(document.querySelectorAll(".shop .box h3")).find((heading) =>
        heading.textContent.toLowerCase().includes(searchTerm)
      );

      if (match) {
        match.closest(".box")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        showCartMessage("No matching product found", "warning");
      }
    }
  });

  cartButton?.addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  document.querySelectorAll("nav ul.nav-links li a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      event.preventDefault();
      document.getElementById(href.substring(1))?.scrollIntoView({ behavior: "smooth" });
      navLinks?.classList.remove("show");
    });
  });

  document.querySelectorAll(".add-cart-btn").forEach((button) => {
    button.addEventListener("click", () => addProductToCart(button));
  });

  document.getElementById("cartItemsContainer")?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const productId = button.dataset.id;
    const action = button.dataset.action;
    const item = getCart().find((cartItem) => cartItem.id === productId);
    if (!item) return;

    if (action === "increase") updateCartItem(productId, item.quantity + 1);
    if (action === "decrease") updateCartItem(productId, item.quantity - 1);
    if (action === "remove") removeCartItem(productId);
  });

  document.getElementById("cartItemsContainer")?.addEventListener("change", (event) => {
    if (!event.target.classList.contains("qty-input")) return;
    updateCartItem(event.target.dataset.id, Number(event.target.value));
  });

  document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);
  document.getElementById("checkoutBtn")?.addEventListener("click", proceedToCheckout);

  updateCartCount();
  renderCartPage();
});
