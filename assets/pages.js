(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function initFiltersModal() {
    var modal = qs("[data-filters-modal]");
    if (!modal) return;

    function open() {
      modal.hidden = false;
      document.body.classList.add("nav-open");
      requestAnimationFrame(function () {
        modal.classList.add("is-open");
      });
    }

    function close() {
      modal.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      setTimeout(function () {
        if (!modal.classList.contains("is-open")) {
          modal.hidden = true;
        }
      }, 300);
    }

    qsa("[data-filters-open]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        open();
      });
    });

    qsa("[data-filters-close]", modal).forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        close();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) close();
    });

    if (document.body.hasAttribute("data-filters-autoload")) {
      open();
    }
  }

  function initPdpGallery() {
    /* Scrolling stacked gallery — no thumb swap needed */
  }

  function initPdpReadMore() {
    var btn = qs("[data-pdp-readmore]");
    var desc = qs("[data-pdp-desc]");
    if (btn && desc) {
      btn.addEventListener("click", function () {
        var collapsed = desc.classList.toggle("is-collapsed");
        btn.textContent = collapsed ? "Lire plus" : "Lire moins";
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      });
    }

    qsa("[data-editorial-more]").forEach(function (moreBtn) {
      var section = moreBtn.closest(".pdp-editorial, .collection-editorial");
      if (!section) return;

      moreBtn.addEventListener("click", function () {
        var expanded = section.classList.toggle("is-expanded");
        moreBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
        moreBtn.textContent = expanded ? "Lire moins" : "Lire plus";
      });
    });
  }

  function initPdpChips() {
    qsa("[data-pdp-chips], [data-pdp-qty]").forEach(function (group) {
      qsa(".pdp-chip", group).forEach(function (chip) {
        chip.addEventListener("click", function () {
          qsa(".pdp-chip", group).forEach(function (c) {
            c.classList.toggle("is-active", c === chip);
          });
        });
      });
    });
  }

  function initPdpVariantDropdown() {
    var wraps = qsa("[data-pdp-variant]");
    if (!wraps.length) return;

    function closeAll(except) {
      wraps.forEach(function (wrap) {
        if (wrap === except) return;
        var trigger = qs("[data-pdp-variant-trigger]", wrap);
        var menu = qs(".pdp-variant__menu", wrap);
        if (!trigger || !menu) return;
        trigger.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      });
    }

    wraps.forEach(function (wrap) {
      var trigger = qs("[data-pdp-variant-trigger]", wrap);
      var menu = qs(".pdp-variant__menu", wrap);
      var label = qs("[data-pdp-variant-label]", wrap);
      var thumb = qs("[data-pdp-variant-thumb]", wrap);
      var countEl = qs("[data-pdp-variant-count]", wrap);
      if (!trigger || !menu) return;

      var options = qsa('[role="option"]', menu);

      function open() {
        closeAll(wrap);
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
      }

      function close() {
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      }

      function selectOption(option) {
        var value = option.getAttribute("data-value") || option.textContent.trim();
        var img = qs("img", option);
        options.forEach(function (opt) {
          opt.classList.toggle("is-selected", opt === option);
          opt.setAttribute("aria-selected", opt === option ? "true" : "false");
        });
        if (label) label.textContent = value;
        if (thumb && img) thumb.src = img.src;
        if (countEl) {
          var remaining = Math.max(0, options.length - 1);
          countEl.textContent = remaining > 0 ? "+" + remaining + " variantes" : "";
        }
        close();
      }

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (trigger.getAttribute("aria-expanded") === "true") close();
        else open();
      });

      options.forEach(function (option) {
        option.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          selectOption(option);
        });
      });
    });

    document.addEventListener("click", function () {
      closeAll();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
  }

  function initPdpProductTabs() {
    var tabs = qs("[data-pdp-tabs]");
    if (!tabs) return;
    var buttons = qsa("[data-tab]", tabs);
    var panels = qsa("[data-tab-panel]");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-tab");
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(function (panel) {
          var on = panel.getAttribute("data-tab-panel") === id;
          panel.classList.toggle("is-active", on);
          panel.hidden = !on;
        });
      });
    });
  }

  function initCardCartButtons() {
    qsa(".product-card__cart").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  function initCollectionStickyBar() {
    var bar = qs("[data-collection-sticky]");
    var sentinel = qs("[data-collection-sticky-sentinel]");
    if (!bar || !sentinel) return;

    var header = qs(".site-header");
    var chipsTrack = qs("[data-collection-chips]", bar);
    var prevBtn = qs(".collection-sticky__fade--prev", bar);
    var nextBtn = qs(".collection-sticky__fade--next", bar) || qs(".collection-sticky__fade", bar);
    var chips = qsa(".collection-chip", bar);
    var sections = qsa("[data-collection-section]");
    var ticking = false;

    function headerOffset() {
      return header ? header.getBoundingClientRect().height : 62;
    }

    function syncTop() {
      document.documentElement.style.setProperty(
        "--collection-sticky-top",
        headerOffset() + "px"
      );
    }

    function syncFadeArrows() {
      if (!chipsTrack) return;
      var maxScroll = chipsTrack.scrollWidth - chipsTrack.clientWidth;
      var canScroll = maxScroll > 4;
      var atStart = chipsTrack.scrollLeft <= 4;
      var atEnd = chipsTrack.scrollLeft >= maxScroll - 4;

      if (prevBtn) prevBtn.hidden = !canScroll || atStart;
      if (nextBtn) nextBtn.hidden = !canScroll || atEnd;
    }

    function scrollChips(dir) {
      if (!chipsTrack) return;
      var step = Math.max(160, Math.round(chipsTrack.clientWidth * 0.6));
      chipsTrack.scrollBy({ left: dir * step, behavior: "smooth" });
    }

    function update() {
      syncTop();
      var show = sentinel.getBoundingClientRect().top <= headerOffset() + 4;
      bar.hidden = !show;
      bar.classList.toggle("is-visible", show);

      if (!show || !sections.length) {
        syncFadeArrows();
        return;
      }
      var activeId = sections[0].id;
      var probe = headerOffset() + 72;
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= probe) activeId = section.id;
      });
      chips.forEach(function (chip) {
        var href = chip.getAttribute("href") || "";
        chip.classList.toggle("is-active", href === "#" + activeId);
      });
      syncFadeArrows();
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.toggle("is-active", c === chip);
        });
      });
    });

    if (chipsTrack) {
      if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
          e.preventDefault();
          scrollChips(-1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
          e.preventDefault();
          scrollChips(1);
        });
      }
      chipsTrack.addEventListener("scroll", syncFadeArrows, { passive: true });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      syncTop();
      syncFadeArrows();
    });
    update();
  }

  function initCollectionSort() {
    var wraps = qsa("[data-collection-sort]");
    if (!wraps.length) return;

    function closeAll(except) {
      wraps.forEach(function (wrap) {
        if (wrap === except) return;
        var trigger = qs("[data-collection-sort-trigger]", wrap);
        var menu = qs(".collection-sort__menu", wrap);
        if (!trigger || !menu) return;
        trigger.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      });
    }

    wraps.forEach(function (wrap) {
      var trigger = qs("[data-collection-sort-trigger]", wrap);
      var menu = qs(".collection-sort__menu", wrap);
      var label = qs("[data-collection-sort-label]", wrap);
      if (!trigger || !menu) return;

      var options = qsa('[role="option"]', menu);

      function open() {
        closeAll(wrap);
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
      }

      function close() {
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      }

      function selectOption(option) {
        var value = option.textContent.trim();
        options.forEach(function (opt) {
          var on = opt === option;
          opt.classList.toggle("is-selected", on);
          opt.setAttribute("aria-selected", on ? "true" : "false");
        });
        if (label) label.textContent = value;
        /* Keep other sort dropdowns in sync */
        wraps.forEach(function (other) {
          if (other === wrap) return;
          var otherLabel = qs("[data-collection-sort-label]", other);
          var otherOptions = qsa('[role="option"]', other);
          var dataValue = option.getAttribute("data-value");
          if (otherLabel) otherLabel.textContent = value;
          otherOptions.forEach(function (opt) {
            var on = opt.getAttribute("data-value") === dataValue;
            opt.classList.toggle("is-selected", on);
            opt.setAttribute("aria-selected", on ? "true" : "false");
          });
        });
        close();
      }

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (trigger.getAttribute("aria-expanded") === "true") close();
        else open();
      });

      options.forEach(function (option) {
        option.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          selectOption(option);
        });
      });
    });

    document.addEventListener("click", function () {
      closeAll();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFiltersModal();
    initPdpGallery();
    initPdpReadMore();
    initPdpChips();
    initPdpVariantDropdown();
    initPdpProductTabs();
    initCardCartButtons();
    initCollectionStickyBar();
    initCollectionSort();
  });
})();
