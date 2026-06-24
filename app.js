// Forma — interactions: nav scroll, reveal, conduct-hero, work filter, theme toggle
(function(){
  document.documentElement.classList.add('js'); // reveals only hide when JS is alive
  // safety: if anything goes wrong, reveal everything after 2.5s so the page is never blank
  setTimeout(function(){ document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ el.classList.add('in'); }); }, 2500);

  // ===== full continuous scroll + colour flip; nav buttons fade-JUMP to a section =====
  var main = document.querySelector('main');
  var header = document.querySelector('header');
  document.body.classList.add('routed');

  // one theme per top-level block, alternating — scrolling the page flips the bg like Instrument
  var THEME_BY_ID = { services:'dark', work:'light', process:'dark', pricing:'light', care:'dark', faq:'light', contact:'dark' };
  var bands = Array.prototype.slice.call(document.querySelectorAll('main>section, main>.strip')).map(function(el){
    var theme = el.classList.contains('hero') ? 'dark' : (el.classList.contains('strip') ? 'light' : (THEME_BY_ID[el.id]||'dark'));
    return { el:el, theme:theme };
  });
  var manualTheme = null;
  function applyTheme(t){ document.body.classList.toggle('light', t==='light'); var tb=document.querySelector('.theme-toggle'); if(tb) tb.textContent = t==='light' ? '☾' : '☀'; }

  // scroll-driven flip: the block crossing the upper third of the viewport sets the bg
  function bandScan(){
    if(manualTheme) return;
    var c = window.innerHeight * 0.4, pick = bands[0];
    for(var i=0;i<bands.length;i++){ if(bands[i].el.getBoundingClientRect().top <= c) pick = bands[i]; else break; }
    if(pick) applyTheme(pick.theme);
  }
  // scroll-spy: highlight the nav item for the section in view
  var navlinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a, .navmenu a'));
  function spy(){
    var c = window.innerHeight * 0.35, curId = '';
    bands.forEach(function(b){ if(b.el.id && b.el.getBoundingClientRect().top <= c) curId = b.el.id; });
    navlinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#'+curId && curId!==''); });
  }
  function onScroll(){ if(window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); bandScan(); spy(); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // nav button → quick fade, jump straight to the section (no slow scroll crawl), fade back
  var headOffset = 84, switching = false;
  function jumpTo(hash){
    var el = (hash==='#top'||hash==='') ? null : document.querySelector(hash);
    if(hash!=='#top' && hash!=='' && !el) return false;
    if(switching) return true;
    switching = true; main.classList.add('switching');
    setTimeout(function(){
      var y = el ? (el.getBoundingClientRect().top + window.scrollY - headOffset) : 0;
      window.scrollTo(0, Math.max(0,y));
      manualTheme = null; bandScan(); spy();
      try{ history.pushState(null,'',hash||'#top'); }catch(e){}
      requestAnimationFrame(function(){ main.classList.remove('switching'); switching = false; });
    }, 170);
    return true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var hash = a.getAttribute('href');
      var menu = document.querySelector('.navmenu'); if(menu){ menu.classList.remove('open'); document.body.style.overflow=''; }
      if(hash==='#contact'){ e.preventDefault(); openCal(); return; }
      if(jumpTo(hash)) e.preventDefault();
    });
  });
  // booking CTAs (contact + WhatsApp links) open the Cal.com-style modal
  document.querySelectorAll('a[href*="wa.me"]').forEach(function(a){
    a.addEventListener('click', function(e){ e.preventDefault(); openCal(); });
  });
  // deep-link on load
  if(location.hash && location.hash!=='#top'){ var t=document.querySelector(location.hash); if(t){ window.scrollTo(0, Math.max(0,t.getBoundingClientRect().top+window.scrollY-headOffset)); } }
  onScroll();

  // scroll reveal
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // conduct hero — hover a service => swap headline word + bg; sticky
  var hero = document.querySelector('.hero');
  var swap = document.querySelector('.hero .swap');
  if(hero && swap){
    document.querySelectorAll('.conduct button').forEach(function(b){
      function set(){
        document.querySelectorAll('.conduct button').forEach(function(x){x.classList.remove('on');});
        b.classList.add('on');
        hero.setAttribute('data-active', b.dataset.k);
        swap.style.opacity = 0;
        setTimeout(function(){ swap.textContent = b.dataset.word; swap.style.opacity = 1; }, 180);
      }
      b.addEventListener('mouseenter', set);
      b.addEventListener('focus', set);
      b.addEventListener('click', set);
    });
  }

  // work filter
  var fbtns = document.querySelectorAll('.filters button');
  fbtns.forEach(function(b){
    b.addEventListener('click', function(){
      fbtns.forEach(function(x){x.classList.remove('on');}); b.classList.add('on');
      var f = b.dataset.f;
      document.querySelectorAll('.work .case').forEach(function(c){
        c.classList.toggle('hide', !(f==='all' || c.dataset.cat===f));
      });
    });
  });

  // mobile overlay menu
  var menu = document.querySelector('.navmenu');
  var burger = document.querySelector('.burger');
  function closeMenu(){ if(menu){ menu.classList.remove('open'); document.body.style.overflow=''; } }
  if(burger && menu){
    burger.addEventListener('click', function(){ menu.classList.add('open'); document.body.style.overflow='hidden'; });
    menu.querySelectorAll('a, .close').forEach(function(a){ a.addEventListener('click', closeMenu); });
  }

  var ES = document.documentElement.lang==='es';

  // ===== Cal.com-style booking modal (mockup — swap for real Cal.com embed once the account exists) =====
  var calModal = document.querySelector('.cal-modal');
  var bookingTopic = '';
  function openCal(topic){
    if(!calModal) return;
    bookingTopic = topic || '';
    var sub = calModal.querySelector('.cal-topic');
    if(sub) sub.textContent = bookingTopic ? (ES?'Sobre: ':'About: ')+bookingTopic : '';
    calModal.removeAttribute('hidden'); document.body.style.overflow='hidden';
    requestAnimationFrame(function(){ calModal.classList.add('open'); }); buildCal();
  }
  function closeCal(){ if(!calModal) return; calModal.classList.remove('open'); document.body.style.overflow=''; setTimeout(function(){ calModal.setAttribute('hidden',''); }, 260); }
  window.openCal = openCal;
  if(calModal){
    calModal.addEventListener('click', function(e){ if(e.target===calModal || e.target.closest('.cal-x')) closeCal(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !calModal.hasAttribute('hidden')) closeCal(); });
  }
  var calCursor = null;
  var MONTHS = ES
    ? ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var T = ES
    ? {slots:'horarios disponibles', confirm:'Reservar', name:'Nombre', email:'Email', wa:'WhatsApp (opcional)', send:'Solicitar llamada', back:'‹ Volver', done:'Solicitud enviada (demo)', donesub:'Conecta Cal.com + un backend de formulario para activarlo en vivo.', need:'Completa nombre y email'}
    : {slots:'available times', confirm:'Confirm', name:'Name', email:'Email', wa:'WhatsApp (optional)', send:'Request call', back:'‹ Back', done:'Request sent (demo)', donesub:'Connect Cal.com + a form backend to make this live.', need:'Add your name and email'};
  function buildCal(){
    var grid = calModal.querySelector('.cal-grid'); if(!grid) return;
    var now = new Date(); if(!calCursor) calCursor = new Date(now.getFullYear(), now.getMonth(), 1);
    calModal.querySelector('#calMonth').textContent = MONTHS[calCursor.getMonth()] + ' ' + calCursor.getFullYear();
    grid.innerHTML = '';
    var first = new Date(calCursor.getFullYear(), calCursor.getMonth(), 1);
    var startDow = (first.getDay()+6)%7;
    var days = new Date(calCursor.getFullYear(), calCursor.getMonth()+1, 0).getDate();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for(var i=0;i<startDow;i++){ grid.appendChild(document.createElement('span')); }
    for(var d=1; d<=days; d++){
      var cell = document.createElement('button'); cell.className='cal-day'; cell.textContent=d;
      var date = new Date(calCursor.getFullYear(), calCursor.getMonth(), d), dow = date.getDay();
      if(date < today || dow===0 || dow===6){ cell.disabled = true; }
      else { (function(date,cell){ cell.addEventListener('click', function(){
        grid.querySelectorAll('.cal-day.on').forEach(function(x){x.classList.remove('on');}); cell.classList.add('on'); showSlots(date);
      }); })(date,cell); }
      grid.appendChild(cell);
    }
  }
  function dateLabel(date){ return ES
    ? date.toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long'})
    : date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}); }
  function showSlots(date){
    var head = calModal.querySelector('#calDay'), list = calModal.querySelector('#calSlots');
    head.innerHTML = '<b>'+dateLabel(date)+'</b><span>'+T.slots+'</span>';
    list.innerHTML = '';
    ['09:00','09:30','10:00','11:00','11:30','14:00','15:00','15:30','16:00','16:30'].forEach(function(t){
      var s = document.createElement('button'); s.className='cal-slot'; s.innerHTML='<span>'+t+'</span>';
      s.addEventListener('click', function(){ leadForm(date, t); });
      list.appendChild(s);
    });
  }
  // lead capture — feels like a real booking; mock submit
  function leadForm(date, t){
    var head = calModal.querySelector('#calDay'), list = calModal.querySelector('#calSlots');
    head.innerHTML = '<b>'+dateLabel(date)+' · '+t+'</b><span>'+(bookingTopic||'15 min · Google Meet')+'</span>';
    list.innerHTML =
      '<button class="cal-link cal-backslots">'+T.back+'</button>'+
      '<input class="cal-in" data-k="name" placeholder="'+T.name+'" autocomplete="name">'+
      '<input class="cal-in" data-k="email" type="email" placeholder="'+T.email+'" autocomplete="email">'+
      '<input class="cal-in" data-k="wa" placeholder="'+T.wa+'" autocomplete="tel">'+
      '<button class="cal-submit">'+T.send+'</button>'+
      '<p class="cal-err" hidden></p>';
    list.querySelector('.cal-backslots').addEventListener('click', function(){ showSlots(date); });
    list.querySelector('.cal-submit').addEventListener('click', function(){
      var name=(list.querySelector('[data-k=name]').value||'').trim(), email=(list.querySelector('[data-k=email]').value||'').trim();
      var err=list.querySelector('.cal-err');
      if(!name || !/.+@.+\..+/.test(email)){ err.textContent=T.need; err.hidden=false; return; }
      head.innerHTML = '<b>'+dateLabel(date)+' · '+t+'</b><span>'+name+'</span>';
      list.innerHTML = '<div class="cal-done"><b>✓ '+T.done+'</b>'+T.donesub+'</div>';
    });
  }
  if(calModal){ calModal.querySelectorAll('.cal-nav').forEach(function(b){ b.addEventListener('click', function(){
    calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth()+ (+b.dataset.d), 1); var now=new Date();
    if(calCursor < new Date(now.getFullYear(), now.getMonth(), 1)) calCursor = new Date(now.getFullYear(), now.getMonth(), 1);
    buildCal();
  }); }); }

  // ===== service tiles → book about that service =====
  document.querySelectorAll('.tiles .tile').forEach(function(tile){
    tile.setAttribute('role','button'); tile.tabIndex=0;
    function go(){ var h=tile.querySelector('h3'); openCal(h?h.textContent.trim():''); }
    tile.addEventListener('click', go);
    tile.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } });
  });

  // ===== work cases → detail modal built from the card itself =====
  var caseModal = document.createElement('div'); caseModal.className='case-modal'; caseModal.hidden=true;
  caseModal.innerHTML = '<div class="case-card"><button class="case-x icon-btn" aria-label="Close">✕</button><div class="case-media"></div><div class="case-body"><span class="case-tag"></span><h3></h3><p></p><div class="case-stat"></div><button class="btn btn-solid case-book">'+(ES?'Agendar sobre esto ':'Book a call about this ')+'<span class="arw">→</span></button></div></div>';
  document.body.appendChild(caseModal);
  function openCase(card){
    var media = card.querySelector('.media');
    caseModal.querySelector('.case-media').style.backgroundImage = media ? media.style.backgroundImage : '';
    caseModal.querySelector('.case-tag').textContent = (card.querySelector('.tag')||{}).textContent||'';
    caseModal.querySelector('.case-body h3').textContent = (card.querySelector('h3')||{}).textContent||'';
    caseModal.querySelector('.case-body p').textContent = (card.querySelector('p')||{}).textContent||'';
    caseModal.querySelector('.case-stat').textContent = (card.querySelector('.stat')||{}).textContent||'';
    caseModal.querySelector('.case-book').onclick = function(){ closeCase(); openCal((card.querySelector('h3')||{}).textContent||''); };
    caseModal.hidden=false; document.body.style.overflow='hidden'; requestAnimationFrame(function(){ caseModal.classList.add('open'); });
  }
  function closeCase(){ caseModal.classList.remove('open'); document.body.style.overflow=''; setTimeout(function(){ caseModal.hidden=true; }, 240); }
  caseModal.addEventListener('click', function(e){ if(e.target===caseModal || e.target.closest('.case-x')) closeCase(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !caseModal.hidden) closeCase(); });
  document.querySelectorAll('.work .case').forEach(function(card){
    card.setAttribute('role','button'); card.tabIndex=0;
    card.addEventListener('click', function(){ openCase(card); });
    card.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openCase(card); } });
  });

  // ===== "software we operate" strip → jump to Work =====
  document.querySelectorAll('.strip .names span').forEach(function(n){
    n.style.cursor='pointer'; n.tabIndex=0;
    n.addEventListener('click', function(){ jumpTo('#work'); });
    n.addEventListener('keydown', function(e){ if(e.key==='Enter'){ jumpTo('#work'); } });
  });
})();
