// @ts-nocheck
(() => {
  const $ = id => document.getElementById(id);
  const KEY = 'pfgen.clients';
  const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

  // Predefined Skills Data
  const SKILLS_DATA = {
    "Technical": ["HTML/CSS", "JavaScript", "React", "Python", "Java", "SQL", "AutoCAD", "Surveying", "Irrigation Systems", "Soil Testing"],
    "Design": ["Figma", "Photoshop", "Illustrator", "UI/UX Design", "Video Editing"],
    "Soft Skills": ["Leadership", "Communication", "Teamwork", "Problem Solving", "Time Management"],
    "Languages": ["Kinyarwanda", "English", "French", "Swahili"]
  };

  const blank = () => ({
    personal: { fullName:'', headline:'', photo:'', email:'', phone:'', location:'', social:{ linkedin:'', github:'', website:'' } },
    about:'', skills:[], projects:[], experience:[], education:[], certifications:[], languages:[], references:[], hobbies:[]
  });

  const Store = {
    all() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
    list() { return Object.values(Store.all()).sort((a,b) => b.updatedAt - a.updatedAt); },
    get(id) { return Store.all()[id]; },
    create(name) {
      const all = Store.all(); const id = uid();
      all[id] = { id, name: name || 'Untitled', theme:'modern', createdAt: Date.now(), updatedAt: Date.now(), data: blank() };
      localStorage.setItem(KEY, JSON.stringify(all)); return all[id];
    },
    save(c) { const all = Store.all(); c.updatedAt = Date.now(); all[c.id] = c; localStorage.setItem(KEY, JSON.stringify(all)); },
    remove(id) { const all = Store.all(); delete all[id]; localStorage.setItem(KEY, JSON.stringify(all)); }
  };

  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function portfolioHtml(c) {
    const d = c.data, p = d.personal, out = [];
    out.push(`<div class="pf">`);
    out.push(`<header class="pf-hero">`);
    if (p.photo) out.push(`<img class="pf-photo" src="${p.photo}" alt="">`);
    out.push(`<h1>${esc(p.fullName||'Your Name')}</h1>`);
    if (p.headline) out.push(`<div style="font-size:16px; color:#2563eb; font-weight:600;">${esc(p.headline)}</div>`);
    out.push(`</header>`);
    if (d.about) out.push(`<section class="pf-section"><h2>About</h2><p>${esc(d.about).replace(/\n/g,'<br>')}</p></section>`);
    
    if (d.skills.length) {
      out.push(`<section class="pf-section"><h2>Skills</h2>`);
      d.skills.forEach(g => {
        if (g.items.length) {
          out.push(`<div style="margin-bottom:10px;"><strong>${esc(g.category)}:</strong> ${g.items.map(esc).join(', ')}</div>`);
        }
      });
      out.push(`</section>`);
    }

    if (d.projects.length) {
      out.push(`<section class="pf-section"><h2>Projects</h2><div class="pf-projects">`);
      d.projects.forEach(pr => {
        out.push(`<div class="pf-project">`);
        if (pr.image && pr.image.startsWith('data:image')) out.push(`<img src="${pr.image}" alt="">`);
        out.push(`<div class="body"><h3>${esc(pr.title)}</h3>`);
        if (pr.description) out.push(`<p>${esc(pr.description)}</p>`);
        if (pr.fileName && pr.fileData) {
          out.push(`<p style="margin-top:10px;"><a href="${pr.fileData}" download="${pr.fileName}" style="color:#2563eb; font-weight:bold;">📄 Download Attachment (${pr.fileName})</a></p>`);
        }
        if (pr.link) out.push(`<p style="margin-top:10px"><a href="${esc(pr.link)}" style="color:#2563eb;">View Project →</a></p>`);
        out.push(`</div></div>`);
      });
      out.push(`</div></section>`);
    }
    
    // Simplifying experience/education for this example
    out.push(`</div>`);
    return out.join('');
  }

  async function fullDoc(c) {
    let css = '';
    try { css = await (await fetch('style.css')).text(); } catch {}
    const title = c.data.personal.fullName || 'Portfolio';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${css}</style></head><body style="background:#fff; margin:0;">${portfolioHtml(c)}</body></html>`;
  }

  // ---------- EXPORT ----------
  async function download(name, content, mime) {
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([content], name, { type: mime });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: name });
          return;
        }
      } catch (err) {}
    }
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) throw new Error('Popup blocked');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) { alert("Download failed."); }
  }

  const safe = s => String(s||'portfolio').replace(/[^\w\-]+/g,'_').slice(0,60);
  let current = null, saveTimer = null;
  const show = id => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); window.scrollTo(0,0); };

  function refreshList() {
    const list = Store.list();
    const el = $('client-list'); el.innerHTML = '';
    $('empty-note').style.display = list.length ? 'none' : 'block';
    list.forEach(c => {
      const div = document.createElement('div'); div.className = 'card';
      div.style.padding = '14px'; div.style.display = 'flex'; div.style.justifyContent = 'space-between'; div.style.alignItems = 'center';
      const left = document.createElement('div');
      const name = document.createElement('div'); name.style.fontWeight = 'bold'; name.textContent = c.name;
      const sub = document.createElement('div'); sub.className = 'muted'; sub.textContent = c.data.personal.headline || new Date(c.updatedAt).toLocaleDateString();
      left.appendChild(name); left.appendChild(sub);
      const del = document.createElement('button'); del.className='icon-btn'; del.style.color = '#ef4444'; del.style.borderColor = '#ef4444'; del.textContent = '✕';
      del.addEventListener('click', e => { e.stopPropagation(); if (confirm('Delete client?')) { Store.remove(c.id); refreshList(); } });
      div.appendChild(left); div.appendChild(del);
      div.addEventListener('click', () => openClient(c.id));
      el.appendChild(div);
    });
  }

  function openClient(id) {
    current = Store.get(id); if (!current) return;
    $('edit-title').textContent = current.name;
    renderForm(); switchTab('form'); show('screen-edit');
  }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    $('tab-form').hidden = name !== 'form'; $('tab-preview').hidden = name !== 'preview';
    if (name === 'preview') refreshPreview();
  }

  async function refreshPreview() { if (current) $('tab-preview').srcdoc = await fullDoc(current); }
  function autoSave() { if (!current) return; clearTimeout(saveTimer); saveTimer = setTimeout(() => Store.save(current), 500); }

  const sectionTitle = t => { const h = document.createElement('div'); h.style.fontSize = '15px'; h.style.fontWeight = '700'; h.style.margin = '22px 0 8px'; h.style.borderBottom = '1px solid var(--border-color)'; h.style.paddingBottom = '4px'; h.textContent = t; return h; };
  function field(label, value, onChange, opts={}) {
    const wrap = document.createElement('div');
    const l = document.createElement('label'); l.className='lbl'; l.textContent = label;
    const i = document.createElement(opts.area ? 'textarea' : 'input');
    if (!opts.area) i.type = opts.type || 'text';
    i.value = value || ''; i.placeholder = opts.placeholder || '';
    i.addEventListener('input', () => onChange(i.value));
    wrap.appendChild(l); wrap.appendChild(i); return wrap;
  }
  function card(children, onRemove) {
    const c = document.createElement('div'); c.className = 'card'; c.style.background = 'rgba(0,0,0,0.1)';
    children.forEach(x => c.appendChild(x));
    if (onRemove) { const b = document.createElement('button'); b.className='ghost'; b.style.color = '#ef4444'; b.style.borderColor = '#ef4444'; b.style.marginTop = '10px'; b.style.fontSize='12px'; b.textContent='Remove'; b.addEventListener('click', onRemove); c.appendChild(b); }
    return c;
  }
  function addBtn(label, onClick) { const b = document.createElement('button'); b.className='ghost'; b.style.width = '100%'; b.style.marginTop='10px'; b.textContent = label; b.addEventListener('click', onClick); return b; }

  function renderForm() {
    const d = current.data, root = $('tab-form'); root.innerHTML = '';
    
    // PERSONAL
    root.appendChild(sectionTitle('Personal'));
    root.appendChild(field('Full name', d.personal.fullName, v => { d.personal.fullName = v; autoSave(); }));
    root.appendChild(field('Headline', d.personal.headline, v => { d.personal.headline = v; autoSave(); }));
    root.appendChild(field('Email', d.personal.email, v => { d.personal.email = v; autoSave(); }));
    root.appendChild(field('Phone', d.personal.phone, v => { d.personal.phone = v; autoSave(); }));
    root.appendChild(field('Location', d.personal.location, v => { d.personal.location = v; autoSave(); }));

    // PHOTO
    root.appendChild(sectionTitle('Photo'));
    const pWrap = document.createElement('div');
    const pIn = document.createElement('input'); pIn.type = 'file'; pIn.accept = 'image/*';
    pIn.addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = () => { d.personal.photo = r.result; autoSave(); renderForm(); }; r.readAsDataURL(f);
    });
    pWrap.appendChild(pIn);
    if (d.personal.photo) {
      const img = document.createElement('img'); img.src = d.personal.photo; img.style.cssText = 'width:80px;height:80px;border-radius:50%;object-fit:cover;margin-top:8px';
      pWrap.appendChild(img);
      const rm = document.createElement('button'); rm.className='ghost'; rm.style.color = '#ef4444'; rm.textContent='Remove photo';
      rm.addEventListener('click', () => { d.personal.photo=''; autoSave(); renderForm(); }); pWrap.appendChild(rm);
    }
    root.appendChild(pWrap);

    // SKILLS
    root.appendChild(sectionTitle('Skills'));
    d.skills.forEach((g, i) => {
      const container = document.createElement('div');
      const catTitle = document.createElement('div'); catTitle.className = 'skill-cat-title'; catTitle.textContent = g.category; 
      container.appendChild(catTitle);
      
      const tagsDiv = document.createElement('div'); tagsDiv.className = 'skill-tags';
      
      // Predefined tags
      const predefined = SKILLS_DATA[g.category] || [];
      predefined.forEach(skill => {
        const tag = document.createElement('div'); tag.className = 'skill-tag'; tag.textContent = skill;
        if (g.items.includes(skill)) tag.classList.add('selected');
        tag.addEventListener('click', () => {
          if (g.items.includes(skill)) g.items = g.items.filter(x => x !== skill);
          else g.items.push(skill);
          autoSave(); renderForm();
        });
        tagsDiv.appendChild(tag);
      });
      
      // Custom tags (already added but not in predefined)
      g.items.forEach(skill => {
        if (!predefined.includes(skill)) {
          const tag = document.createElement('div'); tag.className = 'skill-tag selected'; tag.textContent = skill + ' ✕';
          tag.addEventListener('click', () => { g.items = g.items.filter(x => x !== skill); autoSave(); renderForm(); });
          tagsDiv.appendChild(tag);
        }
      });
      
      container.appendChild(tagsDiv);
      root.appendChild(container);
    });
    
    // Add custom skill
    const customWrap = document.createElement('div'); customWrap.style.display = 'flex'; customWrap.style.gap = '5px'; customWrap.style.marginTop = '10px';
    const cSelect = document.createElement('select'); cSelect.style.flex = '1';
    Object.keys(SKILLS_DATA).forEach(cat => { const o = document.createElement('option'); o.value = cat; o.textContent = cat; cSelect.appendChild(o); });
    const cInput = document.createElement('input'); cInput.type = 'text'; cInput.placeholder = 'add skill...'; cInput.style.flex = '2';
    const cBtn = document.createElement('button'); cBtn.className = 'primary'; cBtn.textContent = '+'; cBtn.style.padding = '0 15px';
    cBtn.addEventListener('click', () => {
      const cat = cSelect.value; const val = cInput.value.trim();
      if (!val) return;
      let group = d.skills.find(g => g.category === cat);
      if (!group) { group = { category: cat, items: [] }; d.skills.push(group); }
      if (!group.items.includes(val)) group.items.push(val);
      autoSave(); renderForm();
    });
    customWrap.appendChild(cSelect); customWrap.appendChild(cInput); customWrap.appendChild(cBtn);
    root.appendChild(customWrap);

    // PROJECTS
    root.appendChild(sectionTitle('Projects'));
    d.projects.forEach((p, i) => {
      root.appendChild(card([
        field('Title', p.title, v => { p.title = v; autoSave(); }),
        field('Description', p.description, v => { p.description = v; autoSave(); }, { area:true }),
        field('Link (URL)', p.link, v => { p.link = v; autoSave(); }),
        
        // File Upload UI
        (() => {
          const w = document.createElement('div');
          const l = document.createElement('label'); l.className='lbl'; l.textContent = 'Image or File (PDF/Doc)';
          const fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/*,application/pdf,.doc,.docx,.txt';
          fileIn.addEventListener('change', e => {
            const f = e.target.files[0]; if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              if (f.type.startsWith('image/')) { p.image = r.result; p.fileData = null; p.fileName = null; }
              else { p.fileData = r.result; p.fileName = f.name; p.image = null; }
              autoSave(); renderForm();
            };
            r.readAsDataURL(f);
          });
          w.appendChild(l); w.appendChild(fileIn);
          if (p.image) { const img = document.createElement('img'); img.src = p.image; img.style.cssText = 'width:100px;margin-top:8px;border-radius:8px'; w.appendChild(img); }
          if (p.fileName) { const note = document.createElement('div'); note.textContent = '📄 ' + p.fileName; note.style.marginTop = '8px'; note.style.color = 'var(--btn-primary)'; w.appendChild(note); }
          return w;
        })()
      ], () => { d.projects.splice(i,1); autoSave(); renderForm(); }));
    });
    root.appendChild(addBtn('+ Project', () => { d.projects.push({ title:'', description:'', link:'', image:'', fileData:null, fileName:null }); autoSave(); renderForm(); }));
  }

  // THEME
  const btnTheme = $('btn-theme');
  function applyTheme(isLight) { document.body.classList.toggle('light', isLight); btnTheme.textContent = isLight ? '🌙' : '☀️'; }
  applyTheme(localStorage.getItem('pfgen_lightMode') === 'true');
  btnTheme.addEventListener('click', () => { const isLight = !document.body.classList.contains('light'); applyTheme(isLight); localStorage.setItem('pfgen_lightMode', isLight); });

  // EVENTS
  $('new-client').addEventListener('click', () => { const name = prompt('Name:'); if (name === null) return; openClient(Store.create(name.trim() || 'Untitled').id); });
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  document.querySelectorAll('[data-home]').forEach(b => b.addEventListener('click', () => { if (current) Store.save(current); refreshList(); show('screen-home'); }));
  $('btn-save').addEventListener('click', () => { if (current) { Store.save(current); alert('Saved.'); } });
  
  $('btn-html').addEventListener('click', async () => { if (!current) return; Store.save(current); download(safe(current.data.personal.fullName)+'_portfolio.html', await fullDoc(current), 'text/html'); });
  
  $('btn-pdf').addEventListener('click', async () => {
    if (!current) return; Store.save(current);
    const html = await fullDoc(current);
    if (window.AndroidPrint && window.AndroidPrint.printPage) window.AndroidPrint.printPage(html);
    else { const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400); }
  });

  $('btn-json').addEventListener('click', () => { if (!current) return; Store.save(current); download(safe(current.data.personal.fullName)+'_portfolio.json', JSON.stringify(current.data, null, 2), 'application/json'); });

  refreshList();
})();