/*
doormat - http://jh3y.github.io/doormat
Licensed under the MIT license

Jhey Tompkins (c) 2014.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = doormat;
function doormat(element, multiple) {
	this.element = element;
	this.multiple = (multiple) ? multiple: false;
	if (this.element) {
		this.setUp();
	}
}
doormat.prototype.setUp = function () {
	var doormat = this;
	(doormat.multiple) ? doormat.element.className += ' doormat-multiple': doormat.element.className += ' doormat';
	if (doormat.multiple && (doormat.element.tagName === 'OL' || doormat.element.tagName === 'UL')) {
		var panels = doormat.element.querySelectorAll('li');
		[].forEach.call(panels, function(panel, index) {
			panel.className += ' doormat-panel';
		});
		panels[0].className += ' current';
		panels[1].className += ' next';
	} else {
		doormat.element.nextElementSibling.className += ' doormat-page-content';
	}
	doormat.bindEvents();
}
doormat.prototype.bindEvents = function () {
	var doormat = this,
		doormatHeight = (doormat.multiple) ? doormat.element.querySelector('.current').offsetHeight + doormat.element.querySelector('.current').offsetTop: doormat.element.offsetHeight,
		iOSDevice = (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)),
		createiOSHeight = function () {
			window.scrollTo(0, 1);
			if (doormat.multiple) {						
				[].forEach.call(doormat.element.querySelectorAll('.doormat-panel'), function (panel, index) {
					panel.style.minHeight = window.innerHeight + 'px';
				});
			} else {
				doormat.element.style.minHeight = window.innerHeight + 'px';
			}
		}
	if (iOSDevice) {
		doormat.element.className += ' iOS';
		createiOSHeight();
		window.onorientationchange = function () {
			createiOSHeight();
		}
		window.onresize = function () {
			createiOSHeight();
		}
	}
	window.onresize = function () {
		if (doormat.multiple) {
			doormatHeight = doormat.element.querySelector('.current').offsetHeight + doormat.element.querySelector('.current').offsetTop;
		} else {
			doormatHeight = doormat.element.offsetHeight;
		}
	}
	if (!doormat.multiple) {
		window.onscroll = function () {
			var scrollY = (window.scrollY || window.pageYOffset);
			if (scrollY >= doormatHeight) {
				(document.body.className.indexOf('doormat-in-content') === -1) ? document.body.className += ' doormat-in-content': false;
			} else {
				document.body.className = document.body.className.replace('doormat-in-content', '');
			}
		};
	} else if (doormat.multiple) {
		var lastScrollPosition = 0;
		var scrollForward = true;
		window.onscroll = function () {
			var currentDm = doormat.element.querySelector('.current'),
				previousDm = currentDm.previousElementSibling,
				newCurrent = currentDm.nextElementSibling,
				scrollY = (window.scrollY || window.pageYOffset);
			scrollForward = (scrollY > lastScrollPosition) ? true: false;
			lastScrollPosition = scrollY;
			if ((scrollY > doormatHeight) && scrollForward) {
				if(newCurrent.nextElementSibling) {
					currentDm.className = currentDm.className.replace('current', '');
					newCurrent.className = newCurrent.className.replace('next', 'current');
					newCurrent.nextElementSibling.className += ' next';
					window.scrollTo(0, newCurrent.offsetTop + 1);
					doormatHeight = newCurrent.offsetTop + newCurrent.offsetHeight;
				}
			} else if (scrollY <= doormat.element.querySelector('.current').offsetTop && !scrollForward) {	
				if (previousDm) {
					currentDm.className = currentDm.className.replace('current', 'next');
					previousDm.className = previousDm.className + ' current';
					newCurrent.className = newCurrent.className.replace('next', '');
					window.scrollTo(0, previousDm.offsetTop + previousDm.offsetHeight);
					doormatHeight = previousDm.offsetTop + previousDm.offsetHeight;
					//detect if using Safari.
					if (navigator.userAgent.match(/Safari/i) && !navigator.userAgent.match(/Chrome/i)) {
						console.log('doormat: try to force repaint in Safari Webkit');
					}
				}
			}
		}
	}
}