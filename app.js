// Forma — interactions: nav scroll, reveal, conduct-hero, work filter, theme toggle
(function(){
  document.documentElement.classList.add('js'); // reveals only hide when JS is alive
  // safety: if anything goes wrong, reveal everything after 2.5s so the page is never blank
  setTimeout(function(){ document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ el.classList.add('in'); }); }, 2500);

  // page-load intro — makes the site feel like it "loads" (a website), not just a long scroll
  (function(){
    var l = document.createElement('div'); l.className = 'loader';
    l.innerHTML = '<div class="lw">Forma</div><div class="bar"><i></i></div>';
    document.body.appendChild(l); document.body.classList.add('loading');
    requestAnimationFrame(function(){ l.classList.add('show'); });
    var done = false;
    function finish(){ if(done) return; done = true; l.classList.add('done'); document.body.classList.remove('loading'); setTimeout(function(){ if(l.parentNode) l.parentNode.removeChild(l); }, 900); }
    window.addEventListener('load', function(){ setTimeout(finish, 600); });
    setTimeout(finish, 2600); // safety
  })();

  // nav restyle + ticker hide on scroll
  var header = document.querySelector('header');
  function onScroll(){ if(window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

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

  // scroll-driven light<->dark section flip — exact Instrument palette (#fff <-> #070708)
  var themeMap = {top:'dark',services:'light',work:'dark',process:'light',pricing:'dark',care:'light',faq:'dark',contact:'light'};
  var bgIO = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ document.body.classList.toggle('light', themeMap[e.target.getAttribute('data-bg')] === 'light'); } });
  }, {rootMargin:'-45% 0px -45% 0px'});
  document.querySelectorAll('[data-bg]').forEach(function(el){ bgIO.observe(el); });

  // page-like transitions — in-page nav clicks wipe a curtain + jump, so it feels like loading a page
  var curtain = document.createElement('div'); curtain.className = 'curtain'; document.body.appendChild(curtain);
  var jumping = false;
  function pageJump(hash){
    var t = document.querySelector(hash); if(!t || jumping) return;
    jumping = true;
    curtain.classList.add('in');                       // cover (bottom -> full)
    setTimeout(function(){
      t.scrollIntoView({block:'start',behavior:'auto'}); // instant jump, hidden behind curtain
      onScroll();
      curtain.classList.add('up');                     // reveal upward (full -> top)
      setTimeout(function(){
        curtain.style.transition = 'none';
        curtain.classList.remove('in','up');           // snap back to resting state
        requestAnimationFrame(function(){ curtain.style.transition = ''; jumping = false; });
      }, 460);
    }, 440);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var hash = a.getAttribute('href'); if(hash.length < 2) return;
      var t = document.querySelector(hash); if(!t) return;
      e.preventDefault();
      if(menu){ menu.classList.remove('open'); document.body.style.overflow=''; }
      try{ history.pushState(null,'',hash); }catch(_){}
      pageJump(hash);
    });
  });

})();
