// Character cursor: letters burst out and drift away from the pointer
(function () {

  var characters = ['h', 'e', 'l', 'l', 'o'];
  var colors = ['#6622CC', '#A755C2', '#B07C9E', '#B59194', '#D2A1B8'];
  var cursorOffset = { x: 0, y: 0 };
  var font = '15px serif';

  function randomSign() { return Math.random() < 0.5 ? -1 : 1; }
  function lifeSpanFn() { return Math.floor(Math.random() * 60 + 80); }
  function initialVelocityFn() {
    return { x: randomSign() * Math.random() * 5, y: randomSign() * Math.random() * 5 };
  }
  var velocityChange = {
    x: function () { return randomSign() / 30; },
    y: function () { return randomSign() / 15; }
  };
  function scaleFn(age, lifeSpan) { return Math.max(((lifeSpan - age) / lifeSpan) * 2, 0); }
  function rotationFn(age, lifeSpan) { return (lifeSpan - age) / 5; }

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  if (!context) return;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'fixed';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '100';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  // Pre-render each character onto its own small canvas
  context.font = font;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  var images = characters.map(function (ch) {
    var m = context.measureText(ch);
    var c = document.createElement('canvas');
    var cx = c.getContext('2d');
    c.width = m.width;
    c.height = m.actualBoundingBoxAscent * 2.5;
    cx.textAlign = 'center';
    cx.font = font;
    cx.textBaseline = 'middle';
    cx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    cx.fillText(ch, c.width / 2, m.actualBoundingBoxAscent);
    return c;
  });

  function Particle(x, y, img) {
    var lifeSpan = lifeSpanFn();
    this.rotationSign = randomSign();
    this.age = 0;
    this.initialLifeSpan = lifeSpan;
    this.lifeSpan = lifeSpan;
    this.velocity = initialVelocityFn();
    this.position = { x: x + cursorOffset.x, y: y + cursorOffset.y };
    this.canv = img;
  }
  Particle.prototype.update = function (ctx) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.lifeSpan--;
    this.age++;
    this.velocity.x += velocityChange.x(this.age, this.initialLifeSpan);
    this.velocity.y += velocityChange.y(this.age, this.initialLifeSpan);

    var scale = scaleFn(this.age, this.initialLifeSpan);
    var radians = this.rotationSign * rotationFn(this.age, this.initialLifeSpan) * 0.0174533;

    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(radians);
    ctx.drawImage(this.canv, (-this.canv.width / 2) * scale, -this.canv.height / 2, this.canv.width * scale, this.canv.height * scale);
    ctx.rotate(-radians);
    ctx.translate(-this.position.x, -this.position.y);
  };

  var particles = [];
  function addParticle(x, y) {
    particles.push(new Particle(x, y, images[Math.floor(Math.random() * images.length)]));
  }

  document.body.addEventListener('mousemove', function (e) { addParticle(e.clientX, e.clientY); });
  function onTouch(e) {
    for (var i = 0; i < e.touches.length; i++) addParticle(e.touches[i].clientX, e.touches[i].clientY);
  }
  document.body.addEventListener('touchmove', onTouch, { passive: true });
  document.body.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  function loop() {
    if (particles.length) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) particles[i].update(context);
      for (var j = particles.length - 1; j >= 0; j--) {
        if (particles[j].lifeSpan < 0) particles.splice(j, 1);
      }
      if (!particles.length) context.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
