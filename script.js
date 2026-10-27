// ===== 1. ՏԱՐԵԹԻՎ =====
const yearElement = document.querySelector("#year");
yearElement.textContent = new Date().getFullYear();

// ===== 2. ՓՈՓՈԽԱԿԱՆՆԵՐ =====
const cart = [];

const cartCount = document.querySelector("#cart-count");
const cartModal = document.querySelector("#cart-modal");
const orderModal = document.querySelector("#order-modal");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const toast = document.querySelector("#toast");

let toastTimer;

// Գումարի ձևաչափ
function formatPrice(price) {
  return price.toLocaleString("hy-AM") + " ֏";
}

// ===== 3. ԾԱՆՈՒՑՈՒՄ =====
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ===== 4. ԶԱՄԲՅՈՒՂԻ ԹԱՐՄԱՑՈՒՄ =====
function updateCart() {
  const totalCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = totalCount;
  cartTotal.textContent = formatPrice(totalPrice);

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p class="small-note">Զամբյուղդ դեռ դատարկ է։ Ընտրիր քո սիրելի սուրճը։</p>';

    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-row">
      <div>
        <strong>${item.name}</strong>
        <small>${formatPrice(item.price)} × ${item.quantity}</small>
      </div>

      <div class="quantity-controls">
        <button
          data-action="decrease"
          data-name="${item.name}"
          aria-label="Նվազեցնել ${item.name} քանակը"
        >−</button>

        <span>${item.quantity}</span>

        <button
          data-action="increase"
          data-name="${item.name}"
          aria-label="Ավելացնել ${item.name} քանակը"
        >+</button>

        <button
          class="remove-button"
          data-action="remove"
          data-name="${item.name}"
          aria-label="Հեռացնել ${item.name}"
        >×</button>
      </div>
    </div>
  `).join("");
}

// ===== 5. ԱՊՐԱՆՔ ԱՎԵԼԱՑՆԵԼ =====
document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    const existingItem = cart.find(
      (item) => item.name === name
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        name,
        price,
        quantity: 1
      });
    }

    updateCart();
    showToast(`${name} ավելացվեց զամբյուղում։`);
  });
});

// ===== 6. ԶԱՄԲՅՈՒՂԻ ՔԱՆԱԿԸ ՓՈԽԵԼ =====
cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const name = button.dataset.name;
  const action = button.dataset.action;

  const item = cart.find(
    (product) => product.name === name
  );

  if (!item) return;

  if (action === "increase") {
    item.quantity++;
  }

  if (action === "decrease") {
    item.quantity--;

    if (item.quantity <= 0) {
      cart.splice(cart.indexOf(item), 1);
    }
  }

  if (action === "remove") {
    cart.splice(cart.indexOf(item), 1);
  }

  updateCart();
});

// ===== 7. ՄԵՆՅՈՒՆ ԶՏԵԼ =====
const filterButtons = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".product-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    filterButtons.forEach((filter) => {
      filter.classList.remove("active");
    });

    button.classList.add("active");

    products.forEach((product) => {
      const matches =
        category === "all" ||
        product.dataset.category === category;

      product.hidden = !matches;
    });
  });
});

// ===== 8. ՊԱՏՈՒՀԱՆՆԵՐ ԲԱՑԵԼ ԵՎ ՓԱԿԵԼ =====
function openModal(modal) {
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  const firstInput = modal.querySelector("input");

  if (firstInput) {
    firstInput.focus();
  }
}

function closeModal(modal) {
  modal.classList.add("hidden");

  const anotherModalIsOpen = [
    cartModal,
    orderModal
  ].some((item) => !item.classList.contains("hidden"));

  if (!anotherModalIsOpen) {
    document.body.classList.remove("modal-open");
  }
}

document.querySelector("#open-cart").addEventListener("click", () => {
  openModal(cartModal);
});

document.querySelector("#close-cart").addEventListener("click", () => {
  closeModal(cartModal);
});

document.querySelector("#close-order").addEventListener("click", () => {
  closeModal(orderModal);
});

// Պատուհանը փակել՝ դրսի հատվածին սեղմելով
[cartModal, orderModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

// Փակել Escape ստեղնով
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal(cartModal);
    closeModal(orderModal);
  }
});

// ===== 9. ՊԱՏՎԵՐԻ ՁԵՎԸ =====
document.querySelector("#checkout").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Նախ ավելացրու ապրանք զամբյուղում։");
    return;
  }

  closeModal(cartModal);
  openModal(orderModal);
});

// ===== 10. ՑՈՒՑԱԴՐԱԿԱՆ ՊԱՏՎԵՐ =====
document.querySelector("#order-form").addEventListener("submit", (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    closeModal(orderModal);
    showToast("Զամբյուղդ դատարկ է։");
    return;
  }

  const formData = new FormData(event.currentTarget);
  const customerName = formData.get("name").trim();

  if (!customerName) {
    showToast("Խնդրում ենք լրացնել անունը։");
    return;
  }

  const orderSummary = cart
    .map((item) => `${item.name} × ${item.quantity}`)
    .join(", ");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  console.log("Ցուցադրական պատվեր", {
    customer: customerName,
    phone: formData.get("phone"),
    address: formData.get("address"),
    products: orderSummary,
    total: formatPrice(total)
  });

  closeModal(orderModal);
  event.currentTarget.reset();

  cart.length = 0;
  updateCart();

  showToast("Շնորհակալություն, " + customerName + "։ Պատվերը ցուցադրական էր։");
});

console.log("Aroma Cafe կայքը հաջողությամբ գործարկվեց։ ☕");

updateCart();