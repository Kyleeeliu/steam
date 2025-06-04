let cart = [];
let lastOrderedDish = null;
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  lastOrderedDish = name; // Track last dish added
  updateCart();
}
function updateCart() {
  const cartDiv = document.getElementById('order-cart');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const li = document.createElement('li');
    li.innerHTML = `${item.name} x${item.qty} <span style='float:right;'>$${item.price * item.qty}</span> <button onclick="removeFromCart('${item.name}')" style="margin-left:8px; background:none; border:none; color:#c62828; cursor:pointer;">&times;</button>`;
    cartItems.appendChild(li);
  });
  // Coupon input
  let couponInput = document.getElementById('coupon-code-input');
  let couponMsg = document.getElementById('coupon-msg');
  if (!couponInput) {
    const inputDiv = document.createElement('div');
    inputDiv.style.margin = '1rem 0 0.5rem 0';
    inputDiv.innerHTML = `<input id='coupon-code-input' type='text' placeholder='Enter coupon code' style='padding:0.4rem 1rem;border-radius:6px;border:1.5px solid #2e7d32;font-size:1rem;width:70%;max-width:220px;margin-right:0.5rem;'> <span id='coupon-msg' style='color:#2e7d32;font-weight:600;'></span>`;
    cartDiv.insertBefore(inputDiv, cartDiv.firstChild);
    couponInput = document.getElementById('coupon-code-input');
    couponMsg = document.getElementById('coupon-msg');
    couponInput.addEventListener('input', updateCart);
  }
  // Coupon logic
  const coupon = getCouponDiscount();
  if (coupon && total > 0) {
    const discountAmt = Math.round(total * coupon.percent * 100) / 100;
    const li = document.createElement('li');
    li.innerHTML = `<span style='color:#2e7d32;'>Coupon (${coupon.code}): -$${discountAmt}</span>`;
    cartItems.appendChild(li);
    total -= discountAmt;
    total = Math.max(0, Math.round(total * 100) / 100);
    if (couponMsg) couponMsg.textContent = 'Coupon applied!';
    if (coupon.percent >= 0.20) {
      couponMsg.textContent += ' (Max 20% discount applied)';
    }
  } else {
    if (couponMsg) couponMsg.textContent = '';
  }
  cartTotal.textContent = total;
  cartDiv.style.display = cart.length ? 'block' : 'none';
}
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  updateCart();
}
function clearCart() {
  cart = [];
  updateCart();
  document.getElementById('order-message').textContent = '';
}
function placeOrder() {
  if (!cart.length) return;
  // Find the last dish in the cart (most recently added)
  if (cart.length > 0) {
    lastOrderedDish = cart[cart.length - 1].name;
  }
  // Calculate bill details before clearing cart
  const billItems = cart.map(item => ({ ...item }));
  let subtotal = billItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const coupon = getCouponDiscount();
  let discount = 0;
  let discountText = '';
  if (coupon && subtotal > 0) {
    discount = Math.round(subtotal * coupon.percent * 100) / 100;
    discountText = `<tr><td colspan='2' style='color:#2e7d32;font-weight:600;'>Coupon (${coupon.code})</td><td style='color:#2e7d32;font-weight:600;'>- $${discount.toFixed(2)}</td></tr>`;
    subtotal -= discount;
    subtotal = Math.max(0, Math.round(subtotal * 100) / 100);
  }
  // Remove 5% coupon after use, keep 10% for future
  if (typeof window !== 'undefined') {
    const input = document.getElementById('coupon-code-input');
    const code = input ? input.value.trim().toUpperCase() : '';
    if (code && localStorage.getItem('eatlah_coupon') === code) {
      localStorage.removeItem('eatlah_coupon');
    }
    // Do not remove 10% coupon (future)
  }
  // Clear cart and show bill
  cart = [];
  const cartDiv = document.getElementById('order-cart');
  cartDiv.style.display = 'block';
  cartDiv.innerHTML = `
    <h3 style='color:#2e7d32;margin-top:0;'>Your Bill</h3>
    <table style='width:100%;margin-bottom:1.2rem;font-size:1.08rem;'>
      <thead><tr><th style='text-align:left;'>Item</th><th style='text-align:center;'>Qty</th><th style='text-align:right;'>Price</th></tr></thead>
      <tbody>
        ${billItems.map(item => `<tr><td>${item.name}</td><td style='text-align:center;'>${item.qty}</td><td style='text-align:right;'>$${(item.price * item.qty).toFixed(2)}</td></tr>`).join('')}
        <tr><td colspan='2' style='font-weight:600;'>Subtotal</td><td style='text-align:right;font-weight:600;'>$${billItems.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}</td></tr>
        ${discountText}
        <tr><td colspan='2' style='font-weight:700;color:#2e7d32;'>Total</td><td style='text-align:right;font-weight:700;color:#2e7d32;'>$${subtotal.toFixed(2)}</td></tr>
      </tbody>
    </table>
    <div style='font-size:1.15rem;color:#388e3c;font-weight:700;margin-bottom:0.7rem;'>Thank you! Your order has been placed.</div>
    <button id="call-staff-btn" style='background:#fbc02d; color:#222; border:none; padding:0.7rem 1.5rem; border-radius:8px; font-size:1.08rem; font-weight:700; cursor:pointer; margin-bottom:0.7rem;'>Call Staff / Checkout</button>
    <div id="call-staff-msg" style="margin:0.7rem 0 0.2rem 0;font-weight:600;color:#2e7d32;"></div>
    <button onclick="resetCartUI()" style='background:#fff; color:#2e7d32; border:1.5px solid #2e7d32; padding:0.6rem 1.2rem; border-radius:6px; font-size:1rem; cursor:pointer;'>Close</button>
    <button id="play-game-btn" style="background:#2e7d32;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-size:1.08rem;font-weight:700;cursor:pointer;margin:0.7rem 0 0.2rem 0;display:block;width:100%;">Play Game</button>
  `;
  // Add call staff button logic
  const callBtn = document.getElementById('call-staff-btn');
  if (callBtn) {
    callBtn.onclick = function() {
      callBtn.disabled = true;
      callBtn.style.opacity = '0.6';
      document.getElementById('call-staff-msg').textContent = 'A staff member has been notified and will assist you shortly.';
    };
  }
  const playGameBtn = document.getElementById('play-game-btn');
  if (playGameBtn) {
    playGameBtn.onclick = function() {
      window.location.href = 'cook-game.html';
    };
  }
}

// --- Coupon redemption in main menu ---
function getCouponDiscount() {
  if (typeof window !== 'undefined') {
    const input = document.getElementById('coupon-code-input');
    const codeStr = input ? input.value.trim().toUpperCase() : '';
    if (!codeStr) return null;
    // Accept multiple codes, separated by comma or space
    const codes = codeStr.split(/[,\s]+/).filter(Boolean);
    let totalPercent = 0;
    let validCodes = [];
    let flappyCoupons = [];
    try {
      flappyCoupons = JSON.parse(localStorage.getItem('flappy_food_coupons') || '[]');
    } catch (e) { flappyCoupons = []; }
    const used = new Set();
    for (let code of codes) {
      if (used.has(code)) continue;
      used.add(code);
      // 5% coupon
      const stored5 = localStorage.getItem('eatlah_coupon');
      if (stored5 && code === stored5) {
        totalPercent += 0.05;
        validCodes.push(code);
        continue;
      }
      // 10% coupon
      const stored10 = localStorage.getItem('eatlah_future_coupon');
      if (stored10 && code === stored10) {
        totalPercent += 0.10;
        validCodes.push(code);
        continue;
      }
      // Flappy Bird coupons
      const flappy = flappyCoupons.find(c => c.code === code);
      if (flappy) {
        totalPercent += flappy.percent;
        validCodes.push(code);
        continue;
      }
    }
    if (totalPercent > 0.20) totalPercent = 0.20;
    if (validCodes.length) return { percent: totalPercent, code: validCodes.join(', ') };
  }
  return null;
}

// Remove the floating Play Food Journey Game button if present
window.addEventListener('DOMContentLoaded', function() {
  const oldBtn = document.getElementById('play-food-journey-main-btn');
  if (oldBtn) oldBtn.remove();
});

function resetCartUI() {
  const cartDiv = document.getElementById('order-cart');
  cartDiv.innerHTML = `
    <h3 style="color:#2e7d32; margin-top:0;">Your Order</h3>
    <ul id="cart-items" style="list-style:none; padding:0; margin:0 0 1rem 0;"></ul>
    <div style="font-weight:bold; margin-bottom:1rem;">Total: $<span id="cart-total">0</span></div>
    <button onclick="placeOrder()" style="background:#2e7d32; color:#fff; border:none; padding:0.6rem 1.2rem; border-radius:6px; font-size:1rem; cursor:pointer;">Place Order</button>
    <button onclick="clearCart()" style="background:#fff; color:#2e7d32; border:1px solid #2e7d32; padding:0.6rem 1.2rem; border-radius:6px; font-size:1rem; cursor:pointer; margin-left:0.5rem;">Clear</button>
    <div id="order-message" style="margin-top:1rem; color:#388e3c; font-weight:600;"></div>
  `;
  cartDiv.style.display = 'none';
  updateCart();
} 