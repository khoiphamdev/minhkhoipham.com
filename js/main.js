(function () {
  var root = document.documentElement;
  var reduce = false; // effects always on, even when the OS prefers reduced motion

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    var isDark = current ? current === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Copy email
  var copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', function () {
    var done = function (label) {
      copyBtn.textContent = label;
      setTimeout(function () { copyBtn.textContent = 'copy'; }, 1600);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText('khoipham.dev@gmail.com').then(
        function () { done('copied ✓'); },
        function () { done('failed'); }
      );
    } else {
      done('failed');
    }
  });

  // Clock + year
  var clock = document.getElementById('clock');
  function tick() {
    var d = new Date();
    clock.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  tick();
  setInterval(tick, 15000);
  document.getElementById('year').textContent = new Date().getFullYear();

  // Typing sequence inside a window
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function play(win) {
    var steps = win.querySelectorAll('.seq');
    var chain = Promise.resolve();
    steps.forEach(function (el) {
      chain = chain.then(function () {
        var typer = el.querySelector('.type');
        if (typer) {
          var text = typer.getAttribute('data-text');
          typer.textContent = '';
          el.style.visibility = 'visible';
          var i = 0;
          return new Promise(function (resolve) {
            var id = setInterval(function () {
              typer.textContent = text.slice(0, ++i);
              if (i >= text.length) { clearInterval(id); resolve(); }
            }, 38);
          }).then(function () { return wait(180); });
        }
        el.style.visibility = 'visible';
        el.classList.add('shown-out');
        return wait(140);
      });
    });
  }

  var wins = document.querySelectorAll('[data-anim]');
  if (!reduce) {
    wins.forEach(function (win) {
      win.classList.add('pending');
      win.querySelectorAll('.type').forEach(function (t) { t.setAttribute('data-text', t.textContent); });
    });
  }

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    wins.forEach(function (w) { w.classList.remove('pending'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      el.classList.add('in');
      if (el.classList.contains('pending')) setTimeout(function () { play(el); }, reduce ? 0 : 250);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
