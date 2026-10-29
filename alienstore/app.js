(function () {
  'use strict';

  var CART_KEY = 'megamagazin_cart_2001';
  var VISIT_KEY = 'megamagazin_visits_2001';

  var cart = readCart();

  /* ---------- хранилище ---------- */

  function readCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* приватный режим — просто работаем без сохранения */
    }
  }

  /* ---------- элементы ---------- */

  var el = {
    panel: document.getElementById('cartPanel'),
    toggle: document.getElementById('cartToggle'),
    list: document.getElementById('cartItems'),
    empty: document.getElementById('cartEmpty'),
    status: document.getElementById('cartStatus'),
    total: document.getElementById('cartTotal'),
    checkout: document.getElementById('checkoutBtn'),
    clear: document.getElementById('clearBtn'),
    openBtn: document.getElementById('cartBtn'),
    counter: document.getElementById('counter'),
    blinkToggle: document.getElementById('blinkToggle')
  };

  /* ---------- утилиты ---------- */

  function money(sum) {
    return sum.toLocaleString('ru-RU');
  }

  function totalQty() {
    return cart.reduce(function (acc, item) { return acc + item.qty; }, 0);
  }

  function totalSum() {
    return cart.reduce(function (acc, item) { return acc + item.qty * item.price; }, 0);
  }

  function showStatus(html) {
    el.status.innerHTML = html;
    el.status.hidden = false;
  }

  function hideStatus() {
    el.status.hidden = true;
    el.status.innerHTML = '';
  }

  /* ---------- корзина: операции ---------- */

  function addToCart(id, name, price) {
    var found = null;

    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) {
        found = cart[i];
        break;
      }
    }

    if (found) {
      found.qty += 1;
    } else {
      cart.push({ id: id, name: name, price: price, qty: 1 });
    }

    writeCart();
    render();
    showStatus('Товар добавлен в корзину!');
  }

  function changeQty(id, delta) {
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id !== id) continue;

      cart[i].qty += delta;

      if (cart[i].qty < 1) {
        cart.splice(i, 1);
      }
      break;
    }

    writeCart();
    render();
  }

  function removeItem(id) {
    cart = cart.filter(function (item) { return item.id !== id; });
    writeCart();
    render();
    showStatus('Товар удалён из корзины.');
  }

  /* ---------- корзина: отрисовка ---------- */

  function buildRow(item) {
    var li = document.createElement('li');
    li.className = 'cart-item';

    var name = document.createElement('div');
    name.className = 'cart-item-name';
    name.textContent = item.name;

    var line = document.createElement('div');
    line.className = 'cart-item-line';

    var qty = document.createElement('span');
    qty.className = 'qty';

    var minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('data-act', 'dec');
    minus.setAttribute('data-id', item.id);
    minus.setAttribute('aria-label', 'Уменьшить количество');

    var count = document.createElement('b');
    count.textContent = item.qty;

    var plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('data-act', 'inc');
    plus.setAttribute('data-id', item.id);
    plus.setAttribute('aria-label', 'Увеличить количество');

    qty.appendChild(minus);
    qty.appendChild(count);
    qty.appendChild(plus);

    var sum = document.createElement('span');
    sum.className = 'cart-item-sum';
    sum.textContent = money(item.qty * item.price);

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'del';
    del.textContent = '×';
    del.setAttribute('data-act', 'del');
    del.setAttribute('data-id', item.id);
    del.setAttribute('aria-label', 'Удалить товар из корзины');

    line.appendChild(qty);
    line.appendChild(sum);
    line.appendChild(del);

    li.appendChild(name);
    li.appendChild(line);

    return li;
  }

  function render() {
    var qty = totalQty();

    /* счётчик на кнопке в шапке */
    var badges = document.querySelectorAll('.js-cart-count');
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = qty;
    }

    /* список товаров */
    el.list.innerHTML = '';

    if (qty === 0) {
      el.empty.hidden = false;
      el.checkout.disabled = true;
      el.clear.hidden = true;
    } else {
      el.empty.hidden = true;
      el.checkout.disabled = false;
      el.clear.hidden = false;

      for (var j = 0; j < cart.length; j++) {
        el.list.appendChild(buildRow(cart[j]));
      }
    }

    el.total.textContent = money(totalSum());
  }

  /* ---------- оформление заказа ---------- */

  function checkout() {
    if (totalQty() === 0) return;

    var sum = totalSum();
    var number = '2026-' + Math.floor(100 + Math.random() * 900);

    cart = [];
    writeCart();
    render();

    showStatus(
      'ЗАКАЗ № ' + number + ' ПРИНЯТ!<br>' +
      'Сумма: ' + money(sum) + ' вон<br>' +
      'Ждите появление вашего заказа <br>в ближайшем свободном пространстве!'
    );
  }


  /* ---------- обработчики ---------- */

  document.addEventListener('click', function (event) {
    /* добавить товар */
    var add = event.target.closest('[data-add]');
    if (add) {
      addToCart(
        add.getAttribute('data-add'),
        add.getAttribute('data-name'),
        Number(add.getAttribute('data-price'))
      );
      openCart();
      return;
    }

    /* кнопки внутри корзины */
    var act = event.target.closest('[data-act]');
    if (act) {
      var id = act.getAttribute('data-id');
      var action = act.getAttribute('data-act');

      if (action === 'inc') changeQty(id, 1);
      if (action === 'dec') changeQty(id, -1);
      if (action === 'del') removeItem(id);
      return;
    }
  });

  el.checkout.addEventListener('click', checkout);

  el.clear.addEventListener('click', function () {
    cart = [];
    writeCart();
    render();
    showStatus('Корзина очищена.');
  });

  el.toggle.addEventListener('click', function () {
    var collapsed = el.panel.classList.toggle('collapsed');
    el.toggle.setAttribute('aria-expanded', String(!collapsed));
  });

  el.openBtn.addEventListener('click', function (event) {
    event.preventDefault();
    openCart();
  });

  /* ---------- счётчик посещений ---------- */

  (function counter() {
    var start = 847;
    var visits = start;

    try {
      var stored = parseInt(localStorage.getItem(VISIT_KEY), 10);
      visits = (isNaN(stored) ? start : stored) + 1;
      localStorage.setItem(VISIT_KEY, String(visits));
    } catch (e) {
      visits = start + Math.floor(Math.random() * 9);
    }

    var digits = String(visits).padStart(6, '0').split('');
    el.counter.innerHTML = '';

    for (var i = 0; i < digits.length; i++) {
      var span = document.createElement('span');
      span.className = 'digit';
      span.textContent = digits[i];
      el.counter.appendChild(span);
    }
  })();

  /* ---------- отключение мигания ---------- */

  el.blinkToggle.addEventListener('click', function (event) {
    event.preventDefault();
    var off = document.documentElement.classList.toggle('no-blink');
    this.textContent = off ? 'Включить мигание' : 'Отключить мигание';
  });

  /* ---------- старт ---------- */

  hideStatus();
  render();
})();
