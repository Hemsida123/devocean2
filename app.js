(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const setMenu = (open) => {
    menu?.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) nav?.querySelector('a')?.focus();
  };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
    if (event.key === 'Tab' && menu?.getAttribute('aria-expanded') === 'true') {
      const links = [...nav.querySelectorAll('a')];
      if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menu.focus(); }
      else if (!event.shiftKey && document.activeElement === menu) { event.preventDefault(); links[0]?.focus(); }
      else if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); menu.focus(); }
      else if (event.shiftKey && document.activeElement === menu) { event.preventDefault(); links.at(-1)?.focus(); }
    }
  });
  const desktop = matchMedia('(min-width:901px)');
  desktop.addEventListener('change', () => { if (desktop.matches) setMenu(false); });
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('#experience-grid .experience')];
  const status = document.querySelector('#experience-status');
  const messages = {featured:'Three ways to start exploring Mexico with Devocean.',beginner:'First experiences and snorkelling — talk to us about the right introduction.',certified:'Guided experiences for certified divers. Requirements vary by trip.',technical:'Specialist experiences — appropriate certification and experience are required.'};
  function filterExperience(value) {
    filters.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === value)));
    cards.forEach((card, i) => { card.hidden = value === 'featured' ? i > 2 : card.dataset.audience !== value; });
    if (status) status.textContent = messages[value];
  }
  filters.forEach(b => b.addEventListener('click', () => filterExperience(b.dataset.filter)));
  if (filters.length) filterExperience('featured');

  const form = document.querySelector('#enquiry-form');
  let enquiry = '';
  if (form) {
    const requested = new URLSearchParams(location.search).get('experience');
    const select = form.elements.experience;
    if (requested && requested.length <= 140) {
      if (![...select.options].some(o => o.value === requested)) select.add(new Option(requested, requested));
      select.value = requested;
    }
    const date = new Date();
    const today = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    form.elements.date.min = today;
    const submit = form.querySelector('[type="submit"]');
    const submitLabel = form.querySelector('[data-submit-label]');
    const statusPanel = document.querySelector('#enquiry-status');
    const statusTitle = document.querySelector('#enquiry-status-title');
    const statusMessage = document.querySelector('#enquiry-status-message');
    const fallback = document.querySelector('#enquiry-fallback');
    let pending = false;
    let requestId = '';
    const showStatus = (state, title, message) => {
      statusPanel.dataset.state = state;
      statusTitle.textContent = title;
      statusMessage.textContent = message;
      statusPanel.hidden = false;
      statusPanel.focus({preventScroll:true});
      statusPanel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'nearest'});
    };
    async function requestJSON(options = {}) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(form.dataset.endpoint, {...options, credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:{Accept:'application/json'}});
        if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Online sending is not available here. Please use email or WhatsApp below.');
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error(result.message || 'We could not send your enquiry. Please try again or use a contact option below.');
        return result;
      } finally { clearTimeout(timer); }
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pending) return;
      if (!form.reportValidity()) return;
      const f = new FormData(form);
      const name = String(f.get('name')).trim();
      const message = String(f.get('message')).trim();
      if (!name || !message) { (name ? form.elements.message : form.elements.name).focus(); return; }
      enquiry = `Hello Devocean Divers,\n\nI would like to plan a diving experience.\n\nName: ${name}\nEmail: ${f.get('email')}\nDate: ${f.get('date') || 'Flexible / to confirm'}\nExperience: ${f.get('experience')}\n\n${message}\n\nPlease confirm availability, full pricing and booking conditions. Thank you!`;
      document.querySelector('#send-email').href = `mailto:devoceandivers.mexico@gmail.com?subject=${encodeURIComponent('Dive enquiry — '+f.get('experience'))}&body=${encodeURIComponent(enquiry)}`;
      document.querySelector('#send-whatsapp').href = 'https://wa.me/529843142681?text='+encodeURIComponent(enquiry);
      pending = true;
      submit.disabled = true;
      submitLabel.textContent = 'Sending your enquiry…';
      form.setAttribute('aria-busy','true');
      fallback.hidden = true;
      statusPanel.hidden = true;
      const fields = [...form.querySelectorAll('input, select, textarea')];
      fields.forEach(field => { field.disabled = true; });
      try {
        if (location.protocol === 'file:') throw new Error('Online sending is not available in this local preview. Please use email or WhatsApp below.');
        if (!requestId) requestId = [...crypto.getRandomValues(new Uint8Array(16))].map(n => n.toString(16).padStart(2,'0')).join('');
        const session = await requestJSON();
        if (typeof session.token !== 'string' || !/^[a-f0-9]{64}$/.test(session.token)) throw new Error('Online sending is not available here. Please use email or WhatsApp below.');
        f.set('csrf', session.token);
        f.set('request_id', requestId);
        await requestJSON({method:'POST',body:f});
        form.reset();
        requestId = '';
        showStatus('success','Thank you. Your enquiry has been sent.','Walter and the team will be in touch to discuss your plans and confirm availability. Your booking is not confirmed yet.');
      } catch (error) {
        fallback.hidden = false;
        const text = error.name === 'AbortError' || error instanceof TypeError
          ? 'We could not confirm your submission. Your details are still here. Try again, or contact us below. If you retry, we check for duplicate submissions.'
          : error.message;
        showStatus('error','Let’s get your message to us.',text);
      } finally {
        fields.forEach(field => { field.disabled = false; });
        pending = false;
        submit.disabled = false;
        submitLabel.textContent = 'Send my enquiry';
        form.removeAttribute('aria-busy');
      }
    });
    form.addEventListener('input', () => { if (!pending) { statusPanel.hidden = true; fallback.hidden = true; requestId = ''; } });
    submit.disabled = false;
    document.querySelector('#copy-enquiry')?.addEventListener('click', async () => {
      const result = document.querySelector('#copy-status');
      try { await navigator.clipboard.writeText(enquiry); result.textContent = 'Copied. Paste your enquiry into an email to Devocean.'; }
      catch { result.textContent = 'Copy is unavailable here. Choose Open email or Open WhatsApp instead.'; }
    });
  }
})();

// A short path from an experience to a personal enquiry.
(() => {
 const form=document.querySelector('#enquiry-form');
 document.querySelector('#quick-plan-button')?.addEventListener('click',()=>{
  if(!form)return;
  const chosen=document.querySelector('#quick-experience').value;
  const select=form.elements.experience;
  select.value=[...select.options].some(o=>o.value===chosen)?chosen:'Not sure yet';
  document.querySelector('#plan-your-dive').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  form.elements.name.focus({preventScroll:true});
 });
 if(form){
  const whatsapp=document.createElement('a');
  whatsapp.className='form-whatsapp';whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';
  whatsapp.textContent='Prefer WhatsApp? Send your plans here';
  function update(){
   const f=new FormData(form);
   const message='Hello Devocean Divers! I would like to plan a dive in Playa del Carmen.\n\n'+
    'Experience: '+f.get('experience')+'\nDate: '+(f.get('date')||'To confirm')+'\n'+
    (f.get('name')?'Name: '+f.get('name')+'\n':'')+(f.get('email')?'Email: '+f.get('email')+'\n':'')+
    (f.get('message')?'\n'+f.get('message')+'\n':'')+'\nPlease confirm availability, full pricing and booking conditions.';
   whatsapp.href='https://wa.me/529843142681?text='+encodeURIComponent(message);
  }
  update();form.addEventListener('input',update);form.addEventListener('change',update);whatsapp.addEventListener('click',update);
  form.querySelector('.form-submit').after(whatsapp);
 }
 // Pause the other film when one starts playing.
 document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{
  document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause()});
 }));
})();
