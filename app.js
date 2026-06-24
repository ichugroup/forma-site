// Forma — interactions: nav scroll, reveal, conduct-hero, work filter, theme toggle
(function(){
  document.documentElement.classList.add('js'); // reveals only hide when JS is alive
  // safety: if anything goes wrong, reveal everything after 2.5s so the page is never blank
  setTimeout(function(){ document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ el.classList.add('in'); }); }, 2500);

  // nav restyle + ticker hide on scroll
  var header = document.querySelector('header');
  function onScroll(){ if(window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // ===== page router — clicking nav shows the section directly (no full-page scroll) =====
  // each "page" = which top-level blocks show + the Instrument-style light/dark theme it flips to
  var GROUP = { hero:'home', strip:'home', services:'services', work:'work', process:'process', pricing:'pricing', care:'pricing', faq:'faq', contact:'contact' };
  var THEME = { home:'dark', services:'light', work:'dark', process:'light', pricing:'dark', faq:'light', contact:'dark' };
  var HASH2PAGE = { '':'home', '#':'home', '#top':'home', '#services':'services', '#work':'work', '#process':'process', '#pricing':'pricing', '#care':'pricing', '#faq':'faq', '#contact':'contact' };
  var blocks = Array.prototype.slice.call(document.querySelectorAll('main>section, main>.strip'));
  blocks.forEach(function(el){
    var key = el.classList.contains('hero') ? 'hero' : (el.classList.contains('strip') ? 'strip' : el.id);
    el.dataset.page = GROUP[key] || 'home';
  });
  document.body.classList.add('routed');

  function applyTheme(t){ document.body.classList.toggle('light', t==='light'); var tb=document.querySelector('.theme-toggle'); if(tb) tb.textContent = t==='light' ? '☾' : '☀'; }

  function showPage(name, push){
    if(!THEME[name]) name = 'home';
    blocks.forEach(function(el){ el.classList.toggle('page-on', el.dataset.page===name); });
    applyTheme(THEME[name]);
    // reveal everything on the now-visible page immediately
    blocks.forEach(function(el){ if(el.dataset.page===name) el.querySelectorAll('.reveal').forEach(function(r){ r.classList.add('in'); }); });
    // active nav state
    document.querySelectorAll('.nav-links a, .navmenu a').forEach(function(a){
      var h = a.getAttribute('href')||''; a.classList.toggle('active', HASH2PAGE[h]===name && name!=='home');
    });
    window.scrollTo(0,0); header.classList.remove('scrolled');
    var hash = name==='home' ? '#top' : '#'+(name==='pricing'?'pricing':name);
    if(push){ try{ history.pushState({p:name}, '', hash); }catch(e){ location.hash = hash; } }
  }

  // intercept every in-page anchor → route instead of scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var page = HASH2PAGE[a.getAttribute('href')];
      if(page===undefined) return; // unknown anchor: let it behave normally
      e.preventDefault();
      var menu = document.querySelector('.navmenu'); if(menu){ menu.classList.remove('open'); document.body.style.overflow=''; }
      showPage(page, true);
    });
  });
  window.addEventListener('popstate', function(){ showPage(HASH2PAGE[location.hash]||'home', false); });
  showPage(HASH2PAGE[location.hash]||'home', false);

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

  // manual theme toggle — overrides the current page theme until you navigate
  var tbtn = document.querySelector('.theme-toggle');
  if(tbtn) tbtn.addEventListener('click', function(){
    applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
  });
})();
