// Forma — interactions: nav scroll, reveal, conduct-hero, work filter, theme toggle
(function(){
  document.documentElement.classList.add('js'); // reveals only hide when JS is alive
  // safety: if anything goes wrong, reveal everything after 2.5s so the page is never blank
  setTimeout(function(){ document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ el.classList.add('in'); }); }, 2500);

  // ===== page router — Instrument model: nav loads a page (no scroll), each page
  //        scrolls on its own and flips the bg light<->dark via themed bands =====
  var main = document.querySelector('main');
  var header = document.querySelector('header');
  var GROUP = { hero:'home', strip:'home', services:'services', work:'work', process:'process', pricing:'pricing', care:'pricing', faq:'faq', contact:'contact' };
  var HASH2PAGE = { '':'home', '#':'home', '#top':'home', '#services':'services', '#work':'work', '#process':'process', '#pricing':'pricing', '#care':'pricing', '#faq':'faq', '#contact':'contact' };
  // per page: ordered themed bands you scroll through (top band = the colour the page opens on)
  var BANDS = {
    home:    [['.hero','dark'],['.strip','light']],
    services:[['#services .sec-head','dark'],['#services .tiles','light']],
    work:    [['#work .sec-head','light'],['#work .work','dark']],
    process: [['#process .sec-head','dark'],['#process .steps','light']],
    pricing: [['#pricing .sec-head','light'],['#pricing .tiers','dark'],['#care .care','light']],
    faq:     [['#faq .sec-head','dark'],['#faq .faq','light']],
    contact: [['#contact','dark']]
  };
  var blocks = Array.prototype.slice.call(document.querySelectorAll('main>section, main>.strip'));
  blocks.forEach(function(el){
    var key = el.classList.contains('hero') ? 'hero' : (el.classList.contains('strip') ? 'strip' : el.id);
    el.dataset.page = GROUP[key] || 'home';
  });
  document.body.classList.add('routed');

  var activeBands = [], manualTheme = null;
  function applyTheme(t){ document.body.classList.toggle('light', t==='light'); var tb=document.querySelector('.theme-toggle'); if(tb) tb.textContent = t==='light' ? '☾' : '☀'; }

  // scroll-driven flip: the band that has reached the viewport's upper-third sets the bg
  function bandScan(){
    if(manualTheme || !activeBands.length) return;
    var c = window.innerHeight * 0.42, pick = activeBands[0];
    for(var i=0;i<activeBands.length;i++){
      if(activeBands[i].el.getBoundingClientRect().top <= c) pick = activeBands[i]; else break;
    }
    applyTheme(pick.theme);
  }
  function onScroll(){ if(window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); bandScan(); }
  window.addEventListener('scroll', onScroll, {passive:true});

  function bindBands(name){
    activeBands = (BANDS[name]||[]).map(function(b){ return {el:document.querySelector(b[0]), theme:b[1]}; }).filter(function(b){ return b.el; });
  }

  function render(name, push){
    if(!BANDS[name]) name = 'home';
    manualTheme = null;
    blocks.forEach(function(el){ el.classList.toggle('page-on', el.dataset.page===name); el.querySelectorAll('.reveal').forEach(function(r){ if(el.dataset.page===name) r.classList.add('in'); }); });
    bindBands(name);
    applyTheme(activeBands.length ? activeBands[0].theme : 'dark');
    document.querySelectorAll('.nav-links a, .navmenu a').forEach(function(a){
      var h = a.getAttribute('href')||''; a.classList.toggle('active', HASH2PAGE[h]===name && name!=='home');
    });
    window.scrollTo(0,0); header.classList.remove('scrolled');
    var hash = name==='home' ? '#top' : '#'+name;
    if(push){ try{ history.pushState({p:name}, '', hash); }catch(e){ location.hash = hash; } }
  }

  // navigate with a real page-load fade so it feels like a site, not a scroll
  var switching = false;
  function showPage(name, push){
    if(switching) return;
    var current = (document.querySelector('main>section.page-on')||{}).dataset;
    if(current && current.page===(BANDS[name]?name:'home') && push){ window.scrollTo(0,0); return; }
    switching = true; main.classList.add('switching');
    setTimeout(function(){
      render(name, push);
      requestAnimationFrame(function(){ main.classList.remove('switching'); switching = false; });
    }, 180);
  }

  // intercept every in-page anchor → route (page swap) instead of scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var page = HASH2PAGE[a.getAttribute('href')];
      if(page===undefined) return;
      e.preventDefault();
      var menu = document.querySelector('.navmenu'); if(menu){ menu.classList.remove('open'); document.body.style.overflow=''; }
      showPage(page, true);
    });
  });
  window.addEventListener('popstate', function(){ render(HASH2PAGE[location.hash]||'home', false); });
  render(HASH2PAGE[location.hash]||'home', false); // first paint: no fade

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

  // manual theme toggle — pins a colour (overrides scroll flip) until you navigate
  var tbtn = document.querySelector('.theme-toggle');
  if(tbtn) tbtn.addEventListener('click', function(){
    manualTheme = document.body.classList.contains('light') ? 'dark' : 'light';
    applyTheme(manualTheme);
  });
})();
