(() => {
  const C = window.VDI_CONFIG;
  const page = document.body.dataset.page || "";
  const headerRoot = document.querySelector("#site-header");
  const footerRoot = document.querySelector("#site-footer");
  const mobileRoot = document.querySelector("#mobile-cta");

  if (headerRoot) {
    headerRoot.innerHTML = `
      <header class="site-header">
        <div class="nav-wrap">
          <div class="shell nav-inner">
            <a class="brand" href="index.html" aria-label="${C.company} home">
              <img src="assets/vishnu-logo-small.png" width="58" height="58" alt="Vishnu Developers and Infrastructure emblem">
              <span><strong>Vishnu</strong><small>Developers & Infrastructure</small></span>
            </a>
            <button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span><span></span><b class="sr-only">Open navigation</b></button>
            <nav id="primary-nav" aria-label="Primary navigation">${C.nav.map(([label, href, key]) => `<a href="${href}"${key === page ? ` class="active" aria-current="page"` : ""}>${label}</a>`).join("")}</nav>
            <div class="nav-actions"><a class="btn btn-line" href="${C.brochure}" target="_blank">Brochure</a><a class="btn btn-gold" href="contact.html#visit">Schedule Visit</a></div>
          </div>
        </div>
      </header>`;
  }

  if (footerRoot) {
    footerRoot.innerHTML = `
      <footer class="footer">
        <div class="shell footer-grid">
          <div class="footer-brand">
            <a class="brand brand-light" href="index.html"><img src="assets/vishnu-logo-small.png" width="58" height="58" alt=""><span><strong>Vishnu</strong><small>Developers & Infrastructure</small></span></a>
            <p>Thoughtfully planned residential spaces shaped by quality, functionality and long-term value.</p>
            <em>We Nurture Your Dreams</em>
          </div>
          <div><h3>Quick Links</h3><a href="index.html">Home</a><a href="about.html">About Us</a><a href="team.html">Team</a><a href="contact.html">Contact Us</a></div>
          <div><h3>Vishnu City</h3><a href="vishnu-city.html">Project Overview</a><a href="residences.html">Residences</a><a href="floor-plans.html">Floor Plans</a><a href="vishnu-city.html#amenities">Amenities</a><a href="gallery.html">Gallery</a></div>
          <div><h3>Contact</h3>${C.phones.map(p => `<a href="tel:${p}">${p}</a>`).join("")}<span>${C.email}</span><span>${C.address}</span><a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div>
        </div>
        <div class="shell footer-bottom"><p>${C.disclaimer}</p><div><a href="terms.html">Terms & Conditions</a><a href="privacy-policy.html">Privacy Policy</a><span>© ${new Date().getFullYear()} ${C.company}</span></div></div>
      </footer>`;
  }

  if (mobileRoot) mobileRoot.innerHTML = `<div class="mobile-cta"><a href="tel:${C.phones[0]}">Call</a><a href="https://wa.me/${C.whatsapp}">WhatsApp</a><a class="main" href="contact.html#visit">Book Visit</a></div>`;

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); toggle?.setAttribute("aria-expanded", "false");
  }));
  window.addEventListener("scroll", () => document.body.classList.toggle("scrolled", scrollY > 24), {passive:true});

  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function revealTarget(el) {
    el.classList.add("visible");
    el.querySelectorAll("[data-count]").forEach(animateCounter);
  }

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { revealTarget(e.target); observer.unobserve(e.target); }
    }), {threshold:.12});
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(revealTarget);

  document.querySelectorAll("[data-count]").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) animateCounter(el);
  });

  const dialog = document.querySelector("#lightbox");
  let previousFocus;
  function openModal(src, title, text = "") {
    if (!dialog) return;
    previousFocus = document.activeElement;
    dialog.querySelector("img").hidden = !src;
    if (src) dialog.querySelector("img").src = src;
    dialog.querySelector("[data-modal-title]").textContent = title;
    dialog.querySelector("[data-modal-copy]").textContent = text;
    dialog.showModal();
    dialog.querySelector(".modal-close").focus();
  }
  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-modal-image], [data-profile]");
    if (!trigger) return;
    openModal(trigger.dataset.modalImage || "", trigger.dataset.modalTitle || trigger.dataset.profile || "Details", trigger.dataset.modalCopy || "");
  });
  dialog?.querySelector(".modal-close")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
  dialog?.addEventListener("keydown", e => {
    if (e.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll("button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])")].filter(el => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  dialog?.addEventListener("close", () => previousFocus?.focus());

  const planButtons = document.querySelectorAll("[data-plan]");
  const planPanel = document.querySelector("#plan-panel");
  function showPlan(key) {
    const p = C.plans[key]; if (!p || !planPanel) return;
    planButtons.forEach(b => { const active = b.dataset.plan === key; b.classList.toggle("active", active); b.setAttribute("aria-selected", active); });
    planPanel.innerHTML = `<div class="plan-visual">${p.image ? `<img src="${p.image}" alt="${p.title} floor plan">` : `<div class="asset-placeholder"><span>Verified drawing pending</span></div>`}</div><div class="plan-copy"><span class="eyebrow">Residence plan</span><h3>${p.title}</h3><strong>${p.area}</strong><p>${p.description}</p>${p.image ? `<button class="btn btn-gold" data-modal-image="${p.image}" data-modal-title="${p.title}" data-modal-copy="${p.area}">Zoom plan</button>` : ""}<a class="text-link" href="contact.html#visit">Enquire about this residence →</a></div>`;
  }
  planButtons.forEach(b => b.addEventListener("click", () => showPlan(b.dataset.plan)));
  if (planButtons.length) showPlan(planButtons[0].dataset.plan);

  document.querySelectorAll(".faq button").forEach(btn => btn.addEventListener("click", () => {
    const item = btn.parentElement; const open = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  }));

  document.querySelectorAll(".lead-form").forEach(form => form.addEventListener("submit", e => {
    e.preventDefault();
    const status = form.querySelector(".form-status");
    if (!form.checkValidity()) { form.reportValidity(); status.textContent = "Please complete the required fields."; return; }
    const date = form.querySelector('[name="date"]');
    if (date?.value && new Date(date.value + "T00:00:00") < new Date(new Date().toDateString())) { status.textContent = "Please select a future date."; date.focus(); return; }
    status.textContent = C.formEndpoint ? "Sending your request…" : `Your details are ready. Online submission is not connected yet—please call ${C.phones[0]} to confirm your visit.`;
  }));

  const loader = document.querySelector(".loader");
  if (loader) {
    const bar = loader.querySelector("i"), count = loader.querySelector("b");
    requestAnimationFrame(() => { bar.style.width = "100%"; count.textContent = "100%"; });
    addEventListener("load", () => setTimeout(() => loader.classList.add("done"), 180), {once:true});
    setTimeout(() => loader.classList.add("done"), 900);
  }
})();
