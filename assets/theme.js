(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ---------- Mobile menu (Figma 02_Menu_Mobile) ---------- */
  function initMobileMenu() {
    var menu = qs("[data-mobile-nav]");
    if (!menu) return;

    var header = qs(".site-header");
    var titleEl = qs("[data-menu-title]", menu);
    var backBtn = qs("[data-menu-back]", menu);
    var backLabel = qs("[data-menu-back-label]", menu);
    var subhead = qs("[data-menu-subhead]", menu);
    var levels = qsa("[data-menu-level]", menu);
    var openBtns = qsa("[data-menu-open]");
    var history = ["root"];

    function levelById(id) {
      return qs('[data-menu-level="' + id + '"]', menu);
    }

    function showLevel(id, push) {
      var next = levelById(id);
      if (!next) return;

      levels.forEach(function (level) {
        var active = level === next;
        level.classList.toggle("is-active", active);
        level.hidden = !active;
      });

      if (push) history.push(id);

      var isRoot = id === "root";
      if (subhead) subhead.hidden = isRoot;
      if (backBtn) {
        var parentId = history.length > 1 ? history[history.length - 2] : "root";
        var parent = levelById(parentId);
        var parentName = parentId === "root"
          ? "Menu"
          : (parent && parent.getAttribute("data-menu-label")) || "menu précédent";
        backBtn.setAttribute("aria-label", "Retour à " + parentName);
        if (backLabel) backLabel.textContent = "Retour";
      }
      if (titleEl) {
        titleEl.textContent = isRoot
          ? "Menu"
          : next.getAttribute("data-menu-label") || "Menu";
      }
    }

    function resetLevels() {
      history = ["root"];
      showLevel("root", false);
    }

    function setOpenUi(open) {
      if (header) header.classList.toggle("is-menu-open", open);
      openBtns.forEach(function (btn) {
        btn.classList.toggle("is-active", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      });
    }

    function openMenu(e) {
      if (e) e.preventDefault();
      if (menu.classList.contains("is-open")) {
        closeMenu();
        return;
      }
      resetLevels();
      menu.hidden = false;
      requestAnimationFrame(function () {
        menu.classList.add("is-open");
      });
      document.body.classList.add("nav-open");
      setOpenUi(true);
    }

    function closeMenu(e) {
      if (e) e.preventDefault();
      menu.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      setOpenUi(false);
      setTimeout(function () {
        if (!menu.classList.contains("is-open")) {
          menu.hidden = true;
          resetLevels();
        }
      }, 280);
    }

    function goBack(e) {
      if (e) e.preventDefault();
      if (history.length < 2) return;
      history.pop();
      showLevel(history[history.length - 1], false);
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener("click", openMenu);
    });

    qsa("[data-menu-close]", menu).forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });

    if (backBtn) backBtn.addEventListener("click", goBack);

    qsa("[data-menu-goto]", menu).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var id = btn.getAttribute("data-menu-goto");
        if (id) showLevel(id, true);
      });
    });

    qsa("[data-menu-link]", menu).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !menu.classList.contains("is-open")) return;
      if (history.length > 1) goBack();
      else closeMenu();
    });

    resetLevels();
  }

  /* ---------- Desktop nav: mega + simple ---------- */
  function initDesktopNav() {
    var items = qsa("[data-nav-item]");
    var backdrop = qs("[data-nav-backdrop]");
    if (!items.length) return;

    var closeTimer = null;

    function clearTimer() {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    }

    function closeAll() {
      items.forEach(function (item) {
        item.classList.remove("is-open");
        var trigger = qs("[data-nav-trigger]", item);
        var panel = qs("[data-nav-panel]", item);
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        if (panel) panel.hidden = true;
      });
      if (backdrop) {
        backdrop.hidden = true;
        backdrop.classList.remove("is-visible");
      }
    }

    function openItem(item) {
      closeAll();
      item.classList.add("is-open");
      var trigger = qs("[data-nav-trigger]", item);
      var panel = qs("[data-nav-panel]", item);
      if (trigger) trigger.setAttribute("aria-expanded", "true");
      if (panel) panel.hidden = false;
      if (backdrop && item.getAttribute("data-nav-type") === "mega") {
        backdrop.hidden = false;
        /* force reflow so opacity transition runs */
        void backdrop.offsetWidth;
        backdrop.classList.add("is-visible");
      }
    }

    items.forEach(function (item) {
      var trigger = qs("[data-nav-trigger]", item);
      var panel = qs("[data-nav-panel]", item);
      if (!trigger || !panel) return;

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        if (item.classList.contains("is-open")) closeAll();
        else openItem(item);
      });

      item.addEventListener("mouseenter", function () {
        if (window.matchMedia("(min-width: 990px)").matches) {
          clearTimer();
          openItem(item);
        }
      });

      item.addEventListener("mouseleave", function () {
        if (!window.matchMedia("(min-width: 990px)").matches) return;
        clearTimer();
        closeTimer = setTimeout(closeAll, 180);
      });

      if (item.getAttribute("data-nav-type") === "mega") {
        panel.addEventListener("mouseenter", clearTimer);
        panel.addEventListener("mouseleave", function () {
          clearTimer();
          closeTimer = setTimeout(closeAll, 180);
        });
      }
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeAll);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });

    qsa(".mega-menu a, .simple-menu a").forEach(function (link) {
      link.addEventListener("click", closeAll);
    });
  }

  /* ---------- Search ---------- */
  function initSearch() {
    var modal = qs("[data-search]");
    if (!modal) return;

    var input = qs("[data-search-input]", modal);
    var clearBtn = qs("[data-search-clear]", modal);
    var openers = qsa("[data-search-open]");

    function syncClear() {
      if (!clearBtn || !input) return;
      clearBtn.hidden = !input.value.trim();
    }

    function openSearch(e) {
      if (e) e.preventDefault();
      modal.hidden = false;
      modal.classList.add("is-open");
      document.body.classList.add("modal-open");
      syncClear();
      if (input) setTimeout(function () { input.focus(); }, 40);
    }

    function closeSearch(e) {
      if (e) e.preventDefault();
      modal.classList.remove("is-open");
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      if (openers[0]) openers[0].focus();
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", openSearch);
    });
    qsa("[data-search-close]", modal).forEach(function (btn) {
      btn.addEventListener("click", closeSearch);
    });

    if (clearBtn && input) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        syncClear();
        input.focus();
      });
      input.addEventListener("input", syncClear);
    }

    var form = qs("form", modal);
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        closeSearch();
      });
    }

    qsa(".search-modal__links a, .search-product", modal).forEach(function (link) {
      link.addEventListener("click", closeSearch);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeSearch();
    });
  }

  /* ---------- Cart drawer + AJAX add-to-cart ---------- */
  function initCart() {
    var root =
      (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) ||
      "/";
    var sectionId = "cart-drawer";
    var cartBestSwiper = null;
    var busy = false;

    function getDrawer() {
      return qs("[data-cart]");
    }

    function getSectionEl() {
      return document.getElementById("shopify-section-" + sectionId);
    }

    function openCart(e) {
      if (e) e.preventDefault();
      var drawer = getDrawer();
      if (!drawer) return;
      drawer.hidden = false;
      drawer.classList.add("is-open");
      document.body.classList.add("modal-open");
      if (cartBestSwiper) {
        requestAnimationFrame(function () {
          try {
            cartBestSwiper.update();
          } catch (err) {}
        });
      }
    }

    function closeCart(e) {
      if (e) e.preventDefault();
      var drawer = getDrawer();
      if (!drawer) return;
      drawer.classList.remove("is-open");
      drawer.hidden = true;
      document.body.classList.remove("modal-open");
    }

    function updateHeaderCount(count) {
      qsa(".icon-cart").forEach(function (btn) {
        var badge = qs(".badge", btn);
        if (count > 0) {
          if (!badge) {
            badge = document.createElement("span");
            badge.className = "badge";
            btn.appendChild(badge);
          }
          badge.textContent = String(count);
          badge.hidden = false;
          badge.removeAttribute("hidden");
        } else if (badge) {
          badge.remove();
        }
      });
    }

    function initCartBestSwiper() {
      if (typeof Swiper === "undefined") return;
      var el = qs(".cart-best-swiper");
      if (!el) {
        cartBestSwiper = null;
        return;
      }
      if (cartBestSwiper && typeof cartBestSwiper.destroy === "function") {
        try {
          cartBestSwiper.destroy(true, true);
        } catch (err) {}
        cartBestSwiper = null;
      }
      cartBestSwiper = new Swiper(".cart-best-swiper", {
        slidesPerView: "auto",
        spaceBetween: 12,
        speed: 400,
        grabCursor: true,
        watchOverflow: true,
        navigation: {
          prevEl: ".cart-best-prev",
          nextEl: ".cart-best-next"
        }
      });
    }

    function refreshCart(openAfter) {
      var keepOpen = !!openAfter || !!(getDrawer() && getDrawer().classList.contains("is-open"));
      return fetch(root + "?sections=" + encodeURIComponent(sectionId))
        .then(function (res) {
          if (!res.ok) throw new Error("Cart section fetch failed");
          return res.json();
        })
        .then(function (data) {
          var html = data && data[sectionId];
          var sectionEl = getSectionEl();
          if (!html || !sectionEl) return;
          sectionEl.outerHTML = html;
          initCartBestSwiper();
          if (keepOpen) openCart();
        })
        .catch(function () {
          if (keepOpen) openCart();
        });
    }

    function fetchCart() {
      return fetch(root + "cart.js", {
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("Cart fetch failed");
        return res.json();
      });
    }

    function syncFromCart(cart, openAfter) {
      if (cart && typeof cart.item_count !== "undefined") {
        updateHeaderCount(cart.item_count);
      }
      return refreshCart(openAfter);
    }

    function addFromForm(form) {
      if (busy || !form) return Promise.resolve();
      var idInput = form.querySelector('[name="id"]');
      if (!idInput || !idInput.value) return Promise.resolve();

      busy = true;
      var submitBtn = form.querySelector('[type="submit"], [name="add"]');
      if (submitBtn) submitBtn.setAttribute("aria-busy", "true");

      var formData = new FormData(form);

      return fetch(root + "cart/add.js", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) {
              var msg =
                (data && (data.description || data.message)) ||
                "Unable to add to cart";
              throw new Error(msg);
            }
            return data;
          });
        })
        .then(function () {
          return fetchCart();
        })
        .then(function (cart) {
          return syncFromCart(cart, true);
        })
        .catch(function (err) {
          console.error(err);
        })
        .finally(function () {
          busy = false;
          if (submitBtn) submitBtn.removeAttribute("aria-busy");
        });
    }

    function changeLineQuantity(key, quantity) {
      if (busy || !key) return Promise.resolve();
      busy = true;
      return fetch(root + "cart/change.js", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: key, quantity: quantity })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error((data && data.message) || "Cart update failed");
            return data;
          });
        })
        .then(function (cart) {
          return syncFromCart(cart, true);
        })
        .catch(function (err) {
          console.error(err);
        })
        .finally(function () {
          busy = false;
        });
    }

    function isProductAddForm(form) {
      if (!form || form.tagName !== "FORM") return false;
      if (form.querySelector('button[name="checkout"], input[name="checkout"]')) {
        return false;
      }
      if (!form.querySelector('[name="id"]')) return false;
      var action = (form.getAttribute("action") || "").toLowerCase();
      if (action.indexOf("/cart/add") !== -1) return true;
      if (form.querySelector('button[name="add"], input[name="add"]')) return true;
      if (form.classList.contains("product-card__form")) return true;
      if (form.classList.contains("main-product__form")) return true;
      return false;
    }

    document.addEventListener("click", function (e) {
      var openBtn = e.target.closest("[data-cart-open]");
      if (openBtn) {
        /* Product-card / form add buttons must not only open an empty drawer */
        if (openBtn.closest("form") && openBtn.matches('[type="submit"], [name="add"], .product-card__cart')) {
          return;
        }
        e.preventDefault();
        openCart(e);
        return;
      }

      var closeBtn = e.target.closest("[data-cart-close]");
      if (closeBtn) {
        e.preventDefault();
        closeCart(e);
        return;
      }

      var removeBtn = e.target.closest(".cart-line__remove");
      if (removeBtn) {
        var line = removeBtn.closest(".cart-line[data-key]");
        if (line) {
          e.preventDefault();
          changeLineQuantity(line.getAttribute("data-key"), 0);
          return;
        }
      }

      var qtyMinus = e.target.closest("[data-qty-minus]");
      var qtyPlus = e.target.closest("[data-qty-plus]");
      if (qtyMinus || qtyPlus) {
        var qtyWrap = (qtyMinus || qtyPlus).closest("[data-qty]");
        if (!qtyWrap) return;
        var lineEl = qtyWrap.closest(".cart-line[data-key]");
        var valueEl = qs("[data-qty-value]", qtyWrap);
        if (lineEl) {
          e.preventDefault();
          var current = parseInt(
            (valueEl && (valueEl.value || valueEl.textContent)) || "1",
            10
          ) || 1;
          if (qtyMinus) {
            changeLineQuantity(lineEl.getAttribute("data-key"), Math.max(0, current - 1));
          } else {
            changeLineQuantity(lineEl.getAttribute("data-key"), current + 1);
          }
          return;
        }
        if (valueEl) {
          e.preventDefault();
          var n = parseInt(valueEl.value || valueEl.textContent || "1", 10) || 1;
          n = qtyMinus ? Math.max(1, n - 1) : n + 1;
          if (valueEl.tagName === "INPUT") valueEl.value = String(n);
          else valueEl.textContent = String(n);
        }
      }
    });

    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!isProductAddForm(form)) return;
      e.preventDefault();
      addFromForm(form);
    });

    document.addEventListener("keydown", function (e) {
      var drawer = getDrawer();
      if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) {
        closeCart();
      }
    });

    fetchCart()
      .then(function (cart) {
        if (cart && typeof cart.item_count !== "undefined") {
          updateHeaderCount(cart.item_count);
        }
      })
      .catch(function () {});

    var api = {
      open: openCart,
      close: closeCart,
      refresh: refreshCart,
      addFromForm: addFromForm,
      setCartBestSwiper: function (swiper) {
        cartBestSwiper = swiper;
      }
    };
    window.themeCart = api;
    return api;
  }

  /* ---------- Swiper sliders ---------- */
  function initSwipers(cartApi) {
    if (typeof Swiper === "undefined") return;
    var productsSwiper = null;

    if (qs(".efficacy-swiper")) {
      new Swiper(".efficacy-swiper", {
        slidesPerView: "auto",
        spaceBetween: 12,
        speed: 450,
        grabCursor: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        pagination: {
          el: ".efficacy-pagination",
          clickable: true
        },
        breakpoints: {
          750: {
            spaceBetween: 16
          },
          990: {
            spaceBetween: 20
          }
        }
      });
    }

    if (qs(".products-swiper")) {
      productsSwiper = new Swiper(".products-swiper", {
        slidesPerView: "auto",
        spaceBetween: 12,
        speed: 450,
        grabCursor: true,
        watchOverflow: true,
        pagination: {
          el: ".products-pagination",
          clickable: true
        },
        breakpoints: {
          750: {
            spaceBetween: 14
          },
          990: {
            slidesPerView: 3,
            spaceBetween: 14,
            allowTouchMove: true,
            grabCursor: true
          },
          1200: {
            slidesPerView: 4,
            spaceBetween: 13,
            allowTouchMove: false,
            grabCursor: false
          }
        }
      });
    }

    if (qs(".journal-swiper")) {
      new Swiper(".journal-swiper", {
        slidesPerView: "auto",
        spaceBetween: 10,
        slidesPerGroup: 1,
        speed: 450,
        grabCursor: true,
        simulateTouch: true,
        watchOverflow: false,
        resistanceRatio: 0.65,
        pagination: {
          el: ".journal-pagination",
          clickable: true
        },
        navigation: {
          prevEl: ".journal-prev",
          nextEl: ".journal-next"
        },
        breakpoints: {
          750: {
            slidesPerView: 2,
            spaceBetween: 0
          },
          990: {
            slidesPerView: 3,
            spaceBetween: 0
          },
          1200: {
            slidesPerView: 4,
            spaceBetween: 0
          }
        }
      });
    }

    if (qs(".listen-swiper")) {
      new Swiper(".listen-swiper", {
        slidesPerView: "auto",
        centeredSlides: true,
        spaceBetween: 8,
        speed: 450,
        grabCursor: true,
        watchOverflow: true,
        initialSlide: 1,
        breakpoints: {
          750: {
            centeredSlides: true,
            spaceBetween: 12
          },
          990: {
            slidesPerView: 3,
            centeredSlides: false,
            spaceBetween: 15,
            allowTouchMove: false,
            grabCursor: false,
            initialSlide: 0
          }
        }
      });
    }

    if (qs(".cart-best-swiper")) {
      var cartBest = new Swiper(".cart-best-swiper", {
        slidesPerView: "auto",
        spaceBetween: 12,
        speed: 400,
        grabCursor: true,
        watchOverflow: true,
        navigation: {
          prevEl: ".cart-best-prev",
          nextEl: ".cart-best-next"
        }
      });
      if (cartApi && cartApi.setCartBestSwiper) {
        cartApi.setCartBestSwiper(cartBest);
      }
    }

    return { productsSwiper: productsSwiper };
  }

  /* ---------- Brand text read more ---------- */
  function initBrandText() {
    qsa("[data-brand-text]").forEach(function (section) {
      var btn = qs("[data-read-more]", section);
      if (!btn) return;

      btn.addEventListener("click", function () {
        var expanded = section.classList.toggle("is-expanded");
        btn.setAttribute("aria-expanded", expanded ? "true" : "false");
        btn.textContent = expanded ? "Lire moins" : "Lire plus";
      });
    });
  }

  /* ---------- Carousels / sliders (products, USP) ---------- */
  function initCarousels() {
    function cardLeft(track, card) {
      var trackRect = track.getBoundingClientRect();
      var cardRect = card.getBoundingClientRect();
      return track.scrollLeft + (cardRect.left - trackRect.left);
    }

    function nearestIndex(track, cards) {
      var left = track.scrollLeft;
      var closest = 0;
      var min = Infinity;
      cards.forEach(function (card, i) {
        var dist = Math.abs(cardLeft(track, card) - left);
        if (dist < min) {
          min = dist;
          closest = i;
        }
      });
      return closest;
    }

    function setActiveDot(dotsWrap, index) {
      if (!dotsWrap) return;
      qsa("button", dotsWrap).forEach(function (btn, bi) {
        btn.classList.toggle("is-active", bi === index);
        btn.setAttribute("aria-current", bi === index ? "true" : "false");
      });
    }

    qsa("[data-carousel]").forEach(function (track) {
      var name = track.getAttribute("data-carousel");
      if (!name) return;

      var dotsWrap = qs('[data-dots="' + name + '"]');
      var prevBtn = qs('[data-carousel-prev="' + name + '"]');
      var nextBtn = qs('[data-carousel-next="' + name + '"]');
      var cards = Array.prototype.slice.call(track.children).filter(function (el) {
        return el.nodeType === 1;
      });
      if (!cards.length) return;

      var index = 0;
      var ticking = false;

      function goTo(i, smooth) {
        if (!cards.length) return;
        index = ((i % cards.length) + cards.length) % cards.length;
        var left = cardLeft(track, cards[index]);
        if (typeof track.scrollTo === "function") {
          track.scrollTo({ left: left, behavior: smooth === false ? "auto" : "smooth" });
        } else {
          track.scrollLeft = left;
        }
        setActiveDot(dotsWrap, index);
      }

      function step(dir) {
        // Prefer advancing by ~one viewport when multiple cards are visible
        var amount = Math.max(cards[0].getBoundingClientRect().width, track.clientWidth * 0.85);
        var nextLeft = track.scrollLeft + dir * amount;
        var max = Math.max(0, track.scrollWidth - track.clientWidth);

        if (dir > 0 && track.scrollLeft >= max - 2) {
          goTo(0);
          return;
        }
        if (dir < 0 && track.scrollLeft <= 2) {
          goTo(cards.length - 1);
          return;
        }

        if (typeof track.scrollTo === "function") {
          track.scrollTo({ left: Math.max(0, Math.min(max, nextLeft)), behavior: "smooth" });
        } else {
          track.scrollLeft = Math.max(0, Math.min(max, nextLeft));
        }
      }

      if (dotsWrap) {
        // Ensure one dot per card when counts differ
        var buttons = qsa("button", dotsWrap);
        if (buttons.length !== cards.length) {
          dotsWrap.innerHTML = "";
          cards.forEach(function (_, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.setAttribute("aria-label", "Slide " + (i + 1));
            if (i === 0) b.className = "is-active";
            dotsWrap.appendChild(b);
          });
          buttons = qsa("button", dotsWrap);
        }
        buttons.forEach(function (btn, bi) {
          btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            goTo(bi);
          });
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          step(-1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          step(1);
        });
      }

      track.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          index = nearestIndex(track, cards);
          setActiveDot(dotsWrap, index);
          ticking = false;
        });
      }, { passive: true });

      // Pointer drag (mouse + touch) — only when track can scroll
      var dragging = false;
      var startX = 0;
      var startScroll = 0;
      var moved = false;

      function canScroll() {
        return track.scrollWidth > track.clientWidth + 4;
      }

      track.addEventListener("pointerdown", function (e) {
        if (!canScroll()) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        // Don't steal clicks from buttons/links until user actually drags
        dragging = true;
        moved = false;
        startX = e.clientX;
        startScroll = track.scrollLeft;
        track.classList.add("is-dragging");
        try { track.setPointerCapture(e.pointerId); } catch (err) {}
      });

      track.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 6) moved = true;
        if (moved) {
          track.scrollLeft = startScroll - dx;
        }
      });

      function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        track.classList.remove("is-dragging");
        try { track.releasePointerCapture(e.pointerId); } catch (err) {}
        if (moved) {
          index = nearestIndex(track, cards);
          goTo(index);
        }
      }

      track.addEventListener("pointerup", endDrag);
      track.addEventListener("pointercancel", endDrag);

      track.addEventListener("click", function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      }, true);

      // Initial sync
      setActiveDot(dotsWrap, 0);
    });
  }

  /* ---------- Product filters ---------- */
  function initProductFilters(productsSwiper) {
    var filters = qs(".products__filters");
    var track = qs(".products-swiper");
    if (!filters || !track) return;

    qsa("button", filters).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        qsa("button", filters).forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");

        var filter = btn.getAttribute("data-filter") || "all";
        qsa(".product-card", track).forEach(function (card) {
          var cat = " " + (card.getAttribute("data-category") || "all") + " ";
          var show = filter === "all" || cat.indexOf(" " + filter + " ") !== -1;
          card.style.display = show ? "" : "none";
        });

        if (productsSwiper) {
          productsSwiper.update();
          productsSwiper.slideTo(0);
        }
      });
    });
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    qsa(".newsletter-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = qs('input[type="email"]', form);
        if (!input || !input.value) return;
        var btn = qs('button[type="submit"]', form);
        var original = btn ? btn.textContent : "";
        if (btn) {
          btn.textContent = "MERCI !";
          btn.disabled = true;
        }
        input.value = "";
        setTimeout(function () {
          if (btn) {
            btn.textContent = original;
            btn.disabled = false;
          }
        }, 2200);
      });
    });
  }

  /* ---------- Footer columns (always expanded) ---------- */
  function initFooterAccordion() {
    var cols = qsa(".footer-col");
    if (!cols.length) return;

    function sync() {
      cols.forEach(function (col) {
        col.setAttribute("open", "");
      });
    }

    sync();
    window.addEventListener("resize", sync);
  }

  /* ---------- Smooth in-page anchors ---------- */
  function initAnchors() {
    qsa('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") {
          e.preventDefault();
          return;
        }
        var target = qs(id);
        if (!target) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- Sticky header (mobile) ---------- */
  function initHeaderScroll() {
    var header = qs(".site-header");
    if (!header) return;

    var mq = window.matchMedia("(max-width: 989px)");

    function update() {
      if (!mq.matches) {
        header.classList.remove("is-scrolled");
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(update);
    }
    update();
  }

  /* ---------- Mobile hero video PIP ---------- */
  function initHeroVideo() {
    var pip = qs("[data-hero-video]");
    if (!pip) return;
    /* Always start visible on mobile (Figma 01_Home_Video) */
    if (window.matchMedia("(max-width: 989px)").matches) {
      pip.hidden = false;
      pip.removeAttribute("hidden");
    }
    var closeBtn = qs("[data-hero-video-close]", pip);
    if (!closeBtn) return;
    closeBtn.addEventListener("click", function () {
      pip.hidden = true;
      updateDiagnosticSticky();
    });
  }

  /* ---------- Mobile sticky diagnostic CTA ---------- */
  function updateDiagnosticSticky() {
    var bar = qs("[data-diagnostic-sticky]");
    var hero = qs(".hero");
    var pip = qs("[data-hero-video]");
    if (!bar) return;

    var mq = window.matchMedia("(max-width: 989px)");
    if (!mq.matches) {
      bar.hidden = true;
      return;
    }

    var videoOpen = pip && !pip.hidden;
    if (videoOpen) {
      bar.hidden = false;
      return;
    }

    /* After video is closed, show sticky once the hero product card scrolls away */
    if (!hero) {
      bar.hidden = false;
      return;
    }
    var bottom = hero.getBoundingClientRect().bottom;
    bar.hidden = bottom > window.innerHeight - 8;
  }

  function initDiagnosticSticky() {
    var bar = qs("[data-diagnostic-sticky]");
    if (!bar) return;
    window.addEventListener("scroll", updateDiagnosticSticky, { passive: true });
    window.addEventListener("resize", updateDiagnosticSticky);
    updateDiagnosticSticky();
  }

  function initLocalization() {
    var pickers = qsa("[data-localization-picker]");
    if (!pickers.length) return;

    function closeAll(except) {
      pickers.forEach(function (picker) {
        if (picker === except) return;
        var trigger = qs("[data-localization-trigger]", picker);
        var list = qs("[data-localization-list]", picker);
        if (!trigger || !list) return;
        picker.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        list.hidden = true;
      });
    }

    pickers.forEach(function (picker) {
      if (picker.classList.contains("localization__picker--static")) return;
      var trigger = qs("[data-localization-trigger]", picker);
      var list = qs("[data-localization-list]", picker);
      if (!trigger || !list) return;

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = picker.classList.contains("is-open");
        closeAll();
        if (!open) {
          picker.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
          list.hidden = false;
        }
      });
    });

    document.addEventListener("click", function () {
      closeAll();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
  }

  function init() {
    var cartApi = initCart();
    initMobileMenu();
    initHeaderScroll();
    initHeroVideo();
    initDiagnosticSticky();
    initDesktopNav();
    initSearch();
    initLocalization();
    var swipers = initSwipers(cartApi) || {};
    initCarousels();
    initProductFilters(swipers.productsSwiper);
    initBrandText();
    initNewsletter();
    initFooterAccordion();
    initAnchors();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
