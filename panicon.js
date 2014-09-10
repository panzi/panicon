(function () {
"use strict";

var panArea = document.createElement("div");
var panner  = document.createElement("div");

panArea.style.position = 'fixed';
panArea.style.right = '10px';
panArea.style.bottom = '10px';
panArea.style.border = '1px solid #808080';
panArea.style.transition = 'opacity 0.5s';
panArea.style.opacity = '0.4';
panArea.style.backgroundColor = 'rgba(96,96,96,0.5)';
panArea.style.boxSizing = 'border-box';
panArea.style.zIndex = '2147483647';

panArea.requestPointerLock =
	panArea.requestPointerLock ||
	panArea.webkitRequestPointerLock ||
	panArea.mozRequestPointerLock ||
	function () {};

panner.style.position = 'absolute';
panner.style.border = '1px solid #404040';
panner.style.cursor = 'move';
panner.style.backgroundColor = 'rgba(64,64,64,0.8)';
panner.style.boxSizing = 'border-box';

var dragged = false;
var entered = false;
var startMouseX = 0;
var startMouseY = 0;
var startScrollX = 0;
var startScrollY = 0;
var scaleX = 1;
var scaleY = 1;
var moveTimer = null;

var exitPointerock = (
	document.exitPointerLock ||
	document.mozExitPointerLock ||
	document.webkitExitPointerLock ||
	function () {}).bind(document);

function dragStart (event) {
	startScrollX = window.scrollX;
	startScrollY = window.scrollY;
	startMouseX = event.clientX;
	startMouseY = event.clientY;
	clearTimeout(moveTimer);
	moveTimer = null;
	dragged = true;
	event.preventDefault();
	event.stopPropagation();
}

panArea.addEventListener('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
}, false);

panArea.addEventListener('mousedown', function (event) {
	if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
		dragStart(event);
		this.requestPointerLock();
	}
	else if (event.button === 0 && !event.shiftKey) {
		/* jump scroll and start drag */
		var pw = panner.offsetWidth;
		var ph = panner.offsetHeight;
		var ar = panArea.getBoundingClientRect();
		var px = event.clientX - pw/2 - ar.left;
		var py = event.clientY - ph/2 - ar.top;
		var sx = px / scaleX;
		var sy = py / scaleY;
		window.scrollTo(sx, sy);
		dragStart(event);
	}
	event.preventDefault();
	event.stopPropagation();
}, false);

panner.addEventListener('click', function (event) {
	if (event.button === 0 || event.button === 1) {
		event.preventDefault();
		event.stopPropagation();
	}
}, false);

panner.addEventListener('mousedown', function (event) {
	if (event.button === 0 && !event.shiftKey) {
		dragStart(event);
	}
}, false);

window.addEventListener('mouseup', function (event) {
	dragged = false;
	resetMoveTimer();
	exitPointerock();
}, false);

window.addEventListener('mousemove', function (event) {
	panArea.style.opacity = entered ? '1.0' : '0.7';
	if (dragged) {	
		var element =
			document.pointerLockElement ||
			document.webkitPointerLockElement ||
			document.mozPointerLockElement;

		if (element === panArea) {
			window.scrollBy(
				event.movementX || event.webkitMovementX || event.mozMovementX,
				event.movementY || event.webkitMovementY || event.mozMovementY);
		}
		else {
			var dmx = event.clientX - startMouseX;
			var dmy = event.clientY - startMouseY;
			var sx = startScrollX + Math.floor(dmx / scaleX);
			var sy = startScrollY + Math.floor(dmy / scaleY);
			window.scrollTo(sx, sy);
		}


		event.preventDefault();
		event.stopPropagation();
	}
	else {
		resetMoveTimer();
	}
}, false);

redraw();
resetMoveTimer();

panArea.appendChild(panner);

panArea.addEventListener('mouseenter', function (event) {
	entered = true;
	this.style.opacity = '1.0';
}, false);

panArea.addEventListener('mouseleave', function (event) {
	entered = false;
	this.style.opacity = '0.7';
}, false);

if (document.body) {
	document.body.appendChild(panArea);
}
else {
	document.addEventListener("DOMContentLoaded", addPanIcon, false);
	window.addEventListener("load", addPanIcon, false);
}

function addPanIcon () {
	document.body.appendChild(panArea);
	document.removeEventListener("DOMContentLoaded", addPanIcon, false);
	window.removeEventListener("load", addPanIcon, false);
}

window.addEventListener('resize', redraw, false);
window.addEventListener('scroll', redraw, false);
window.addEventListener('load', redraw, false);

var observer = new MutationObserver(function (mutations) {
	var found = false;
	for (var i = 0; i < mutations.length; ++ i) {
		var mutation = mutations[i];
		if (mutation.target !== panArea && mutation.target !== panner) {
			found = true;
			break;
		}
	}

	if (found) {
		redraw();
	}
});

observer.observe(document.documentElement, {
	attributes: true,
	childList: true,
	characterData: true,
	subtree: true
});

function redraw () {
	var sx = window.scrollX;
	var sy = window.scrollY;
	var sw = document.documentElement.scrollWidth;
	var sh = document.documentElement.scrollHeight;
	var ww = window.innerWidth;
	var wh = window.innerHeight;
	var aw, ah, pw, ph, px, py;

	if (sw <= sh) {
		var maxh = Math.max(wh/2 - 10, 60);
		aw = 60;
		ah = sh/sw * aw;
		if (ah > maxh) {
			ah = maxh;
			aw = sw/sh * ah;
		}
	}
	else {
		var maxw = Math.max(ww/2 - 10, 60);
		ah = 60;
		aw = sw/sh * ah;
		if (aw > maxw) {
			aw = maxw;
			ah = sh/sw * aw;
		}
	}

	pw = aw/sw * ww;
	ph = ah/sh * wh;
	scaleX = pw/ww;
	scaleY = ph/wh;
	px = sx * scaleX;
	py = sy * scaleY;

	panArea.style.width  = Math.floor(aw)+'px';
	panArea.style.height = Math.floor(ah)+'px';
	panner.style.width  = Math.floor(pw)+'px';
	panner.style.height = Math.floor(ph)+'px';
	panner.style.left = Math.floor(px-1)+'px';
	panner.style.top  = Math.floor(py-1)+'px';
}

function resetMoveTimer() {
	if (moveTimer !== null) {
		clearTimeout(moveTimer);
	}

	moveTimer = setTimeout(function () {
		moveTimer = null;
		if (!dragged) {
			panArea.style.opacity = '0';
		}
	}, 2000);
}

})();
