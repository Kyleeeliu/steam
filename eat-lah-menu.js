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
  document.getElementById('order-message').textContent = 'Thank you! Your order has been placed.';
  clearCart();
  // Remove 5% coupon after use, keep 10% for future
  if (typeof window !== 'undefined') {
    const input = document.getElementById('coupon-code-input');
    const code = input ? input.value.trim().toUpperCase() : '';
    if (code && localStorage.getItem('eatlah_coupon') === code) {
      localStorage.removeItem('eatlah_coupon');
    }
    // Do not remove 10% coupon (future)
  }
  setTimeout(() => {
    document.getElementById('order-cart').style.display = 'none';
    showMinigames();
  }, 1200);
}
function showMinigames() {
  // Instead of showing a section, redirect to the food journey page
  if (typeof window !== 'undefined') {
    localStorage.setItem('show_food_journey', '1');
    window.location.href = 'food-journey.html';
  }
}
function hideMinigames() {
  // No longer needed
}

// --- Interactive Food Journey Story ---
function renderFoodJourneyStory() {
  let storyIdx = 0;
  const story = [
    {
      emoji: '🌱',
      title: 'It Starts on the Farm',
      text: 'Our journey begins with local farmers planting and nurturing crops and raising animals with care.',
      interactive: 'harvest',
    },
    {
      emoji: '🚜',
      title: 'Harvest & Collection',
      text: 'When the time is right, ingredients are harvested and collected fresh from the fields.',
      interactive: null,
    },
    {
      emoji: '🚚',
      title: 'Transport to Market',
      text: 'The fresh produce and ingredients are delivered to local markets and restaurants, reducing food miles.',
      interactive: 'quiz',
    },
    {
      emoji: '👩‍🍳',
      title: 'Prepared by Our Chefs',
      text: 'Our chefs select the best local ingredients and prepare your meal with love and skill.',
      interactive: null,
    },
    {
      emoji: '🍽️',
      title: 'Served to You',
      text: 'Your delicious meal is served, fresh and full of local flavor. Enjoy!',
      interactive: null,
    },
    {
      emoji: '🎉',
      title: 'You Did It!',
      text: "Thanks for learning about your food's journey! Here's a 10% off coupon for your next order: <b>EATLAH10</b>",
      interactive: null,
    }
  ];
  let storyDiv = document.getElementById('food-journey-story');
  if (!storyDiv) {
    storyDiv = document.createElement('div');
    storyDiv.id = 'food-journey-story';
    document.getElementById('minigames-section').innerHTML = '';
    document.getElementById('minigames-section').appendChild(storyDiv);
  }
  function renderPanel() {
    const s = story[storyIdx];
    // Visual aid for each step
    let visual = `<div style='font-size:3rem;'>${s.emoji}</div>`;
    // Interactive: Harvest wheat
    if (s.interactive === 'harvest') {
      // Render a field of clickable wheat
      const wheatCount = 8;
      let harvested = 0;
      visual = `<div style='display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:1rem;'>` +
        Array.from({length: wheatCount}).map((_,i) => `<span class='wheat-emoji' data-idx='${i}' style='font-size:2.2rem;cursor:pointer;transition:transform 0.2s;'>🌾</span>`).join('') +
        `</div>`;
      storyDiv.innerHTML = `
        <div style="max-width:340px;margin:2rem auto;background:#fffde7;border-radius:18px;box-shadow:0 4px 24px #2e7d3222;padding:2rem 1.2rem;text-align:center;">
          ${visual}
          <div style="font-weight:700;font-size:1.2rem;color:#2e7d32;margin:1rem 0 0.5rem 0;">${s.title}</div>
          <div style="font-size:1.08rem;color:#333;margin-bottom:1.5rem;">Click each wheat to harvest!</div>
          <div id='harvest-progress' style='color:#2e7d32;font-weight:600;margin-bottom:1rem;'>0 / ${wheatCount} harvested</div>
        </div>
      `;
      const wheatEls = Array.from(storyDiv.querySelectorAll('.wheat-emoji'));
      wheatEls.forEach(el => {
        el.onclick = function() {
          if (!el.classList.contains('harvested')) {
            el.classList.add('harvested');
            el.style.transform = 'scale(1.3) rotate(-20deg)';
            el.style.opacity = '0.4';
            harvested++;
            document.getElementById('harvest-progress').textContent = `${harvested} / ${wheatCount} harvested`;
            if (harvested === wheatCount) {
              setTimeout(() => {
                storyIdx++;
                renderPanel();
              }, 600);
            }
          }
        };
      });
      return;
    }
    // Interactive: Quiz for transport
    if (s.interactive === 'quiz') {
      visual = `<div style='font-size:3rem;'>🚚</div>`;
      storyDiv.innerHTML = `
        <div style="max-width:340px;margin:2rem auto;background:#fffde7;border-radius:18px;box-shadow:0 4px 24px #2e7d3222;padding:2rem 1.2rem;text-align:center;">
          ${visual}
          <div style="font-weight:700;font-size:1.2rem;color:#2e7d32;margin:1rem 0 0.5rem 0;">${s.title}</div>
          <div style="font-size:1.08rem;color:#333;margin-bottom:1.5rem;">Why is eating local food better for the environment?</div>
          <button class='quiz-btn' style='background:#e8f5e9;color:#2e7d32;border:2px solid #2e7d32;padding:0.5rem 1.2rem;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;margin:0.3rem;'>A. It reduces food miles and emissions</button><br>
          <button class='quiz-btn' style='background:#e8f5e9;color:#2e7d32;border:2px solid #2e7d32;padding:0.5rem 1.2rem;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;margin:0.3rem;'>B. It makes food more expensive</button><br>
          <button class='quiz-btn' style='background:#e8f5e9;color:#2e7d32;border:2px solid #2e7d32;padding:0.5rem 1.2rem;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;margin:0.3rem;'>C. It takes longer to reach you</button>
          <div id='quiz-feedback' style='margin-top:1rem;font-weight:600;color:#c62828;'></div>
        </div>
      `;
      const btns = Array.from(storyDiv.querySelectorAll('.quiz-btn'));
      btns[0].onclick = () => {
        document.getElementById('quiz-feedback').textContent = 'Correct!';
        btns.forEach(b => b.disabled = true);
        btns[0].style.background = '#2e7d32';
        btns[0].style.color = '#fff';
        setTimeout(() => {
          storyIdx++;
          renderPanel();
        }, 900);
      };
      btns[1].onclick = btns[2].onclick = () => {
        document.getElementById('quiz-feedback').textContent = 'Try again!';
      };
      return;
    }
    // Default: normal panel with visual
    storyDiv.innerHTML = `
      <div style="max-width:340px;margin:2rem auto;background:#fffde7;border-radius:18px;box-shadow:0 4px 24px #2e7d3222;padding:2rem 1.2rem;text-align:center;">
        ${visual}
        <div style="font-weight:700;font-size:1.2rem;color:#2e7d32;margin:1rem 0 0.5rem 0;">${s.title}</div>
        <div style="font-size:1.08rem;color:#333;margin-bottom:1.5rem;">${s.text}</div>
        ${storyIdx < story.length-1 ? `<button style='background:#2e7d32;color:#fff;border:none;padding:0.6rem 1.5rem;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;' id='story-next-btn'>Next</button>` : ''}
      </div>
    `;
    if (storyIdx === story.length-1) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('eatlah_coupon', 'EATLAH10');
      }
    }
    const nextBtn = document.getElementById('story-next-btn');
    if (nextBtn) {
      nextBtn.onclick = () => {
        storyIdx++;
        renderPanel();
      };
    }
  }
  renderPanel();
}

// --- Coupon redemption in main menu ---
function getCouponDiscount() {
  if (typeof window !== 'undefined') {
    const input = document.getElementById('coupon-code-input');
    const code = input ? input.value.trim().toUpperCase() : '';
    const stored5 = localStorage.getItem('eatlah_coupon');
    const stored10 = localStorage.getItem('eatlah_future_coupon');
    if (code && stored5 && code === stored5) return { percent: 0.05, code };
    if (code && stored10 && code === stored10) return { percent: 0.10, code };
  }
  return null;
} 