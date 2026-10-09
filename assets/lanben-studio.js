/* 共创画布：手绘缓冲、图片上传、产品预览和规则对话。无网络请求。 */
(function () {
  'use strict';
  var root = document.getElementById('studio');
  if (!root) return;
  function el(id) { return document.getElementById(id); }
  var board = el('stCanvas'), product = el('stProduct');
  var ctx = board.getContext('2d', { willReadFrequently: true }), out = product.getContext('2d');
  if (!ctx || !out) { el('stStatus').textContent = '当前浏览器不支持画板，请换一个浏览器试试。'; return; }
  var collage = null, revision = 0, frame = 0;
  var scale = el('stScale'), layout = el('stLayout'), posX = el('stX'), posY = el('stY');
  function designCanvas() { return collage ? collage.canvas : board; }
  function designReady() { return !!(collage && collage.ink); }
  function say(text) { el('stStatus').textContent = text; }
  function update() {
    el('stSource').textContent = collage ? collage.label : '共创画布';
    el('stSavePattern').disabled = !designReady(); el('stSaveProduct').disabled = !designReady();
    el('stBrushValue').textContent = el('stBrush').value; el('stScaleValue').textContent = scale.value;
    if (!frame) frame = requestAnimationFrame(function () { frame = 0; renderProduct(); });
  }
  el('stBrush').addEventListener('input', update);
  window.addEventListener('st:paint', function (e) {
    var d=e.detail;
    if(d.phase==='end') {
      var pixels=ctx.getImageData(0,0,512,512).data;d.ink=false;
      for(var i=3;i<pixels.length;i+=4)if(pixels[i]){d.ink=true;break;}
      return;
    }
    revision++;ctx.save();ctx.globalCompositeOperation=d.tool==='erase'?'destination-out':'source-over';
    ctx.strokeStyle=ctx.fillStyle=el('stColor').value;ctx.lineWidth=Number(el('stBrush').value);ctx.lineCap=ctx.lineJoin='round';
    ctx.beginPath();
    if(!d.from){ctx.arc(d.point.x,d.point.y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}
    else{ctx.moveTo(d.from.x,d.from.y);ctx.lineTo(d.point.x,d.point.y);ctx.stroke();}
    ctx.restore();
  });
  el('stUpload').addEventListener('change', function () {
    var file=this.files[0];this.value='';if(!file)return;
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){say('请上传 PNG、JPG 或 WebP 图片。');return;}
    if(file.size>10*1024*1024){say('图片超过 10 MB，请缩小后再上传。');return;}
    var token=++revision,url=URL.createObjectURL(file),img=new Image();say('正在读取图片…');
    img.onload=function(){
      URL.revokeObjectURL(url);if(token!==revision)return;
      if(img.naturalWidth*img.naturalHeight>24000000){say('图片尺寸过大，请缩小到 2400 万像素以内。');return;}
      window.dispatchEvent(new CustomEvent('st:upload',{detail:{image:img,name:'上传图片'}}));
    };
    img.onerror=function(){URL.revokeObjectURL(url);if(token===revision)say('无法读取这张图片，请换一张有效的图片。');};
    img.src=url;
  });
  /* —— 试样产品：手提包 / 短袖上衣；底色：本白地蓝花 / 藏蓝地白花 ——
     两套配色各一份色板，换底色只是读另一组取值，绘制里不再散落颜色常量。 */
  var productType = 'bag', baseMode = 'light';
  var PAL = {
    light: {
      bg: '#f3f0e8', fabric: '#fffdf7', edge: '#c5bca9', stitch: '#a79b85',
      handle: '#d3c8b4', handleIn: '#f9f6ee', neck: '#e6e0d0', collar: '#d3c8b4', collarIn: '#f9f6ee',
      cap: '#173f63', capSub: '#69727b',
      dark: 'rgba(55,43,22,.12)', soft: 'rgba(255,255,255,.04)', deeper: 'rgba(55,43,22,.15)'
    },
    dark: {
      bg: '#eee9dd', fabric: '#173f63', edge: '#0f2c46', stitch: 'rgba(233,241,247,.34)',
      handle: '#0f2c46', handleIn: '#22496b', neck: '#0d2438', collar: '#0f2c46', collarIn: '#22496b',
      cap: '#173f63', capSub: '#69727b',
      dark: 'rgba(6,16,28,.34)', soft: 'rgba(255,255,255,.05)', deeper: 'rgba(6,16,28,.38)'
    }
  };
  function pal() { return PAL[baseMode]; }
  function productName() {
    if (productType === 'tee') return '短袖上衣';
    if (productType === 'fan') return '折扇';
    return '手提包';
  }
  function shapePath() {
    if (productType === 'tee') return teePath;
    if (productType === 'fan') return fanFacePath;
    return bagPath;
  }

  /* 藏蓝地用的「白花」图层：把一幅「白地蓝花」重描成「透明地 + 冷白花」，
     铺在藏蓝布面上即成蓝底白花——这正是蓝印花布的另一种印法。
     逐像素重算：白底一律透明，笔画越深越白；抗锯齿靠保留原 alpha。 */
  var flowerTile = null, flowerRev = -1;
  function buildFlowerTile() {
    if (!flowerTile) { flowerTile = document.createElement('canvas'); flowerTile.width = flowerTile.height = 512; }
    var tc = flowerTile.getContext('2d');
    flowerTile.__composite = false;
    tc.globalCompositeOperation = 'source-over';
    tc.clearRect(0, 0, 512, 512);
    tc.drawImage(designCanvas(), 0, 0, 512, 512);
    try {
      var img = tc.getImageData(0, 0, 512, 512), d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var a = d[i + 3]; if (!a) continue;
        var lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        var k = (236 - lum) / 170;               /* 白地 → ≤0（透明）；蓝笔画 → 接近 1（白花） */
        if (k <= 0) { d[i + 3] = 0; continue; }
        if (k > 1) k = 1;
        d[i] = 244; d[i + 1] = 249; d[i + 2] = 253;
        d[i + 3] = Math.round(a * k);
      }
      tc.putImageData(img, 0, 0);
    } catch (e) {
      /* 以 file:// 打开时图片可能被视作跨域、禁止读回像素。退回纯合成路径：
         整幅反相成「黑地奶油花」，铺到藏蓝布面上时用 lighten 叠加，效果接近。 */
      tc.globalCompositeOperation = 'difference';
      tc.fillStyle = '#ffffff'; tc.fillRect(0, 0, 512, 512);
      tc.globalCompositeOperation = 'source-over';
      flowerTile.__composite = true;
    }
    flowerRev = revision;
    return flowerTile;
  }
  function tileAt() {
    if (baseMode !== 'dark') return designCanvas();
    if (!flowerTile || flowerRev !== revision) buildFlowerTile();
    return flowerTile;
  }
  /* 铺纹样：在当前布面区域（box）内单图居中或无缝平铺。 */
  function layPattern(c, box) {
    if (!designReady()) return;
    var size = Number(scale.value), x = Number(posX.value), y = Number(posY.value), src = tileAt();
    var prev = c.globalCompositeOperation;
    if (baseMode === 'dark' && src.__composite) c.globalCompositeOperation = 'lighten';
    if (layout.value === 'single') {
      c.drawImage(src, box[0] + box[2] / 2 - size / 2 + x, box[1] + box[3] / 2 - size / 2 + y, size, size);
    } else {
      // 固定纹样原点后平铺，位置滑杆改变整幅织物的相位。
      var startX = box[0] + ((x % size) + size) % size - size;
      var startY = box[1] + ((y % size) + size) % size - size;
      for (var px = startX; px < box[0] + box[2]; px += size)
        for (var py = startY; py < box[1] + box[3]; py += size) c.drawImage(src, px, py, size, size);
    }
    c.globalCompositeOperation = prev;
  }
  function bagPath(c) {
    c.beginPath(); c.moveTo(180, 318); c.lineTo(620, 318); c.lineTo(651, 730);
    c.quadraticCurveTo(650, 775, 610, 782); c.lineTo(190, 782);
    c.quadraticCurveTo(150, 775, 149, 730); c.closePath();
  }
  /* 短袖上衣轮廓（平铺正面，按真实 T 恤比例）：衣长 ≈ 1.41 × 衣宽，
     总袖展 ≈ 1.9 × 衣宽——之前「像连衣裙」的根因就是衣身 460 高配 254 宽。
     坐标以 x=400 左右对称：右侧改一处，左侧同步取 800-x。
     版型关键：①衣身 260..540（宽280），肩线 y≈278 → 下摆 y≈672（长394）；
     ②侧缝是【笔直的垂直线】：腋下 540,380 → 下摆 540,672，x 全程不变，
     不再有任何外鼓或收腰，下摆与胸围等宽；
     ③袖子是平行四边形：上缘/下缝都平行于袖轴（548,278 → 668,388），
     袖宽 80px，袖口 72px 直边，绝不能外鼓或收尖；
     ④袖窿处不画缉缝线——袖与身的交界只靠轮廓区分。 */
  function teePath(c) {
    c.beginPath();
    c.moveTo(340, 235);
    c.bezierCurveTo(355, 288, 445, 288, 460, 235);          // 前领弧（宽120 深53）
    c.bezierCurveTo(490, 247, 518, 262, 548, 278);          // 右肩线（斜下至肩端）
    c.bezierCurveTo(588, 314, 628, 352, 668, 388);          // 右袖上缘（平行袖轴，平直）
    c.lineTo(614, 446);                                     // 右袖口（直边，宽约72）
    c.bezierCurveTo(590, 424, 565, 402, 540, 380);          // 右袖下缝（平行袖轴）→ 腋下
    c.bezierCurveTo(540, 478, 540, 576, 540, 672);          // 右侧缝（笔直垂直线）
    c.bezierCurveTo(466, 680, 334, 680, 260, 672);          // 下摆（微垂 8px）
    c.bezierCurveTo(260, 576, 260, 478, 260, 380);          // 左侧缝（镜像，同样笔直）
    c.bezierCurveTo(235, 402, 210, 424, 186, 446);          // 左袖下缝（镜像）
    c.lineTo(132, 388);                                     // 左袖口（镜像）
    c.bezierCurveTo(172, 352, 212, 314, 252, 278);          // 左袖上缘（镜像）
    c.bezierCurveTo(282, 262, 310, 247, 340, 235);          // 左肩线（镜像）
    c.closePath();
  }
  /* 折扇（完全展开）：整体就是一个扇形——外弧是扇口，内弧以下收拢到扇柄根，
     没有伸出去的大骨尾巴，也没有扇钉。扇面是「外弧 − 内弧」之间的一段环扇形，
     只有扇面铺纹样，扇柄根与折痕一律保持素面，所以几何与绘制分开：
     fanFacePath 负责扇面（铺纹样时用它 clip），折痕画在扇面之上。
     几何：圆心 (400,630)，外半径 390、内半径 120，展开 132°——折扇全开时的常见角度。
     包围盒 [42,238,716,345] 的中心 (400,410) 与环扇形形心 (400,409) 几乎重合，
     因此「单图居中」刚好落在扇面视觉中心。 */
  var FAN = { cx: 400, cy: 630, R: 390, r: 120, spread: 132, ribs: 18 };
  var FA0 = -Math.PI / 2 - FAN.spread * Math.PI / 360;
  var FA1 = -Math.PI / 2 + FAN.spread * Math.PI / 360;
  function fanAngle(i) { return FA0 + (FA1 - FA0) * i / FAN.ribs; }
  function fanFacePath(c) {
    c.beginPath();
    c.arc(FAN.cx, FAN.cy, FAN.R, FA0, FA1);          // 扇口（外弧）
    c.arc(FAN.cx, FAN.cy, FAN.r, FA1, FA0, true);    // 内弧（靠扇钉一侧）
    c.closePath();
  }
  /* 扇面折痕：沿半径等分的细线，明暗交替模拟折扇的凹凸。只在扇面内画。 */
  function drawFanRibs(c, P) {
    var i, th, x0, y0, x1, y1;
    c.lineWidth = 1.6; c.lineCap = 'butt';
    for (i = 1; i < FAN.ribs; i++) {
      th = fanAngle(i);
      x0 = FAN.cx + FAN.r * Math.cos(th); y0 = FAN.cy + FAN.r * Math.sin(th);
      x1 = FAN.cx + FAN.R * Math.cos(th); y1 = FAN.cy + FAN.R * Math.sin(th);
      c.globalAlpha = i % 2 ? .5 : .26;
      c.strokeStyle = i % 2 ? P.stitch : P.edge;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
    c.globalAlpha = 1;
  }
  /* 扇柄根：内弧以内、收拢到圆心的一小段扇形，是扇子本体的一部分（不是伸出去的柄）。
     上面走几道扇骨线，全部素面，不放纹样。
     ——这一段的面取「本白布面」的白（同 light 的 fabric），不参与「本白地 / 藏蓝地」换色：
       扇面会随底色变化，扇柄根始终是这块白，所以取值写死，不读 PAL；
       轮廓与扇骨线用浅灰米色，保证白块之上形状仍看得清。 */
  var HUB = { face: '#fffdf7', edge: '#c5bca9', grain: '#a79b85' };
  function drawFanHub(c) {
    var i, th, x0, y0, x1, y1;
    c.beginPath();
    c.moveTo(FAN.cx, FAN.cy);
    c.arc(FAN.cx, FAN.cy, FAN.r, FA0, FA1);
    c.closePath();
    c.fillStyle = HUB.face; c.fill();
    c.strokeStyle = HUB.edge; c.lineWidth = 3; c.stroke();
    c.lineWidth = 4; c.lineCap = 'round'; c.strokeStyle = HUB.grain;
    for (i = 1; i < FAN.ribs; i++) {
      th = fanAngle(i);
      x0 = FAN.cx + 16 * Math.cos(th);    y0 = FAN.cy + 16 * Math.sin(th);
      x1 = FAN.cx + (FAN.r - 3) * Math.cos(th); y1 = FAN.cy + (FAN.r - 3) * Math.sin(th);
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
  }
  /* 扇口包边：沿外弧内侧的一条窄边，与扇面同色系的素边，不放纹样。 */
  function drawFanBinding(c, P) {
    c.beginPath();
    c.arc(FAN.cx, FAN.cy, FAN.R, FA0, FA1);
    c.arc(FAN.cx, FAN.cy, FAN.R - 15, FA1, FA0, true);
    c.closePath(); c.fillStyle = P.collar; c.fill();
  }
  var BOXES = { bag: [140, 318, 520, 480], tee: [100, 210, 600, 490], fan: [42, 238, 716, 345] };
  function drawHandle(c, P) {
    c.strokeStyle = P.handle; c.lineWidth = 32; c.lineCap = 'round';
    c.beginPath(); c.moveTo(272, 350); c.lineTo(272, 220); c.bezierCurveTo(272, 85, 528, 85, 528, 220); c.lineTo(528, 350); c.stroke();
    c.strokeStyle = P.handleIn; c.lineWidth = 20; c.stroke();
  }
  function drawNeckInner(c, P) {
    c.beginPath();
    c.moveTo(340, 235);
    c.bezierCurveTo(368, 247, 432, 247, 460, 235);          // 后领浅弧（露出的后领口）
    c.bezierCurveTo(445, 288, 355, 288, 340, 235);          // 回走前领弧
    c.closePath(); c.fillStyle = P.neck; c.fill();
    c.fillStyle = P.collar;                                 // 后领中央的小织标（参考版型图同款）
    c.fillRect(388, 238, 24, 10);
  }
  /* 罗纹圆领：领圈双层描边 + 沿领圈均布的横向罗纹细线。 */
  function drawCollar(c, P) {
    var p0x = 340, p0y = 235, p1x = 355, p1y = 288, p2x = 445, p2y = 288, p3x = 460, p3y = 235;
    function bez(t) {
      var u = 1 - t;
      return [
        u*u*u*p0x + 3*u*u*t*p1x + 3*u*t*t*p2x + t*t*t*p3x,
        u*u*u*p0y + 3*u*u*t*p1y + 3*u*t*t*p2y + t*t*t*p3y
      ];
    }
    c.beginPath(); c.moveTo(p0x, p0y); c.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
    c.lineCap = 'round'; c.strokeStyle = P.collar; c.lineWidth = 16; c.stroke();
    c.strokeStyle = P.collarIn; c.lineWidth = 9; c.stroke();
    c.strokeStyle = P.stitch; c.lineWidth = 1; c.globalAlpha = .75;   // 罗纹
    for (var i = 1; i <= 13; i++) {
      var t = i / 14, p = bez(t), q = bez(t + 0.01);
      var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      var nx = -dy / L, ny = dx / L;
      c.beginPath(); c.moveTo(p[0] - nx * 7, p[1] - ny * 7); c.lineTo(p[0] + nx * 7, p[1] + ny * 7); c.stroke();
    }
    c.globalAlpha = 1;
  }
  function renderProduct() {
    var P = pal(), path = shapePath(), box = BOXES[productType];
    out.setLineDash([]);
    out.clearRect(0, 0, 800, 900);
    out.fillStyle = P.bg; out.fillRect(0, 0, 800, 900);
    out.fillStyle = 'rgba(26,47,61,.10)';
    if (productType === 'tee') {
      out.beginPath(); out.ellipse(400, 704, 220, 16, 0, 0, Math.PI * 2); out.fill();
      drawNeckInner(out, P);
    } else if (productType === 'fan') {
      out.beginPath(); out.ellipse(400, 638, 158, 12, 0, 0, Math.PI * 2); out.fill();
      drawFanHub(out);
    } else {
      out.beginPath(); out.ellipse(400, 802, 260, 22, 0, 0, Math.PI * 2); out.fill();
      drawHandle(out, P);
    }
    out.save(); path(out); out.clip();
    out.fillStyle = P.fabric; out.fillRect(box[0], box[1], box[2], box[3]);
    layPattern(out, box);
    var shade = out.createLinearGradient(box[0], 0, box[0] + box[2], 0);
    shade.addColorStop(0, P.dark); shade.addColorStop(.14, P.soft);
    shade.addColorStop(.85, P.soft); shade.addColorStop(1, P.deeper);
    out.fillStyle = shade; out.fillRect(box[0], box[1], box[2], box[3]);
    out.restore();
    path(out); out.strokeStyle = P.edge; out.lineWidth = 3; out.stroke();
    out.setLineDash([5, 6]); out.strokeStyle = P.stitch; out.lineWidth = 1.5;
    if (productType === 'tee') {
      out.beginPath();
      out.moveTo(272, 658); out.bezierCurveTo(372, 666, 428, 666, 528, 658);   // 下摆明线
      out.moveTo(659, 380); out.lineTo(605, 438);                              // 右袖口明线（与袖口平行）
      out.moveTo(141, 380); out.lineTo(195, 438);                              // 左袖口明线
      out.moveTo(465, 246); out.bezierCurveTo(492, 258, 518, 272, 540, 284);   // 右肩明线
      out.moveTo(335, 246); out.bezierCurveTo(308, 258, 282, 272, 260, 284);   // 左肩明线
      out.stroke();
      out.setLineDash([]); drawCollar(out, P);
    } else if (productType === 'fan') {
      out.setLineDash([]);
      out.save(); fanFacePath(out); out.clip(); drawFanRibs(out, P); out.restore();
      drawFanBinding(out, P);
    } else {
      out.beginPath(); out.moveTo(193, 342); out.lineTo(607, 342); out.moveTo(178, 750); out.lineTo(622, 750); out.stroke();
    }
    out.setLineDash([]);
    out.textAlign = 'center';
    out.fillStyle = P.cap; out.font = '19px sans-serif'; out.fillText('蓝印花布 · 纹样共创', 400, 850);
    out.fillStyle = P.capSub; out.font = '14px sans-serif';
    out.fillText(productName() + '设计示意 · ' + (baseMode === 'dark' ? '藏蓝地白花' : '本白地蓝花'), 400, 877);
  }
  [scale, layout, posX, posY].forEach(function (input) { input.addEventListener('input', update); });
  function saveCanvas(canvas, name) {
    if (!designReady()) { say('先画几笔、上传作品或选择一张档案纹样，再保存。'); return; }
    try {
      canvas.toBlob(function (blob) {
        if (!blob) { say('保存未成功，请重试。'); return; }
        var url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
        say('已准备下载。若手机浏览器打开了图片，可长按保存。');
      }, 'image/png');
    } catch (e) { say('浏览器未能导出图片，请换一个浏览器重试。'); }
  }
  function savePattern() {
    var copy = document.createElement('canvas'); copy.width = 512; copy.height = 512;
    var c = copy.getContext('2d'); c.fillStyle = '#ffffff'; c.fillRect(0, 0, 512, 512); c.drawImage(designCanvas(), 0, 0);
    saveCanvas(copy, '我的蓝印花布作品.png');
  }
  el('stSavePattern').addEventListener('click', savePattern);
  el('stSaveProduct').addEventListener('click', function () { renderProduct(); saveCanvas(product, '我的蓝印花布' + productName() + '.png'); });

  /* 产品 / 底色切换：一组按钮各自 aria-pressed，状态只存 productType / baseMode，
     切换后重画预览并把保存按钮、标题标签、无障碍标签同步到当前组合。 */
  function syncSwitches() {
    Array.prototype.forEach.call(root.querySelectorAll('[data-st-product]'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.stProduct === productType));
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-st-base]'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.stBase === baseMode));
    });
    var name = productName(), chip = el('stProductChip'), save = el('stSaveProduct');
    if (chip) chip.textContent = name;
    if (save) save.textContent = '保存' + name + '效果图 ↓';
    product.setAttribute('aria-label', name + '效果示意图，纹样、产品与底色变化时同步更新');
  }
  function switchTo(kind, value) {
    if (kind === 'product') { if (productType === value) return; productType = value; }
    else { if (baseMode === value) return; baseMode = value; }
    syncSwitches(); update();
  }
  Array.prototype.forEach.call(root.querySelectorAll('[data-st-product]'), function (b) {
    b.addEventListener('click', function () {
      switchTo('product', b.dataset.stProduct);
      say('试样换成了' + productName() + '，纹样与排布保持不变。');
    });
  });
  Array.prototype.forEach.call(root.querySelectorAll('[data-st-base]'), function (b) {
    b.addEventListener('click', function () {
      switchTo('base', b.dataset.stBase);
      say(baseMode === 'dark' ? '底色换成藏蓝，纹样以白花呈现——蓝底白花的另一种印法。' : '底色换回本白，纹样回到蓝花。');
    });
  });
  syncSwitches();

  function message(text, user) {
    var p = document.createElement('p'), tag = document.createElement('span');
    p.className = 'st-message' + (user ? ' st-message--user' : '');
    tag.textContent = user ? '你' : '设计助手 · 演示';
    p.appendChild(tag); p.appendChild(document.createTextNode(text));
    var log = el('stMessages'); log.appendChild(p);
    while (log.children.length > 30) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function respond(text) {
    var actions = [], s = Number(scale.value), x = Number(posX.value), y = Number(posY.value), mode = layout.value;
    if (!designReady()) return '先在画板上画几笔，上传图片，或选一张档案纹样；准备好后，我就能按你的要求调整' + productName() + '预览。';
    if (/恢复|默认|重置/.test(text)) { s = 180; x = 0; y = 0; mode = 'repeat'; actions.push('恢复默认连续平铺'); }
    else {
      if (/单图|居中|中央/.test(text)) { mode = 'single'; x = 0; y = 0; actions.push('切换为单图居中'); }
      if (/平铺|连续|重复/.test(text)) { mode = 'repeat'; actions.push('切换为连续平铺'); }
      if (/大一点|放大|大一些|大点|稀|疏/.test(text)) { s += 40; actions.push('放大纹样'); }
      else if (/小一点|缩小|小一些|小点|密|细/.test(text)) { s -= 40; actions.push('缩小纹样'); }
      if (/密|稀|疏/.test(text)) mode = 'repeat';
      if (/向右|往右|右移/.test(text)) { x += 25; actions.push('向右移动'); }
      if (/向左|往左|左移/.test(text)) { x -= 25; actions.push('向左移动'); }
      if (/向上|往上|上移/.test(text)) { y -= 25; actions.push('向上移动'); }
      if (/向下|往下|下移/.test(text)) { y += 25; actions.push('向下移动'); }
    }
    if (!actions.length) return '这版是设计流程演示，还未接入 AI。试试“纹样大一点”“细密平铺”“单图居中”或“向右一点”，也可以直接用预览下方的滑杆调整。';
    var bounded = clamp(s, 60, 360) !== s || clamp(x, -150, 150) !== x || clamp(y, -150, 150) !== y;
    scale.value = clamp(s, 60, 360); posX.value = clamp(x, -150, 150); posY.value = clamp(y, -150, 150); layout.value = mode;
    update(); say('设计对话已调整产品预览。');
    return '已' + actions.join('，并') + '，上方预览已同步。' + (bounded ? '有参数已达到可调整范围。' : '') + '喜欢这版的话，可以保存' + productName() + '效果图。';
  }
  function send(text) { text = text.trim().slice(0, 200); if (!text) return; message(text, true); message(respond(text), false); }
  el('stChatForm').addEventListener('submit', function (e) { e.preventDefault(); send(el('stPrompt').value); el('stPrompt').value = ''; });
  root.querySelectorAll('[data-st-prompt]').forEach(function (button) { button.addEventListener('click', function () { send(button.dataset.stPrompt); }); });
  window.addEventListener('st:collage', function (e) { revision++; collage = e.detail; update(); });
  update();
})();
