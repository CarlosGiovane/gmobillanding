var CONFIG = {
  SIM_RES: 128,
  DYE_RES: 512,
  DISSIPATION: 0.96, // 0.90 = some rápido, 0.99 = fica por muito tempo
  VELOCITY_DISS: 0.95,
  PRESSURE_ITER: 10,
  CURL: 3, // 0 = sem redemoinho, 50 = muito turbulento
  SPLAT_RADIUS: 0.001, // valores úteis: 0.001 (fino) até 0.008 (largo)
  SPLAT_FORCE: 2, //força arasto valores úteis: 2 (suave) até 15 (agressivo)
  TOUCH_FORCE: 400,
  SPLASH_ON_LOAD: true,

  // Paleta quente — laranja, salmão, amarelo e suas variações
  // #FF6B00 laranja vivo       → [1.00, 0.42, 0.00]
  // #FF9A3C laranja médio      → [1.00, 0.60, 0.24]
  // #FFB347 laranja dourado    → [1.00, 0.70, 0.28]
  // #FF4500 laranja avermelhado→ [1.00, 0.27, 0.00]
  // #FF7F6B salmão             → [1.00, 0.50, 0.42]
  // #FF9E80 salmão claro       → [1.00, 0.62, 0.50]
  // #FFCC44 amarelo dourado    → [1.00, 0.80, 0.27]
  // #FFE066 amarelo suave      → [1.00, 0.88, 0.40]
  //[0.1, 0.9, 0.6],   // verde
  //[0.1, 0.4, 1.0],   // azul
  //[1.0, 0.2, 0.5],   // rosa
  //[0.1, 0.9, 0.6],   // verde
  //[1.0, 0.6, 0.1],   // laranja
  //[0.6, 0.1, 1.0],   // roxo
  //[0.1, 0.8, 1.0],   // ciano

  // [1.0, 0.42, 0.0], // laranja vivo
  // [1.0, 0.27, 0.0], // laranja avermelhado
  // [1.0, 0.6, 0.24], // laranja médio
  // [1.0, 0.7, 0.28], // laranja dourado
  // [1.0, 0.5, 0.42], // salmão
  // [1.0, 0.62, 0.5], // salmão claro
  // [1.0, 0.8, 0.27], // amarelo dourado
  // [1.0, 0.88, 0.4], // amarelo suave
  // [0.1, 0.8, 1.0], // ciano
  // [0.1, 1.0, 0.8], // ciano claro

  COLORS: [
    [1.0, 0.42, 0.0],
    [1.0, 0.6, 0.24],
    [1.0, 0.7, 0.28],
    [1.0, 0.27, 0.0],
    [1.0, 0.5, 0.42],
    [1.0, 0.62, 0.5],
    [1.0, 0.8, 0.27],
    [1.0, 0.88, 0.4],
  ],
};

(function () {
  var canvas = document.getElementById("fluid-canvas");
  if (!canvas) return;
  var gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) {
    console.warn("WebGL nao suportado.");
    return;
  }

  var W,
    H,
    colorIdx = 0,
    last = { x: -1, y: -1 };
  var isGL2 =
    typeof WebGL2RenderingContext !== "undefined" &&
    gl instanceof WebGL2RenderingContext;

  /* ---------- Detectar formato suportado ---------- */
  function getSupportedFormat(internalFormat, format, type) {
    // Testa se o framebuffer aceita este formato
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      4,
      4,
      0,
      format,
      type,
      null,
    );
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
    gl.deleteTexture(tex);
    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  // Tenta formatos do melhor para o pior
  var FMT;
  if (isGL2) {
    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("EXT_color_buffer_half_float");
    if (getSupportedFormat(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT)) {
      FMT = {
        internalFormat: gl.RGBA16F,
        format: gl.RGBA,
        type: gl.HALF_FLOAT,
      };
    } else if (getSupportedFormat(gl.RGBA32F, gl.RGBA, gl.FLOAT)) {
      FMT = { internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT };
    } else {
      FMT = {
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE,
      };
    }
  } else {
    var extHF = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    var extF = gl.getExtension("OES_texture_float");
    gl.getExtension("OES_texture_float_linear");
    gl.getExtension("WEBGL_color_buffer_float");
    gl.getExtension("EXT_color_buffer_half_float");
    var HALF_FLOAT = extHF ? extHF.HALF_FLOAT_OES : null;
    if (HALF_FLOAT && getSupportedFormat(gl.RGBA, gl.RGBA, HALF_FLOAT)) {
      FMT = { internalFormat: gl.RGBA, format: gl.RGBA, type: HALF_FLOAT };
    } else if (extF && getSupportedFormat(gl.RGBA, gl.RGBA, gl.FLOAT)) {
      FMT = { internalFormat: gl.RGBA, format: gl.RGBA, type: gl.FLOAT };
    } else {
      FMT = {
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE,
      };
    }
  }

  var LINEAR = gl.LINEAR;

  /* ---------- Shaders ---------- */
  var vSrc = [
    "precision highp float;",
    "attribute vec2 aPos;",
    "varying vec2 vUv, vL, vR, vT, vB;",
    "uniform vec2 texelSize;",
    "void main() {",
    "  vUv = aPos * 0.5 + 0.5;",
    "  vL  = vUv - vec2(texelSize.x, 0.0);",
    "  vR  = vUv + vec2(texelSize.x, 0.0);",
    "  vT  = vUv + vec2(0.0,  texelSize.y);",
    "  vB  = vUv - vec2(0.0,  texelSize.y);",
    "  gl_Position = vec4(aPos, 0.0, 1.0);",
    "}",
  ].join("\n");

  function mkProg(fSrc) {
    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error("Shader error:", gl.getShaderInfoLog(s));
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
      console.error("Program error:", gl.getProgramInfoLog(p));
    return {
      use: function () {
        gl.useProgram(p);
      },
      u: function (n) {
        return gl.getUniformLocation(p, n);
      },
    };
  }

  var P = {
    adv: mkProg(
      [
        "precision highp float;",
        "varying vec2 vUv; uniform sampler2D uVel, uSrc;",
        "uniform vec2 rdx; uniform float dt, dissipation;",
        "void main() {",
        "  vec2 c = vUv - dt * texture2D(uVel, vUv).xy * rdx;",
        "  gl_FragColor = dissipation * texture2D(uSrc, c);",
        "}",
      ].join("\n"),
    ),
    div: mkProg(
      [
        "precision highp float;",
        "varying vec2 vL, vR, vT, vB; uniform sampler2D uVel;",
        "void main() {",
        "  gl_FragColor = vec4(0.5*(texture2D(uVel,vR).x-texture2D(uVel,vL).x+texture2D(uVel,vT).y-texture2D(uVel,vB).y),0,0,1);",
        "}",
      ].join("\n"),
    ),
    pres: mkProg(
      [
        "precision highp float;",
        "varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uPressure, uDivergence;",
        "void main() {",
        "  float p = (texture2D(uPressure,vL).x+texture2D(uPressure,vR).x+texture2D(uPressure,vT).x+texture2D(uPressure,vB).x-texture2D(uDivergence,vUv).x)*0.25;",
        "  gl_FragColor = vec4(p, 0, 0, 1);",
        "}",
      ].join("\n"),
    ),
    grad: mkProg(
      [
        "precision highp float;",
        "varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uPressure, uVel;",
        "void main() {",
        "  vec2 v = texture2D(uVel,vUv).xy - vec2(texture2D(uPressure,vR).x-texture2D(uPressure,vL).x, texture2D(uPressure,vT).x-texture2D(uPressure,vB).x)*0.5;",
        "  gl_FragColor = vec4(v, 0, 1);",
        "}",
      ].join("\n"),
    ),
    curl: mkProg(
      [
        "precision highp float;",
        "varying vec2 vL, vR, vT, vB; uniform sampler2D uVel;",
        "void main() {",
        "  gl_FragColor = vec4(0.5*((texture2D(uVel,vR).y-texture2D(uVel,vL).y)-(texture2D(uVel,vT).x-texture2D(uVel,vB).x)),0,0,1);",
        "}",
      ].join("\n"),
    ),
    vort: mkProg(
      [
        "precision highp float;",
        "varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVel, uCurl; uniform float curl, dt;",
        "void main() {",
        "  float l=texture2D(uCurl,vL).x, r=texture2D(uCurl,vR).x, t=texture2D(uCurl,vT).x, b=texture2D(uCurl,vB).x, c=texture2D(uCurl,vUv).x;",
        "  vec2 f = 0.5*vec2(abs(t)-abs(b), abs(r)-abs(l));",
        "  f = f/(length(f)+0.0001)*curl*c; f.y *= -1.0;",
        "  gl_FragColor = vec4(texture2D(uVel,vUv).xy + f*dt, 0, 1);",
        "}",
      ].join("\n"),
    ),
    splat: mkProg(
      [
        "precision highp float;",
        "varying vec2 vUv; uniform sampler2D uTarget;",
        "uniform float aspectRatio, radius; uniform vec3 color; uniform vec2 point;",
        "void main() {",
        "  vec2 p = vUv - point; p.x *= aspectRatio;",
        "  gl_FragColor = vec4(texture2D(uTarget,vUv).xyz + exp(-dot(p,p)/radius)*color, 1);",
        "}",
      ].join("\n"),
    ),
    display: mkProg(
      [
        "precision highp float;",
        "varying vec2 vUv; uniform sampler2D uTexture;",
        "void main() { vec3 c = texture2D(uTexture,vUv).rgb; gl_FragColor = vec4(c, max(c.r,max(c.g,c.b))); }",
      ].join("\n"),
    ),
    clear: mkProg(
      [
        "precision highp float;",
        "varying vec2 vUv; uniform sampler2D uTexture; uniform float value;",
        "void main() { gl_FragColor = value * texture2D(uTexture,vUv); }",
      ].join("\n"),
    ),
  };

  /* ---------- FBOs ---------- */
  function mkFBO(w, h, filter) {
    gl.activeTexture(gl.TEXTURE0);
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      FMT.internalFormat,
      w,
      h,
      0,
      FMT.format,
      FMT.type,
      null,
    );
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE)
      console.warn("FBO incompleto:", status);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      tex: tex,
      fb: fb,
      w: w,
      h: h,
      attach: function (id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return id;
      },
    };
  }

  function mkDouble(w, h, filter) {
    var a = mkFBO(w, h, filter),
      b = mkFBO(w, h, filter);
    return {
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      swap: function () {
        var t = a;
        a = b;
        b = t;
      },
    };
  }

  var SR = CONFIG.SIM_RES,
    DR = CONFIG.DYE_RES;
  var velFBO = mkDouble(SR, SR, LINEAR);
  var dyeFBO = mkDouble(DR, DR, LINEAR);
  var presFBO = mkDouble(SR, SR, gl.NEAREST);
  var divFBO = mkFBO(SR, SR, gl.NEAREST);
  var curlFBO = mkFBO(SR, SR, gl.NEAREST);

  /* ---------- Quad ---------- */
  var vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
    gl.STATIC_DRAW,
  );
  var ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array([0, 1, 2, 0, 2, 3]),
    gl.STATIC_DRAW,
  );

  function blit(target) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      gl.viewport(0, 0, target.w, target.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /* ---------- Splat ---------- */
  function nextColor() {
    return CONFIG.COLORS[colorIdx++ % CONFIG.COLORS.length];
  }

  function splat(x, y, dx, dy, color) {
    P.splat.use();
    gl.uniform1i(P.splat.u("uTarget"), velFBO.read.attach(0));
    gl.uniform1f(P.splat.u("aspectRatio"), W / H);
    gl.uniform2f(P.splat.u("point"), x / W, 1.0 - y / H);
    gl.uniform3f(P.splat.u("color"), dx, -dy, 0.0);
    gl.uniform1f(P.splat.u("radius"), CONFIG.SPLAT_RADIUS);
    blit(velFBO.write);
    velFBO.swap();

    gl.uniform1i(P.splat.u("uTarget"), dyeFBO.read.attach(0));
    gl.uniform3f(P.splat.u("color"), color[0], color[1], color[2]);
    gl.uniform1f(P.splat.u("radius"), CONFIG.SPLAT_RADIUS * 2.0);
    blit(dyeFBO.write);
    dyeFBO.swap();
  }

  /* ---------- Step ---------- */
  function step(dt) {
    gl.disable(gl.BLEND);
    var rdx = [1.0 / SR, 1.0 / SR];

    P.curl.use();
    gl.uniform2fv(P.curl.u("texelSize"), rdx);
    gl.uniform1i(P.curl.u("uVel"), velFBO.read.attach(0));
    blit(curlFBO);

    P.vort.use();
    gl.uniform2fv(P.vort.u("texelSize"), rdx);
    gl.uniform1i(P.vort.u("uVel"), velFBO.read.attach(0));
    gl.uniform1i(P.vort.u("uCurl"), curlFBO.attach(1));
    gl.uniform1f(P.vort.u("curl"), CONFIG.CURL);
    gl.uniform1f(P.vort.u("dt"), dt);
    blit(velFBO.write);
    velFBO.swap();

    P.div.use();
    gl.uniform2fv(P.div.u("texelSize"), rdx);
    gl.uniform1i(P.div.u("uVel"), velFBO.read.attach(0));
    blit(divFBO);

    P.clear.use();
    gl.uniform1i(P.clear.u("uTexture"), presFBO.read.attach(0));
    gl.uniform1f(P.clear.u("value"), 0.8);
    blit(presFBO.write);
    presFBO.swap();

    P.pres.use();
    gl.uniform2fv(P.pres.u("texelSize"), rdx);
    gl.uniform1i(P.pres.u("uDivergence"), divFBO.attach(0));
    for (var i = 0; i < CONFIG.PRESSURE_ITER; i++) {
      gl.uniform1i(P.pres.u("uPressure"), presFBO.read.attach(1));
      blit(presFBO.write);
      presFBO.swap();
    }

    P.grad.use();
    gl.uniform2fv(P.grad.u("texelSize"), rdx);
    gl.uniform1i(P.grad.u("uPressure"), presFBO.read.attach(0));
    gl.uniform1i(P.grad.u("uVel"), velFBO.read.attach(1));
    blit(velFBO.write);
    velFBO.swap();

    P.adv.use();
    gl.uniform2fv(P.adv.u("rdx"), rdx);
    gl.uniform1i(P.adv.u("uVel"), velFBO.read.attach(0));
    gl.uniform1i(P.adv.u("uSrc"), velFBO.read.attach(0));
    gl.uniform1f(P.adv.u("dt"), dt);
    gl.uniform1f(P.adv.u("dissipation"), CONFIG.VELOCITY_DISS);
    blit(velFBO.write);
    velFBO.swap();

    gl.uniform1i(P.adv.u("uVel"), velFBO.read.attach(0));
    gl.uniform1i(P.adv.u("uSrc"), dyeFBO.read.attach(1));
    gl.uniform1f(P.adv.u("dissipation"), CONFIG.DISSIPATION);
    blit(dyeFBO.write);
    dyeFBO.swap();
  }

  /* ---------- Loop ---------- */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  }

  var fluidActive = false;
  canvas.style.display = "none";
  window.toggleFluidEffect = function () {
    fluidActive = !fluidActive;
    canvas.style.display = fluidActive ? "" : "none";
    var label = document.getElementById("fluid-toggle-label");
    if (label) label.textContent = fluidActive ? "Efeito: ON" : "Efeito: OFF";
  };

  var lastT = Date.now();
  function loop() {
    resize();
    var now = Date.now();
    var dt = Math.min((now - lastT) / 1000, 0.016);
    lastT = now;
    step(dt);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    P.display.use();
    gl.uniform1i(P.display.u("uTexture"), dyeFBO.read.attach(0));
    blit(null);

    requestAnimationFrame(loop);
  }

  /* ---------- Eventos ---------- */
  window.addEventListener("mousemove", function (e) {
    var x = e.clientX,
      y = e.clientY;
    var dx = (x - (last.x < 0 ? x : last.x)) * CONFIG.SPLAT_FORCE;
    var dy = (y - (last.y < 0 ? y : last.y)) * CONFIG.SPLAT_FORCE;
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1)
      splat(x, y, dx, dy, nextColor());
    last = { x: x, y: y };
  });

  window.addEventListener(
    "touchmove",
    function (e) {
      if (!fluidActive) return;
      e.preventDefault();
      var f = CONFIG.TOUCH_FORCE;
      for (var i = 0; i < e.touches.length; i++) {
        var t = e.touches[i];
        splat(
          t.clientX,
          t.clientY,
          (Math.random() - 0.5) * f,
          -(Math.random() - 0.5) * f,
          nextColor(),
        );
      }
    },
    { passive: false },
  );

  /* ---------- Splash ---------- */
  if (CONFIG.SPLASH_ON_LOAD) {
    setTimeout(function () {
      resize();
      var cx = W / 2,
        cy = H / 2;
      for (var i = 0; i < CONFIG.COLORS.length; i++) {
        var a = (i / CONFIG.COLORS.length) * Math.PI * 2;
        splat(
          cx + Math.cos(a) * 80,
          cy + Math.sin(a) * 80,
          Math.cos(a) * 600,
          Math.sin(a) * 600,
          CONFIG.COLORS[i],
        );
      }
    }, 200);
  }

  loop();
})();
