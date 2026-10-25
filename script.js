const FREE_SHIPPING = 150;
const $ = (selector) => document.querySelector(selector);

const cartPanel = $("#cart");
let cart = [];
try { cart = JSON.parse(localStorage.getItem("serena-cart")) || []; } catch {}

function renderCart() {
  const count = cart.reduce((n, item) => n + item.qty, 0);
  const total = cart.reduce((n, item) => n + item.price * item.qty, 0);

  $("#cart-count").textContent = count;
  $("#open-cart").setAttribute("aria-label", `Open cart with ${count} items`);
  $("#cart-subtotal").textContent = `$${total}.00`;
  $("#ship-msg").textContent =
    total >= FREE_SHIPPING
      ? "Complimentary shipping is yours."
      : `You’re $${FREE_SHIPPING - total} away from complimentary shipping.`;
  $("#ship-bar").style.width = `${Math.min(100, (total / FREE_SHIPPING) * 100)}%`;

  $("#cart-list").innerHTML = cart
    .map((item, i) => `
      <li class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <h3>${item.name}</h3>
          <small>${item.material} · ${item.size === "One size" ? "One size" : "Size " + item.size}</small>
          <p>$${item.price}</p>
          <div class="quantity">
            <button type="button" data-i="${i}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button type="button" data-i="${i}" data-change="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </li>`)
    .join("");

  try { localStorage.setItem("serena-cart", JSON.stringify(cart)); } catch {}
}

function addToCart(item) {
  const same = cart.find((c) => c.name === item.name && c.material === item.material && c.size === item.size);
  if (same) same.qty++;
  else cart.push({ ...item, qty: 1 });
  renderCart();
  if (!cartPanel.matches(":popover-open")) cartPanel.showPopover();
}

document.addEventListener("click", (event) => {
  const quick = event.target.closest("[data-add]");
  if (quick) {
    const { name, price, image } = quick.dataset;
    addToCart({ name, price: Number(price), image, material: "18k Gold Vermeil", size: "One size" });
  }

  const qty = event.target.closest("[data-change]");
  if (qty) {
    cart[qty.dataset.i].qty += Number(qty.dataset.change);
    cart = cart.filter((item) => item.qty > 0);
    renderCart();
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest(".add-form");
  if (form) {
    event.preventDefault();
    const choice = new FormData(form);
    const { name, price, image } = form.dataset;
    addToCart({ name, price: Number(price), image, material: choice.get("material"), size: choice.get("size") || "One size" });
  }

  if (event.target.id === "newsletter") {
    event.preventDefault();
    $("#newsletter-note").textContent = "Welcome to Serena. Your private code is SERENA30.";
  }
});

addEventListener("hashchange", () => { $("#menu-toggle").checked = false; });

renderCart();