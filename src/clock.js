(function (root, factory) {
  var plugin = "Clock";

  if (typeof exports === "object") {
    module.exports = factory(plugin);
  } else if (typeof define === "function" && define.amd) {
    define([], factory(plugin));
  } else {
    root[plugin] = factory(plugin);
  }
})(typeof global !== "undefined" ? global : this.window || this.global, function (plugin) {
	"use strict";
	var win = window,
		doc = document,
		body = doc.body;

	var defaultConfig = {
		css : {
			color: "lightgreen",
			"background-color": "black",
		},
		layout :{
			top: "{title}",
			bottom : "{date}",
		}
	}

	var on = function(el, e, fn){
		el.addEventListener(e, fn, false);
	}

	var isObject = function(val){
		return Object.prototype.toString.call(val) === "[object Object]";
	}

	var extend = function (src, props) {
		for (var prop in props) {
			if (props.hasOwnProperty(prop)) {
				var val = props[prop];
				if (val && isObject(val)) {
					src[prop] = src[prop] || {};
					extend(src[prop], val);
				} else {
					src[prop] = val;
				}
			}
		}
		return src;
	}

	var createElement = function (a, b){
		var d = doc.createElement(a);
		if (b && "object" == typeof b) {
			var e;
			for(e in b){
				if("html" === e){
					d.innerHTML = b[e];
				} else {
					d.setAttribute(e, b[e]);
				}
			}
		}
		return d;
	}

	var classList = {
    add: function (s, a) {
			if (s.classList) {
				s.classList.add(a);
			} else {
				if (!classList.contains(s, a)) {
					s.className = s.className.trim() + " " + a;
				}
			}
		},
		remove: function (s, a) {
			if (s.classList) {
				// Split the space-separated class names and remove them one by one
				a.split(" ").forEach(function (className) {
					s.classList.remove(className);
				});
			} else {
				if (classList.contains(s, a)) {
					s.className = s.className.replace(
						new RegExp("(^|\\s)" + a.split(" ").join("|") + "(\\s|$)", "gi"),
						" "
					);
				}
			}
		},
		contains: function (s, a) {
			if (s && a) {
				if (s.classList) {
					// Check if any of the provided classes are in the class list
					return a.split(" ").some(function (className) {
						return s.classList.contains(className);
					});
				} else {
					// Check each class individually in the className string
					return a.split(" ").every(function (className) {
						return new RegExp("(^|\\s)" + className + "(\\s|$)", "gi").test(s.className);
					});
				}
			}
			return false;
		}
	};


	var css = function (el, e) {
		if (isObject(e)) {
			for(var s in e) {
				el.style[s] = e[s];
			}
		}

		return el;
	}

	var timer = function(t){
		var hrs = t.getHours().toString().padStart(2, "0"),
			mins = t.getMinutes().toString().padStart(2, "0"),
			sec = t.getSeconds().toString().padStart(2, "0");
		return `${hrs}:${mins}:${sec}`;
	}

	var currentDate = function(t){
		var mons = (t.getMonth() + 1).toString().padStart(2, "0"),
			day = t.getDate().toString().padStart(2, "0"),
			yrs = t.getFullYear().toString();

		return `${mons}/${day}/${yrs}`;
	}

	var Clock = function (clock, options) {
		this.initialized = false;

		this.options = extend(defaultConfig, options);

		if(typeof clock === "string"){
			clock = document.querySelector(clock);
		}

		this.clock = clock;

		this.init();
	}

	var proto = Clock.prototype;

	proto.init = function (options) {
		if (this.initialized){
			return false;
		}

		var that = this;

		this.options = extend(this.options, options || {});

		// IE detection
		this.isIE = !!/(msie|trident)/i.test(navigator.userAgent);

		this.render();

		that.initialized = true;
	}

	proto.render = function (type){
		var that = this,
			o = that.options,
			template = "";

		// Build
		that.wrapper = createElement("div", {
			class : "clock-wrapper"
		});

		// Template for custom layouts
		template += "<div class='clock-top'>";
		template += o.layout.top;
		template += "</div>";
		template += "<div class='clock-container'></div>";
		template += "<div class='clock-bottom'>";
		template += o.layout.bottom;
		template +="</div>";


		if(o.layout.top === "{title}" || !o.layout.top){
			template = template.replace("<div class='clock-top'>{title}</div>", "");
		}

		that.wrapper.innerHTML = template;

		that.container = that.wrapper.querySelector(".clock-container");
		that.bottom = that.wrapper.querySelector(".clock-bottom");

		// apply custom css
		that.clock = css(that.clock, o.css);

		// Insert in to DOM tree
		that.clock.parentNode.replaceChild(that.wrapper, that.clock);
		that.container.appendChild(that.clock);

		that.startTime();
	}

	proto.startTime = function(){
		var that = this;

		setInterval(function (){
			var today = new Date();
			that.clock.innerHTML = timer(today);
			that.bottom.innerHTML = currentDate(today);
		}, 1000);
	}

	return Clock;
});
