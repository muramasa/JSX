var BrowserPlatform = jsx.Platform.extend({
	constructor: function(root) {
		this._root = root;
		this._errors = [];
		this._content = {};

		this._map = JSON.parse(this.load("/web/tree.generated.json"));
	},

	getRoot: function () {
		return this._root;
	},

	fileExists: function (path) {
		path = path.replace(this._root, "");
		//console.log([this._root, path, path in this._map]);
		return path in this._map;
	},

	getFilesInDirectory: function (path) {
		var d = this._map[path];
		if(d instanceof Object) {
			var a = [];
			for(var k in d) {
				if(typeof(d[k]) === "string") {
					a.push(k);
				}
			}
			return a;
		}
		else {
			throw new Error("not a directory");
		}
	},

	setContent: function (name, content) {
		this._content[name] = content;
	},

	load: function (name) {
		if(name in this._content) {
			return this._content[name];
		}
		// synchronous XHR
		var xhr = new XMLHttpRequest();
		xhr.open("GET", name, false);
		xhr.send(null);
		if(xhr.status === 200) {
			return xhr.responseText;
		}
		else {
			throw new Error(xhr.status + " " + xhr.statusText + ": " + name);
		}
	},

	error: function (s) {
		console.error(s);
		this._errors.push(s);
	},

	getErrors: function () {
		return this._errors;
	},

	applyClosureCompiler: function (sourceText, level, minify) {
		var URL = 'http://closure-compiler.appspot.com/compile';
		var xhr = new XMLHttpRequest();
		xhr.open("POST", URL, false);
		xhr.setRequestHeader("Content-Type",
							 "application/x-www-form-urlencoded");

		var param = {
			js_code: sourceText,
			compilation_level: level,
			output_format: "text",
			output_info: "compiled_code"
		};
		if(!minify) {
			param.formatting = "pretty_print";
		}
		if(level === "ADVANCED_OPTIMIZATIONS") {
			param.js_externs = "";
		}
		var params = [];
		for(var key in param) {
			params.push(encodeURIComponent(key) +
						"=" +
						encodeURIComponent(param[key]));
		}
		xhr.send(params.join("&"));
		return xhr.responseText;
	}
});
