(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{13:function(e,t,n){},14:function(e,t,n){"use strict";n.r(t);var i=n(1),a=n.n(i),r=n(5),o=n.n(r),s=n(3),h=n.n(s),c=n(2),u=n(6),l=n(0),d=function e(t,n,i,a){var r=this;Object(c.a)(this,e),this.startDragX=void 0,this.startDragY=void 0,this.drag=void 0,this.zoomIn=void 0,this.zoomOut=void 0,this.mouseWheelHandler=function(e){e.preventDefault(),Math.max(-1,Math.min(1,-e.deltaY))<0&&r.zoomOut?r.zoomOut():r.zoomIn&&r.zoomIn()},this.mouseDownHandler=function(e){e.preventDefault(),r.startDragX=e.clientX,r.startDragY=e.clientY},this.mouseMoveHandler=function(e){e.preventDefault(),null!==r.startDragX&&null!==r.startDragY&&(r.drag&&r.drag(e.clientX-r.startDragX,e.clientY-r.startDragY),r.startDragX=e.clientX,r.startDragY=e.clientY)},this.mouseUpHandler=function(e){e.preventDefault(),r.mouseMoveHandler(e),r.startDragX=null,r.startDragY=null},this.startDragX=null,this.startDragY=null,this.drag=n,this.zoomIn=i,this.zoomOut=a,t.addEventListener("wheel",this.mouseWheelHandler),t.addEventListener("wheel",this.mouseWheelHandler),t.addEventListener("mousedown",this.mouseDownHandler),t.addEventListener("mousemove",this.mouseMoveHandler),t.addEventListener("mouseup",this.mouseUpHandler)},m=function(){function e(t){Object(c.a)(this,e),this.container=void 0,this.controls=void 0,this.renderer=void 0,this.scene=void 0,this.camera=void 0,this.center=void 0,this.globe=void 0,this.clouds=void 0,this.container=t,this.renderer=this.initRenderer(t),this.scene=this.initScene(),this.camera=this.initCamera(),this.center=this.initCenter(),this.camera.lookAt(this.center);var n=this.initAmbientLight();this.scene.add(n);var i=this.initDirectionalLight();this.scene.add(i),this.globe=this.createGlobe(),this.scene.add(this.globe),this.clouds=this.createClouds(),this.scene.add(this.clouds);var a=this.initStarField();this.scene.add(a),this.controls=new d(t,this.drag.bind(this),this.zoomIn.bind(this),this.zoomOut.bind(this))}return Object(u.a)(e,[{key:"initRenderer",value:function(e){var t=new l.n;return t.setSize(window.innerWidth,window.innerHeight),e.appendChild(t.domElement),t}},{key:"initScene",value:function(){return new l.j}},{key:"initCamera",value:function(){var e=new l.i(45,window.innerWidth/window.innerHeight,.01,300);return e.up=new l.m(0,0,1),e.position.x=2,e}},{key:"initCenter",value:function(){return new l.m}},{key:"initAmbientLight",value:function(){return new l.a(3355443)}},{key:"initDirectionalLight",value:function(){var e=new l.d(16777215,1);return e.position.set(5,3,5),e}},{key:"createGlobe",value:function(){var e=new l.l;return new l.f(new l.k(.5,32,32).rotateX(l.e.degToRad(90)),new l.h({map:e.load("img/2_no_clouds_4k.jpg"),bumpMap:e.load("img/elev_bump_4k.jpg"),bumpScale:.01,specularMap:e.load("img/water_4k.png"),specular:new l.c("grey")}))}},{key:"createClouds",value:function(){return new l.f(new l.k(.503,32,32).rotateX(l.e.degToRad(90)),new l.h({map:(new l.l).load("img/fair_clouds_4k.png"),transparent:!0}))}},{key:"initStarField",value:function(){return new l.f(new l.k(90,64,64).rotateX(l.e.degToRad(90)),new l.g({map:(new l.l).load("img/galaxy_starfield.png"),side:l.b}))}},{key:"drag",value:function(e,t){var n=Math.PI/450,i=n*e,a=n*t,r=this.camera.position.sub(this.center),o=r.length(),s=Math.acos(r.z/o),h=Math.atan2(r.y,r.x);s=Math.min(Math.max(s-a,0),Math.PI),h-=i,r.x=o*Math.sin(s)*Math.cos(h),r.y=o*Math.sin(s)*Math.sin(h),r.z=o*Math.cos(s),this.camera.position.add(this.center),this.camera.lookAt(this.center)}},{key:"zoomIn",value:function(){this.camera.position.length()>.7&&this.camera.position.sub(this.center).multiplyScalar(.9).add(this.center)}},{key:"zoomOut",value:function(){this.camera.position.length()<5&&this.camera.position.sub(this.center).multiplyScalar(1.1).add(this.center)}},{key:"render",value:function(){var e=this.renderer,t=this.globe,n=this.scene,i=this.camera,a=this.clouds,r=this.container,o=[];o.push(function(e){t.rotateZ(1/32*e)}),o.push(function(e){a.rotateZ(1/24*e)}),window.addEventListener("resize",function(){i.aspect=r.clientWidth/r.clientHeight,i.updateProjectionMatrix(),e.setSize(r.clientWidth,r.clientHeight)}),o.push(function(){e.render(n,i)});var s=null;requestAnimationFrame(function e(t){s=s||t-1e3/60;var n=Math.min(200,t-s);s=t,o.forEach(function(e){e(n/1e3,t/1e3)}),requestAnimationFrame(e)})}}]),e}();var p=function(){var e=function(){var e=Object(i.useRef)(null);return Object(i.useEffect)(function(){e.current&&new m(e.current).render()}),e}();return a.a.createElement("div",{className:h.a.app},a.a.createElement("header",{className:h.a.appHeader},"CLEAN PLANET"),a.a.createElement("main",{className:h.a.threeContainer,ref:e}),a.a.createElement("footer",null,"\xa9 Anton Chernov 2019"))};n(13),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(a.a.createElement(p,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},3:function(e,t,n){e.exports={app:"app_app__287iy",appHeader:"app_appHeader__2NN4M",threeContainer:"app_threeContainer__1T10y"}},7:function(e,t,n){e.exports=n(14)}},[[7,1,2]]]);
//# sourceMappingURL=main.e0d73495.chunk.js.map