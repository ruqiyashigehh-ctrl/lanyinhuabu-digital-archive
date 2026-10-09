/* 纹样拼贴：对象层与干净输出画布分离，选中框不进入产品或导出。 */
(function () {
 'use strict';
 function el(id) { return document.getElementById(id); }
 if (!el('stCollage')) return;
 // 单行素材栏：支持触屏/触控板横滑、键盘与按钮翻页。
 var strip=el('stPatternStrip'),prev=el('stPatternsPrev'),next=el('stPatternsNext');
 function syncArrows(){
  var max=Math.max(0,strip.scrollWidth-strip.clientWidth);
  prev.disabled=strip.scrollLeft<=1;next.disabled=strip.scrollLeft>=max-1;
 }
 function browse(direction){
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  strip.scrollBy({left:direction*Math.max(114,strip.clientWidth-114),behavior:reduced?'auto':'smooth'});
 }
 prev.addEventListener('click',function(){browse(-1);});next.addEventListener('click',function(){browse(1);});
 strip.addEventListener('scroll',syncArrows,{passive:true});
 window.addEventListener('resize',syncArrows);window.addEventListener('lb:reveal',syncArrows);
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(syncArrows).observe(strip);
 requestAnimationFrame(syncArrows);
 var display = el('stCollage'), ctx = display.getContext('2d', { willReadFrequently:true });
 var clean = document.createElement('canvas'); clean.width = clean.height = 512;
 var c = clean.getContext('2d');
 var drawing=el('stCanvas'),paint=drawing.getContext('2d',{willReadFrequently:true}),paintInk=false;
 if (!ctx || !c) return;
 var layers = [], selected = null, serial = 0, tool = 'select', drag = null, pending = 0;
 var past = [], future = [], cache = new Map();
 var pointers=new Map(), changed=false;
 var select = el('stLayer');
 function say(text) { el('stStatus').textContent = text; }
 function item() { return layers.find(function (l) { return l.id === selected; }); }
 function copyLayers() { return layers.map(function (l) { return Object.assign({}, l); }); }
 function snapshot(){return{layers:copyLayers(),selected:selected,pixels:paint.getImageData(0,0,512,512),ink:paintInk};}
 function remember() {
  past.push(snapshot());
  if (past.length > 21) past.shift(); future = []; render();
 }
 function restore(state) {
  pending++; layers = state.layers.map(function (l) { return Object.assign({}, l); }); selected = state.selected; paint.putImageData(state.pixels,0,0);paintInk=state.ink;render();
 }
 function shape(context, layer) {
  context.save(); context.translate(layer.x, layer.y); context.rotate(layer.angle * Math.PI / 180);
  context.drawImage(layer.image, -layer.size / 2, -layer.size / 2, layer.size, layer.size); context.restore();
 }
 function render() {
  c.clearRect(0,0,512,512); layers.forEach(function (l) { shape(c,l); }); c.drawImage(drawing,0,0);
  ctx.clearRect(0,0,512,512); ctx.drawImage(clean,0,0);
  var current = item();
  if (current && tool==='select') {
   ctx.save(); ctx.translate(current.x,current.y); ctx.rotate(current.angle*Math.PI/180);
   ctx.strokeStyle='#2a6da1';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.strokeRect(-current.size/2,-current.size/2,current.size,current.size);
   ctx.setLineDash([]);ctx.fillStyle='#fff';
   [-1,1].forEach(function(x){[-1,1].forEach(function(y){ctx.fillRect(x*current.size/2-6,y*current.size/2-6,12,12);ctx.strokeRect(x*current.size/2-6,y*current.size/2-6,12,12);});});
   ctx.restore();
  }
  select.replaceChildren();
  if (!layers.length) { var empty=document.createElement('option');empty.value='';empty.textContent='还没有纹样';select.appendChild(empty); }
  layers.forEach(function (l,i) { var option=document.createElement('option');option.value=String(l.id);option.textContent=(i+1)+' · '+l.name;select.appendChild(option); });
  select.value=current?String(current.id):'';
  el('stLayerControls').disabled=!current;
  el('stCanvasTools').hidden=!current||tool!=='select';el('stCanvasTools').disabled=!current;
  el('stCollageUndo').disabled=past.length<2;el('stCollageRedo').disabled=!future.length;
  window.dispatchEvent(new CustomEvent('st:collage',{detail:{active:true,canvas:clean,ink:layers.length>0||paintInk,label:'共创画布 · '+layers.length+' 枚'}}));
 }
 function switchTool(next){
  finish();pending++;tool=next;
  [['stSelect','select'],['stPen','draw'],['stEraser','erase']].forEach(function(pair){el(pair[0]).setAttribute('aria-pressed',String(tool===pair[1]));});
  el('stBrushSettings').hidden=tool==='select';display.style.cursor=tool==='select'?'grab':'crosshair';render();
 }
 [['stSelect','select'],['stPen','draw'],['stEraser','erase']].forEach(function(pair){el(pair[0]).addEventListener('click',function(){switchTool(pair[1]);});});
 function prepared(img,uploaded) {
  if(cache.has(img))return cache.get(img);
  var tile=document.createElement('canvas');tile.width=tile.height=512;var t=tile.getContext('2d',{willReadFrequently:true});
  var ratio=Math.min(512/img.naturalWidth,512/img.naturalHeight);
  var w=img.naturalWidth*ratio,h=img.naturalHeight*ratio;
  t.drawImage(img,(512-w)/2,(512-h)/2,w,h);var pixels=t.getImageData(0,0,512,512),d=pixels.data;
  // 原素材为蓝线白底：去掉近白背景，叠放时不会被白色方块遮住。
  if(!uploaded)for(var i=0;i<d.length;i+=4)if(d[i]>225&&d[i+1]>225&&d[i+2]>225)d[i+3]=0;
  t.putImageData(pixels,0,0);cache.set(img,tile);return tile;
 }
 function add(img,name,uploaded) {
  if(layers.length>=20){say('已经有20枚纹样，请先删除一枚再添加。');return;}
  finish();tool='select';switchTool('select');pending++;var offset=(layers.length%5)*20;
  var layer={id:++serial,name:name,image:prepared(img,uploaded),x:216+offset,y:216+offset,size:180,angle:0};
  layers.push(layer);selected=layer.id;remember();say('已加入'+name+'。拖动移动，拉角点缩放，或用双指和画布内按钮调整。');
 }
 el('studio').querySelectorAll('[data-st-pattern]').forEach(function(button){
  button.addEventListener('click',function(){
   var img=button.querySelector('img'),token=++pending;
   function load(){if(token!==pending)return;try{add(img,button.dataset.stPattern);}catch(e){say('纹样读取失败，请刷新页面后再试。');}}
   if(img.complete&&img.naturalWidth)load();
   else {say('正在载入纹样…');img.addEventListener('load',load,{once:true});img.addEventListener('error',function(){if(token===pending)say('纹样未能载入，请换一张。');},{once:true});}
  });
 });
 window.addEventListener('st:upload',function(e){add(e.detail.image,e.detail.name,true);});
 function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
 function angle(v){return ((v+180)%360+360)%360-180;}
 function point(e){var r=display.getBoundingClientRect();return{x:(e.clientX-r.left)*512/r.width,y:(e.clientY-r.top)*512/r.height};}
 function local(p,l){var a=-l.angle*Math.PI/180,dx=p.x-l.x,dy=p.y-l.y;return{x:dx*Math.cos(a)-dy*Math.sin(a),y:dx*Math.sin(a)+dy*Math.cos(a)};}
 function hit(p,l){var q=local(p,l);return Math.abs(q.x)<=l.size/2&&Math.abs(q.y)<=l.size/2;}
 function corner(p,l){var q=local(p,l);return Math.abs(Math.abs(q.x)-l.size/2)<=20&&Math.abs(Math.abs(q.y)-l.size/2)<=20;}
 function pair(){var ps=Array.from(pointers.values()),a=ps[0],b=ps[1];return{distance:Math.hypot(b.x-a.x,b.y-a.y),angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI,x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
 function startPinch(){var l=item(),p=pair();drag={kind:'pinch',distance:Math.max(1,p.distance),angle:p.angle,size:l.size,rotation:l.angle,x:l.x,y:l.y,mx:p.x,my:p.y};}
 display.addEventListener('pointerdown',function(e){
  if((e.pointerType==='mouse'&&e.button!==0)||pointers.size>=2)return;e.preventDefault();pending++;
  var p=point(e),l=item();
  if(tool!=='select'){
   if(pointers.size)return;pointers.set(e.pointerId,p);display.setPointerCapture(e.pointerId);
   drag={kind:'paint',last:p};changed=true;
   window.dispatchEvent(new CustomEvent('st:paint',{detail:{phase:'start',tool:tool,point:p}}));
   if(tool==='draw')paintInk=true;render();return;
  }
  if(pointers.size===1&&l){pointers.set(e.pointerId,p);display.setPointerCapture(e.pointerId);startPinch();return;}
  var resize=l&&corner(p,l),found=resize?l:null;
  if(!found)for(var i=layers.length-1;i>=0;i--)if(hit(p,layers[i])){found=layers[i];break;}
  selected=found?found.id:null;
  if(found){pointers.set(e.pointerId,p);display.setPointerCapture(e.pointerId);changed=false;
   drag=resize?{kind:'resize',size:found.size,distance:Math.max(1,Math.hypot(p.x-found.x,p.y-found.y))}:{kind:'move',dx:p.x-found.x,dy:p.y-found.y};
  }render();
 });
 display.addEventListener('pointermove',function(e){
  if(!pointers.has(e.pointerId)||!drag)return;e.preventDefault();var p=point(e),l=item();pointers.set(e.pointerId,p);
  if(drag.kind==='paint'){
   window.dispatchEvent(new CustomEvent('st:paint',{detail:{phase:'move',tool:tool,point:p,from:drag.last}}));drag.last=p;changed=true;render();return;
  }
  if(!l)return;
  if(drag.kind==='pinch'&&pointers.size===2){var ps=pair();l.size=Math.round(clamp(drag.size*ps.distance/drag.distance,40,450));l.angle=angle(drag.rotation+angle(ps.angle-drag.angle));l.x=clamp(drag.x+ps.x-drag.mx,0,512);l.y=clamp(drag.y+ps.y-drag.my,0,512);}
  else if(drag.kind==='resize')l.size=Math.round(clamp(drag.size*Math.hypot(p.x-l.x,p.y-l.y)/drag.distance,40,450));
  else{l.x=clamp(p.x-drag.dx,0,512);l.y=clamp(p.y-drag.dy,0,512);}
  changed=true;render();
 });
 function finish(e){
  if(!drag)return;
  if(e&&e.pointerId!==undefined){
   if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);
   if(display.hasPointerCapture(e.pointerId))display.releasePointerCapture(e.pointerId);
   if(pointers.size){var remaining=Array.from(pointers.values())[0],l=item();drag={kind:'move',dx:remaining.x-l.x,dy:remaining.y-l.y};return;}
  }
  var wasPaint=drag.kind==='paint';
  var ids=Array.from(pointers.keys());pointers.clear();drag=null;ids.forEach(function(id){if(display.hasPointerCapture(id))display.releasePointerCapture(id);});
  if(wasPaint){var result={phase:'end'};window.dispatchEvent(new CustomEvent('st:paint',{detail:result}));paintInk=result.ink;}
  if(changed){changed=false;remember();}
 }
 ['pointerup','lostpointercapture'].forEach(function(name){display.addEventListener(name,finish);});
 display.addEventListener('pointercancel',function(){finish();});
 window.addEventListener('pointerup',finish);window.addEventListener('blur',function(){finish();});window.addEventListener('pagehide',function(){finish();});
 document.addEventListener('visibilitychange',function(){if(document.hidden)finish();});
 window.addEventListener('lb:reveal',function(){var owner=display.closest('.lb-page');if(owner&&!owner.classList.contains('is-on'))finish();});
 select.addEventListener('change',function(){finish();selected=Number(select.value)||null;render();});
 function transform(size,rotation,dx,dy){finish();var l=item();if(!l)return;l.size=clamp(l.size+size,40,450);l.angle=angle(l.angle+rotation);l.x=clamp(l.x+dx,0,512);l.y=clamp(l.y+dy,0,512);remember();}
 [['stLayerSmaller',-20,0],['stLayerLarger',20,0],['stLayerRotateLeft',0,-15],['stLayerRotateRight',0,15]].forEach(function(entry){el(entry[0]).addEventListener('click',function(){transform(entry[1],entry[2],0,0);});});
 display.addEventListener('keydown',function(e){
  if(tool!=='select'||!item())return;var step=e.shiftKey?20:5,commands={ArrowLeft:[0,0,-step,0],ArrowRight:[0,0,step,0],ArrowUp:[0,0,0,-step],ArrowDown:[0,0,0,step],'+':[20,0,0,0],'=':[20,0,0,0],'-':[-20,0,0,0],'[':[0,-15,0,0],']':[0,15,0,0]};
  if(commands[e.key]){e.preventDefault();transform.apply(null,commands[e.key]);}
 });
 function action(kind){
  finish();pending++;var l=item();if(!l)return;var index=layers.indexOf(l);
  if(kind==='delete'){layers.splice(index,1);selected=layers.length?layers[layers.length-1].id:null;}
  if(kind==='front'){layers.splice(index,1);layers.push(l);}
  if(kind==='back'){layers.splice(index,1);layers.unshift(l);}
  if(kind==='duplicate'){
   if(layers.length>=20){say('最多加入20枚纹样。');return;}
   var dupe=Object.assign({},l,{id:++serial,x:Math.min(512,l.x+20),y:Math.min(512,l.y+20)});layers.push(dupe);selected=dupe.id;
  }
  remember();say('拼贴已更新，产品预览已同步。');
 }
 [['stLayerDelete','delete'],['stLayerFront','front'],['stLayerBack','back'],['stLayerDuplicate','duplicate']].forEach(function(pair){el(pair[0]).addEventListener('click',function(){action(pair[1]);});});
 el('stCollageClear').addEventListener('click',function(){finish();pending++;layers=[];selected=null;paint.clearRect(0,0,512,512);paintInk=false;remember();say('作品已清空，可以撤销恢复。');});
 el('stCollageUndo').addEventListener('click',function(){finish();if(past.length<2)return;future.push(past.pop());restore(past[past.length-1]);});
 el('stCollageRedo').addEventListener('click',function(){finish();if(!future.length)return;var s=future.pop();past.push(s);restore(s);});
 past.push(snapshot());switchTool('select');say('点击纹样或上传图片，再用画笔添加自己的细节。');
})();
