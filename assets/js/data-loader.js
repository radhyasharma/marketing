/* ============================================================
   DATA LOADER — Renders pricing & blog content from JSON files
   so site previews on raw.githack.com without a PHP server.
   On a real PHP host, the same JSON files are written by /admin.
   ============================================================ */

(function () {
  // Resolve data dir relative to current page
  const dataBase = document.documentElement.dataset.dataBase || 'data';

  // ============ PRICING ============
  const pricingRoot = document.getElementById('pricing-root');
  if (pricingRoot) {
    fetch(`${dataBase}/pricing.json?_=${Date.now()}`)
      .then(r => r.json())
      .then(data => renderPricing(pricingRoot, data))
      .catch(err => {
        pricingRoot.innerHTML = `<p style="text-align:center;color:var(--text-mute)">Pricing temporarily unavailable.</p>`;
        console.error(err);
      });
  }

  function renderPricing(root, data) {
    const symbol = data.currency_symbol || '₹';
    const cats = data.categories || [];

    const tabsHtml = `
      <div class="pricing-tabs reveal">
        ${cats.map((c, i) => `
          <button class="pricing-tab ${i === 0 ? 'active' : ''}" data-tab="${c.id}">${c.name}</button>
        `).join('')}
      </div>
    `;

    const tablesHtml = cats.map((cat, i) => `
      <div class="pricing-panel reveal" data-panel="${cat.id}" ${i === 0 ? '' : 'hidden'}>
        <div class="pricing-table">
          <div class="pricing-row head">
            <div>Item</div>
            <div>Dry Clean</div>
            <div>Wash &amp; Iron</div>
            <div>Iron Only</div>
          </div>
          ${cat.items.map(item => `
            <div class="pricing-row">
              <div class="item-name">${item.name}</div>
              <div class="price ${item.dry_clean == null ? 'na' : ''}">${fmt(item.dry_clean, symbol)}</div>
              <div class="price ${item.wash_iron == null ? 'na' : ''}">${fmt(item.wash_iron, symbol)}</div>
              <div class="price ${item.iron_only == null ? 'na' : ''}">${fmt(item.iron_only, symbol)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    const note = data.note ? `<p class="pricing-note reveal">${escapeHtml(data.note)}</p>` : '';

    root.innerHTML = tabsHtml + tablesHtml + note;

    // Tabs interactivity
    root.querySelectorAll('.pricing-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.tab;
        root.querySelectorAll('.pricing-tab').forEach(b => b.classList.toggle('active', b === btn));
        root.querySelectorAll('.pricing-panel').forEach(p => {
          p.hidden = p.dataset.panel !== id;
        });
      });
    });

    // Re-trigger reveal observer
    triggerReveal(root);
  }

  function fmt(value, symbol) {
    if (value == null) return '—';
    return `<small>${symbol}</small>${value}`;
  }

  // ============ BLOG LIST ============
  const blogRoot = document.getElementById('blog-root');
  if (blogRoot) {
    fetch(`${dataBase}/blogs.json?_=${Date.now()}`)
      .then(r => r.json())
      .then(data => renderBlogList(blogRoot, data.posts || []))
      .catch(err => {
        blogRoot.innerHTML = `<p style="text-align:center;color:var(--text-mute)">Blog temporarily unavailable.</p>`;
        console.error(err);
      });
  }

  function renderBlogList(root, posts) {
    if (!posts.length) {
      root.innerHTML = `<p style="text-align:center;color:var(--text-mute)">No posts yet.</p>`;
      return;
    }
    // Sort newest first
    posts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

    root.innerHTML = `
      <div class="blog-grid reveal-stagger">
        ${posts.map(p => `
          <a href="post.html?slug=${encodeURIComponent(p.slug)}" class="blog-card">
            <div class="blog-card-img">
              ${p.cover ? `<img src="${escapeAttr(p.cover)}" alt="${escapeAttr(p.title)}" loading="lazy">` : ''}
            </div>
            <div class="blog-card-body">
              <div class="blog-meta">
                <span>${formatDate(p.date)}</span>
                ${p.author ? `<span class="dot">&bull;</span><span>${escapeHtml(p.author)}</span>` : ''}
              </div>
              <h3>${escapeHtml(p.title)}</h3>
              <p>${escapeHtml(p.excerpt || '')}</p>
              <div class="read-more">Read article →</div>
            </div>
          </a>
        `).join('')}
      </div>
    `;
    triggerReveal(root);
  }

  // ============ BLOG SINGLE ============
  const postRoot = document.getElementById('post-root');
  if (postRoot) {
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    fetch(`${dataBase}/blogs.json?_=${Date.now()}`)
      .then(r => r.json())
      .then(data => {
        const post = (data.posts || []).find(p => p.slug === slug);
        if (!post) {
          postRoot.innerHTML = `
            <div class="page-hero">
              <div class="container">
                <h1>Post not found</h1>
                <p class="lead" style="margin: 1rem auto 0">This article may have moved. <a href="blog.html" style="color:var(--gold)">Back to blog</a>.</p>
              </div>
            </div>`;
          document.title = 'Post not found — LS Dry Cleaners';
          return;
        }
        renderPost(postRoot, post);
      })
      .catch(err => {
        postRoot.innerHTML = `<p style="text-align:center;color:var(--text-mute);padding:120px 24px">Article temporarily unavailable.</p>`;
        console.error(err);
      });
  }

  function renderPost(root, post) {
    document.title = `${post.title} — LS Dry Cleaners`;
    const tags = (post.tags || []).map(t => `<span style="color:var(--gold);margin-right:8px">#${escapeHtml(t)}</span>`).join('');

    root.innerHTML = `
      <div class="post-hero">
        <div class="container">
          <div class="breadcrumb"><a href="blog.html">Journal</a><span class="sep">/</span> Article</div>
          <h1>${escapeHtml(post.title)}</h1>
          <div class="blog-meta">
            <span>${formatDate(post.date)}</span>
            ${post.author ? `<span class="dot">&bull;</span><span>${escapeHtml(post.author)}</span>` : ''}
          </div>
        </div>
      </div>
      ${post.cover ? `<div class="post-cover"><img src="${escapeAttr(post.cover)}" alt="${escapeAttr(post.title)}"></div>` : ''}
      <article class="post-content">
        ${post.content || ''}
        ${tags ? `<p style="margin-top:48px;padding-top:24px;border-top:1px solid var(--border);font-size:.85rem">${tags}</p>` : ''}
        <p style="margin-top:32px"><a href="blog.html" style="color:var(--gold)">← Back to all articles</a></p>
      </article>
    `;
  }

  // ============ Helpers ============
  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }
  function escapeAttr(s = '') {
    return escapeHtml(s);
  }
  function formatDate(s) {
    if (!s) return '';
    try {
      const d = new Date(s);
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return s; }
  }
  function triggerReveal(root) {
    if (!('IntersectionObserver' in window)) {
      root.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('in'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    root.querySelectorAll('.reveal, .reveal-stagger').forEach(el => obs.observe(el));
  }
})();
