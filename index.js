// @bun
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// node_modules/fast-safe-stringify/index.js
var require_fast_safe_stringify = __commonJS((exports, module) => {
  var defaultOptions = function() {
    return {
      depthLimit: Number.MAX_SAFE_INTEGER,
      edgesLimit: Number.MAX_SAFE_INTEGER
    };
  };
  var stringify = function(obj, replacer, spacer, options) {
    if (typeof options === "undefined") {
      options = defaultOptions();
    }
    decirc(obj, "", 0, [], undefined, 0, options);
    var res;
    try {
      if (replacerStack.length === 0) {
        res = JSON.stringify(obj, replacer, spacer);
      } else {
        res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
      }
    } catch (_) {
      return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
    } finally {
      while (arr.length !== 0) {
        var part = arr.pop();
        if (part.length === 4) {
          Object.defineProperty(part[0], part[1], part[3]);
        } else {
          part[0][part[1]] = part[2];
        }
      }
    }
    return res;
  };
  var setReplace = function(replace, val, k, parent) {
    var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
    if (propertyDescriptor.get !== undefined) {
      if (propertyDescriptor.configurable) {
        Object.defineProperty(parent, k, { value: replace });
        arr.push([parent, k, val, propertyDescriptor]);
      } else {
        replacerStack.push([val, k, replace]);
      }
    } else {
      parent[k] = replace;
      arr.push([parent, k, val]);
    }
  };
  var decirc = function(val, k, edgeIndex, stack, parent, depth, options) {
    depth += 1;
    var i;
    if (typeof val === "object" && val !== null) {
      for (i = 0;i < stack.length; i++) {
        if (stack[i] === val) {
          setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
          return;
        }
      }
      if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
        setReplace(LIMIT_REPLACE_NODE, val, k, parent);
        return;
      }
      if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
        setReplace(LIMIT_REPLACE_NODE, val, k, parent);
        return;
      }
      stack.push(val);
      if (Array.isArray(val)) {
        for (i = 0;i < val.length; i++) {
          decirc(val[i], i, i, stack, val, depth, options);
        }
      } else {
        var keys = Object.keys(val);
        for (i = 0;i < keys.length; i++) {
          var key = keys[i];
          decirc(val[key], key, i, stack, val, depth, options);
        }
      }
      stack.pop();
    }
  };
  var compareFunction = function(a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  };
  var deterministicStringify = function(obj, replacer, spacer, options) {
    if (typeof options === "undefined") {
      options = defaultOptions();
    }
    var tmp = deterministicDecirc(obj, "", 0, [], undefined, 0, options) || obj;
    var res;
    try {
      if (replacerStack.length === 0) {
        res = JSON.stringify(tmp, replacer, spacer);
      } else {
        res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
      }
    } catch (_) {
      return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
    } finally {
      while (arr.length !== 0) {
        var part = arr.pop();
        if (part.length === 4) {
          Object.defineProperty(part[0], part[1], part[3]);
        } else {
          part[0][part[1]] = part[2];
        }
      }
    }
    return res;
  };
  var deterministicDecirc = function(val, k, edgeIndex, stack, parent, depth, options) {
    depth += 1;
    var i;
    if (typeof val === "object" && val !== null) {
      for (i = 0;i < stack.length; i++) {
        if (stack[i] === val) {
          setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
          return;
        }
      }
      try {
        if (typeof val.toJSON === "function") {
          return;
        }
      } catch (_) {
        return;
      }
      if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
        setReplace(LIMIT_REPLACE_NODE, val, k, parent);
        return;
      }
      if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
        setReplace(LIMIT_REPLACE_NODE, val, k, parent);
        return;
      }
      stack.push(val);
      if (Array.isArray(val)) {
        for (i = 0;i < val.length; i++) {
          deterministicDecirc(val[i], i, i, stack, val, depth, options);
        }
      } else {
        var tmp = {};
        var keys = Object.keys(val).sort(compareFunction);
        for (i = 0;i < keys.length; i++) {
          var key = keys[i];
          deterministicDecirc(val[key], key, i, stack, val, depth, options);
          tmp[key] = val[key];
        }
        if (typeof parent !== "undefined") {
          arr.push([parent, k, val]);
          parent[k] = tmp;
        } else {
          return tmp;
        }
      }
      stack.pop();
    }
  };
  var replaceGetterValues = function(replacer) {
    replacer = typeof replacer !== "undefined" ? replacer : function(k, v) {
      return v;
    };
    return function(key, val) {
      if (replacerStack.length > 0) {
        for (var i = 0;i < replacerStack.length; i++) {
          var part = replacerStack[i];
          if (part[1] === key && part[0] === val) {
            val = part[2];
            replacerStack.splice(i, 1);
            break;
          }
        }
      }
      return replacer.call(this, key, val);
    };
  };
  module.exports = stringify;
  stringify.default = stringify;
  stringify.stable = deterministicStringify;
  stringify.stableStringify = deterministicStringify;
  var LIMIT_REPLACE_NODE = "[...]";
  var CIRCULAR_REPLACE_NODE = "[Circular]";
  var arr = [];
  var replacerStack = [];
});

// node_modules/is-arrayish/index.js
var require_is_arrayish = __commonJS((exports, module) => {
  module.exports = function isArrayish(obj) {
    if (!obj) {
      return false;
    }
    return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && obj.splice instanceof Function;
  };
});

// node_modules/error-ex/index.js
var require_error_ex = __commonJS((exports, module) => {
  var util = import.meta.require("util");
  var isArrayish = require_is_arrayish();
  var errorEx = function errorEx(name, properties) {
    if (!name || name.constructor !== String) {
      properties = name || {};
      name = Error.name;
    }
    var errorExError = function ErrorEXError(message) {
      if (!this) {
        return new ErrorEXError(message);
      }
      message = message instanceof Error ? message.message : message || this.message;
      Error.call(this, message);
      Error.captureStackTrace(this, errorExError);
      this.name = name;
      Object.defineProperty(this, "message", {
        configurable: true,
        enumerable: false,
        get: function() {
          var newMessage = message.split(/\r?\n/g);
          for (var key in properties) {
            if (!properties.hasOwnProperty(key)) {
              continue;
            }
            var modifier = properties[key];
            if ("message" in modifier) {
              newMessage = modifier.message(this[key], newMessage) || newMessage;
              if (!isArrayish(newMessage)) {
                newMessage = [newMessage];
              }
            }
          }
          return newMessage.join("\n");
        },
        set: function(v) {
          message = v;
        }
      });
      var overwrittenStack = null;
      var stackDescriptor = Object.getOwnPropertyDescriptor(this, "stack");
      var stackGetter = stackDescriptor.get;
      var stackValue = stackDescriptor.value;
      delete stackDescriptor.value;
      delete stackDescriptor.writable;
      stackDescriptor.set = function(newstack) {
        overwrittenStack = newstack;
      };
      stackDescriptor.get = function() {
        var stack = (overwrittenStack || (stackGetter ? stackGetter.call(this) : stackValue)).split(/\r?\n+/g);
        if (!overwrittenStack) {
          stack[0] = this.name + ": " + this.message;
        }
        var lineCount = 1;
        for (var key in properties) {
          if (!properties.hasOwnProperty(key)) {
            continue;
          }
          var modifier = properties[key];
          if ("line" in modifier) {
            var line = modifier.line(this[key]);
            if (line) {
              stack.splice(lineCount++, 0, "    " + line);
            }
          }
          if ("stack" in modifier) {
            modifier.stack(this[key], stack);
          }
        }
        return stack.join("\n");
      };
      Object.defineProperty(this, "stack", stackDescriptor);
    };
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(errorExError.prototype, Error.prototype);
      Object.setPrototypeOf(errorExError, Error);
    } else {
      util.inherits(errorExError, Error);
    }
    return errorExError;
  };
  errorEx.append = function(str, def) {
    return {
      message: function(v, message) {
        v = v || def;
        if (v) {
          message[0] += " " + str.replace("%s", v.toString());
        }
        return message;
      }
    };
  };
  errorEx.line = function(str, def) {
    return {
      line: function(v) {
        v = v || def;
        if (v) {
          return str.replace("%s", v.toString());
        }
        return null;
      }
    };
  };
  module.exports = errorEx;
});

// node_modules/json-parse-better-errors/index.js
var require_json_parse_better_errors = __commonJS((exports, module) => {
  var parseJson = function(txt, reviver, context) {
    context = context || 20;
    try {
      return JSON.parse(txt, reviver);
    } catch (e) {
      if (typeof txt !== "string") {
        const isEmptyArray = Array.isArray(txt) && txt.length === 0;
        const errorMessage = "Cannot parse " + (isEmptyArray ? "an empty array" : String(txt));
        throw new TypeError(errorMessage);
      }
      const syntaxErr = e.message.match(/^Unexpected token.*position\s+(\d+)/i);
      const errIdx = syntaxErr ? +syntaxErr[1] : e.message.match(/^Unexpected end of JSON.*/i) ? txt.length - 1 : null;
      if (errIdx != null) {
        const start = errIdx <= context ? 0 : errIdx - context;
        const end = errIdx + context >= txt.length ? txt.length : errIdx + context;
        e.message += ` while parsing near '${start === 0 ? "" : "..."}${txt.slice(start, end)}${end === txt.length ? "" : "..."}'`;
      } else {
        e.message += ` while parsing '${txt.slice(0, context * 2)}'`;
      }
      throw e;
    }
  };
  module.exports = parseJson;
});

// node_modules/parse-json/index.js
var require_parse_json = __commonJS((exports, module) => {
  var errorEx = require_error_ex();
  var fallback = require_json_parse_better_errors();
  var JSONError = errorEx("JSONError", {
    fileName: errorEx.append("in %s")
  });
  module.exports = (input, reviver, filename) => {
    if (typeof reviver === "string") {
      filename = reviver;
      reviver = null;
    }
    try {
      try {
        return JSON.parse(input, reviver);
      } catch (err) {
        fallback(input, reviver);
        throw err;
      }
    } catch (err) {
      err.message = err.message.replace(/\n/g, "");
      const jsonErr = new JSONError(err);
      if (filename) {
        jsonErr.fileName = filename;
      }
      throw jsonErr;
    }
  };
});

// node_modules/strip-bom/index.js
var require_strip_bom = __commonJS((exports, module) => {
  module.exports = (string) => {
    if (typeof string !== "string") {
      throw new TypeError(`Expected a string, got ${typeof string}`);
    }
    if (string.charCodeAt(0) === 65279) {
      return string.slice(1);
    }
    return string;
  };
});

// node_modules/strip-json-comments/index.js
var require_strip_json_comments = __commonJS((exports, module) => {
  var singleComment = Symbol("singleComment");
  var multiComment = Symbol("multiComment");
  var stripWithoutWhitespace = () => "";
  var stripWithWhitespace = (string, start, end) => string.slice(start, end).replace(/\S/g, " ");
  var isEscaped = (jsonString, quotePosition) => {
    let index = quotePosition - 1;
    let backslashCount = 0;
    while (jsonString[index] === "\\") {
      index -= 1;
      backslashCount += 1;
    }
    return Boolean(backslashCount % 2);
  };
  module.exports = (jsonString, options = {}) => {
    if (typeof jsonString !== "string") {
      throw new TypeError(`Expected argument \`jsonString\` to be a \`string\`, got \`${typeof jsonString}\``);
    }
    const strip = options.whitespace === false ? stripWithoutWhitespace : stripWithWhitespace;
    let insideString = false;
    let insideComment = false;
    let offset = 0;
    let result = "";
    for (let i = 0;i < jsonString.length; i++) {
      const currentCharacter = jsonString[i];
      const nextCharacter = jsonString[i + 1];
      if (!insideComment && currentCharacter === '"') {
        const escaped = isEscaped(jsonString, i);
        if (!escaped) {
          insideString = !insideString;
        }
      }
      if (insideString) {
        continue;
      }
      if (!insideComment && currentCharacter + nextCharacter === "//") {
        result += jsonString.slice(offset, i);
        offset = i;
        insideComment = singleComment;
        i++;
      } else if (insideComment === singleComment && currentCharacter + nextCharacter === "\r\n") {
        i++;
        insideComment = false;
        result += strip(jsonString, offset, i);
        offset = i;
        continue;
      } else if (insideComment === singleComment && currentCharacter === "\n") {
        insideComment = false;
        result += strip(jsonString, offset, i);
        offset = i;
      } else if (!insideComment && currentCharacter + nextCharacter === "/*") {
        result += jsonString.slice(offset, i);
        offset = i;
        insideComment = multiComment;
        i++;
        continue;
      } else if (insideComment === multiComment && currentCharacter + nextCharacter === "*/") {
        i++;
        insideComment = false;
        result += strip(jsonString, offset, i + 1);
        offset = i + 1;
        continue;
      }
    }
    return result + (insideComment ? strip(jsonString.slice(offset)) : jsonString.slice(offset));
  };
});

// node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS((exports, module) => {
  var patch = function(fs) {
    if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
      patchLchmod(fs);
    }
    if (!fs.lutimes) {
      patchLutimes(fs);
    }
    fs.chown = chownFix(fs.chown);
    fs.fchown = chownFix(fs.fchown);
    fs.lchown = chownFix(fs.lchown);
    fs.chmod = chmodFix(fs.chmod);
    fs.fchmod = chmodFix(fs.fchmod);
    fs.lchmod = chmodFix(fs.lchmod);
    fs.chownSync = chownFixSync(fs.chownSync);
    fs.fchownSync = chownFixSync(fs.fchownSync);
    fs.lchownSync = chownFixSync(fs.lchownSync);
    fs.chmodSync = chmodFixSync(fs.chmodSync);
    fs.fchmodSync = chmodFixSync(fs.fchmodSync);
    fs.lchmodSync = chmodFixSync(fs.lchmodSync);
    fs.stat = statFix(fs.stat);
    fs.fstat = statFix(fs.fstat);
    fs.lstat = statFix(fs.lstat);
    fs.statSync = statFixSync(fs.statSync);
    fs.fstatSync = statFixSync(fs.fstatSync);
    fs.lstatSync = statFixSync(fs.lstatSync);
    if (fs.chmod && !fs.lchmod) {
      fs.lchmod = function(path, mode, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchmodSync = function() {
      };
    }
    if (fs.chown && !fs.lchown) {
      fs.lchown = function(path, uid, gid, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchownSync = function() {
      };
    }
    if (platform === "win32") {
      fs.rename = typeof fs.rename !== "function" ? fs.rename : function(fs$rename) {
        function rename(from, to, cb) {
          var start = Date.now();
          var backoff = 0;
          fs$rename(from, to, function CB(er) {
            if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 60000) {
              setTimeout(function() {
                fs.stat(to, function(stater, st) {
                  if (stater && stater.code === "ENOENT")
                    fs$rename(from, to, CB);
                  else
                    cb(er);
                });
              }, backoff);
              if (backoff < 100)
                backoff += 10;
              return;
            }
            if (cb)
              cb(er);
          });
        }
        if (Object.setPrototypeOf)
          Object.setPrototypeOf(rename, fs$rename);
        return rename;
      }(fs.rename);
    }
    fs.read = typeof fs.read !== "function" ? fs.read : function(fs$read) {
      function read(fd, buffer, offset, length, position, callback_) {
        var callback;
        if (callback_ && typeof callback_ === "function") {
          var eagCounter = 0;
          callback = function(er, _, __) {
            if (er && er.code === "EAGAIN" && eagCounter < 10) {
              eagCounter++;
              return fs$read.call(fs, fd, buffer, offset, length, position, callback);
            }
            callback_.apply(this, arguments);
          };
        }
        return fs$read.call(fs, fd, buffer, offset, length, position, callback);
      }
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(read, fs$read);
      return read;
    }(fs.read);
    fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : function(fs$readSync) {
      return function(fd, buffer, offset, length, position) {
        var eagCounter = 0;
        while (true) {
          try {
            return fs$readSync.call(fs, fd, buffer, offset, length, position);
          } catch (er) {
            if (er.code === "EAGAIN" && eagCounter < 10) {
              eagCounter++;
              continue;
            }
            throw er;
          }
        }
      };
    }(fs.readSync);
    function patchLchmod(fs2) {
      fs2.lchmod = function(path, mode, callback) {
        fs2.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
          if (err) {
            if (callback)
              callback(err);
            return;
          }
          fs2.fchmod(fd, mode, function(err2) {
            fs2.close(fd, function(err22) {
              if (callback)
                callback(err2 || err22);
            });
          });
        });
      };
      fs2.lchmodSync = function(path, mode) {
        var fd = fs2.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
        var threw = true;
        var ret;
        try {
          ret = fs2.fchmodSync(fd, mode);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs2.closeSync(fd);
            } catch (er) {
            }
          } else {
            fs2.closeSync(fd);
          }
        }
        return ret;
      };
    }
    function patchLutimes(fs2) {
      if (constants.hasOwnProperty("O_SYMLINK") && fs2.futimes) {
        fs2.lutimes = function(path, at, mt, cb) {
          fs2.open(path, constants.O_SYMLINK, function(er, fd) {
            if (er) {
              if (cb)
                cb(er);
              return;
            }
            fs2.futimes(fd, at, mt, function(er2) {
              fs2.close(fd, function(er22) {
                if (cb)
                  cb(er2 || er22);
              });
            });
          });
        };
        fs2.lutimesSync = function(path, at, mt) {
          var fd = fs2.openSync(path, constants.O_SYMLINK);
          var ret;
          var threw = true;
          try {
            ret = fs2.futimesSync(fd, at, mt);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs2.closeSync(fd);
              } catch (er) {
              }
            } else {
              fs2.closeSync(fd);
            }
          }
          return ret;
        };
      } else if (fs2.futimes) {
        fs2.lutimes = function(_a, _b, _c, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs2.lutimesSync = function() {
        };
      }
    }
    function chmodFix(orig) {
      if (!orig)
        return orig;
      return function(target, mode, cb) {
        return orig.call(fs, target, mode, function(er) {
          if (chownErOk(er))
            er = null;
          if (cb)
            cb.apply(this, arguments);
        });
      };
    }
    function chmodFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, mode) {
        try {
          return orig.call(fs, target, mode);
        } catch (er) {
          if (!chownErOk(er))
            throw er;
        }
      };
    }
    function chownFix(orig) {
      if (!orig)
        return orig;
      return function(target, uid, gid, cb) {
        return orig.call(fs, target, uid, gid, function(er) {
          if (chownErOk(er))
            er = null;
          if (cb)
            cb.apply(this, arguments);
        });
      };
    }
    function chownFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, uid, gid) {
        try {
          return orig.call(fs, target, uid, gid);
        } catch (er) {
          if (!chownErOk(er))
            throw er;
        }
      };
    }
    function statFix(orig) {
      if (!orig)
        return orig;
      return function(target, options, cb) {
        if (typeof options === "function") {
          cb = options;
          options = null;
        }
        function callback(er, stats) {
          if (stats) {
            if (stats.uid < 0)
              stats.uid += 4294967296;
            if (stats.gid < 0)
              stats.gid += 4294967296;
          }
          if (cb)
            cb.apply(this, arguments);
        }
        return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
      };
    }
    function statFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, options) {
        var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
        if (stats) {
          if (stats.uid < 0)
            stats.uid += 4294967296;
          if (stats.gid < 0)
            stats.gid += 4294967296;
        }
        return stats;
      };
    }
    function chownErOk(er) {
      if (!er)
        return true;
      if (er.code === "ENOSYS")
        return true;
      var nonroot = !process.getuid || process.getuid() !== 0;
      if (nonroot) {
        if (er.code === "EINVAL" || er.code === "EPERM")
          return true;
      }
      return false;
    }
  };
  var constants = import.meta.require("constants");
  var origCwd = process.cwd;
  var cwd = null;
  var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    if (!cwd)
      cwd = origCwd.call(process);
    return cwd;
  };
  try {
    process.cwd();
  } catch (er) {
  }
  if (typeof process.chdir === "function") {
    chdir = process.chdir;
    process.chdir = function(d) {
      cwd = null;
      chdir.call(process, d);
    };
    if (Object.setPrototypeOf)
      Object.setPrototypeOf(process.chdir, chdir);
  }
  var chdir;
  module.exports = patch;
});

// node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS((exports, module) => {
  var legacy = function(fs) {
    return {
      ReadStream,
      WriteStream
    };
    function ReadStream(path, options) {
      if (!(this instanceof ReadStream))
        return new ReadStream(path, options);
      Stream.call(this);
      var self2 = this;
      this.path = path;
      this.fd = null;
      this.readable = true;
      this.paused = false;
      this.flags = "r";
      this.mode = 438;
      this.bufferSize = 64 * 1024;
      options = options || {};
      var keys = Object.keys(options);
      for (var index = 0, length = keys.length;index < length; index++) {
        var key = keys[index];
        this[key] = options[key];
      }
      if (this.encoding)
        this.setEncoding(this.encoding);
      if (this.start !== undefined) {
        if (typeof this.start !== "number") {
          throw TypeError("start must be a Number");
        }
        if (this.end === undefined) {
          this.end = Infinity;
        } else if (typeof this.end !== "number") {
          throw TypeError("end must be a Number");
        }
        if (this.start > this.end) {
          throw new Error("start must be <= end");
        }
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          self2._read();
        });
        return;
      }
      fs.open(this.path, this.flags, this.mode, function(err, fd) {
        if (err) {
          self2.emit("error", err);
          self2.readable = false;
          return;
        }
        self2.fd = fd;
        self2.emit("open", fd);
        self2._read();
      });
    }
    function WriteStream(path, options) {
      if (!(this instanceof WriteStream))
        return new WriteStream(path, options);
      Stream.call(this);
      this.path = path;
      this.fd = null;
      this.writable = true;
      this.flags = "w";
      this.encoding = "binary";
      this.mode = 438;
      this.bytesWritten = 0;
      options = options || {};
      var keys = Object.keys(options);
      for (var index = 0, length = keys.length;index < length; index++) {
        var key = keys[index];
        this[key] = options[key];
      }
      if (this.start !== undefined) {
        if (typeof this.start !== "number") {
          throw TypeError("start must be a Number");
        }
        if (this.start < 0) {
          throw new Error("start must be >= zero");
        }
        this.pos = this.start;
      }
      this.busy = false;
      this._queue = [];
      if (this.fd === null) {
        this._open = fs.open;
        this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
        this.flush();
      }
    }
  };
  var Stream = import.meta.require("stream").Stream;
  module.exports = legacy;
});

// node_modules/graceful-fs/clone.js
var require_clone = __commonJS((exports, module) => {
  var clone = function(obj) {
    if (obj === null || typeof obj !== "object")
      return obj;
    if (obj instanceof Object)
      var copy = { __proto__: getPrototypeOf(obj) };
    else
      var copy = Object.create(null);
    Object.getOwnPropertyNames(obj).forEach(function(key) {
      Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
    });
    return copy;
  };
  module.exports = clone;
  var getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return obj.__proto__;
  };
});

// node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS((exports, module) => {
  var noop = function() {
  };
  var publishQueue = function(context, queue2) {
    Object.defineProperty(context, gracefulQueue, {
      get: function() {
        return queue2;
      }
    });
  };
  var patch = function(fs2) {
    polyfills(fs2);
    fs2.gracefulify = patch;
    fs2.createReadStream = createReadStream;
    fs2.createWriteStream = createWriteStream;
    var fs$readFile = fs2.readFile;
    fs2.readFile = readFile;
    function readFile(path, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$readFile(path, options, cb);
      function go$readFile(path2, options2, cb2, startTime) {
        return fs$readFile(path2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$writeFile = fs2.writeFile;
    fs2.writeFile = writeFile;
    function writeFile(path, data, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$writeFile(path, data, options, cb);
      function go$writeFile(path2, data2, options2, cb2, startTime) {
        return fs$writeFile(path2, data2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$appendFile = fs2.appendFile;
    if (fs$appendFile)
      fs2.appendFile = appendFile;
    function appendFile(path, data, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$appendFile(path, data, options, cb);
      function go$appendFile(path2, data2, options2, cb2, startTime) {
        return fs$appendFile(path2, data2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$copyFile = fs2.copyFile;
    if (fs$copyFile)
      fs2.copyFile = copyFile;
    function copyFile(src, dest, flags, cb) {
      if (typeof flags === "function") {
        cb = flags;
        flags = 0;
      }
      return go$copyFile(src, dest, flags, cb);
      function go$copyFile(src2, dest2, flags2, cb2, startTime) {
        return fs$copyFile(src2, dest2, flags2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$readdir = fs2.readdir;
    fs2.readdir = readdir;
    var noReaddirOptionVersions = /^v[0-5]\./;
    function readdir(path, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir(path2, options2, cb2, startTime) {
        return fs$readdir(path2, fs$readdirCallback(path2, options2, cb2, startTime));
      } : function go$readdir(path2, options2, cb2, startTime) {
        return fs$readdir(path2, options2, fs$readdirCallback(path2, options2, cb2, startTime));
      };
      return go$readdir(path, options, cb);
      function fs$readdirCallback(path2, options2, cb2, startTime) {
        return function(err, files) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([
              go$readdir,
              [path2, options2, cb2],
              err,
              startTime || Date.now(),
              Date.now()
            ]);
          else {
            if (files && files.sort)
              files.sort();
            if (typeof cb2 === "function")
              cb2.call(this, err, files);
          }
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var legStreams = legacy(fs2);
      ReadStream = legStreams.ReadStream;
      WriteStream = legStreams.WriteStream;
    }
    var fs$ReadStream = fs2.ReadStream;
    if (fs$ReadStream) {
      ReadStream.prototype = Object.create(fs$ReadStream.prototype);
      ReadStream.prototype.open = ReadStream$open;
    }
    var fs$WriteStream = fs2.WriteStream;
    if (fs$WriteStream) {
      WriteStream.prototype = Object.create(fs$WriteStream.prototype);
      WriteStream.prototype.open = WriteStream$open;
    }
    Object.defineProperty(fs2, "ReadStream", {
      get: function() {
        return ReadStream;
      },
      set: function(val) {
        ReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(fs2, "WriteStream", {
      get: function() {
        return WriteStream;
      },
      set: function(val) {
        WriteStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileReadStream = ReadStream;
    Object.defineProperty(fs2, "FileReadStream", {
      get: function() {
        return FileReadStream;
      },
      set: function(val) {
        FileReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileWriteStream = WriteStream;
    Object.defineProperty(fs2, "FileWriteStream", {
      get: function() {
        return FileWriteStream;
      },
      set: function(val) {
        FileWriteStream = val;
      },
      enumerable: true,
      configurable: true
    });
    function ReadStream(path, options) {
      if (this instanceof ReadStream)
        return fs$ReadStream.apply(this, arguments), this;
      else
        return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
    }
    function ReadStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          if (that.autoClose)
            that.destroy();
          that.emit("error", err);
        } else {
          that.fd = fd;
          that.emit("open", fd);
          that.read();
        }
      });
    }
    function WriteStream(path, options) {
      if (this instanceof WriteStream)
        return fs$WriteStream.apply(this, arguments), this;
      else
        return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
    }
    function WriteStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          that.destroy();
          that.emit("error", err);
        } else {
          that.fd = fd;
          that.emit("open", fd);
        }
      });
    }
    function createReadStream(path, options) {
      return new fs2.ReadStream(path, options);
    }
    function createWriteStream(path, options) {
      return new fs2.WriteStream(path, options);
    }
    var fs$open = fs2.open;
    fs2.open = open;
    function open(path, flags, mode, cb) {
      if (typeof mode === "function")
        cb = mode, mode = null;
      return go$open(path, flags, mode, cb);
      function go$open(path2, flags2, mode2, cb2, startTime) {
        return fs$open(path2, flags2, mode2, function(err, fd) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    return fs2;
  };
  var enqueue = function(elem) {
    debug("ENQUEUE", elem[0].name, elem[1]);
    fs[gracefulQueue].push(elem);
    retry();
  };
  var resetQueue = function() {
    var now = Date.now();
    for (var i = 0;i < fs[gracefulQueue].length; ++i) {
      if (fs[gracefulQueue][i].length > 2) {
        fs[gracefulQueue][i][3] = now;
        fs[gracefulQueue][i][4] = now;
      }
    }
    retry();
  };
  var retry = function() {
    clearTimeout(retryTimer);
    retryTimer = undefined;
    if (fs[gracefulQueue].length === 0)
      return;
    var elem = fs[gracefulQueue].shift();
    var fn = elem[0];
    var args = elem[1];
    var err = elem[2];
    var startTime = elem[3];
    var lastTime = elem[4];
    if (startTime === undefined) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args);
    } else if (Date.now() - startTime >= 60000) {
      debug("TIMEOUT", fn.name, args);
      var cb = args.pop();
      if (typeof cb === "function")
        cb.call(null, err);
    } else {
      var sinceAttempt = Date.now() - lastTime;
      var sinceStart = Math.max(lastTime - startTime, 1);
      var desiredDelay = Math.min(sinceStart * 1.2, 100);
      if (sinceAttempt >= desiredDelay) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args.concat([startTime]));
      } else {
        fs[gracefulQueue].push(elem);
      }
    }
    if (retryTimer === undefined) {
      retryTimer = setTimeout(retry, 0);
    }
  };
  var fs = import.meta.require("fs");
  var polyfills = require_polyfills();
  var legacy = require_legacy_streams();
  var clone = require_clone();
  var util = import.meta.require("util");
  var gracefulQueue;
  var previousSymbol;
  if (typeof Symbol === "function" && typeof Symbol.for === "function") {
    gracefulQueue = Symbol.for("graceful-fs.queue");
    previousSymbol = Symbol.for("graceful-fs.previous");
  } else {
    gracefulQueue = "___graceful-fs.queue";
    previousSymbol = "___graceful-fs.previous";
  }
  var debug = noop;
  if (util.debuglog)
    debug = util.debuglog("gfs4");
  else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
    debug = function() {
      var m = util.format.apply(util, arguments);
      m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
      console.error(m);
    };
  if (!fs[gracefulQueue]) {
    queue = global[gracefulQueue] || [];
    publishQueue(fs, queue);
    fs.close = function(fs$close) {
      function close(fd, cb) {
        return fs$close.call(fs, fd, function(err) {
          if (!err) {
            resetQueue();
          }
          if (typeof cb === "function")
            cb.apply(this, arguments);
        });
      }
      Object.defineProperty(close, previousSymbol, {
        value: fs$close
      });
      return close;
    }(fs.close);
    fs.closeSync = function(fs$closeSync) {
      function closeSync(fd) {
        fs$closeSync.apply(fs, arguments);
        resetQueue();
      }
      Object.defineProperty(closeSync, previousSymbol, {
        value: fs$closeSync
      });
      return closeSync;
    }(fs.closeSync);
    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
      process.on("exit", function() {
        debug(fs[gracefulQueue]);
        import.meta.require("assert").equal(fs[gracefulQueue].length, 0);
      });
    }
  }
  var queue;
  if (!global[gracefulQueue]) {
    publishQueue(global, fs[gracefulQueue]);
  }
  module.exports = patch(clone(fs));
  if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
  }
  var retryTimer;
});

// node_modules/mkdirp/index.js
var require_mkdirp = __commonJS((exports, module) => {
  var mkdirP = function(p, opts, f, made) {
    if (typeof opts === "function") {
      f = opts;
      opts = {};
    } else if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === undefined) {
      mode = _0777;
    }
    if (!made)
      made = null;
    var cb = f || function() {
    };
    p = path.resolve(p);
    xfs.mkdir(p, mode, function(er) {
      if (!er) {
        made = made || p;
        return cb(null, made);
      }
      switch (er.code) {
        case "ENOENT":
          if (path.dirname(p) === p)
            return cb(er);
          mkdirP(path.dirname(p), opts, function(er2, made2) {
            if (er2)
              cb(er2, made2);
            else
              mkdirP(p, opts, cb, made2);
          });
          break;
        default:
          xfs.stat(p, function(er2, stat) {
            if (er2 || !stat.isDirectory())
              cb(er, made);
            else
              cb(null, made);
          });
          break;
      }
    });
  };
  var path = import.meta.require("path");
  var fs = import.meta.require("fs");
  var _0777 = parseInt("0777", 8);
  module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
  mkdirP.sync = function sync(p, opts, made) {
    if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === undefined) {
      mode = _0777;
    }
    if (!made)
      made = null;
    p = path.resolve(p);
    try {
      xfs.mkdirSync(p, mode);
      made = made || p;
    } catch (err0) {
      switch (err0.code) {
        case "ENOENT":
          made = sync(path.dirname(p), opts, made);
          sync(p, opts, made);
          break;
        default:
          var stat;
          try {
            stat = xfs.statSync(p);
          } catch (err1) {
            throw err0;
          }
          if (!stat.isDirectory())
            throw err0;
          break;
      }
    }
    return made;
  };
});

// node_modules/jsonc/lib/helper.js
var require_helper = __commonJS((exports) => {
  var promisify = function(fn) {
    return function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return new Promise(function(resolve, reject) {
        fn.apply(undefined, args.concat([function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }]));
      });
    };
  };
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var fast_safe_stringify_1 = require_fast_safe_stringify();
  var fs = require_graceful_fs();
  var mkdirp = require_mkdirp();
  var oproto = Object.prototype;
  var defaultStringifyOpts = {
    replacer: null,
    space: 0,
    handleCircular: true
  };
  var helper = {
    isObject: function(o) {
      return oproto.toString.call(o) === "[object Object]";
    },
    isPrimitive: function(value) {
      var t = typeof value;
      return value === null || value === undefined || t !== "function" && t !== "object";
    },
    strLog: function(value, pretty) {
      if (helper.isPrimitive(value))
        return value;
      var s = pretty ? "  " : null;
      return fast_safe_stringify_1.default(value, null, s);
    },
    getLogger: function(config, pretty) {
      return function() {
        var args = [];
        for (var _i = 0;_i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var stream = config.stream;
        var msg = args.map(function(arg) {
          if (arg instanceof Error) {
            stream = config.streamErr;
            return arg.stack || arg.message || String(arg);
          }
          return helper.strLog(arg, pretty);
        }).join(" ");
        stream.write(msg + "\n");
      };
    },
    getStringifyOptions: function(options, space) {
      if (helper.isObject(options)) {
        return __assign({}, defaultStringifyOpts, options);
      }
      if (typeof options === "function" || Array.isArray(options)) {
        return __assign({}, defaultStringifyOpts, { replacer: options, space });
      }
      return __assign({}, defaultStringifyOpts, { space });
    },
    fs,
    mkdirp,
    promise: {
      readFile: promisify(fs.readFile),
      writeFile: promisify(fs.writeFile),
      mkdirp: promisify(mkdirp)
    },
    safeSync: function(fn) {
      return function() {
        var args = [];
        for (var _i = 0;_i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        try {
          return [null, fn.apply(undefined, args)];
        } catch (err) {
          return [err, undefined];
        }
      };
    },
    safeAsync: function(promise) {
      return promise.then(function(data) {
        return [null, data];
      }).catch(function(err) {
        return [err, undefined];
      });
    }
  };
  exports.helper = helper;
});

// node_modules/jsonc/lib/jsonc.safe.js
var require_jsonc_safe = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var fast_safe_stringify_1 = require_fast_safe_stringify();
  var stripJsonComments = require_strip_json_comments();
  var helper_1 = require_helper();
  var jsonc_1 = require_jsonc();
  var safeSync = helper_1.helper.safeSync;
  var safeAsync = helper_1.helper.safeAsync;
  var jsoncSafe = function() {
    function jsoncSafe2() {
    }
    jsoncSafe2.config = function(cfg) {
      jsonc_1.jsonc.config(cfg);
    };
    jsoncSafe2.log = function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      jsonc_1.jsonc.log.apply(jsonc_1.jsonc, args);
    };
    jsoncSafe2.logp = function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      jsonc_1.jsonc.logp.apply(jsonc_1.jsonc, args);
    };
    jsoncSafe2.parse = function(str, options) {
      return safeSync(jsonc_1.jsonc.parse)(str, options);
    };
    jsoncSafe2.stringify = function(value, optionsOrReplacer, space) {
      var opts = helper_1.helper.getStringifyOptions(optionsOrReplacer, space);
      try {
        return [null, fast_safe_stringify_1.default(value, opts.replacer, opts.space)];
      } catch (err) {
        return [err, undefined];
      }
    };
    jsoncSafe2.isJSON = function(str, allowComments) {
      if (allowComments === undefined) {
        allowComments = false;
      }
      return jsonc_1.jsonc.isJSON(str, allowComments);
    };
    jsoncSafe2.stripComments = function(str, whitespace) {
      if (whitespace === undefined) {
        whitespace = false;
      }
      return safeSync(stripJsonComments)(str, { whitespace });
    };
    jsoncSafe2.uglify = function(str) {
      return safeSync(jsonc_1.jsonc.uglify)(str);
    };
    jsoncSafe2.beautify = function(str, space) {
      if (space === undefined) {
        space = 2;
      }
      return safeSync(jsonc_1.jsonc.beautify)(str, space);
    };
    jsoncSafe2.normalize = function(value, replacer) {
      return safeSync(jsonc_1.jsonc.normalize)(value, replacer);
    };
    jsoncSafe2.read = function(filePath, options) {
      return safeAsync(jsonc_1.jsonc.read(filePath, options));
    };
    jsoncSafe2.readSync = function(filePath, options) {
      return safeSync(jsonc_1.jsonc.readSync)(filePath, options);
    };
    jsoncSafe2.write = function(filePath, data, options) {
      return safeAsync(jsonc_1.jsonc.write(filePath, data, options));
    };
    jsoncSafe2.writeSync = function(filePath, data, options) {
      return safeSync(jsonc_1.jsonc.writeSync)(filePath, data, options);
    };
    return jsoncSafe2;
  }();
  exports.jsoncSafe = jsoncSafe;
});

// node_modules/jsonc/lib/jsonc.js
var require_jsonc = __commonJS((exports) => {
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : new P(function(resolve2) {
          resolve2(result.value);
        }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator = exports && exports.__generator || function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : undefined, done: true };
    }
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var path = import.meta.require("path");
  var fast_safe_stringify_1 = require_fast_safe_stringify();
  var parseJson = require_parse_json();
  var stripBOM = require_strip_bom();
  var stripJsonComments = require_strip_json_comments();
  var helper_1 = require_helper();
  var jsonc_safe_1 = require_jsonc_safe();
  var fs = helper_1.helper.fs;
  var mkdirp = helper_1.helper.mkdirp;
  var promise = helper_1.helper.promise;
  var jsonc = function() {
    function jsonc2() {
    }
    jsonc2.config = function(cfg) {
      var conf = __assign({ stream: process.stdout, streamErr: process.stderr }, cfg || {});
      jsonc2._ = {
        logger: helper_1.helper.getLogger(conf, false),
        prettyLogger: helper_1.helper.getLogger(conf, true)
      };
    };
    jsonc2.log = function() {
      var _a;
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      (_a = jsonc2._).logger.apply(_a, args);
    };
    jsonc2.logp = function() {
      var _a;
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      (_a = jsonc2._).prettyLogger.apply(_a, args);
    };
    jsonc2.parse = function(str, options) {
      var opts = typeof options === "function" ? { reviver: options } : options || {};
      if (opts.stripComments !== false)
        str = stripJsonComments(str, { whitespace: false });
      return parseJson(str, opts.reviver);
    };
    jsonc2.stringify = function(value, optionsOrReplacer, space) {
      var opts = helper_1.helper.getStringifyOptions(optionsOrReplacer, space);
      return opts.handleCircular ? fast_safe_stringify_1.default(value, opts.replacer, opts.space) : JSON.stringify(value, opts.replacer, opts.space);
    };
    jsonc2.isJSON = function(str, allowComments) {
      if (allowComments === undefined) {
        allowComments = false;
      }
      if (typeof str !== "string")
        return false;
      var _a = jsonc2.safe.parse(str, { stripComments: allowComments }), err = _a[0], result = _a[1];
      return !err && (helper_1.helper.isObject(result) || Array.isArray(result));
    };
    jsonc2.stripComments = function(str, whitespace) {
      if (whitespace === undefined) {
        whitespace = false;
      }
      return stripJsonComments(str, { whitespace });
    };
    jsonc2.uglify = function(str) {
      return jsonc2.stringify(jsonc2.parse(str, { stripComments: true }));
    };
    jsonc2.beautify = function(str, space) {
      if (space === undefined) {
        space = 2;
      }
      if (!space)
        space = 2;
      return jsonc2.stringify(jsonc2.parse(str), { space });
    };
    jsonc2.normalize = function(value, replacer) {
      return jsonc2.parse(jsonc2.stringify(value, { replacer }));
    };
    jsonc2.read = function(filePath, options) {
      return __awaiter(this, undefined, undefined, function() {
        var opts, data;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              opts = __assign({ reviver: null, stripComments: true }, options || {});
              return [4, promise.readFile(filePath, "utf8")];
            case 1:
              data = _a.sent();
              if (opts.stripComments !== false)
                data = stripJsonComments(data);
              return [2, parseJson(stripBOM(data), opts.reviver, filePath)];
          }
        });
      });
    };
    jsonc2.readSync = function(filePath, options) {
      var opts = __assign({ reviver: null, stripComments: true }, options || {});
      var data = fs.readFileSync(filePath, "utf8");
      if (opts.stripComments !== false)
        data = stripJsonComments(data);
      return parseJson(stripBOM(data), opts.reviver, filePath);
    };
    jsonc2.write = function(filePath, data, options) {
      return __awaiter(this, undefined, undefined, function() {
        var opts, content;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              opts = __assign({ replacer: null, space: 0, mode: 438, autoPath: true }, options || {});
              if (!opts.autoPath)
                return [3, 2];
              return [4, promise.mkdirp(path.dirname(filePath), { fs })];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              content = JSON.stringify(data, opts.replacer, opts.space);
              return [4, promise.writeFile(filePath, content + "\n", {
                mode: opts.mode,
                encoding: "utf8"
              })];
            case 3:
              _a.sent();
              return [2, true];
          }
        });
      });
    };
    jsonc2.writeSync = function(filePath, data, options) {
      var opts = __assign({ replacer: null, space: 0, mode: 438, autoPath: true }, options || {});
      if (opts.autoPath)
        mkdirp.sync(path.dirname(filePath), { fs });
      var content = JSON.stringify(data, opts.replacer, opts.space);
      fs.writeFileSync(filePath, content + "\n", {
        mode: opts.mode,
        encoding: "utf8"
      });
      return true;
    };
    return jsonc2;
  }();
  exports.jsonc = jsonc;
  jsonc.config(null);
  (function(jsonc2) {
    jsonc2.safe = jsonc_safe_1.jsoncSafe;
  })(jsonc || (jsonc = {}));
  exports.jsonc = jsonc;
});

// node_modules/jsonc/index.js
var require_jsonc2 = __commonJS((exports, module) => {
  var jsonc = require_jsonc().jsonc;
  module.exports = jsonc;
  module.exports.jsonc = jsonc;
  module.exports.safe = jsonc.safe;
});

// node_modules/delayed-stream/lib/delayed_stream.js
var require_delayed_stream = __commonJS((exports, module) => {
  var DelayedStream = function() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;
    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
  };
  var Stream = import.meta.require("stream").Stream;
  var util = import.meta.require("util");
  module.exports = DelayedStream;
  util.inherits(DelayedStream, Stream);
  DelayedStream.create = function(source, options) {
    var delayedStream = new this;
    options = options || {};
    for (var option in options) {
      delayedStream[option] = options[option];
    }
    delayedStream.source = source;
    var realEmit = source.emit;
    source.emit = function() {
      delayedStream._handleEmit(arguments);
      return realEmit.apply(source, arguments);
    };
    source.on("error", function() {
    });
    if (delayedStream.pauseStream) {
      source.pause();
    }
    return delayedStream;
  };
  Object.defineProperty(DelayedStream.prototype, "readable", {
    configurable: true,
    enumerable: true,
    get: function() {
      return this.source.readable;
    }
  });
  DelayedStream.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
  };
  DelayedStream.prototype.resume = function() {
    if (!this._released) {
      this.release();
    }
    this.source.resume();
  };
  DelayedStream.prototype.pause = function() {
    this.source.pause();
  };
  DelayedStream.prototype.release = function() {
    this._released = true;
    this._bufferedEvents.forEach(function(args) {
      this.emit.apply(this, args);
    }.bind(this));
    this._bufferedEvents = [];
  };
  DelayedStream.prototype.pipe = function() {
    var r = Stream.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
  };
  DelayedStream.prototype._handleEmit = function(args) {
    if (this._released) {
      this.emit.apply(this, args);
      return;
    }
    if (args[0] === "data") {
      this.dataSize += args[1].length;
      this._checkIfMaxDataSizeExceeded();
    }
    this._bufferedEvents.push(args);
  };
  DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
    if (this._maxDataSizeExceeded) {
      return;
    }
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    this._maxDataSizeExceeded = true;
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this.emit("error", new Error(message));
  };
});

// node_modules/combined-stream/lib/combined_stream.js
var require_combined_stream = __commonJS((exports, module) => {
  var CombinedStream = function() {
    this.writable = false;
    this.readable = true;
    this.dataSize = 0;
    this.maxDataSize = 2 * 1024 * 1024;
    this.pauseStreams = true;
    this._released = false;
    this._streams = [];
    this._currentStream = null;
    this._insideLoop = false;
    this._pendingNext = false;
  };
  var util = import.meta.require("util");
  var Stream = import.meta.require("stream").Stream;
  var DelayedStream = require_delayed_stream();
  module.exports = CombinedStream;
  util.inherits(CombinedStream, Stream);
  CombinedStream.create = function(options) {
    var combinedStream = new this;
    options = options || {};
    for (var option in options) {
      combinedStream[option] = options[option];
    }
    return combinedStream;
  };
  CombinedStream.isStreamLike = function(stream) {
    return typeof stream !== "function" && typeof stream !== "string" && typeof stream !== "boolean" && typeof stream !== "number" && !Buffer.isBuffer(stream);
  };
  CombinedStream.prototype.append = function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      if (!(stream instanceof DelayedStream)) {
        var newStream = DelayedStream.create(stream, {
          maxDataSize: Infinity,
          pauseStream: this.pauseStreams
        });
        stream.on("data", this._checkDataSize.bind(this));
        stream = newStream;
      }
      this._handleErrors(stream);
      if (this.pauseStreams) {
        stream.pause();
      }
    }
    this._streams.push(stream);
    return this;
  };
  CombinedStream.prototype.pipe = function(dest, options) {
    Stream.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
  };
  CombinedStream.prototype._getNext = function() {
    this._currentStream = null;
    if (this._insideLoop) {
      this._pendingNext = true;
      return;
    }
    this._insideLoop = true;
    try {
      do {
        this._pendingNext = false;
        this._realGetNext();
      } while (this._pendingNext);
    } finally {
      this._insideLoop = false;
    }
  };
  CombinedStream.prototype._realGetNext = function() {
    var stream = this._streams.shift();
    if (typeof stream == "undefined") {
      this.end();
      return;
    }
    if (typeof stream !== "function") {
      this._pipeNext(stream);
      return;
    }
    var getStream = stream;
    getStream(function(stream2) {
      var isStreamLike = CombinedStream.isStreamLike(stream2);
      if (isStreamLike) {
        stream2.on("data", this._checkDataSize.bind(this));
        this._handleErrors(stream2);
      }
      this._pipeNext(stream2);
    }.bind(this));
  };
  CombinedStream.prototype._pipeNext = function(stream) {
    this._currentStream = stream;
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      stream.on("end", this._getNext.bind(this));
      stream.pipe(this, { end: false });
      return;
    }
    var value = stream;
    this.write(value);
    this._getNext();
  };
  CombinedStream.prototype._handleErrors = function(stream) {
    var self2 = this;
    stream.on("error", function(err) {
      self2._emitError(err);
    });
  };
  CombinedStream.prototype.write = function(data) {
    this.emit("data", data);
  };
  CombinedStream.prototype.pause = function() {
    if (!this.pauseStreams) {
      return;
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function")
      this._currentStream.pause();
    this.emit("pause");
  };
  CombinedStream.prototype.resume = function() {
    if (!this._released) {
      this._released = true;
      this.writable = true;
      this._getNext();
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function")
      this._currentStream.resume();
    this.emit("resume");
  };
  CombinedStream.prototype.end = function() {
    this._reset();
    this.emit("end");
  };
  CombinedStream.prototype.destroy = function() {
    this._reset();
    this.emit("close");
  };
  CombinedStream.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
  };
  CombinedStream.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this._emitError(new Error(message));
  };
  CombinedStream.prototype._updateDataSize = function() {
    this.dataSize = 0;
    var self2 = this;
    this._streams.forEach(function(stream) {
      if (!stream.dataSize) {
        return;
      }
      self2.dataSize += stream.dataSize;
    });
    if (this._currentStream && this._currentStream.dataSize) {
      this.dataSize += this._currentStream.dataSize;
    }
  };
  CombinedStream.prototype._emitError = function(err) {
    this._reset();
    this.emit("error", err);
  };
});

// node_modules/mime-db/db.json
var require_db = __commonJS((exports, module) => {
  module.exports = {
    "application/1d-interleaved-parityfec": {
      source: "iana"
    },
    "application/3gpdash-qoe-report+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/3gpp-ims+xml": {
      source: "iana",
      compressible: true
    },
    "application/3gpphal+json": {
      source: "iana",
      compressible: true
    },
    "application/3gpphalforms+json": {
      source: "iana",
      compressible: true
    },
    "application/a2l": {
      source: "iana"
    },
    "application/ace+cbor": {
      source: "iana"
    },
    "application/activemessage": {
      source: "iana"
    },
    "application/activity+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-directory+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcost+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcostparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointprop+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointpropparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-error+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamcontrol+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamparams+json": {
      source: "iana",
      compressible: true
    },
    "application/aml": {
      source: "iana"
    },
    "application/andrew-inset": {
      source: "iana",
      extensions: ["ez"]
    },
    "application/applefile": {
      source: "iana"
    },
    "application/applixware": {
      source: "apache",
      extensions: ["aw"]
    },
    "application/at+jwt": {
      source: "iana"
    },
    "application/atf": {
      source: "iana"
    },
    "application/atfx": {
      source: "iana"
    },
    "application/atom+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atom"]
    },
    "application/atomcat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomcat"]
    },
    "application/atomdeleted+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomdeleted"]
    },
    "application/atomicmail": {
      source: "iana"
    },
    "application/atomsvc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomsvc"]
    },
    "application/atsc-dwd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dwd"]
    },
    "application/atsc-dynamic-event-message": {
      source: "iana"
    },
    "application/atsc-held+xml": {
      source: "iana",
      compressible: true,
      extensions: ["held"]
    },
    "application/atsc-rdt+json": {
      source: "iana",
      compressible: true
    },
    "application/atsc-rsat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsat"]
    },
    "application/atxml": {
      source: "iana"
    },
    "application/auth-policy+xml": {
      source: "iana",
      compressible: true
    },
    "application/bacnet-xdd+zip": {
      source: "iana",
      compressible: false
    },
    "application/batch-smtp": {
      source: "iana"
    },
    "application/bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/beep+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/calendar+json": {
      source: "iana",
      compressible: true
    },
    "application/calendar+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xcs"]
    },
    "application/call-completion": {
      source: "iana"
    },
    "application/cals-1840": {
      source: "iana"
    },
    "application/captive+json": {
      source: "iana",
      compressible: true
    },
    "application/cbor": {
      source: "iana"
    },
    "application/cbor-seq": {
      source: "iana"
    },
    "application/cccex": {
      source: "iana"
    },
    "application/ccmp+xml": {
      source: "iana",
      compressible: true
    },
    "application/ccxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ccxml"]
    },
    "application/cdfx+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdfx"]
    },
    "application/cdmi-capability": {
      source: "iana",
      extensions: ["cdmia"]
    },
    "application/cdmi-container": {
      source: "iana",
      extensions: ["cdmic"]
    },
    "application/cdmi-domain": {
      source: "iana",
      extensions: ["cdmid"]
    },
    "application/cdmi-object": {
      source: "iana",
      extensions: ["cdmio"]
    },
    "application/cdmi-queue": {
      source: "iana",
      extensions: ["cdmiq"]
    },
    "application/cdni": {
      source: "iana"
    },
    "application/cea": {
      source: "iana"
    },
    "application/cea-2018+xml": {
      source: "iana",
      compressible: true
    },
    "application/cellml+xml": {
      source: "iana",
      compressible: true
    },
    "application/cfw": {
      source: "iana"
    },
    "application/city+json": {
      source: "iana",
      compressible: true
    },
    "application/clr": {
      source: "iana"
    },
    "application/clue+xml": {
      source: "iana",
      compressible: true
    },
    "application/clue_info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cms": {
      source: "iana"
    },
    "application/cnrp+xml": {
      source: "iana",
      compressible: true
    },
    "application/coap-group+json": {
      source: "iana",
      compressible: true
    },
    "application/coap-payload": {
      source: "iana"
    },
    "application/commonground": {
      source: "iana"
    },
    "application/conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cose": {
      source: "iana"
    },
    "application/cose-key": {
      source: "iana"
    },
    "application/cose-key-set": {
      source: "iana"
    },
    "application/cpl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cpl"]
    },
    "application/csrattrs": {
      source: "iana"
    },
    "application/csta+xml": {
      source: "iana",
      compressible: true
    },
    "application/cstadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/csvm+json": {
      source: "iana",
      compressible: true
    },
    "application/cu-seeme": {
      source: "apache",
      extensions: ["cu"]
    },
    "application/cwt": {
      source: "iana"
    },
    "application/cybercash": {
      source: "iana"
    },
    "application/dart": {
      compressible: true
    },
    "application/dash+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpd"]
    },
    "application/dash-patch+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpp"]
    },
    "application/dashdelta": {
      source: "iana"
    },
    "application/davmount+xml": {
      source: "iana",
      compressible: true,
      extensions: ["davmount"]
    },
    "application/dca-rft": {
      source: "iana"
    },
    "application/dcd": {
      source: "iana"
    },
    "application/dec-dx": {
      source: "iana"
    },
    "application/dialog-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/dicom": {
      source: "iana"
    },
    "application/dicom+json": {
      source: "iana",
      compressible: true
    },
    "application/dicom+xml": {
      source: "iana",
      compressible: true
    },
    "application/dii": {
      source: "iana"
    },
    "application/dit": {
      source: "iana"
    },
    "application/dns": {
      source: "iana"
    },
    "application/dns+json": {
      source: "iana",
      compressible: true
    },
    "application/dns-message": {
      source: "iana"
    },
    "application/docbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dbk"]
    },
    "application/dots+cbor": {
      source: "iana"
    },
    "application/dskpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/dssc+der": {
      source: "iana",
      extensions: ["dssc"]
    },
    "application/dssc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdssc"]
    },
    "application/dvcs": {
      source: "iana"
    },
    "application/ecmascript": {
      source: "iana",
      compressible: true,
      extensions: ["es", "ecma"]
    },
    "application/edi-consent": {
      source: "iana"
    },
    "application/edi-x12": {
      source: "iana",
      compressible: false
    },
    "application/edifact": {
      source: "iana",
      compressible: false
    },
    "application/efi": {
      source: "iana"
    },
    "application/elm+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/elm+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.cap+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/emergencycalldata.comment+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.control+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.deviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.ecall.msd": {
      source: "iana"
    },
    "application/emergencycalldata.providerinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.serviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.subscriberinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.veds+xml": {
      source: "iana",
      compressible: true
    },
    "application/emma+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emma"]
    },
    "application/emotionml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emotionml"]
    },
    "application/encaprtp": {
      source: "iana"
    },
    "application/epp+xml": {
      source: "iana",
      compressible: true
    },
    "application/epub+zip": {
      source: "iana",
      compressible: false,
      extensions: ["epub"]
    },
    "application/eshop": {
      source: "iana"
    },
    "application/exi": {
      source: "iana",
      extensions: ["exi"]
    },
    "application/expect-ct-report+json": {
      source: "iana",
      compressible: true
    },
    "application/express": {
      source: "iana",
      extensions: ["exp"]
    },
    "application/fastinfoset": {
      source: "iana"
    },
    "application/fastsoap": {
      source: "iana"
    },
    "application/fdt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fdt"]
    },
    "application/fhir+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fhir+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fido.trusted-apps+json": {
      compressible: true
    },
    "application/fits": {
      source: "iana"
    },
    "application/flexfec": {
      source: "iana"
    },
    "application/font-sfnt": {
      source: "iana"
    },
    "application/font-tdpfr": {
      source: "iana",
      extensions: ["pfr"]
    },
    "application/font-woff": {
      source: "iana",
      compressible: false
    },
    "application/framework-attributes+xml": {
      source: "iana",
      compressible: true
    },
    "application/geo+json": {
      source: "iana",
      compressible: true,
      extensions: ["geojson"]
    },
    "application/geo+json-seq": {
      source: "iana"
    },
    "application/geopackage+sqlite3": {
      source: "iana"
    },
    "application/geoxacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/gltf-buffer": {
      source: "iana"
    },
    "application/gml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["gml"]
    },
    "application/gpx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["gpx"]
    },
    "application/gxf": {
      source: "apache",
      extensions: ["gxf"]
    },
    "application/gzip": {
      source: "iana",
      compressible: false,
      extensions: ["gz"]
    },
    "application/h224": {
      source: "iana"
    },
    "application/held+xml": {
      source: "iana",
      compressible: true
    },
    "application/hjson": {
      extensions: ["hjson"]
    },
    "application/http": {
      source: "iana"
    },
    "application/hyperstudio": {
      source: "iana",
      extensions: ["stk"]
    },
    "application/ibe-key-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pkg-reply+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pp-data": {
      source: "iana"
    },
    "application/iges": {
      source: "iana"
    },
    "application/im-iscomposing+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/index": {
      source: "iana"
    },
    "application/index.cmd": {
      source: "iana"
    },
    "application/index.obj": {
      source: "iana"
    },
    "application/index.response": {
      source: "iana"
    },
    "application/index.vnd": {
      source: "iana"
    },
    "application/inkml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ink", "inkml"]
    },
    "application/iotp": {
      source: "iana"
    },
    "application/ipfix": {
      source: "iana",
      extensions: ["ipfix"]
    },
    "application/ipp": {
      source: "iana"
    },
    "application/isup": {
      source: "iana"
    },
    "application/its+xml": {
      source: "iana",
      compressible: true,
      extensions: ["its"]
    },
    "application/java-archive": {
      source: "apache",
      compressible: false,
      extensions: ["jar", "war", "ear"]
    },
    "application/java-serialized-object": {
      source: "apache",
      compressible: false,
      extensions: ["ser"]
    },
    "application/java-vm": {
      source: "apache",
      compressible: false,
      extensions: ["class"]
    },
    "application/javascript": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["js", "mjs"]
    },
    "application/jf2feed+json": {
      source: "iana",
      compressible: true
    },
    "application/jose": {
      source: "iana"
    },
    "application/jose+json": {
      source: "iana",
      compressible: true
    },
    "application/jrd+json": {
      source: "iana",
      compressible: true
    },
    "application/jscalendar+json": {
      source: "iana",
      compressible: true
    },
    "application/json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["json", "map"]
    },
    "application/json-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/json-seq": {
      source: "iana"
    },
    "application/json5": {
      extensions: ["json5"]
    },
    "application/jsonml+json": {
      source: "apache",
      compressible: true,
      extensions: ["jsonml"]
    },
    "application/jwk+json": {
      source: "iana",
      compressible: true
    },
    "application/jwk-set+json": {
      source: "iana",
      compressible: true
    },
    "application/jwt": {
      source: "iana"
    },
    "application/kpml-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/kpml-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/ld+json": {
      source: "iana",
      compressible: true,
      extensions: ["jsonld"]
    },
    "application/lgr+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lgr"]
    },
    "application/link-format": {
      source: "iana"
    },
    "application/load-control+xml": {
      source: "iana",
      compressible: true
    },
    "application/lost+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lostxml"]
    },
    "application/lostsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/lpf+zip": {
      source: "iana",
      compressible: false
    },
    "application/lxf": {
      source: "iana"
    },
    "application/mac-binhex40": {
      source: "iana",
      extensions: ["hqx"]
    },
    "application/mac-compactpro": {
      source: "apache",
      extensions: ["cpt"]
    },
    "application/macwriteii": {
      source: "iana"
    },
    "application/mads+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mads"]
    },
    "application/manifest+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["webmanifest"]
    },
    "application/marc": {
      source: "iana",
      extensions: ["mrc"]
    },
    "application/marcxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mrcx"]
    },
    "application/mathematica": {
      source: "iana",
      extensions: ["ma", "nb", "mb"]
    },
    "application/mathml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mathml"]
    },
    "application/mathml-content+xml": {
      source: "iana",
      compressible: true
    },
    "application/mathml-presentation+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-associated-procedure-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-deregister+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-envelope+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-protection-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-reception-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-schedule+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-user-service-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbox": {
      source: "iana",
      extensions: ["mbox"]
    },
    "application/media-policy-dataset+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpf"]
    },
    "application/media_control+xml": {
      source: "iana",
      compressible: true
    },
    "application/mediaservercontrol+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mscml"]
    },
    "application/merge-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/metalink+xml": {
      source: "apache",
      compressible: true,
      extensions: ["metalink"]
    },
    "application/metalink4+xml": {
      source: "iana",
      compressible: true,
      extensions: ["meta4"]
    },
    "application/mets+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mets"]
    },
    "application/mf4": {
      source: "iana"
    },
    "application/mikey": {
      source: "iana"
    },
    "application/mipc": {
      source: "iana"
    },
    "application/missing-blocks+cbor-seq": {
      source: "iana"
    },
    "application/mmt-aei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["maei"]
    },
    "application/mmt-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musd"]
    },
    "application/mods+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mods"]
    },
    "application/moss-keys": {
      source: "iana"
    },
    "application/moss-signature": {
      source: "iana"
    },
    "application/mosskey-data": {
      source: "iana"
    },
    "application/mosskey-request": {
      source: "iana"
    },
    "application/mp21": {
      source: "iana",
      extensions: ["m21", "mp21"]
    },
    "application/mp4": {
      source: "iana",
      extensions: ["mp4s", "m4p"]
    },
    "application/mpeg4-generic": {
      source: "iana"
    },
    "application/mpeg4-iod": {
      source: "iana"
    },
    "application/mpeg4-iod-xmt": {
      source: "iana"
    },
    "application/mrb-consumer+xml": {
      source: "iana",
      compressible: true
    },
    "application/mrb-publish+xml": {
      source: "iana",
      compressible: true
    },
    "application/msc-ivr+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msc-mixer+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msword": {
      source: "iana",
      compressible: false,
      extensions: ["doc", "dot"]
    },
    "application/mud+json": {
      source: "iana",
      compressible: true
    },
    "application/multipart-core": {
      source: "iana"
    },
    "application/mxf": {
      source: "iana",
      extensions: ["mxf"]
    },
    "application/n-quads": {
      source: "iana",
      extensions: ["nq"]
    },
    "application/n-triples": {
      source: "iana",
      extensions: ["nt"]
    },
    "application/nasdata": {
      source: "iana"
    },
    "application/news-checkgroups": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-groupinfo": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-transmission": {
      source: "iana"
    },
    "application/nlsml+xml": {
      source: "iana",
      compressible: true
    },
    "application/node": {
      source: "iana",
      extensions: ["cjs"]
    },
    "application/nss": {
      source: "iana"
    },
    "application/oauth-authz-req+jwt": {
      source: "iana"
    },
    "application/oblivious-dns-message": {
      source: "iana"
    },
    "application/ocsp-request": {
      source: "iana"
    },
    "application/ocsp-response": {
      source: "iana"
    },
    "application/octet-stream": {
      source: "iana",
      compressible: false,
      extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
    },
    "application/oda": {
      source: "iana",
      extensions: ["oda"]
    },
    "application/odm+xml": {
      source: "iana",
      compressible: true
    },
    "application/odx": {
      source: "iana"
    },
    "application/oebps-package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["opf"]
    },
    "application/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogx"]
    },
    "application/omdoc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["omdoc"]
    },
    "application/onenote": {
      source: "apache",
      extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
    },
    "application/opc-nodeset+xml": {
      source: "iana",
      compressible: true
    },
    "application/oscore": {
      source: "iana"
    },
    "application/oxps": {
      source: "iana",
      extensions: ["oxps"]
    },
    "application/p21": {
      source: "iana"
    },
    "application/p21+zip": {
      source: "iana",
      compressible: false
    },
    "application/p2p-overlay+xml": {
      source: "iana",
      compressible: true,
      extensions: ["relo"]
    },
    "application/parityfec": {
      source: "iana"
    },
    "application/passport": {
      source: "iana"
    },
    "application/patch-ops-error+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xer"]
    },
    "application/pdf": {
      source: "iana",
      compressible: false,
      extensions: ["pdf"]
    },
    "application/pdx": {
      source: "iana"
    },
    "application/pem-certificate-chain": {
      source: "iana"
    },
    "application/pgp-encrypted": {
      source: "iana",
      compressible: false,
      extensions: ["pgp"]
    },
    "application/pgp-keys": {
      source: "iana",
      extensions: ["asc"]
    },
    "application/pgp-signature": {
      source: "iana",
      extensions: ["asc", "sig"]
    },
    "application/pics-rules": {
      source: "apache",
      extensions: ["prf"]
    },
    "application/pidf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pidf-diff+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pkcs10": {
      source: "iana",
      extensions: ["p10"]
    },
    "application/pkcs12": {
      source: "iana"
    },
    "application/pkcs7-mime": {
      source: "iana",
      extensions: ["p7m", "p7c"]
    },
    "application/pkcs7-signature": {
      source: "iana",
      extensions: ["p7s"]
    },
    "application/pkcs8": {
      source: "iana",
      extensions: ["p8"]
    },
    "application/pkcs8-encrypted": {
      source: "iana"
    },
    "application/pkix-attr-cert": {
      source: "iana",
      extensions: ["ac"]
    },
    "application/pkix-cert": {
      source: "iana",
      extensions: ["cer"]
    },
    "application/pkix-crl": {
      source: "iana",
      extensions: ["crl"]
    },
    "application/pkix-pkipath": {
      source: "iana",
      extensions: ["pkipath"]
    },
    "application/pkixcmp": {
      source: "iana",
      extensions: ["pki"]
    },
    "application/pls+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pls"]
    },
    "application/poc-settings+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/postscript": {
      source: "iana",
      compressible: true,
      extensions: ["ai", "eps", "ps"]
    },
    "application/ppsp-tracker+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+xml": {
      source: "iana",
      compressible: true
    },
    "application/provenance+xml": {
      source: "iana",
      compressible: true,
      extensions: ["provx"]
    },
    "application/prs.alvestrand.titrax-sheet": {
      source: "iana"
    },
    "application/prs.cww": {
      source: "iana",
      extensions: ["cww"]
    },
    "application/prs.cyn": {
      source: "iana",
      charset: "7-BIT"
    },
    "application/prs.hpub+zip": {
      source: "iana",
      compressible: false
    },
    "application/prs.nprend": {
      source: "iana"
    },
    "application/prs.plucker": {
      source: "iana"
    },
    "application/prs.rdf-xml-crypt": {
      source: "iana"
    },
    "application/prs.xsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/pskc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pskcxml"]
    },
    "application/pvd+json": {
      source: "iana",
      compressible: true
    },
    "application/qsig": {
      source: "iana"
    },
    "application/raml+yaml": {
      compressible: true,
      extensions: ["raml"]
    },
    "application/raptorfec": {
      source: "iana"
    },
    "application/rdap+json": {
      source: "iana",
      compressible: true
    },
    "application/rdf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rdf", "owl"]
    },
    "application/reginfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rif"]
    },
    "application/relax-ng-compact-syntax": {
      source: "iana",
      extensions: ["rnc"]
    },
    "application/remote-printing": {
      source: "iana"
    },
    "application/reputon+json": {
      source: "iana",
      compressible: true
    },
    "application/resource-lists+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rl"]
    },
    "application/resource-lists-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rld"]
    },
    "application/rfc+xml": {
      source: "iana",
      compressible: true
    },
    "application/riscos": {
      source: "iana"
    },
    "application/rlmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/rls-services+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rs"]
    },
    "application/route-apd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rapd"]
    },
    "application/route-s-tsid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sls"]
    },
    "application/route-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rusd"]
    },
    "application/rpki-ghostbusters": {
      source: "iana",
      extensions: ["gbr"]
    },
    "application/rpki-manifest": {
      source: "iana",
      extensions: ["mft"]
    },
    "application/rpki-publication": {
      source: "iana"
    },
    "application/rpki-roa": {
      source: "iana",
      extensions: ["roa"]
    },
    "application/rpki-updown": {
      source: "iana"
    },
    "application/rsd+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rsd"]
    },
    "application/rss+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rss"]
    },
    "application/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "application/rtploopback": {
      source: "iana"
    },
    "application/rtx": {
      source: "iana"
    },
    "application/samlassertion+xml": {
      source: "iana",
      compressible: true
    },
    "application/samlmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/sarif+json": {
      source: "iana",
      compressible: true
    },
    "application/sarif-external-properties+json": {
      source: "iana",
      compressible: true
    },
    "application/sbe": {
      source: "iana"
    },
    "application/sbml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sbml"]
    },
    "application/scaip+xml": {
      source: "iana",
      compressible: true
    },
    "application/scim+json": {
      source: "iana",
      compressible: true
    },
    "application/scvp-cv-request": {
      source: "iana",
      extensions: ["scq"]
    },
    "application/scvp-cv-response": {
      source: "iana",
      extensions: ["scs"]
    },
    "application/scvp-vp-request": {
      source: "iana",
      extensions: ["spq"]
    },
    "application/scvp-vp-response": {
      source: "iana",
      extensions: ["spp"]
    },
    "application/sdp": {
      source: "iana",
      extensions: ["sdp"]
    },
    "application/secevent+jwt": {
      source: "iana"
    },
    "application/senml+cbor": {
      source: "iana"
    },
    "application/senml+json": {
      source: "iana",
      compressible: true
    },
    "application/senml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["senmlx"]
    },
    "application/senml-etch+cbor": {
      source: "iana"
    },
    "application/senml-etch+json": {
      source: "iana",
      compressible: true
    },
    "application/senml-exi": {
      source: "iana"
    },
    "application/sensml+cbor": {
      source: "iana"
    },
    "application/sensml+json": {
      source: "iana",
      compressible: true
    },
    "application/sensml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sensmlx"]
    },
    "application/sensml-exi": {
      source: "iana"
    },
    "application/sep+xml": {
      source: "iana",
      compressible: true
    },
    "application/sep-exi": {
      source: "iana"
    },
    "application/session-info": {
      source: "iana"
    },
    "application/set-payment": {
      source: "iana"
    },
    "application/set-payment-initiation": {
      source: "iana",
      extensions: ["setpay"]
    },
    "application/set-registration": {
      source: "iana"
    },
    "application/set-registration-initiation": {
      source: "iana",
      extensions: ["setreg"]
    },
    "application/sgml": {
      source: "iana"
    },
    "application/sgml-open-catalog": {
      source: "iana"
    },
    "application/shf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["shf"]
    },
    "application/sieve": {
      source: "iana",
      extensions: ["siv", "sieve"]
    },
    "application/simple-filter+xml": {
      source: "iana",
      compressible: true
    },
    "application/simple-message-summary": {
      source: "iana"
    },
    "application/simplesymbolcontainer": {
      source: "iana"
    },
    "application/sipc": {
      source: "iana"
    },
    "application/slate": {
      source: "iana"
    },
    "application/smil": {
      source: "iana"
    },
    "application/smil+xml": {
      source: "iana",
      compressible: true,
      extensions: ["smi", "smil"]
    },
    "application/smpte336m": {
      source: "iana"
    },
    "application/soap+fastinfoset": {
      source: "iana"
    },
    "application/soap+xml": {
      source: "iana",
      compressible: true
    },
    "application/sparql-query": {
      source: "iana",
      extensions: ["rq"]
    },
    "application/sparql-results+xml": {
      source: "iana",
      compressible: true,
      extensions: ["srx"]
    },
    "application/spdx+json": {
      source: "iana",
      compressible: true
    },
    "application/spirits-event+xml": {
      source: "iana",
      compressible: true
    },
    "application/sql": {
      source: "iana"
    },
    "application/srgs": {
      source: "iana",
      extensions: ["gram"]
    },
    "application/srgs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["grxml"]
    },
    "application/sru+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sru"]
    },
    "application/ssdl+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ssdl"]
    },
    "application/ssml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ssml"]
    },
    "application/stix+json": {
      source: "iana",
      compressible: true
    },
    "application/swid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["swidtag"]
    },
    "application/tamp-apex-update": {
      source: "iana"
    },
    "application/tamp-apex-update-confirm": {
      source: "iana"
    },
    "application/tamp-community-update": {
      source: "iana"
    },
    "application/tamp-community-update-confirm": {
      source: "iana"
    },
    "application/tamp-error": {
      source: "iana"
    },
    "application/tamp-sequence-adjust": {
      source: "iana"
    },
    "application/tamp-sequence-adjust-confirm": {
      source: "iana"
    },
    "application/tamp-status-query": {
      source: "iana"
    },
    "application/tamp-status-response": {
      source: "iana"
    },
    "application/tamp-update": {
      source: "iana"
    },
    "application/tamp-update-confirm": {
      source: "iana"
    },
    "application/tar": {
      compressible: true
    },
    "application/taxii+json": {
      source: "iana",
      compressible: true
    },
    "application/td+json": {
      source: "iana",
      compressible: true
    },
    "application/tei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tei", "teicorpus"]
    },
    "application/tetra_isi": {
      source: "iana"
    },
    "application/thraud+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tfi"]
    },
    "application/timestamp-query": {
      source: "iana"
    },
    "application/timestamp-reply": {
      source: "iana"
    },
    "application/timestamped-data": {
      source: "iana",
      extensions: ["tsd"]
    },
    "application/tlsrpt+gzip": {
      source: "iana"
    },
    "application/tlsrpt+json": {
      source: "iana",
      compressible: true
    },
    "application/tnauthlist": {
      source: "iana"
    },
    "application/token-introspection+jwt": {
      source: "iana"
    },
    "application/toml": {
      compressible: true,
      extensions: ["toml"]
    },
    "application/trickle-ice-sdpfrag": {
      source: "iana"
    },
    "application/trig": {
      source: "iana",
      extensions: ["trig"]
    },
    "application/ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ttml"]
    },
    "application/tve-trigger": {
      source: "iana"
    },
    "application/tzif": {
      source: "iana"
    },
    "application/tzif-leap": {
      source: "iana"
    },
    "application/ubjson": {
      compressible: false,
      extensions: ["ubj"]
    },
    "application/ulpfec": {
      source: "iana"
    },
    "application/urc-grpsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/urc-ressheet+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsheet"]
    },
    "application/urc-targetdesc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["td"]
    },
    "application/urc-uisocketdesc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vcard+json": {
      source: "iana",
      compressible: true
    },
    "application/vcard+xml": {
      source: "iana",
      compressible: true
    },
    "application/vemmi": {
      source: "iana"
    },
    "application/vividence.scriptfile": {
      source: "apache"
    },
    "application/vnd.1000minds.decision-model+xml": {
      source: "iana",
      compressible: true,
      extensions: ["1km"]
    },
    "application/vnd.3gpp-prose+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-prose-pc3ch+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-v2x-local-service-information": {
      source: "iana"
    },
    "application/vnd.3gpp.5gnas": {
      source: "iana"
    },
    "application/vnd.3gpp.access-transfer-events+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.bsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gmop+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gtpc": {
      source: "iana"
    },
    "application/vnd.3gpp.interworking-data": {
      source: "iana"
    },
    "application/vnd.3gpp.lpp": {
      source: "iana"
    },
    "application/vnd.3gpp.mc-signalling-ear": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-payload": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-signalling": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-floor-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-signed+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-init-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-transmission-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mid-call+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ngap": {
      source: "iana"
    },
    "application/vnd.3gpp.pfcp": {
      source: "iana"
    },
    "application/vnd.3gpp.pic-bw-large": {
      source: "iana",
      extensions: ["plb"]
    },
    "application/vnd.3gpp.pic-bw-small": {
      source: "iana",
      extensions: ["psb"]
    },
    "application/vnd.3gpp.pic-bw-var": {
      source: "iana",
      extensions: ["pvb"]
    },
    "application/vnd.3gpp.s1ap": {
      source: "iana"
    },
    "application/vnd.3gpp.sms": {
      source: "iana"
    },
    "application/vnd.3gpp.sms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-ext+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.state-and-event-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ussd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.bcmcsinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.sms": {
      source: "iana"
    },
    "application/vnd.3gpp2.tcap": {
      source: "iana",
      extensions: ["tcap"]
    },
    "application/vnd.3lightssoftware.imagescal": {
      source: "iana"
    },
    "application/vnd.3m.post-it-notes": {
      source: "iana",
      extensions: ["pwn"]
    },
    "application/vnd.accpac.simply.aso": {
      source: "iana",
      extensions: ["aso"]
    },
    "application/vnd.accpac.simply.imp": {
      source: "iana",
      extensions: ["imp"]
    },
    "application/vnd.acucobol": {
      source: "iana",
      extensions: ["acu"]
    },
    "application/vnd.acucorp": {
      source: "iana",
      extensions: ["atc", "acutc"]
    },
    "application/vnd.adobe.air-application-installer-package+zip": {
      source: "apache",
      compressible: false,
      extensions: ["air"]
    },
    "application/vnd.adobe.flash.movie": {
      source: "iana"
    },
    "application/vnd.adobe.formscentral.fcdt": {
      source: "iana",
      extensions: ["fcdt"]
    },
    "application/vnd.adobe.fxp": {
      source: "iana",
      extensions: ["fxp", "fxpl"]
    },
    "application/vnd.adobe.partial-upload": {
      source: "iana"
    },
    "application/vnd.adobe.xdp+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdp"]
    },
    "application/vnd.adobe.xfdf": {
      source: "iana",
      extensions: ["xfdf"]
    },
    "application/vnd.aether.imp": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata-pagedef": {
      source: "iana"
    },
    "application/vnd.afpc.cmoca-cmresource": {
      source: "iana"
    },
    "application/vnd.afpc.foca-charset": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codedfont": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codepage": {
      source: "iana"
    },
    "application/vnd.afpc.modca": {
      source: "iana"
    },
    "application/vnd.afpc.modca-cmtable": {
      source: "iana"
    },
    "application/vnd.afpc.modca-formdef": {
      source: "iana"
    },
    "application/vnd.afpc.modca-mediummap": {
      source: "iana"
    },
    "application/vnd.afpc.modca-objectcontainer": {
      source: "iana"
    },
    "application/vnd.afpc.modca-overlay": {
      source: "iana"
    },
    "application/vnd.afpc.modca-pagesegment": {
      source: "iana"
    },
    "application/vnd.age": {
      source: "iana",
      extensions: ["age"]
    },
    "application/vnd.ah-barcode": {
      source: "iana"
    },
    "application/vnd.ahead.space": {
      source: "iana",
      extensions: ["ahead"]
    },
    "application/vnd.airzip.filesecure.azf": {
      source: "iana",
      extensions: ["azf"]
    },
    "application/vnd.airzip.filesecure.azs": {
      source: "iana",
      extensions: ["azs"]
    },
    "application/vnd.amadeus+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.amazon.ebook": {
      source: "apache",
      extensions: ["azw"]
    },
    "application/vnd.amazon.mobi8-ebook": {
      source: "iana"
    },
    "application/vnd.americandynamics.acc": {
      source: "iana",
      extensions: ["acc"]
    },
    "application/vnd.amiga.ami": {
      source: "iana",
      extensions: ["ami"]
    },
    "application/vnd.amundsen.maze+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.android.ota": {
      source: "iana"
    },
    "application/vnd.android.package-archive": {
      source: "apache",
      compressible: false,
      extensions: ["apk"]
    },
    "application/vnd.anki": {
      source: "iana"
    },
    "application/vnd.anser-web-certificate-issue-initiation": {
      source: "iana",
      extensions: ["cii"]
    },
    "application/vnd.anser-web-funds-transfer-initiation": {
      source: "apache",
      extensions: ["fti"]
    },
    "application/vnd.antix.game-component": {
      source: "iana",
      extensions: ["atx"]
    },
    "application/vnd.apache.arrow.file": {
      source: "iana"
    },
    "application/vnd.apache.arrow.stream": {
      source: "iana"
    },
    "application/vnd.apache.thrift.binary": {
      source: "iana"
    },
    "application/vnd.apache.thrift.compact": {
      source: "iana"
    },
    "application/vnd.apache.thrift.json": {
      source: "iana"
    },
    "application/vnd.api+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.aplextor.warrp+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apothekende.reservation+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apple.installer+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpkg"]
    },
    "application/vnd.apple.keynote": {
      source: "iana",
      extensions: ["key"]
    },
    "application/vnd.apple.mpegurl": {
      source: "iana",
      extensions: ["m3u8"]
    },
    "application/vnd.apple.numbers": {
      source: "iana",
      extensions: ["numbers"]
    },
    "application/vnd.apple.pages": {
      source: "iana",
      extensions: ["pages"]
    },
    "application/vnd.apple.pkpass": {
      compressible: false,
      extensions: ["pkpass"]
    },
    "application/vnd.arastra.swi": {
      source: "iana"
    },
    "application/vnd.aristanetworks.swi": {
      source: "iana",
      extensions: ["swi"]
    },
    "application/vnd.artisan+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.artsquare": {
      source: "iana"
    },
    "application/vnd.astraea-software.iota": {
      source: "iana",
      extensions: ["iota"]
    },
    "application/vnd.audiograph": {
      source: "iana",
      extensions: ["aep"]
    },
    "application/vnd.autopackage": {
      source: "iana"
    },
    "application/vnd.avalon+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.avistar+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.balsamiq.bmml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["bmml"]
    },
    "application/vnd.balsamiq.bmpr": {
      source: "iana"
    },
    "application/vnd.banana-accounting": {
      source: "iana"
    },
    "application/vnd.bbf.usp.error": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bekitzur-stech+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bint.med-content": {
      source: "iana"
    },
    "application/vnd.biopax.rdf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.blink-idb-value-wrapper": {
      source: "iana"
    },
    "application/vnd.blueice.multipass": {
      source: "iana",
      extensions: ["mpm"]
    },
    "application/vnd.bluetooth.ep.oob": {
      source: "iana"
    },
    "application/vnd.bluetooth.le.oob": {
      source: "iana"
    },
    "application/vnd.bmi": {
      source: "iana",
      extensions: ["bmi"]
    },
    "application/vnd.bpf": {
      source: "iana"
    },
    "application/vnd.bpf3": {
      source: "iana"
    },
    "application/vnd.businessobjects": {
      source: "iana",
      extensions: ["rep"]
    },
    "application/vnd.byu.uapi+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cab-jscript": {
      source: "iana"
    },
    "application/vnd.canon-cpdl": {
      source: "iana"
    },
    "application/vnd.canon-lips": {
      source: "iana"
    },
    "application/vnd.capasystems-pg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cendio.thinlinc.clientconf": {
      source: "iana"
    },
    "application/vnd.century-systems.tcp_stream": {
      source: "iana"
    },
    "application/vnd.chemdraw+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdxml"]
    },
    "application/vnd.chess-pgn": {
      source: "iana"
    },
    "application/vnd.chipnuts.karaoke-mmd": {
      source: "iana",
      extensions: ["mmd"]
    },
    "application/vnd.ciedi": {
      source: "iana"
    },
    "application/vnd.cinderella": {
      source: "iana",
      extensions: ["cdy"]
    },
    "application/vnd.cirpack.isdn-ext": {
      source: "iana"
    },
    "application/vnd.citationstyles.style+xml": {
      source: "iana",
      compressible: true,
      extensions: ["csl"]
    },
    "application/vnd.claymore": {
      source: "iana",
      extensions: ["cla"]
    },
    "application/vnd.cloanto.rp9": {
      source: "iana",
      extensions: ["rp9"]
    },
    "application/vnd.clonk.c4group": {
      source: "iana",
      extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
    },
    "application/vnd.cluetrust.cartomobile-config": {
      source: "iana",
      extensions: ["c11amc"]
    },
    "application/vnd.cluetrust.cartomobile-config-pkg": {
      source: "iana",
      extensions: ["c11amz"]
    },
    "application/vnd.coffeescript": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet-template": {
      source: "iana"
    },
    "application/vnd.collection+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.doc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.next+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.comicbook+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.comicbook-rar": {
      source: "iana"
    },
    "application/vnd.commerce-battelle": {
      source: "iana"
    },
    "application/vnd.commonspace": {
      source: "iana",
      extensions: ["csp"]
    },
    "application/vnd.contact.cmsg": {
      source: "iana",
      extensions: ["cdbcmsg"]
    },
    "application/vnd.coreos.ignition+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cosmocaller": {
      source: "iana",
      extensions: ["cmc"]
    },
    "application/vnd.crick.clicker": {
      source: "iana",
      extensions: ["clkx"]
    },
    "application/vnd.crick.clicker.keyboard": {
      source: "iana",
      extensions: ["clkk"]
    },
    "application/vnd.crick.clicker.palette": {
      source: "iana",
      extensions: ["clkp"]
    },
    "application/vnd.crick.clicker.template": {
      source: "iana",
      extensions: ["clkt"]
    },
    "application/vnd.crick.clicker.wordbank": {
      source: "iana",
      extensions: ["clkw"]
    },
    "application/vnd.criticaltools.wbs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wbs"]
    },
    "application/vnd.cryptii.pipe+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.crypto-shade-file": {
      source: "iana"
    },
    "application/vnd.cryptomator.encrypted": {
      source: "iana"
    },
    "application/vnd.cryptomator.vault": {
      source: "iana"
    },
    "application/vnd.ctc-posml": {
      source: "iana",
      extensions: ["pml"]
    },
    "application/vnd.ctct.ws+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cups-pdf": {
      source: "iana"
    },
    "application/vnd.cups-postscript": {
      source: "iana"
    },
    "application/vnd.cups-ppd": {
      source: "iana",
      extensions: ["ppd"]
    },
    "application/vnd.cups-raster": {
      source: "iana"
    },
    "application/vnd.cups-raw": {
      source: "iana"
    },
    "application/vnd.curl": {
      source: "iana"
    },
    "application/vnd.curl.car": {
      source: "apache",
      extensions: ["car"]
    },
    "application/vnd.curl.pcurl": {
      source: "apache",
      extensions: ["pcurl"]
    },
    "application/vnd.cyan.dean.root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cybank": {
      source: "iana"
    },
    "application/vnd.cyclonedx+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cyclonedx+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.d2l.coursepackage1p0+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.d3m-dataset": {
      source: "iana"
    },
    "application/vnd.d3m-problem": {
      source: "iana"
    },
    "application/vnd.dart": {
      source: "iana",
      compressible: true,
      extensions: ["dart"]
    },
    "application/vnd.data-vision.rdz": {
      source: "iana",
      extensions: ["rdz"]
    },
    "application/vnd.datapackage+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dataresource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dbf": {
      source: "iana",
      extensions: ["dbf"]
    },
    "application/vnd.debian.binary-package": {
      source: "iana"
    },
    "application/vnd.dece.data": {
      source: "iana",
      extensions: ["uvf", "uvvf", "uvd", "uvvd"]
    },
    "application/vnd.dece.ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uvt", "uvvt"]
    },
    "application/vnd.dece.unspecified": {
      source: "iana",
      extensions: ["uvx", "uvvx"]
    },
    "application/vnd.dece.zip": {
      source: "iana",
      extensions: ["uvz", "uvvz"]
    },
    "application/vnd.denovo.fcselayout-link": {
      source: "iana",
      extensions: ["fe_launch"]
    },
    "application/vnd.desmume.movie": {
      source: "iana"
    },
    "application/vnd.dir-bi.plate-dl-nosuffix": {
      source: "iana"
    },
    "application/vnd.dm.delegation+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dna": {
      source: "iana",
      extensions: ["dna"]
    },
    "application/vnd.document+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dolby.mlp": {
      source: "apache",
      extensions: ["mlp"]
    },
    "application/vnd.dolby.mobile.1": {
      source: "iana"
    },
    "application/vnd.dolby.mobile.2": {
      source: "iana"
    },
    "application/vnd.doremir.scorecloud-binary-document": {
      source: "iana"
    },
    "application/vnd.dpgraph": {
      source: "iana",
      extensions: ["dpg"]
    },
    "application/vnd.dreamfactory": {
      source: "iana",
      extensions: ["dfac"]
    },
    "application/vnd.drive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ds-keypoint": {
      source: "apache",
      extensions: ["kpxx"]
    },
    "application/vnd.dtg.local": {
      source: "iana"
    },
    "application/vnd.dtg.local.flash": {
      source: "iana"
    },
    "application/vnd.dtg.local.html": {
      source: "iana"
    },
    "application/vnd.dvb.ait": {
      source: "iana",
      extensions: ["ait"]
    },
    "application/vnd.dvb.dvbisl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.dvbj": {
      source: "iana"
    },
    "application/vnd.dvb.esgcontainer": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcdftnotifaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess2": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgpdd": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcroaming": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-base": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-enhancement": {
      source: "iana"
    },
    "application/vnd.dvb.notif-aggregate-root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-container+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-generic+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-msglist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-init+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.pfr": {
      source: "iana"
    },
    "application/vnd.dvb.service": {
      source: "iana",
      extensions: ["svc"]
    },
    "application/vnd.dxr": {
      source: "iana"
    },
    "application/vnd.dynageo": {
      source: "iana",
      extensions: ["geo"]
    },
    "application/vnd.dzr": {
      source: "iana"
    },
    "application/vnd.easykaraoke.cdgdownload": {
      source: "iana"
    },
    "application/vnd.ecdis-update": {
      source: "iana"
    },
    "application/vnd.ecip.rlp": {
      source: "iana"
    },
    "application/vnd.eclipse.ditto+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ecowin.chart": {
      source: "iana",
      extensions: ["mag"]
    },
    "application/vnd.ecowin.filerequest": {
      source: "iana"
    },
    "application/vnd.ecowin.fileupdate": {
      source: "iana"
    },
    "application/vnd.ecowin.series": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesrequest": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesupdate": {
      source: "iana"
    },
    "application/vnd.efi.img": {
      source: "iana"
    },
    "application/vnd.efi.iso": {
      source: "iana"
    },
    "application/vnd.emclient.accessrequest+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.enliven": {
      source: "iana",
      extensions: ["nml"]
    },
    "application/vnd.enphase.envoy": {
      source: "iana"
    },
    "application/vnd.eprints.data+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.epson.esf": {
      source: "iana",
      extensions: ["esf"]
    },
    "application/vnd.epson.msf": {
      source: "iana",
      extensions: ["msf"]
    },
    "application/vnd.epson.quickanime": {
      source: "iana",
      extensions: ["qam"]
    },
    "application/vnd.epson.salt": {
      source: "iana",
      extensions: ["slt"]
    },
    "application/vnd.epson.ssf": {
      source: "iana",
      extensions: ["ssf"]
    },
    "application/vnd.ericsson.quickcall": {
      source: "iana"
    },
    "application/vnd.espass-espass+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.eszigno3+xml": {
      source: "iana",
      compressible: true,
      extensions: ["es3", "et3"]
    },
    "application/vnd.etsi.aoc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.asic-e+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.asic-s+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.cug+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvcommand+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-bc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-cod+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-npvr+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvservice+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mcid+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mheg5": {
      source: "iana"
    },
    "application/vnd.etsi.overload-control-policy-dataset+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.pstn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.sci+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.simservs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.timestamp-token": {
      source: "iana"
    },
    "application/vnd.etsi.tsl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.tsl.der": {
      source: "iana"
    },
    "application/vnd.eu.kasparian.car+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.eudora.data": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.profile": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.settings": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.theme": {
      source: "iana"
    },
    "application/vnd.exstream-empower+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.exstream-package": {
      source: "iana"
    },
    "application/vnd.ezpix-album": {
      source: "iana",
      extensions: ["ez2"]
    },
    "application/vnd.ezpix-package": {
      source: "iana",
      extensions: ["ez3"]
    },
    "application/vnd.f-secure.mobile": {
      source: "iana"
    },
    "application/vnd.familysearch.gedcom+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.fastcopy-disk-image": {
      source: "iana"
    },
    "application/vnd.fdf": {
      source: "iana",
      extensions: ["fdf"]
    },
    "application/vnd.fdsn.mseed": {
      source: "iana",
      extensions: ["mseed"]
    },
    "application/vnd.fdsn.seed": {
      source: "iana",
      extensions: ["seed", "dataless"]
    },
    "application/vnd.ffsns": {
      source: "iana"
    },
    "application/vnd.ficlab.flb+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.filmit.zfc": {
      source: "iana"
    },
    "application/vnd.fints": {
      source: "iana"
    },
    "application/vnd.firemonkeys.cloudcell": {
      source: "iana"
    },
    "application/vnd.flographit": {
      source: "iana",
      extensions: ["gph"]
    },
    "application/vnd.fluxtime.clip": {
      source: "iana",
      extensions: ["ftc"]
    },
    "application/vnd.font-fontforge-sfd": {
      source: "iana"
    },
    "application/vnd.framemaker": {
      source: "iana",
      extensions: ["fm", "frame", "maker", "book"]
    },
    "application/vnd.frogans.fnc": {
      source: "iana",
      extensions: ["fnc"]
    },
    "application/vnd.frogans.ltf": {
      source: "iana",
      extensions: ["ltf"]
    },
    "application/vnd.fsc.weblaunch": {
      source: "iana",
      extensions: ["fsc"]
    },
    "application/vnd.fujifilm.fb.docuworks": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.binder": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.jfi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fujitsu.oasys": {
      source: "iana",
      extensions: ["oas"]
    },
    "application/vnd.fujitsu.oasys2": {
      source: "iana",
      extensions: ["oa2"]
    },
    "application/vnd.fujitsu.oasys3": {
      source: "iana",
      extensions: ["oa3"]
    },
    "application/vnd.fujitsu.oasysgp": {
      source: "iana",
      extensions: ["fg5"]
    },
    "application/vnd.fujitsu.oasysprs": {
      source: "iana",
      extensions: ["bh2"]
    },
    "application/vnd.fujixerox.art-ex": {
      source: "iana"
    },
    "application/vnd.fujixerox.art4": {
      source: "iana"
    },
    "application/vnd.fujixerox.ddd": {
      source: "iana",
      extensions: ["ddd"]
    },
    "application/vnd.fujixerox.docuworks": {
      source: "iana",
      extensions: ["xdw"]
    },
    "application/vnd.fujixerox.docuworks.binder": {
      source: "iana",
      extensions: ["xbd"]
    },
    "application/vnd.fujixerox.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujixerox.hbpl": {
      source: "iana"
    },
    "application/vnd.fut-misnet": {
      source: "iana"
    },
    "application/vnd.futoin+cbor": {
      source: "iana"
    },
    "application/vnd.futoin+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fuzzysheet": {
      source: "iana",
      extensions: ["fzs"]
    },
    "application/vnd.genomatix.tuxedo": {
      source: "iana",
      extensions: ["txd"]
    },
    "application/vnd.gentics.grd+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geo+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geocube+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geogebra.file": {
      source: "iana",
      extensions: ["ggb"]
    },
    "application/vnd.geogebra.slides": {
      source: "iana"
    },
    "application/vnd.geogebra.tool": {
      source: "iana",
      extensions: ["ggt"]
    },
    "application/vnd.geometry-explorer": {
      source: "iana",
      extensions: ["gex", "gre"]
    },
    "application/vnd.geonext": {
      source: "iana",
      extensions: ["gxt"]
    },
    "application/vnd.geoplan": {
      source: "iana",
      extensions: ["g2w"]
    },
    "application/vnd.geospace": {
      source: "iana",
      extensions: ["g3w"]
    },
    "application/vnd.gerber": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt-response": {
      source: "iana"
    },
    "application/vnd.gmx": {
      source: "iana",
      extensions: ["gmx"]
    },
    "application/vnd.google-apps.document": {
      compressible: false,
      extensions: ["gdoc"]
    },
    "application/vnd.google-apps.presentation": {
      compressible: false,
      extensions: ["gslides"]
    },
    "application/vnd.google-apps.spreadsheet": {
      compressible: false,
      extensions: ["gsheet"]
    },
    "application/vnd.google-earth.kml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["kml"]
    },
    "application/vnd.google-earth.kmz": {
      source: "iana",
      compressible: false,
      extensions: ["kmz"]
    },
    "application/vnd.gov.sk.e-form+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.gov.sk.e-form+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.gov.sk.xmldatacontainer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.grafeq": {
      source: "iana",
      extensions: ["gqf", "gqs"]
    },
    "application/vnd.gridmp": {
      source: "iana"
    },
    "application/vnd.groove-account": {
      source: "iana",
      extensions: ["gac"]
    },
    "application/vnd.groove-help": {
      source: "iana",
      extensions: ["ghf"]
    },
    "application/vnd.groove-identity-message": {
      source: "iana",
      extensions: ["gim"]
    },
    "application/vnd.groove-injector": {
      source: "iana",
      extensions: ["grv"]
    },
    "application/vnd.groove-tool-message": {
      source: "iana",
      extensions: ["gtm"]
    },
    "application/vnd.groove-tool-template": {
      source: "iana",
      extensions: ["tpl"]
    },
    "application/vnd.groove-vcard": {
      source: "iana",
      extensions: ["vcg"]
    },
    "application/vnd.hal+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hal+xml": {
      source: "iana",
      compressible: true,
      extensions: ["hal"]
    },
    "application/vnd.handheld-entertainment+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zmm"]
    },
    "application/vnd.hbci": {
      source: "iana",
      extensions: ["hbci"]
    },
    "application/vnd.hc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hcl-bireports": {
      source: "iana"
    },
    "application/vnd.hdt": {
      source: "iana"
    },
    "application/vnd.heroku+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hhe.lesson-player": {
      source: "iana",
      extensions: ["les"]
    },
    "application/vnd.hl7cda+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.hl7v2+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.hp-hpgl": {
      source: "iana",
      extensions: ["hpgl"]
    },
    "application/vnd.hp-hpid": {
      source: "iana",
      extensions: ["hpid"]
    },
    "application/vnd.hp-hps": {
      source: "iana",
      extensions: ["hps"]
    },
    "application/vnd.hp-jlyt": {
      source: "iana",
      extensions: ["jlt"]
    },
    "application/vnd.hp-pcl": {
      source: "iana",
      extensions: ["pcl"]
    },
    "application/vnd.hp-pclxl": {
      source: "iana",
      extensions: ["pclxl"]
    },
    "application/vnd.httphone": {
      source: "iana"
    },
    "application/vnd.hydrostatix.sof-data": {
      source: "iana",
      extensions: ["sfd-hdstx"]
    },
    "application/vnd.hyper+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyper-item+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyperdrive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hzn-3d-crossword": {
      source: "iana"
    },
    "application/vnd.ibm.afplinedata": {
      source: "iana"
    },
    "application/vnd.ibm.electronic-media": {
      source: "iana"
    },
    "application/vnd.ibm.minipay": {
      source: "iana",
      extensions: ["mpy"]
    },
    "application/vnd.ibm.modcap": {
      source: "iana",
      extensions: ["afp", "listafp", "list3820"]
    },
    "application/vnd.ibm.rights-management": {
      source: "iana",
      extensions: ["irm"]
    },
    "application/vnd.ibm.secure-container": {
      source: "iana",
      extensions: ["sc"]
    },
    "application/vnd.iccprofile": {
      source: "iana",
      extensions: ["icc", "icm"]
    },
    "application/vnd.ieee.1905": {
      source: "iana"
    },
    "application/vnd.igloader": {
      source: "iana",
      extensions: ["igl"]
    },
    "application/vnd.imagemeter.folder+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.imagemeter.image+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.immervision-ivp": {
      source: "iana",
      extensions: ["ivp"]
    },
    "application/vnd.immervision-ivu": {
      source: "iana",
      extensions: ["ivu"]
    },
    "application/vnd.ims.imsccv1p1": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p2": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p3": {
      source: "iana"
    },
    "application/vnd.ims.lis.v2.result+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy.id+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings.simple+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informedcontrol.rms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informix-visionary": {
      source: "iana"
    },
    "application/vnd.infotech.project": {
      source: "iana"
    },
    "application/vnd.infotech.project+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.innopath.wamp.notification": {
      source: "iana"
    },
    "application/vnd.insors.igm": {
      source: "iana",
      extensions: ["igm"]
    },
    "application/vnd.intercon.formnet": {
      source: "iana",
      extensions: ["xpw", "xpx"]
    },
    "application/vnd.intergeo": {
      source: "iana",
      extensions: ["i2g"]
    },
    "application/vnd.intertrust.digibox": {
      source: "iana"
    },
    "application/vnd.intertrust.nncp": {
      source: "iana"
    },
    "application/vnd.intu.qbo": {
      source: "iana",
      extensions: ["qbo"]
    },
    "application/vnd.intu.qfx": {
      source: "iana",
      extensions: ["qfx"]
    },
    "application/vnd.iptc.g2.catalogitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.conceptitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.knowledgeitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.packageitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.planningitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ipunplugged.rcprofile": {
      source: "iana",
      extensions: ["rcprofile"]
    },
    "application/vnd.irepository.package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["irp"]
    },
    "application/vnd.is-xpr": {
      source: "iana",
      extensions: ["xpr"]
    },
    "application/vnd.isac.fcs": {
      source: "iana",
      extensions: ["fcs"]
    },
    "application/vnd.iso11783-10+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.jam": {
      source: "iana",
      extensions: ["jam"]
    },
    "application/vnd.japannet-directory-service": {
      source: "iana"
    },
    "application/vnd.japannet-jpnstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-payment-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-registration": {
      source: "iana"
    },
    "application/vnd.japannet-registration-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-setstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-verification": {
      source: "iana"
    },
    "application/vnd.japannet-verification-wakeup": {
      source: "iana"
    },
    "application/vnd.jcp.javame.midlet-rms": {
      source: "iana",
      extensions: ["rms"]
    },
    "application/vnd.jisp": {
      source: "iana",
      extensions: ["jisp"]
    },
    "application/vnd.joost.joda-archive": {
      source: "iana",
      extensions: ["joda"]
    },
    "application/vnd.jsk.isdn-ngn": {
      source: "iana"
    },
    "application/vnd.kahootz": {
      source: "iana",
      extensions: ["ktz", "ktr"]
    },
    "application/vnd.kde.karbon": {
      source: "iana",
      extensions: ["karbon"]
    },
    "application/vnd.kde.kchart": {
      source: "iana",
      extensions: ["chrt"]
    },
    "application/vnd.kde.kformula": {
      source: "iana",
      extensions: ["kfo"]
    },
    "application/vnd.kde.kivio": {
      source: "iana",
      extensions: ["flw"]
    },
    "application/vnd.kde.kontour": {
      source: "iana",
      extensions: ["kon"]
    },
    "application/vnd.kde.kpresenter": {
      source: "iana",
      extensions: ["kpr", "kpt"]
    },
    "application/vnd.kde.kspread": {
      source: "iana",
      extensions: ["ksp"]
    },
    "application/vnd.kde.kword": {
      source: "iana",
      extensions: ["kwd", "kwt"]
    },
    "application/vnd.kenameaapp": {
      source: "iana",
      extensions: ["htke"]
    },
    "application/vnd.kidspiration": {
      source: "iana",
      extensions: ["kia"]
    },
    "application/vnd.kinar": {
      source: "iana",
      extensions: ["kne", "knp"]
    },
    "application/vnd.koan": {
      source: "iana",
      extensions: ["skp", "skd", "skt", "skm"]
    },
    "application/vnd.kodak-descriptor": {
      source: "iana",
      extensions: ["sse"]
    },
    "application/vnd.las": {
      source: "iana"
    },
    "application/vnd.las.las+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.las.las+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lasxml"]
    },
    "application/vnd.laszip": {
      source: "iana"
    },
    "application/vnd.leap+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.liberty-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.llamagraphics.life-balance.desktop": {
      source: "iana",
      extensions: ["lbd"]
    },
    "application/vnd.llamagraphics.life-balance.exchange+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lbe"]
    },
    "application/vnd.logipipe.circuit+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.loom": {
      source: "iana"
    },
    "application/vnd.lotus-1-2-3": {
      source: "iana",
      extensions: ["123"]
    },
    "application/vnd.lotus-approach": {
      source: "iana",
      extensions: ["apr"]
    },
    "application/vnd.lotus-freelance": {
      source: "iana",
      extensions: ["pre"]
    },
    "application/vnd.lotus-notes": {
      source: "iana",
      extensions: ["nsf"]
    },
    "application/vnd.lotus-organizer": {
      source: "iana",
      extensions: ["org"]
    },
    "application/vnd.lotus-screencam": {
      source: "iana",
      extensions: ["scm"]
    },
    "application/vnd.lotus-wordpro": {
      source: "iana",
      extensions: ["lwp"]
    },
    "application/vnd.macports.portpkg": {
      source: "iana",
      extensions: ["portpkg"]
    },
    "application/vnd.mapbox-vector-tile": {
      source: "iana",
      extensions: ["mvt"]
    },
    "application/vnd.marlin.drm.actiontoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.conftoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.license+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.mdcf": {
      source: "iana"
    },
    "application/vnd.mason+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.maxar.archive.3tz+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.maxmind.maxmind-db": {
      source: "iana"
    },
    "application/vnd.mcd": {
      source: "iana",
      extensions: ["mcd"]
    },
    "application/vnd.medcalcdata": {
      source: "iana",
      extensions: ["mc1"]
    },
    "application/vnd.mediastation.cdkey": {
      source: "iana",
      extensions: ["cdkey"]
    },
    "application/vnd.meridian-slingshot": {
      source: "iana"
    },
    "application/vnd.mfer": {
      source: "iana",
      extensions: ["mwf"]
    },
    "application/vnd.mfmp": {
      source: "iana",
      extensions: ["mfm"]
    },
    "application/vnd.micro+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.micrografx.flo": {
      source: "iana",
      extensions: ["flo"]
    },
    "application/vnd.micrografx.igx": {
      source: "iana",
      extensions: ["igx"]
    },
    "application/vnd.microsoft.portable-executable": {
      source: "iana"
    },
    "application/vnd.microsoft.windows.thumbnail-cache": {
      source: "iana"
    },
    "application/vnd.miele+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.mif": {
      source: "iana",
      extensions: ["mif"]
    },
    "application/vnd.minisoft-hp3000-save": {
      source: "iana"
    },
    "application/vnd.mitsubishi.misty-guard.trustweb": {
      source: "iana"
    },
    "application/vnd.mobius.daf": {
      source: "iana",
      extensions: ["daf"]
    },
    "application/vnd.mobius.dis": {
      source: "iana",
      extensions: ["dis"]
    },
    "application/vnd.mobius.mbk": {
      source: "iana",
      extensions: ["mbk"]
    },
    "application/vnd.mobius.mqy": {
      source: "iana",
      extensions: ["mqy"]
    },
    "application/vnd.mobius.msl": {
      source: "iana",
      extensions: ["msl"]
    },
    "application/vnd.mobius.plc": {
      source: "iana",
      extensions: ["plc"]
    },
    "application/vnd.mobius.txf": {
      source: "iana",
      extensions: ["txf"]
    },
    "application/vnd.mophun.application": {
      source: "iana",
      extensions: ["mpn"]
    },
    "application/vnd.mophun.certificate": {
      source: "iana",
      extensions: ["mpc"]
    },
    "application/vnd.motorola.flexsuite": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.adsi": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.fis": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.gotap": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.kmr": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.ttc": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.wem": {
      source: "iana"
    },
    "application/vnd.motorola.iprm": {
      source: "iana"
    },
    "application/vnd.mozilla.xul+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xul"]
    },
    "application/vnd.ms-3mfdocument": {
      source: "iana"
    },
    "application/vnd.ms-artgalry": {
      source: "iana",
      extensions: ["cil"]
    },
    "application/vnd.ms-asf": {
      source: "iana"
    },
    "application/vnd.ms-cab-compressed": {
      source: "iana",
      extensions: ["cab"]
    },
    "application/vnd.ms-color.iccprofile": {
      source: "apache"
    },
    "application/vnd.ms-excel": {
      source: "iana",
      compressible: false,
      extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
    },
    "application/vnd.ms-excel.addin.macroenabled.12": {
      source: "iana",
      extensions: ["xlam"]
    },
    "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
      source: "iana",
      extensions: ["xlsb"]
    },
    "application/vnd.ms-excel.sheet.macroenabled.12": {
      source: "iana",
      extensions: ["xlsm"]
    },
    "application/vnd.ms-excel.template.macroenabled.12": {
      source: "iana",
      extensions: ["xltm"]
    },
    "application/vnd.ms-fontobject": {
      source: "iana",
      compressible: true,
      extensions: ["eot"]
    },
    "application/vnd.ms-htmlhelp": {
      source: "iana",
      extensions: ["chm"]
    },
    "application/vnd.ms-ims": {
      source: "iana",
      extensions: ["ims"]
    },
    "application/vnd.ms-lrm": {
      source: "iana",
      extensions: ["lrm"]
    },
    "application/vnd.ms-office.activex+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-officetheme": {
      source: "iana",
      extensions: ["thmx"]
    },
    "application/vnd.ms-opentype": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-outlook": {
      compressible: false,
      extensions: ["msg"]
    },
    "application/vnd.ms-package.obfuscated-opentype": {
      source: "apache"
    },
    "application/vnd.ms-pki.seccat": {
      source: "apache",
      extensions: ["cat"]
    },
    "application/vnd.ms-pki.stl": {
      source: "apache",
      extensions: ["stl"]
    },
    "application/vnd.ms-playready.initiator+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-powerpoint": {
      source: "iana",
      compressible: false,
      extensions: ["ppt", "pps", "pot"]
    },
    "application/vnd.ms-powerpoint.addin.macroenabled.12": {
      source: "iana",
      extensions: ["ppam"]
    },
    "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
      source: "iana",
      extensions: ["pptm"]
    },
    "application/vnd.ms-powerpoint.slide.macroenabled.12": {
      source: "iana",
      extensions: ["sldm"]
    },
    "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
      source: "iana",
      extensions: ["ppsm"]
    },
    "application/vnd.ms-powerpoint.template.macroenabled.12": {
      source: "iana",
      extensions: ["potm"]
    },
    "application/vnd.ms-printdevicecapabilities+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-printing.printticket+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-printschematicket+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-project": {
      source: "iana",
      extensions: ["mpp", "mpt"]
    },
    "application/vnd.ms-tnef": {
      source: "iana"
    },
    "application/vnd.ms-windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.nwprinting.oob": {
      source: "iana"
    },
    "application/vnd.ms-windows.printerpairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.wsd.oob": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-resp": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-resp": {
      source: "iana"
    },
    "application/vnd.ms-word.document.macroenabled.12": {
      source: "iana",
      extensions: ["docm"]
    },
    "application/vnd.ms-word.template.macroenabled.12": {
      source: "iana",
      extensions: ["dotm"]
    },
    "application/vnd.ms-works": {
      source: "iana",
      extensions: ["wps", "wks", "wcm", "wdb"]
    },
    "application/vnd.ms-wpl": {
      source: "iana",
      extensions: ["wpl"]
    },
    "application/vnd.ms-xpsdocument": {
      source: "iana",
      compressible: false,
      extensions: ["xps"]
    },
    "application/vnd.msa-disk-image": {
      source: "iana"
    },
    "application/vnd.mseq": {
      source: "iana",
      extensions: ["mseq"]
    },
    "application/vnd.msign": {
      source: "iana"
    },
    "application/vnd.multiad.creator": {
      source: "iana"
    },
    "application/vnd.multiad.creator.cif": {
      source: "iana"
    },
    "application/vnd.music-niff": {
      source: "iana"
    },
    "application/vnd.musician": {
      source: "iana",
      extensions: ["mus"]
    },
    "application/vnd.muvee.style": {
      source: "iana",
      extensions: ["msty"]
    },
    "application/vnd.mynfc": {
      source: "iana",
      extensions: ["taglet"]
    },
    "application/vnd.nacamar.ybrid+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ncd.control": {
      source: "iana"
    },
    "application/vnd.ncd.reference": {
      source: "iana"
    },
    "application/vnd.nearst.inv+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nebumind.line": {
      source: "iana"
    },
    "application/vnd.nervana": {
      source: "iana"
    },
    "application/vnd.netfpx": {
      source: "iana"
    },
    "application/vnd.neurolanguage.nlu": {
      source: "iana",
      extensions: ["nlu"]
    },
    "application/vnd.nimn": {
      source: "iana"
    },
    "application/vnd.nintendo.nitro.rom": {
      source: "iana"
    },
    "application/vnd.nintendo.snes.rom": {
      source: "iana"
    },
    "application/vnd.nitf": {
      source: "iana",
      extensions: ["ntf", "nitf"]
    },
    "application/vnd.noblenet-directory": {
      source: "iana",
      extensions: ["nnd"]
    },
    "application/vnd.noblenet-sealer": {
      source: "iana",
      extensions: ["nns"]
    },
    "application/vnd.noblenet-web": {
      source: "iana",
      extensions: ["nnw"]
    },
    "application/vnd.nokia.catalogs": {
      source: "iana"
    },
    "application/vnd.nokia.conml+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.conml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.iptv.config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.isds-radio-presets": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.landmarkcollection+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.n-gage.ac+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ac"]
    },
    "application/vnd.nokia.n-gage.data": {
      source: "iana",
      extensions: ["ngdat"]
    },
    "application/vnd.nokia.n-gage.symbian.install": {
      source: "iana",
      extensions: ["n-gage"]
    },
    "application/vnd.nokia.ncd": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.radio-preset": {
      source: "iana",
      extensions: ["rpst"]
    },
    "application/vnd.nokia.radio-presets": {
      source: "iana",
      extensions: ["rpss"]
    },
    "application/vnd.novadigm.edm": {
      source: "iana",
      extensions: ["edm"]
    },
    "application/vnd.novadigm.edx": {
      source: "iana",
      extensions: ["edx"]
    },
    "application/vnd.novadigm.ext": {
      source: "iana",
      extensions: ["ext"]
    },
    "application/vnd.ntt-local.content-share": {
      source: "iana"
    },
    "application/vnd.ntt-local.file-transfer": {
      source: "iana"
    },
    "application/vnd.ntt-local.ogw_remote-access": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_remote": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_tcp_stream": {
      source: "iana"
    },
    "application/vnd.oasis.opendocument.chart": {
      source: "iana",
      extensions: ["odc"]
    },
    "application/vnd.oasis.opendocument.chart-template": {
      source: "iana",
      extensions: ["otc"]
    },
    "application/vnd.oasis.opendocument.database": {
      source: "iana",
      extensions: ["odb"]
    },
    "application/vnd.oasis.opendocument.formula": {
      source: "iana",
      extensions: ["odf"]
    },
    "application/vnd.oasis.opendocument.formula-template": {
      source: "iana",
      extensions: ["odft"]
    },
    "application/vnd.oasis.opendocument.graphics": {
      source: "iana",
      compressible: false,
      extensions: ["odg"]
    },
    "application/vnd.oasis.opendocument.graphics-template": {
      source: "iana",
      extensions: ["otg"]
    },
    "application/vnd.oasis.opendocument.image": {
      source: "iana",
      extensions: ["odi"]
    },
    "application/vnd.oasis.opendocument.image-template": {
      source: "iana",
      extensions: ["oti"]
    },
    "application/vnd.oasis.opendocument.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["odp"]
    },
    "application/vnd.oasis.opendocument.presentation-template": {
      source: "iana",
      extensions: ["otp"]
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
      source: "iana",
      compressible: false,
      extensions: ["ods"]
    },
    "application/vnd.oasis.opendocument.spreadsheet-template": {
      source: "iana",
      extensions: ["ots"]
    },
    "application/vnd.oasis.opendocument.text": {
      source: "iana",
      compressible: false,
      extensions: ["odt"]
    },
    "application/vnd.oasis.opendocument.text-master": {
      source: "iana",
      extensions: ["odm"]
    },
    "application/vnd.oasis.opendocument.text-template": {
      source: "iana",
      extensions: ["ott"]
    },
    "application/vnd.oasis.opendocument.text-web": {
      source: "iana",
      extensions: ["oth"]
    },
    "application/vnd.obn": {
      source: "iana"
    },
    "application/vnd.ocf+cbor": {
      source: "iana"
    },
    "application/vnd.oci.image.manifest.v1+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oftn.l10n+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessdownload+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessstreaming+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.cspg-hexbinary": {
      source: "iana"
    },
    "application/vnd.oipf.dae.svg+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.dae.xhtml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.mippvcontrolmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.pae.gem": {
      source: "iana"
    },
    "application/vnd.oipf.spdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.spdlist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.ueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.userprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.olpc-sugar": {
      source: "iana",
      extensions: ["xo"]
    },
    "application/vnd.oma-scws-config": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-request": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-response": {
      source: "iana"
    },
    "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.drm-trigger+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.imd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.ltkm": {
      source: "iana"
    },
    "application/vnd.oma.bcast.notification+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.provisioningtrigger": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgboot": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgdd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sgdu": {
      source: "iana"
    },
    "application/vnd.oma.bcast.simple-symbol-container": {
      source: "iana"
    },
    "application/vnd.oma.bcast.smartcard-trigger+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sprov+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.stkm": {
      source: "iana"
    },
    "application/vnd.oma.cab-address-book+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-feature-handler+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-pcc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-subs-invite+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-user-prefs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.dcd": {
      source: "iana"
    },
    "application/vnd.oma.dcdc": {
      source: "iana"
    },
    "application/vnd.oma.dd2+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dd2"]
    },
    "application/vnd.oma.drm.risd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.group-usage-list+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+cbor": {
      source: "iana"
    },
    "application/vnd.oma.lwm2m+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+tlv": {
      source: "iana"
    },
    "application/vnd.oma.pal+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.detailed-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.final-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.groups+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.invocation-descriptor+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.optimized-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.push": {
      source: "iana"
    },
    "application/vnd.oma.scidm.messages+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.xcap-directory+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.omads-email+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-file+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-folder+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omaloc-supl-init": {
      source: "iana"
    },
    "application/vnd.onepager": {
      source: "iana"
    },
    "application/vnd.onepagertamp": {
      source: "iana"
    },
    "application/vnd.onepagertamx": {
      source: "iana"
    },
    "application/vnd.onepagertat": {
      source: "iana"
    },
    "application/vnd.onepagertatp": {
      source: "iana"
    },
    "application/vnd.onepagertatx": {
      source: "iana"
    },
    "application/vnd.openblox.game+xml": {
      source: "iana",
      compressible: true,
      extensions: ["obgx"]
    },
    "application/vnd.openblox.game-binary": {
      source: "iana"
    },
    "application/vnd.openeye.oeb": {
      source: "iana"
    },
    "application/vnd.openofficeorg.extension": {
      source: "apache",
      extensions: ["oxt"]
    },
    "application/vnd.openstreetmap.data+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osm"]
    },
    "application/vnd.opentimestamps.ots": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawing+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["pptx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide": {
      source: "iana",
      extensions: ["sldx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
      source: "iana",
      extensions: ["ppsx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template": {
      source: "iana",
      extensions: ["potx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      source: "iana",
      compressible: false,
      extensions: ["xlsx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
      source: "iana",
      extensions: ["xltx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.theme+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.vmldrawing": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      source: "iana",
      compressible: false,
      extensions: ["docx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
      source: "iana",
      extensions: ["dotx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.core-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.relationships+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oracle.resource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.orange.indata": {
      source: "iana"
    },
    "application/vnd.osa.netdeploy": {
      source: "iana"
    },
    "application/vnd.osgeo.mapguide.package": {
      source: "iana",
      extensions: ["mgp"]
    },
    "application/vnd.osgi.bundle": {
      source: "iana"
    },
    "application/vnd.osgi.dp": {
      source: "iana",
      extensions: ["dp"]
    },
    "application/vnd.osgi.subsystem": {
      source: "iana",
      extensions: ["esa"]
    },
    "application/vnd.otps.ct-kip+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oxli.countgraph": {
      source: "iana"
    },
    "application/vnd.pagerduty+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.palm": {
      source: "iana",
      extensions: ["pdb", "pqa", "oprc"]
    },
    "application/vnd.panoply": {
      source: "iana"
    },
    "application/vnd.paos.xml": {
      source: "iana"
    },
    "application/vnd.patentdive": {
      source: "iana"
    },
    "application/vnd.patientecommsdoc": {
      source: "iana"
    },
    "application/vnd.pawaafile": {
      source: "iana",
      extensions: ["paw"]
    },
    "application/vnd.pcos": {
      source: "iana"
    },
    "application/vnd.pg.format": {
      source: "iana",
      extensions: ["str"]
    },
    "application/vnd.pg.osasli": {
      source: "iana",
      extensions: ["ei6"]
    },
    "application/vnd.piaccess.application-licence": {
      source: "iana"
    },
    "application/vnd.picsel": {
      source: "iana",
      extensions: ["efif"]
    },
    "application/vnd.pmi.widget": {
      source: "iana",
      extensions: ["wg"]
    },
    "application/vnd.poc.group-advertisement+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.pocketlearn": {
      source: "iana",
      extensions: ["plf"]
    },
    "application/vnd.powerbuilder6": {
      source: "iana",
      extensions: ["pbd"]
    },
    "application/vnd.powerbuilder6-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder7": {
      source: "iana"
    },
    "application/vnd.powerbuilder7-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder75": {
      source: "iana"
    },
    "application/vnd.powerbuilder75-s": {
      source: "iana"
    },
    "application/vnd.preminet": {
      source: "iana"
    },
    "application/vnd.previewsystems.box": {
      source: "iana",
      extensions: ["box"]
    },
    "application/vnd.proteus.magazine": {
      source: "iana",
      extensions: ["mgz"]
    },
    "application/vnd.psfs": {
      source: "iana"
    },
    "application/vnd.publishare-delta-tree": {
      source: "iana",
      extensions: ["qps"]
    },
    "application/vnd.pvi.ptid1": {
      source: "iana",
      extensions: ["ptid"]
    },
    "application/vnd.pwg-multiplexed": {
      source: "iana"
    },
    "application/vnd.pwg-xhtml-print+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.qualcomm.brew-app-res": {
      source: "iana"
    },
    "application/vnd.quarantainenet": {
      source: "iana"
    },
    "application/vnd.quark.quarkxpress": {
      source: "iana",
      extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
    },
    "application/vnd.quobject-quoxdocument": {
      source: "iana"
    },
    "application/vnd.radisys.moml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-stream+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-base+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-detect+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-group+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-speech+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-transform+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rainstor.data": {
      source: "iana"
    },
    "application/vnd.rapid": {
      source: "iana"
    },
    "application/vnd.rar": {
      source: "iana",
      extensions: ["rar"]
    },
    "application/vnd.realvnc.bed": {
      source: "iana",
      extensions: ["bed"]
    },
    "application/vnd.recordare.musicxml": {
      source: "iana",
      extensions: ["mxl"]
    },
    "application/vnd.recordare.musicxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musicxml"]
    },
    "application/vnd.renlearn.rlprint": {
      source: "iana"
    },
    "application/vnd.resilient.logic": {
      source: "iana"
    },
    "application/vnd.restful+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rig.cryptonote": {
      source: "iana",
      extensions: ["cryptonote"]
    },
    "application/vnd.rim.cod": {
      source: "apache",
      extensions: ["cod"]
    },
    "application/vnd.rn-realmedia": {
      source: "apache",
      extensions: ["rm"]
    },
    "application/vnd.rn-realmedia-vbr": {
      source: "apache",
      extensions: ["rmvb"]
    },
    "application/vnd.route66.link66+xml": {
      source: "iana",
      compressible: true,
      extensions: ["link66"]
    },
    "application/vnd.rs-274x": {
      source: "iana"
    },
    "application/vnd.ruckus.download": {
      source: "iana"
    },
    "application/vnd.s3sms": {
      source: "iana"
    },
    "application/vnd.sailingtracker.track": {
      source: "iana",
      extensions: ["st"]
    },
    "application/vnd.sar": {
      source: "iana"
    },
    "application/vnd.sbm.cid": {
      source: "iana"
    },
    "application/vnd.sbm.mid2": {
      source: "iana"
    },
    "application/vnd.scribus": {
      source: "iana"
    },
    "application/vnd.sealed.3df": {
      source: "iana"
    },
    "application/vnd.sealed.csf": {
      source: "iana"
    },
    "application/vnd.sealed.doc": {
      source: "iana"
    },
    "application/vnd.sealed.eml": {
      source: "iana"
    },
    "application/vnd.sealed.mht": {
      source: "iana"
    },
    "application/vnd.sealed.net": {
      source: "iana"
    },
    "application/vnd.sealed.ppt": {
      source: "iana"
    },
    "application/vnd.sealed.tiff": {
      source: "iana"
    },
    "application/vnd.sealed.xls": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.html": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.pdf": {
      source: "iana"
    },
    "application/vnd.seemail": {
      source: "iana",
      extensions: ["see"]
    },
    "application/vnd.seis+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.sema": {
      source: "iana",
      extensions: ["sema"]
    },
    "application/vnd.semd": {
      source: "iana",
      extensions: ["semd"]
    },
    "application/vnd.semf": {
      source: "iana",
      extensions: ["semf"]
    },
    "application/vnd.shade-save-file": {
      source: "iana"
    },
    "application/vnd.shana.informed.formdata": {
      source: "iana",
      extensions: ["ifm"]
    },
    "application/vnd.shana.informed.formtemplate": {
      source: "iana",
      extensions: ["itp"]
    },
    "application/vnd.shana.informed.interchange": {
      source: "iana",
      extensions: ["iif"]
    },
    "application/vnd.shana.informed.package": {
      source: "iana",
      extensions: ["ipk"]
    },
    "application/vnd.shootproof+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shopkick+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shp": {
      source: "iana"
    },
    "application/vnd.shx": {
      source: "iana"
    },
    "application/vnd.sigrok.session": {
      source: "iana"
    },
    "application/vnd.simtech-mindmapper": {
      source: "iana",
      extensions: ["twd", "twds"]
    },
    "application/vnd.siren+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.smaf": {
      source: "iana",
      extensions: ["mmf"]
    },
    "application/vnd.smart.notebook": {
      source: "iana"
    },
    "application/vnd.smart.teacher": {
      source: "iana",
      extensions: ["teacher"]
    },
    "application/vnd.snesdev-page-table": {
      source: "iana"
    },
    "application/vnd.software602.filler.form+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fo"]
    },
    "application/vnd.software602.filler.form-xml-zip": {
      source: "iana"
    },
    "application/vnd.solent.sdkm+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sdkm", "sdkd"]
    },
    "application/vnd.spotfire.dxp": {
      source: "iana",
      extensions: ["dxp"]
    },
    "application/vnd.spotfire.sfs": {
      source: "iana",
      extensions: ["sfs"]
    },
    "application/vnd.sqlite3": {
      source: "iana"
    },
    "application/vnd.sss-cod": {
      source: "iana"
    },
    "application/vnd.sss-dtf": {
      source: "iana"
    },
    "application/vnd.sss-ntf": {
      source: "iana"
    },
    "application/vnd.stardivision.calc": {
      source: "apache",
      extensions: ["sdc"]
    },
    "application/vnd.stardivision.draw": {
      source: "apache",
      extensions: ["sda"]
    },
    "application/vnd.stardivision.impress": {
      source: "apache",
      extensions: ["sdd"]
    },
    "application/vnd.stardivision.math": {
      source: "apache",
      extensions: ["smf"]
    },
    "application/vnd.stardivision.writer": {
      source: "apache",
      extensions: ["sdw", "vor"]
    },
    "application/vnd.stardivision.writer-global": {
      source: "apache",
      extensions: ["sgl"]
    },
    "application/vnd.stepmania.package": {
      source: "iana",
      extensions: ["smzip"]
    },
    "application/vnd.stepmania.stepchart": {
      source: "iana",
      extensions: ["sm"]
    },
    "application/vnd.street-stream": {
      source: "iana"
    },
    "application/vnd.sun.wadl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wadl"]
    },
    "application/vnd.sun.xml.calc": {
      source: "apache",
      extensions: ["sxc"]
    },
    "application/vnd.sun.xml.calc.template": {
      source: "apache",
      extensions: ["stc"]
    },
    "application/vnd.sun.xml.draw": {
      source: "apache",
      extensions: ["sxd"]
    },
    "application/vnd.sun.xml.draw.template": {
      source: "apache",
      extensions: ["std"]
    },
    "application/vnd.sun.xml.impress": {
      source: "apache",
      extensions: ["sxi"]
    },
    "application/vnd.sun.xml.impress.template": {
      source: "apache",
      extensions: ["sti"]
    },
    "application/vnd.sun.xml.math": {
      source: "apache",
      extensions: ["sxm"]
    },
    "application/vnd.sun.xml.writer": {
      source: "apache",
      extensions: ["sxw"]
    },
    "application/vnd.sun.xml.writer.global": {
      source: "apache",
      extensions: ["sxg"]
    },
    "application/vnd.sun.xml.writer.template": {
      source: "apache",
      extensions: ["stw"]
    },
    "application/vnd.sus-calendar": {
      source: "iana",
      extensions: ["sus", "susp"]
    },
    "application/vnd.svd": {
      source: "iana",
      extensions: ["svd"]
    },
    "application/vnd.swiftview-ics": {
      source: "iana"
    },
    "application/vnd.sycle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.syft+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.symbian.install": {
      source: "apache",
      extensions: ["sis", "sisx"]
    },
    "application/vnd.syncml+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xsm"]
    },
    "application/vnd.syncml.dm+wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["bdm"]
    },
    "application/vnd.syncml.dm+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xdm"]
    },
    "application/vnd.syncml.dm.notification": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["ddf"]
    },
    "application/vnd.syncml.dmtnds+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmtnds+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.syncml.ds.notification": {
      source: "iana"
    },
    "application/vnd.tableschema+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tao.intent-module-archive": {
      source: "iana",
      extensions: ["tao"]
    },
    "application/vnd.tcpdump.pcap": {
      source: "iana",
      extensions: ["pcap", "cap", "dmp"]
    },
    "application/vnd.think-cell.ppttc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tmd.mediaflex.api+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tml": {
      source: "iana"
    },
    "application/vnd.tmobile-livetv": {
      source: "iana",
      extensions: ["tmo"]
    },
    "application/vnd.tri.onesource": {
      source: "iana"
    },
    "application/vnd.trid.tpt": {
      source: "iana",
      extensions: ["tpt"]
    },
    "application/vnd.triscape.mxs": {
      source: "iana",
      extensions: ["mxs"]
    },
    "application/vnd.trueapp": {
      source: "iana",
      extensions: ["tra"]
    },
    "application/vnd.truedoc": {
      source: "iana"
    },
    "application/vnd.ubisoft.webplayer": {
      source: "iana"
    },
    "application/vnd.ufdl": {
      source: "iana",
      extensions: ["ufd", "ufdl"]
    },
    "application/vnd.uiq.theme": {
      source: "iana",
      extensions: ["utz"]
    },
    "application/vnd.umajin": {
      source: "iana",
      extensions: ["umj"]
    },
    "application/vnd.unity": {
      source: "iana",
      extensions: ["unityweb"]
    },
    "application/vnd.uoml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uoml"]
    },
    "application/vnd.uplanet.alert": {
      source: "iana"
    },
    "application/vnd.uplanet.alert-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.channel": {
      source: "iana"
    },
    "application/vnd.uplanet.channel-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.list": {
      source: "iana"
    },
    "application/vnd.uplanet.list-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.signal": {
      source: "iana"
    },
    "application/vnd.uri-map": {
      source: "iana"
    },
    "application/vnd.valve.source.material": {
      source: "iana"
    },
    "application/vnd.vcx": {
      source: "iana",
      extensions: ["vcx"]
    },
    "application/vnd.vd-study": {
      source: "iana"
    },
    "application/vnd.vectorworks": {
      source: "iana"
    },
    "application/vnd.vel+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.verimatrix.vcas": {
      source: "iana"
    },
    "application/vnd.veritone.aion+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.veryant.thin": {
      source: "iana"
    },
    "application/vnd.ves.encrypted": {
      source: "iana"
    },
    "application/vnd.vidsoft.vidconference": {
      source: "iana"
    },
    "application/vnd.visio": {
      source: "iana",
      extensions: ["vsd", "vst", "vss", "vsw"]
    },
    "application/vnd.visionary": {
      source: "iana",
      extensions: ["vis"]
    },
    "application/vnd.vividence.scriptfile": {
      source: "iana"
    },
    "application/vnd.vsf": {
      source: "iana",
      extensions: ["vsf"]
    },
    "application/vnd.wap.sic": {
      source: "iana"
    },
    "application/vnd.wap.slc": {
      source: "iana"
    },
    "application/vnd.wap.wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["wbxml"]
    },
    "application/vnd.wap.wmlc": {
      source: "iana",
      extensions: ["wmlc"]
    },
    "application/vnd.wap.wmlscriptc": {
      source: "iana",
      extensions: ["wmlsc"]
    },
    "application/vnd.webturbo": {
      source: "iana",
      extensions: ["wtb"]
    },
    "application/vnd.wfa.dpp": {
      source: "iana"
    },
    "application/vnd.wfa.p2p": {
      source: "iana"
    },
    "application/vnd.wfa.wsc": {
      source: "iana"
    },
    "application/vnd.windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.wmc": {
      source: "iana"
    },
    "application/vnd.wmf.bootstrap": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica.package": {
      source: "iana"
    },
    "application/vnd.wolfram.player": {
      source: "iana",
      extensions: ["nbp"]
    },
    "application/vnd.wordperfect": {
      source: "iana",
      extensions: ["wpd"]
    },
    "application/vnd.wqd": {
      source: "iana",
      extensions: ["wqd"]
    },
    "application/vnd.wrq-hp3000-labelled": {
      source: "iana"
    },
    "application/vnd.wt.stf": {
      source: "iana",
      extensions: ["stf"]
    },
    "application/vnd.wv.csp+wbxml": {
      source: "iana"
    },
    "application/vnd.wv.csp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.wv.ssp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xacml+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xara": {
      source: "iana",
      extensions: ["xar"]
    },
    "application/vnd.xfdl": {
      source: "iana",
      extensions: ["xfdl"]
    },
    "application/vnd.xfdl.webform": {
      source: "iana"
    },
    "application/vnd.xmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xmpie.cpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.dpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.plan": {
      source: "iana"
    },
    "application/vnd.xmpie.ppkg": {
      source: "iana"
    },
    "application/vnd.xmpie.xlim": {
      source: "iana"
    },
    "application/vnd.yamaha.hv-dic": {
      source: "iana",
      extensions: ["hvd"]
    },
    "application/vnd.yamaha.hv-script": {
      source: "iana",
      extensions: ["hvs"]
    },
    "application/vnd.yamaha.hv-voice": {
      source: "iana",
      extensions: ["hvp"]
    },
    "application/vnd.yamaha.openscoreformat": {
      source: "iana",
      extensions: ["osf"]
    },
    "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osfpvg"]
    },
    "application/vnd.yamaha.remote-setup": {
      source: "iana"
    },
    "application/vnd.yamaha.smaf-audio": {
      source: "iana",
      extensions: ["saf"]
    },
    "application/vnd.yamaha.smaf-phrase": {
      source: "iana",
      extensions: ["spf"]
    },
    "application/vnd.yamaha.through-ngn": {
      source: "iana"
    },
    "application/vnd.yamaha.tunnel-udpencap": {
      source: "iana"
    },
    "application/vnd.yaoweme": {
      source: "iana"
    },
    "application/vnd.yellowriver-custom-menu": {
      source: "iana",
      extensions: ["cmp"]
    },
    "application/vnd.youtube.yt": {
      source: "iana"
    },
    "application/vnd.zul": {
      source: "iana",
      extensions: ["zir", "zirz"]
    },
    "application/vnd.zzazz.deck+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zaz"]
    },
    "application/voicexml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["vxml"]
    },
    "application/voucher-cms+json": {
      source: "iana",
      compressible: true
    },
    "application/vq-rtcpxr": {
      source: "iana"
    },
    "application/wasm": {
      source: "iana",
      compressible: true,
      extensions: ["wasm"]
    },
    "application/watcherinfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wif"]
    },
    "application/webpush-options+json": {
      source: "iana",
      compressible: true
    },
    "application/whoispp-query": {
      source: "iana"
    },
    "application/whoispp-response": {
      source: "iana"
    },
    "application/widget": {
      source: "iana",
      extensions: ["wgt"]
    },
    "application/winhlp": {
      source: "apache",
      extensions: ["hlp"]
    },
    "application/wita": {
      source: "iana"
    },
    "application/wordperfect5.1": {
      source: "iana"
    },
    "application/wsdl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wsdl"]
    },
    "application/wspolicy+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wspolicy"]
    },
    "application/x-7z-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["7z"]
    },
    "application/x-abiword": {
      source: "apache",
      extensions: ["abw"]
    },
    "application/x-ace-compressed": {
      source: "apache",
      extensions: ["ace"]
    },
    "application/x-amf": {
      source: "apache"
    },
    "application/x-apple-diskimage": {
      source: "apache",
      extensions: ["dmg"]
    },
    "application/x-arj": {
      compressible: false,
      extensions: ["arj"]
    },
    "application/x-authorware-bin": {
      source: "apache",
      extensions: ["aab", "x32", "u32", "vox"]
    },
    "application/x-authorware-map": {
      source: "apache",
      extensions: ["aam"]
    },
    "application/x-authorware-seg": {
      source: "apache",
      extensions: ["aas"]
    },
    "application/x-bcpio": {
      source: "apache",
      extensions: ["bcpio"]
    },
    "application/x-bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/x-bittorrent": {
      source: "apache",
      extensions: ["torrent"]
    },
    "application/x-blorb": {
      source: "apache",
      extensions: ["blb", "blorb"]
    },
    "application/x-bzip": {
      source: "apache",
      compressible: false,
      extensions: ["bz"]
    },
    "application/x-bzip2": {
      source: "apache",
      compressible: false,
      extensions: ["bz2", "boz"]
    },
    "application/x-cbr": {
      source: "apache",
      extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
    },
    "application/x-cdlink": {
      source: "apache",
      extensions: ["vcd"]
    },
    "application/x-cfs-compressed": {
      source: "apache",
      extensions: ["cfs"]
    },
    "application/x-chat": {
      source: "apache",
      extensions: ["chat"]
    },
    "application/x-chess-pgn": {
      source: "apache",
      extensions: ["pgn"]
    },
    "application/x-chrome-extension": {
      extensions: ["crx"]
    },
    "application/x-cocoa": {
      source: "nginx",
      extensions: ["cco"]
    },
    "application/x-compress": {
      source: "apache"
    },
    "application/x-conference": {
      source: "apache",
      extensions: ["nsc"]
    },
    "application/x-cpio": {
      source: "apache",
      extensions: ["cpio"]
    },
    "application/x-csh": {
      source: "apache",
      extensions: ["csh"]
    },
    "application/x-deb": {
      compressible: false
    },
    "application/x-debian-package": {
      source: "apache",
      extensions: ["deb", "udeb"]
    },
    "application/x-dgc-compressed": {
      source: "apache",
      extensions: ["dgc"]
    },
    "application/x-director": {
      source: "apache",
      extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
    },
    "application/x-doom": {
      source: "apache",
      extensions: ["wad"]
    },
    "application/x-dtbncx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ncx"]
    },
    "application/x-dtbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dtb"]
    },
    "application/x-dtbresource+xml": {
      source: "apache",
      compressible: true,
      extensions: ["res"]
    },
    "application/x-dvi": {
      source: "apache",
      compressible: false,
      extensions: ["dvi"]
    },
    "application/x-envoy": {
      source: "apache",
      extensions: ["evy"]
    },
    "application/x-eva": {
      source: "apache",
      extensions: ["eva"]
    },
    "application/x-font-bdf": {
      source: "apache",
      extensions: ["bdf"]
    },
    "application/x-font-dos": {
      source: "apache"
    },
    "application/x-font-framemaker": {
      source: "apache"
    },
    "application/x-font-ghostscript": {
      source: "apache",
      extensions: ["gsf"]
    },
    "application/x-font-libgrx": {
      source: "apache"
    },
    "application/x-font-linux-psf": {
      source: "apache",
      extensions: ["psf"]
    },
    "application/x-font-pcf": {
      source: "apache",
      extensions: ["pcf"]
    },
    "application/x-font-snf": {
      source: "apache",
      extensions: ["snf"]
    },
    "application/x-font-speedo": {
      source: "apache"
    },
    "application/x-font-sunos-news": {
      source: "apache"
    },
    "application/x-font-type1": {
      source: "apache",
      extensions: ["pfa", "pfb", "pfm", "afm"]
    },
    "application/x-font-vfont": {
      source: "apache"
    },
    "application/x-freearc": {
      source: "apache",
      extensions: ["arc"]
    },
    "application/x-futuresplash": {
      source: "apache",
      extensions: ["spl"]
    },
    "application/x-gca-compressed": {
      source: "apache",
      extensions: ["gca"]
    },
    "application/x-glulx": {
      source: "apache",
      extensions: ["ulx"]
    },
    "application/x-gnumeric": {
      source: "apache",
      extensions: ["gnumeric"]
    },
    "application/x-gramps-xml": {
      source: "apache",
      extensions: ["gramps"]
    },
    "application/x-gtar": {
      source: "apache",
      extensions: ["gtar"]
    },
    "application/x-gzip": {
      source: "apache"
    },
    "application/x-hdf": {
      source: "apache",
      extensions: ["hdf"]
    },
    "application/x-httpd-php": {
      compressible: true,
      extensions: ["php"]
    },
    "application/x-install-instructions": {
      source: "apache",
      extensions: ["install"]
    },
    "application/x-iso9660-image": {
      source: "apache",
      extensions: ["iso"]
    },
    "application/x-iwork-keynote-sffkey": {
      extensions: ["key"]
    },
    "application/x-iwork-numbers-sffnumbers": {
      extensions: ["numbers"]
    },
    "application/x-iwork-pages-sffpages": {
      extensions: ["pages"]
    },
    "application/x-java-archive-diff": {
      source: "nginx",
      extensions: ["jardiff"]
    },
    "application/x-java-jnlp-file": {
      source: "apache",
      compressible: false,
      extensions: ["jnlp"]
    },
    "application/x-javascript": {
      compressible: true
    },
    "application/x-keepass2": {
      extensions: ["kdbx"]
    },
    "application/x-latex": {
      source: "apache",
      compressible: false,
      extensions: ["latex"]
    },
    "application/x-lua-bytecode": {
      extensions: ["luac"]
    },
    "application/x-lzh-compressed": {
      source: "apache",
      extensions: ["lzh", "lha"]
    },
    "application/x-makeself": {
      source: "nginx",
      extensions: ["run"]
    },
    "application/x-mie": {
      source: "apache",
      extensions: ["mie"]
    },
    "application/x-mobipocket-ebook": {
      source: "apache",
      extensions: ["prc", "mobi"]
    },
    "application/x-mpegurl": {
      compressible: false
    },
    "application/x-ms-application": {
      source: "apache",
      extensions: ["application"]
    },
    "application/x-ms-shortcut": {
      source: "apache",
      extensions: ["lnk"]
    },
    "application/x-ms-wmd": {
      source: "apache",
      extensions: ["wmd"]
    },
    "application/x-ms-wmz": {
      source: "apache",
      extensions: ["wmz"]
    },
    "application/x-ms-xbap": {
      source: "apache",
      extensions: ["xbap"]
    },
    "application/x-msaccess": {
      source: "apache",
      extensions: ["mdb"]
    },
    "application/x-msbinder": {
      source: "apache",
      extensions: ["obd"]
    },
    "application/x-mscardfile": {
      source: "apache",
      extensions: ["crd"]
    },
    "application/x-msclip": {
      source: "apache",
      extensions: ["clp"]
    },
    "application/x-msdos-program": {
      extensions: ["exe"]
    },
    "application/x-msdownload": {
      source: "apache",
      extensions: ["exe", "dll", "com", "bat", "msi"]
    },
    "application/x-msmediaview": {
      source: "apache",
      extensions: ["mvb", "m13", "m14"]
    },
    "application/x-msmetafile": {
      source: "apache",
      extensions: ["wmf", "wmz", "emf", "emz"]
    },
    "application/x-msmoney": {
      source: "apache",
      extensions: ["mny"]
    },
    "application/x-mspublisher": {
      source: "apache",
      extensions: ["pub"]
    },
    "application/x-msschedule": {
      source: "apache",
      extensions: ["scd"]
    },
    "application/x-msterminal": {
      source: "apache",
      extensions: ["trm"]
    },
    "application/x-mswrite": {
      source: "apache",
      extensions: ["wri"]
    },
    "application/x-netcdf": {
      source: "apache",
      extensions: ["nc", "cdf"]
    },
    "application/x-ns-proxy-autoconfig": {
      compressible: true,
      extensions: ["pac"]
    },
    "application/x-nzb": {
      source: "apache",
      extensions: ["nzb"]
    },
    "application/x-perl": {
      source: "nginx",
      extensions: ["pl", "pm"]
    },
    "application/x-pilot": {
      source: "nginx",
      extensions: ["prc", "pdb"]
    },
    "application/x-pkcs12": {
      source: "apache",
      compressible: false,
      extensions: ["p12", "pfx"]
    },
    "application/x-pkcs7-certificates": {
      source: "apache",
      extensions: ["p7b", "spc"]
    },
    "application/x-pkcs7-certreqresp": {
      source: "apache",
      extensions: ["p7r"]
    },
    "application/x-pki-message": {
      source: "iana"
    },
    "application/x-rar-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["rar"]
    },
    "application/x-redhat-package-manager": {
      source: "nginx",
      extensions: ["rpm"]
    },
    "application/x-research-info-systems": {
      source: "apache",
      extensions: ["ris"]
    },
    "application/x-sea": {
      source: "nginx",
      extensions: ["sea"]
    },
    "application/x-sh": {
      source: "apache",
      compressible: true,
      extensions: ["sh"]
    },
    "application/x-shar": {
      source: "apache",
      extensions: ["shar"]
    },
    "application/x-shockwave-flash": {
      source: "apache",
      compressible: false,
      extensions: ["swf"]
    },
    "application/x-silverlight-app": {
      source: "apache",
      extensions: ["xap"]
    },
    "application/x-sql": {
      source: "apache",
      extensions: ["sql"]
    },
    "application/x-stuffit": {
      source: "apache",
      compressible: false,
      extensions: ["sit"]
    },
    "application/x-stuffitx": {
      source: "apache",
      extensions: ["sitx"]
    },
    "application/x-subrip": {
      source: "apache",
      extensions: ["srt"]
    },
    "application/x-sv4cpio": {
      source: "apache",
      extensions: ["sv4cpio"]
    },
    "application/x-sv4crc": {
      source: "apache",
      extensions: ["sv4crc"]
    },
    "application/x-t3vm-image": {
      source: "apache",
      extensions: ["t3"]
    },
    "application/x-tads": {
      source: "apache",
      extensions: ["gam"]
    },
    "application/x-tar": {
      source: "apache",
      compressible: true,
      extensions: ["tar"]
    },
    "application/x-tcl": {
      source: "apache",
      extensions: ["tcl", "tk"]
    },
    "application/x-tex": {
      source: "apache",
      extensions: ["tex"]
    },
    "application/x-tex-tfm": {
      source: "apache",
      extensions: ["tfm"]
    },
    "application/x-texinfo": {
      source: "apache",
      extensions: ["texinfo", "texi"]
    },
    "application/x-tgif": {
      source: "apache",
      extensions: ["obj"]
    },
    "application/x-ustar": {
      source: "apache",
      extensions: ["ustar"]
    },
    "application/x-virtualbox-hdd": {
      compressible: true,
      extensions: ["hdd"]
    },
    "application/x-virtualbox-ova": {
      compressible: true,
      extensions: ["ova"]
    },
    "application/x-virtualbox-ovf": {
      compressible: true,
      extensions: ["ovf"]
    },
    "application/x-virtualbox-vbox": {
      compressible: true,
      extensions: ["vbox"]
    },
    "application/x-virtualbox-vbox-extpack": {
      compressible: false,
      extensions: ["vbox-extpack"]
    },
    "application/x-virtualbox-vdi": {
      compressible: true,
      extensions: ["vdi"]
    },
    "application/x-virtualbox-vhd": {
      compressible: true,
      extensions: ["vhd"]
    },
    "application/x-virtualbox-vmdk": {
      compressible: true,
      extensions: ["vmdk"]
    },
    "application/x-wais-source": {
      source: "apache",
      extensions: ["src"]
    },
    "application/x-web-app-manifest+json": {
      compressible: true,
      extensions: ["webapp"]
    },
    "application/x-www-form-urlencoded": {
      source: "iana",
      compressible: true
    },
    "application/x-x509-ca-cert": {
      source: "iana",
      extensions: ["der", "crt", "pem"]
    },
    "application/x-x509-ca-ra-cert": {
      source: "iana"
    },
    "application/x-x509-next-ca-cert": {
      source: "iana"
    },
    "application/x-xfig": {
      source: "apache",
      extensions: ["fig"]
    },
    "application/x-xliff+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/x-xpinstall": {
      source: "apache",
      compressible: false,
      extensions: ["xpi"]
    },
    "application/x-xz": {
      source: "apache",
      extensions: ["xz"]
    },
    "application/x-zmachine": {
      source: "apache",
      extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
    },
    "application/x400-bp": {
      source: "iana"
    },
    "application/xacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/xaml+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xaml"]
    },
    "application/xcap-att+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xav"]
    },
    "application/xcap-caps+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xca"]
    },
    "application/xcap-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdf"]
    },
    "application/xcap-el+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xel"]
    },
    "application/xcap-error+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcap-ns+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xns"]
    },
    "application/xcon-conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcon-conference-info-diff+xml": {
      source: "iana",
      compressible: true
    },
    "application/xenc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xenc"]
    },
    "application/xhtml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xhtml", "xht"]
    },
    "application/xhtml-voice+xml": {
      source: "apache",
      compressible: true
    },
    "application/xliff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml", "xsl", "xsd", "rng"]
    },
    "application/xml-dtd": {
      source: "iana",
      compressible: true,
      extensions: ["dtd"]
    },
    "application/xml-external-parsed-entity": {
      source: "iana"
    },
    "application/xml-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/xmpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/xop+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xop"]
    },
    "application/xproc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xpl"]
    },
    "application/xslt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xsl", "xslt"]
    },
    "application/xspf+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xspf"]
    },
    "application/xv+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mxml", "xhvml", "xvml", "xvm"]
    },
    "application/yang": {
      source: "iana",
      extensions: ["yang"]
    },
    "application/yang-data+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-data+xml": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/yin+xml": {
      source: "iana",
      compressible: true,
      extensions: ["yin"]
    },
    "application/zip": {
      source: "iana",
      compressible: false,
      extensions: ["zip"]
    },
    "application/zlib": {
      source: "iana"
    },
    "application/zstd": {
      source: "iana"
    },
    "audio/1d-interleaved-parityfec": {
      source: "iana"
    },
    "audio/32kadpcm": {
      source: "iana"
    },
    "audio/3gpp": {
      source: "iana",
      compressible: false,
      extensions: ["3gpp"]
    },
    "audio/3gpp2": {
      source: "iana"
    },
    "audio/aac": {
      source: "iana"
    },
    "audio/ac3": {
      source: "iana"
    },
    "audio/adpcm": {
      source: "apache",
      extensions: ["adp"]
    },
    "audio/amr": {
      source: "iana",
      extensions: ["amr"]
    },
    "audio/amr-wb": {
      source: "iana"
    },
    "audio/amr-wb+": {
      source: "iana"
    },
    "audio/aptx": {
      source: "iana"
    },
    "audio/asc": {
      source: "iana"
    },
    "audio/atrac-advanced-lossless": {
      source: "iana"
    },
    "audio/atrac-x": {
      source: "iana"
    },
    "audio/atrac3": {
      source: "iana"
    },
    "audio/basic": {
      source: "iana",
      compressible: false,
      extensions: ["au", "snd"]
    },
    "audio/bv16": {
      source: "iana"
    },
    "audio/bv32": {
      source: "iana"
    },
    "audio/clearmode": {
      source: "iana"
    },
    "audio/cn": {
      source: "iana"
    },
    "audio/dat12": {
      source: "iana"
    },
    "audio/dls": {
      source: "iana"
    },
    "audio/dsr-es201108": {
      source: "iana"
    },
    "audio/dsr-es202050": {
      source: "iana"
    },
    "audio/dsr-es202211": {
      source: "iana"
    },
    "audio/dsr-es202212": {
      source: "iana"
    },
    "audio/dv": {
      source: "iana"
    },
    "audio/dvi4": {
      source: "iana"
    },
    "audio/eac3": {
      source: "iana"
    },
    "audio/encaprtp": {
      source: "iana"
    },
    "audio/evrc": {
      source: "iana"
    },
    "audio/evrc-qcp": {
      source: "iana"
    },
    "audio/evrc0": {
      source: "iana"
    },
    "audio/evrc1": {
      source: "iana"
    },
    "audio/evrcb": {
      source: "iana"
    },
    "audio/evrcb0": {
      source: "iana"
    },
    "audio/evrcb1": {
      source: "iana"
    },
    "audio/evrcnw": {
      source: "iana"
    },
    "audio/evrcnw0": {
      source: "iana"
    },
    "audio/evrcnw1": {
      source: "iana"
    },
    "audio/evrcwb": {
      source: "iana"
    },
    "audio/evrcwb0": {
      source: "iana"
    },
    "audio/evrcwb1": {
      source: "iana"
    },
    "audio/evs": {
      source: "iana"
    },
    "audio/flexfec": {
      source: "iana"
    },
    "audio/fwdred": {
      source: "iana"
    },
    "audio/g711-0": {
      source: "iana"
    },
    "audio/g719": {
      source: "iana"
    },
    "audio/g722": {
      source: "iana"
    },
    "audio/g7221": {
      source: "iana"
    },
    "audio/g723": {
      source: "iana"
    },
    "audio/g726-16": {
      source: "iana"
    },
    "audio/g726-24": {
      source: "iana"
    },
    "audio/g726-32": {
      source: "iana"
    },
    "audio/g726-40": {
      source: "iana"
    },
    "audio/g728": {
      source: "iana"
    },
    "audio/g729": {
      source: "iana"
    },
    "audio/g7291": {
      source: "iana"
    },
    "audio/g729d": {
      source: "iana"
    },
    "audio/g729e": {
      source: "iana"
    },
    "audio/gsm": {
      source: "iana"
    },
    "audio/gsm-efr": {
      source: "iana"
    },
    "audio/gsm-hr-08": {
      source: "iana"
    },
    "audio/ilbc": {
      source: "iana"
    },
    "audio/ip-mr_v2.5": {
      source: "iana"
    },
    "audio/isac": {
      source: "apache"
    },
    "audio/l16": {
      source: "iana"
    },
    "audio/l20": {
      source: "iana"
    },
    "audio/l24": {
      source: "iana",
      compressible: false
    },
    "audio/l8": {
      source: "iana"
    },
    "audio/lpc": {
      source: "iana"
    },
    "audio/melp": {
      source: "iana"
    },
    "audio/melp1200": {
      source: "iana"
    },
    "audio/melp2400": {
      source: "iana"
    },
    "audio/melp600": {
      source: "iana"
    },
    "audio/mhas": {
      source: "iana"
    },
    "audio/midi": {
      source: "apache",
      extensions: ["mid", "midi", "kar", "rmi"]
    },
    "audio/mobile-xmf": {
      source: "iana",
      extensions: ["mxmf"]
    },
    "audio/mp3": {
      compressible: false,
      extensions: ["mp3"]
    },
    "audio/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["m4a", "mp4a"]
    },
    "audio/mp4a-latm": {
      source: "iana"
    },
    "audio/mpa": {
      source: "iana"
    },
    "audio/mpa-robust": {
      source: "iana"
    },
    "audio/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
    },
    "audio/mpeg4-generic": {
      source: "iana"
    },
    "audio/musepack": {
      source: "apache"
    },
    "audio/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["oga", "ogg", "spx", "opus"]
    },
    "audio/opus": {
      source: "iana"
    },
    "audio/parityfec": {
      source: "iana"
    },
    "audio/pcma": {
      source: "iana"
    },
    "audio/pcma-wb": {
      source: "iana"
    },
    "audio/pcmu": {
      source: "iana"
    },
    "audio/pcmu-wb": {
      source: "iana"
    },
    "audio/prs.sid": {
      source: "iana"
    },
    "audio/qcelp": {
      source: "iana"
    },
    "audio/raptorfec": {
      source: "iana"
    },
    "audio/red": {
      source: "iana"
    },
    "audio/rtp-enc-aescm128": {
      source: "iana"
    },
    "audio/rtp-midi": {
      source: "iana"
    },
    "audio/rtploopback": {
      source: "iana"
    },
    "audio/rtx": {
      source: "iana"
    },
    "audio/s3m": {
      source: "apache",
      extensions: ["s3m"]
    },
    "audio/scip": {
      source: "iana"
    },
    "audio/silk": {
      source: "apache",
      extensions: ["sil"]
    },
    "audio/smv": {
      source: "iana"
    },
    "audio/smv-qcp": {
      source: "iana"
    },
    "audio/smv0": {
      source: "iana"
    },
    "audio/sofa": {
      source: "iana"
    },
    "audio/sp-midi": {
      source: "iana"
    },
    "audio/speex": {
      source: "iana"
    },
    "audio/t140c": {
      source: "iana"
    },
    "audio/t38": {
      source: "iana"
    },
    "audio/telephone-event": {
      source: "iana"
    },
    "audio/tetra_acelp": {
      source: "iana"
    },
    "audio/tetra_acelp_bb": {
      source: "iana"
    },
    "audio/tone": {
      source: "iana"
    },
    "audio/tsvcis": {
      source: "iana"
    },
    "audio/uemclip": {
      source: "iana"
    },
    "audio/ulpfec": {
      source: "iana"
    },
    "audio/usac": {
      source: "iana"
    },
    "audio/vdvi": {
      source: "iana"
    },
    "audio/vmr-wb": {
      source: "iana"
    },
    "audio/vnd.3gpp.iufp": {
      source: "iana"
    },
    "audio/vnd.4sb": {
      source: "iana"
    },
    "audio/vnd.audiokoz": {
      source: "iana"
    },
    "audio/vnd.celp": {
      source: "iana"
    },
    "audio/vnd.cisco.nse": {
      source: "iana"
    },
    "audio/vnd.cmles.radio-events": {
      source: "iana"
    },
    "audio/vnd.cns.anp1": {
      source: "iana"
    },
    "audio/vnd.cns.inf1": {
      source: "iana"
    },
    "audio/vnd.dece.audio": {
      source: "iana",
      extensions: ["uva", "uvva"]
    },
    "audio/vnd.digital-winds": {
      source: "iana",
      extensions: ["eol"]
    },
    "audio/vnd.dlna.adts": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.1": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.2": {
      source: "iana"
    },
    "audio/vnd.dolby.mlp": {
      source: "iana"
    },
    "audio/vnd.dolby.mps": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2x": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2z": {
      source: "iana"
    },
    "audio/vnd.dolby.pulse.1": {
      source: "iana"
    },
    "audio/vnd.dra": {
      source: "iana",
      extensions: ["dra"]
    },
    "audio/vnd.dts": {
      source: "iana",
      extensions: ["dts"]
    },
    "audio/vnd.dts.hd": {
      source: "iana",
      extensions: ["dtshd"]
    },
    "audio/vnd.dts.uhd": {
      source: "iana"
    },
    "audio/vnd.dvb.file": {
      source: "iana"
    },
    "audio/vnd.everad.plj": {
      source: "iana"
    },
    "audio/vnd.hns.audio": {
      source: "iana"
    },
    "audio/vnd.lucent.voice": {
      source: "iana",
      extensions: ["lvp"]
    },
    "audio/vnd.ms-playready.media.pya": {
      source: "iana",
      extensions: ["pya"]
    },
    "audio/vnd.nokia.mobile-xmf": {
      source: "iana"
    },
    "audio/vnd.nortel.vbk": {
      source: "iana"
    },
    "audio/vnd.nuera.ecelp4800": {
      source: "iana",
      extensions: ["ecelp4800"]
    },
    "audio/vnd.nuera.ecelp7470": {
      source: "iana",
      extensions: ["ecelp7470"]
    },
    "audio/vnd.nuera.ecelp9600": {
      source: "iana",
      extensions: ["ecelp9600"]
    },
    "audio/vnd.octel.sbc": {
      source: "iana"
    },
    "audio/vnd.presonus.multitrack": {
      source: "iana"
    },
    "audio/vnd.qcelp": {
      source: "iana"
    },
    "audio/vnd.rhetorex.32kadpcm": {
      source: "iana"
    },
    "audio/vnd.rip": {
      source: "iana",
      extensions: ["rip"]
    },
    "audio/vnd.rn-realaudio": {
      compressible: false
    },
    "audio/vnd.sealedmedia.softseal.mpeg": {
      source: "iana"
    },
    "audio/vnd.vmx.cvsd": {
      source: "iana"
    },
    "audio/vnd.wave": {
      compressible: false
    },
    "audio/vorbis": {
      source: "iana",
      compressible: false
    },
    "audio/vorbis-config": {
      source: "iana"
    },
    "audio/wav": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/wave": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/webm": {
      source: "apache",
      compressible: false,
      extensions: ["weba"]
    },
    "audio/x-aac": {
      source: "apache",
      compressible: false,
      extensions: ["aac"]
    },
    "audio/x-aiff": {
      source: "apache",
      extensions: ["aif", "aiff", "aifc"]
    },
    "audio/x-caf": {
      source: "apache",
      compressible: false,
      extensions: ["caf"]
    },
    "audio/x-flac": {
      source: "apache",
      extensions: ["flac"]
    },
    "audio/x-m4a": {
      source: "nginx",
      extensions: ["m4a"]
    },
    "audio/x-matroska": {
      source: "apache",
      extensions: ["mka"]
    },
    "audio/x-mpegurl": {
      source: "apache",
      extensions: ["m3u"]
    },
    "audio/x-ms-wax": {
      source: "apache",
      extensions: ["wax"]
    },
    "audio/x-ms-wma": {
      source: "apache",
      extensions: ["wma"]
    },
    "audio/x-pn-realaudio": {
      source: "apache",
      extensions: ["ram", "ra"]
    },
    "audio/x-pn-realaudio-plugin": {
      source: "apache",
      extensions: ["rmp"]
    },
    "audio/x-realaudio": {
      source: "nginx",
      extensions: ["ra"]
    },
    "audio/x-tta": {
      source: "apache"
    },
    "audio/x-wav": {
      source: "apache",
      extensions: ["wav"]
    },
    "audio/xm": {
      source: "apache",
      extensions: ["xm"]
    },
    "chemical/x-cdx": {
      source: "apache",
      extensions: ["cdx"]
    },
    "chemical/x-cif": {
      source: "apache",
      extensions: ["cif"]
    },
    "chemical/x-cmdf": {
      source: "apache",
      extensions: ["cmdf"]
    },
    "chemical/x-cml": {
      source: "apache",
      extensions: ["cml"]
    },
    "chemical/x-csml": {
      source: "apache",
      extensions: ["csml"]
    },
    "chemical/x-pdb": {
      source: "apache"
    },
    "chemical/x-xyz": {
      source: "apache",
      extensions: ["xyz"]
    },
    "font/collection": {
      source: "iana",
      extensions: ["ttc"]
    },
    "font/otf": {
      source: "iana",
      compressible: true,
      extensions: ["otf"]
    },
    "font/sfnt": {
      source: "iana"
    },
    "font/ttf": {
      source: "iana",
      compressible: true,
      extensions: ["ttf"]
    },
    "font/woff": {
      source: "iana",
      extensions: ["woff"]
    },
    "font/woff2": {
      source: "iana",
      extensions: ["woff2"]
    },
    "image/aces": {
      source: "iana",
      extensions: ["exr"]
    },
    "image/apng": {
      compressible: false,
      extensions: ["apng"]
    },
    "image/avci": {
      source: "iana",
      extensions: ["avci"]
    },
    "image/avcs": {
      source: "iana",
      extensions: ["avcs"]
    },
    "image/avif": {
      source: "iana",
      compressible: false,
      extensions: ["avif"]
    },
    "image/bmp": {
      source: "iana",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/cgm": {
      source: "iana",
      extensions: ["cgm"]
    },
    "image/dicom-rle": {
      source: "iana",
      extensions: ["drle"]
    },
    "image/emf": {
      source: "iana",
      extensions: ["emf"]
    },
    "image/fits": {
      source: "iana",
      extensions: ["fits"]
    },
    "image/g3fax": {
      source: "iana",
      extensions: ["g3"]
    },
    "image/gif": {
      source: "iana",
      compressible: false,
      extensions: ["gif"]
    },
    "image/heic": {
      source: "iana",
      extensions: ["heic"]
    },
    "image/heic-sequence": {
      source: "iana",
      extensions: ["heics"]
    },
    "image/heif": {
      source: "iana",
      extensions: ["heif"]
    },
    "image/heif-sequence": {
      source: "iana",
      extensions: ["heifs"]
    },
    "image/hej2k": {
      source: "iana",
      extensions: ["hej2"]
    },
    "image/hsj2": {
      source: "iana",
      extensions: ["hsj2"]
    },
    "image/ief": {
      source: "iana",
      extensions: ["ief"]
    },
    "image/jls": {
      source: "iana",
      extensions: ["jls"]
    },
    "image/jp2": {
      source: "iana",
      compressible: false,
      extensions: ["jp2", "jpg2"]
    },
    "image/jpeg": {
      source: "iana",
      compressible: false,
      extensions: ["jpeg", "jpg", "jpe"]
    },
    "image/jph": {
      source: "iana",
      extensions: ["jph"]
    },
    "image/jphc": {
      source: "iana",
      extensions: ["jhc"]
    },
    "image/jpm": {
      source: "iana",
      compressible: false,
      extensions: ["jpm"]
    },
    "image/jpx": {
      source: "iana",
      compressible: false,
      extensions: ["jpx", "jpf"]
    },
    "image/jxr": {
      source: "iana",
      extensions: ["jxr"]
    },
    "image/jxra": {
      source: "iana",
      extensions: ["jxra"]
    },
    "image/jxrs": {
      source: "iana",
      extensions: ["jxrs"]
    },
    "image/jxs": {
      source: "iana",
      extensions: ["jxs"]
    },
    "image/jxsc": {
      source: "iana",
      extensions: ["jxsc"]
    },
    "image/jxsi": {
      source: "iana",
      extensions: ["jxsi"]
    },
    "image/jxss": {
      source: "iana",
      extensions: ["jxss"]
    },
    "image/ktx": {
      source: "iana",
      extensions: ["ktx"]
    },
    "image/ktx2": {
      source: "iana",
      extensions: ["ktx2"]
    },
    "image/naplps": {
      source: "iana"
    },
    "image/pjpeg": {
      compressible: false
    },
    "image/png": {
      source: "iana",
      compressible: false,
      extensions: ["png"]
    },
    "image/prs.btif": {
      source: "iana",
      extensions: ["btif"]
    },
    "image/prs.pti": {
      source: "iana",
      extensions: ["pti"]
    },
    "image/pwg-raster": {
      source: "iana"
    },
    "image/sgi": {
      source: "apache",
      extensions: ["sgi"]
    },
    "image/svg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["svg", "svgz"]
    },
    "image/t38": {
      source: "iana",
      extensions: ["t38"]
    },
    "image/tiff": {
      source: "iana",
      compressible: false,
      extensions: ["tif", "tiff"]
    },
    "image/tiff-fx": {
      source: "iana",
      extensions: ["tfx"]
    },
    "image/vnd.adobe.photoshop": {
      source: "iana",
      compressible: true,
      extensions: ["psd"]
    },
    "image/vnd.airzip.accelerator.azv": {
      source: "iana",
      extensions: ["azv"]
    },
    "image/vnd.cns.inf2": {
      source: "iana"
    },
    "image/vnd.dece.graphic": {
      source: "iana",
      extensions: ["uvi", "uvvi", "uvg", "uvvg"]
    },
    "image/vnd.djvu": {
      source: "iana",
      extensions: ["djvu", "djv"]
    },
    "image/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "image/vnd.dwg": {
      source: "iana",
      extensions: ["dwg"]
    },
    "image/vnd.dxf": {
      source: "iana",
      extensions: ["dxf"]
    },
    "image/vnd.fastbidsheet": {
      source: "iana",
      extensions: ["fbs"]
    },
    "image/vnd.fpx": {
      source: "iana",
      extensions: ["fpx"]
    },
    "image/vnd.fst": {
      source: "iana",
      extensions: ["fst"]
    },
    "image/vnd.fujixerox.edmics-mmr": {
      source: "iana",
      extensions: ["mmr"]
    },
    "image/vnd.fujixerox.edmics-rlc": {
      source: "iana",
      extensions: ["rlc"]
    },
    "image/vnd.globalgraphics.pgb": {
      source: "iana"
    },
    "image/vnd.microsoft.icon": {
      source: "iana",
      compressible: true,
      extensions: ["ico"]
    },
    "image/vnd.mix": {
      source: "iana"
    },
    "image/vnd.mozilla.apng": {
      source: "iana"
    },
    "image/vnd.ms-dds": {
      compressible: true,
      extensions: ["dds"]
    },
    "image/vnd.ms-modi": {
      source: "iana",
      extensions: ["mdi"]
    },
    "image/vnd.ms-photo": {
      source: "apache",
      extensions: ["wdp"]
    },
    "image/vnd.net-fpx": {
      source: "iana",
      extensions: ["npx"]
    },
    "image/vnd.pco.b16": {
      source: "iana",
      extensions: ["b16"]
    },
    "image/vnd.radiance": {
      source: "iana"
    },
    "image/vnd.sealed.png": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.gif": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.jpg": {
      source: "iana"
    },
    "image/vnd.svf": {
      source: "iana"
    },
    "image/vnd.tencent.tap": {
      source: "iana",
      extensions: ["tap"]
    },
    "image/vnd.valve.source.texture": {
      source: "iana",
      extensions: ["vtf"]
    },
    "image/vnd.wap.wbmp": {
      source: "iana",
      extensions: ["wbmp"]
    },
    "image/vnd.xiff": {
      source: "iana",
      extensions: ["xif"]
    },
    "image/vnd.zbrush.pcx": {
      source: "iana",
      extensions: ["pcx"]
    },
    "image/webp": {
      source: "apache",
      extensions: ["webp"]
    },
    "image/wmf": {
      source: "iana",
      extensions: ["wmf"]
    },
    "image/x-3ds": {
      source: "apache",
      extensions: ["3ds"]
    },
    "image/x-cmu-raster": {
      source: "apache",
      extensions: ["ras"]
    },
    "image/x-cmx": {
      source: "apache",
      extensions: ["cmx"]
    },
    "image/x-freehand": {
      source: "apache",
      extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
    },
    "image/x-icon": {
      source: "apache",
      compressible: true,
      extensions: ["ico"]
    },
    "image/x-jng": {
      source: "nginx",
      extensions: ["jng"]
    },
    "image/x-mrsid-image": {
      source: "apache",
      extensions: ["sid"]
    },
    "image/x-ms-bmp": {
      source: "nginx",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/x-pcx": {
      source: "apache",
      extensions: ["pcx"]
    },
    "image/x-pict": {
      source: "apache",
      extensions: ["pic", "pct"]
    },
    "image/x-portable-anymap": {
      source: "apache",
      extensions: ["pnm"]
    },
    "image/x-portable-bitmap": {
      source: "apache",
      extensions: ["pbm"]
    },
    "image/x-portable-graymap": {
      source: "apache",
      extensions: ["pgm"]
    },
    "image/x-portable-pixmap": {
      source: "apache",
      extensions: ["ppm"]
    },
    "image/x-rgb": {
      source: "apache",
      extensions: ["rgb"]
    },
    "image/x-tga": {
      source: "apache",
      extensions: ["tga"]
    },
    "image/x-xbitmap": {
      source: "apache",
      extensions: ["xbm"]
    },
    "image/x-xcf": {
      compressible: false
    },
    "image/x-xpixmap": {
      source: "apache",
      extensions: ["xpm"]
    },
    "image/x-xwindowdump": {
      source: "apache",
      extensions: ["xwd"]
    },
    "message/cpim": {
      source: "iana"
    },
    "message/delivery-status": {
      source: "iana"
    },
    "message/disposition-notification": {
      source: "iana",
      extensions: [
        "disposition-notification"
      ]
    },
    "message/external-body": {
      source: "iana"
    },
    "message/feedback-report": {
      source: "iana"
    },
    "message/global": {
      source: "iana",
      extensions: ["u8msg"]
    },
    "message/global-delivery-status": {
      source: "iana",
      extensions: ["u8dsn"]
    },
    "message/global-disposition-notification": {
      source: "iana",
      extensions: ["u8mdn"]
    },
    "message/global-headers": {
      source: "iana",
      extensions: ["u8hdr"]
    },
    "message/http": {
      source: "iana",
      compressible: false
    },
    "message/imdn+xml": {
      source: "iana",
      compressible: true
    },
    "message/news": {
      source: "iana"
    },
    "message/partial": {
      source: "iana",
      compressible: false
    },
    "message/rfc822": {
      source: "iana",
      compressible: true,
      extensions: ["eml", "mime"]
    },
    "message/s-http": {
      source: "iana"
    },
    "message/sip": {
      source: "iana"
    },
    "message/sipfrag": {
      source: "iana"
    },
    "message/tracking-status": {
      source: "iana"
    },
    "message/vnd.si.simp": {
      source: "iana"
    },
    "message/vnd.wfa.wsc": {
      source: "iana",
      extensions: ["wsc"]
    },
    "model/3mf": {
      source: "iana",
      extensions: ["3mf"]
    },
    "model/e57": {
      source: "iana"
    },
    "model/gltf+json": {
      source: "iana",
      compressible: true,
      extensions: ["gltf"]
    },
    "model/gltf-binary": {
      source: "iana",
      compressible: true,
      extensions: ["glb"]
    },
    "model/iges": {
      source: "iana",
      compressible: false,
      extensions: ["igs", "iges"]
    },
    "model/mesh": {
      source: "iana",
      compressible: false,
      extensions: ["msh", "mesh", "silo"]
    },
    "model/mtl": {
      source: "iana",
      extensions: ["mtl"]
    },
    "model/obj": {
      source: "iana",
      extensions: ["obj"]
    },
    "model/step": {
      source: "iana"
    },
    "model/step+xml": {
      source: "iana",
      compressible: true,
      extensions: ["stpx"]
    },
    "model/step+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpz"]
    },
    "model/step-xml+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpxz"]
    },
    "model/stl": {
      source: "iana",
      extensions: ["stl"]
    },
    "model/vnd.collada+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dae"]
    },
    "model/vnd.dwf": {
      source: "iana",
      extensions: ["dwf"]
    },
    "model/vnd.flatland.3dml": {
      source: "iana"
    },
    "model/vnd.gdl": {
      source: "iana",
      extensions: ["gdl"]
    },
    "model/vnd.gs-gdl": {
      source: "apache"
    },
    "model/vnd.gs.gdl": {
      source: "iana"
    },
    "model/vnd.gtw": {
      source: "iana",
      extensions: ["gtw"]
    },
    "model/vnd.moml+xml": {
      source: "iana",
      compressible: true
    },
    "model/vnd.mts": {
      source: "iana",
      extensions: ["mts"]
    },
    "model/vnd.opengex": {
      source: "iana",
      extensions: ["ogex"]
    },
    "model/vnd.parasolid.transmit.binary": {
      source: "iana",
      extensions: ["x_b"]
    },
    "model/vnd.parasolid.transmit.text": {
      source: "iana",
      extensions: ["x_t"]
    },
    "model/vnd.pytha.pyox": {
      source: "iana"
    },
    "model/vnd.rosette.annotated-data-model": {
      source: "iana"
    },
    "model/vnd.sap.vds": {
      source: "iana",
      extensions: ["vds"]
    },
    "model/vnd.usdz+zip": {
      source: "iana",
      compressible: false,
      extensions: ["usdz"]
    },
    "model/vnd.valve.source.compiled-map": {
      source: "iana",
      extensions: ["bsp"]
    },
    "model/vnd.vtu": {
      source: "iana",
      extensions: ["vtu"]
    },
    "model/vrml": {
      source: "iana",
      compressible: false,
      extensions: ["wrl", "vrml"]
    },
    "model/x3d+binary": {
      source: "apache",
      compressible: false,
      extensions: ["x3db", "x3dbz"]
    },
    "model/x3d+fastinfoset": {
      source: "iana",
      extensions: ["x3db"]
    },
    "model/x3d+vrml": {
      source: "apache",
      compressible: false,
      extensions: ["x3dv", "x3dvz"]
    },
    "model/x3d+xml": {
      source: "iana",
      compressible: true,
      extensions: ["x3d", "x3dz"]
    },
    "model/x3d-vrml": {
      source: "iana",
      extensions: ["x3dv"]
    },
    "multipart/alternative": {
      source: "iana",
      compressible: false
    },
    "multipart/appledouble": {
      source: "iana"
    },
    "multipart/byteranges": {
      source: "iana"
    },
    "multipart/digest": {
      source: "iana"
    },
    "multipart/encrypted": {
      source: "iana",
      compressible: false
    },
    "multipart/form-data": {
      source: "iana",
      compressible: false
    },
    "multipart/header-set": {
      source: "iana"
    },
    "multipart/mixed": {
      source: "iana"
    },
    "multipart/multilingual": {
      source: "iana"
    },
    "multipart/parallel": {
      source: "iana"
    },
    "multipart/related": {
      source: "iana",
      compressible: false
    },
    "multipart/report": {
      source: "iana"
    },
    "multipart/signed": {
      source: "iana",
      compressible: false
    },
    "multipart/vnd.bint.med-plus": {
      source: "iana"
    },
    "multipart/voice-message": {
      source: "iana"
    },
    "multipart/x-mixed-replace": {
      source: "iana"
    },
    "text/1d-interleaved-parityfec": {
      source: "iana"
    },
    "text/cache-manifest": {
      source: "iana",
      compressible: true,
      extensions: ["appcache", "manifest"]
    },
    "text/calendar": {
      source: "iana",
      extensions: ["ics", "ifb"]
    },
    "text/calender": {
      compressible: true
    },
    "text/cmd": {
      compressible: true
    },
    "text/coffeescript": {
      extensions: ["coffee", "litcoffee"]
    },
    "text/cql": {
      source: "iana"
    },
    "text/cql-expression": {
      source: "iana"
    },
    "text/cql-identifier": {
      source: "iana"
    },
    "text/css": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["css"]
    },
    "text/csv": {
      source: "iana",
      compressible: true,
      extensions: ["csv"]
    },
    "text/csv-schema": {
      source: "iana"
    },
    "text/directory": {
      source: "iana"
    },
    "text/dns": {
      source: "iana"
    },
    "text/ecmascript": {
      source: "iana"
    },
    "text/encaprtp": {
      source: "iana"
    },
    "text/enriched": {
      source: "iana"
    },
    "text/fhirpath": {
      source: "iana"
    },
    "text/flexfec": {
      source: "iana"
    },
    "text/fwdred": {
      source: "iana"
    },
    "text/gff3": {
      source: "iana"
    },
    "text/grammar-ref-list": {
      source: "iana"
    },
    "text/html": {
      source: "iana",
      compressible: true,
      extensions: ["html", "htm", "shtml"]
    },
    "text/jade": {
      extensions: ["jade"]
    },
    "text/javascript": {
      source: "iana",
      compressible: true
    },
    "text/jcr-cnd": {
      source: "iana"
    },
    "text/jsx": {
      compressible: true,
      extensions: ["jsx"]
    },
    "text/less": {
      compressible: true,
      extensions: ["less"]
    },
    "text/markdown": {
      source: "iana",
      compressible: true,
      extensions: ["markdown", "md"]
    },
    "text/mathml": {
      source: "nginx",
      extensions: ["mml"]
    },
    "text/mdx": {
      compressible: true,
      extensions: ["mdx"]
    },
    "text/mizar": {
      source: "iana"
    },
    "text/n3": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["n3"]
    },
    "text/parameters": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/parityfec": {
      source: "iana"
    },
    "text/plain": {
      source: "iana",
      compressible: true,
      extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
    },
    "text/provenance-notation": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/prs.fallenstein.rst": {
      source: "iana"
    },
    "text/prs.lines.tag": {
      source: "iana",
      extensions: ["dsc"]
    },
    "text/prs.prop.logic": {
      source: "iana"
    },
    "text/raptorfec": {
      source: "iana"
    },
    "text/red": {
      source: "iana"
    },
    "text/rfc822-headers": {
      source: "iana"
    },
    "text/richtext": {
      source: "iana",
      compressible: true,
      extensions: ["rtx"]
    },
    "text/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "text/rtp-enc-aescm128": {
      source: "iana"
    },
    "text/rtploopback": {
      source: "iana"
    },
    "text/rtx": {
      source: "iana"
    },
    "text/sgml": {
      source: "iana",
      extensions: ["sgml", "sgm"]
    },
    "text/shaclc": {
      source: "iana"
    },
    "text/shex": {
      source: "iana",
      extensions: ["shex"]
    },
    "text/slim": {
      extensions: ["slim", "slm"]
    },
    "text/spdx": {
      source: "iana",
      extensions: ["spdx"]
    },
    "text/strings": {
      source: "iana"
    },
    "text/stylus": {
      extensions: ["stylus", "styl"]
    },
    "text/t140": {
      source: "iana"
    },
    "text/tab-separated-values": {
      source: "iana",
      compressible: true,
      extensions: ["tsv"]
    },
    "text/troff": {
      source: "iana",
      extensions: ["t", "tr", "roff", "man", "me", "ms"]
    },
    "text/turtle": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["ttl"]
    },
    "text/ulpfec": {
      source: "iana"
    },
    "text/uri-list": {
      source: "iana",
      compressible: true,
      extensions: ["uri", "uris", "urls"]
    },
    "text/vcard": {
      source: "iana",
      compressible: true,
      extensions: ["vcard"]
    },
    "text/vnd.a": {
      source: "iana"
    },
    "text/vnd.abc": {
      source: "iana"
    },
    "text/vnd.ascii-art": {
      source: "iana"
    },
    "text/vnd.curl": {
      source: "iana",
      extensions: ["curl"]
    },
    "text/vnd.curl.dcurl": {
      source: "apache",
      extensions: ["dcurl"]
    },
    "text/vnd.curl.mcurl": {
      source: "apache",
      extensions: ["mcurl"]
    },
    "text/vnd.curl.scurl": {
      source: "apache",
      extensions: ["scurl"]
    },
    "text/vnd.debian.copyright": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.dmclientscript": {
      source: "iana"
    },
    "text/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "text/vnd.esmertec.theme-descriptor": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.familysearch.gedcom": {
      source: "iana",
      extensions: ["ged"]
    },
    "text/vnd.ficlab.flt": {
      source: "iana"
    },
    "text/vnd.fly": {
      source: "iana",
      extensions: ["fly"]
    },
    "text/vnd.fmi.flexstor": {
      source: "iana",
      extensions: ["flx"]
    },
    "text/vnd.gml": {
      source: "iana"
    },
    "text/vnd.graphviz": {
      source: "iana",
      extensions: ["gv"]
    },
    "text/vnd.hans": {
      source: "iana"
    },
    "text/vnd.hgl": {
      source: "iana"
    },
    "text/vnd.in3d.3dml": {
      source: "iana",
      extensions: ["3dml"]
    },
    "text/vnd.in3d.spot": {
      source: "iana",
      extensions: ["spot"]
    },
    "text/vnd.iptc.newsml": {
      source: "iana"
    },
    "text/vnd.iptc.nitf": {
      source: "iana"
    },
    "text/vnd.latex-z": {
      source: "iana"
    },
    "text/vnd.motorola.reflex": {
      source: "iana"
    },
    "text/vnd.ms-mediapackage": {
      source: "iana"
    },
    "text/vnd.net2phone.commcenter.command": {
      source: "iana"
    },
    "text/vnd.radisys.msml-basic-layout": {
      source: "iana"
    },
    "text/vnd.senx.warpscript": {
      source: "iana"
    },
    "text/vnd.si.uricatalogue": {
      source: "iana"
    },
    "text/vnd.sosi": {
      source: "iana"
    },
    "text/vnd.sun.j2me.app-descriptor": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["jad"]
    },
    "text/vnd.trolltech.linguist": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.wap.si": {
      source: "iana"
    },
    "text/vnd.wap.sl": {
      source: "iana"
    },
    "text/vnd.wap.wml": {
      source: "iana",
      extensions: ["wml"]
    },
    "text/vnd.wap.wmlscript": {
      source: "iana",
      extensions: ["wmls"]
    },
    "text/vtt": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["vtt"]
    },
    "text/x-asm": {
      source: "apache",
      extensions: ["s", "asm"]
    },
    "text/x-c": {
      source: "apache",
      extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
    },
    "text/x-component": {
      source: "nginx",
      extensions: ["htc"]
    },
    "text/x-fortran": {
      source: "apache",
      extensions: ["f", "for", "f77", "f90"]
    },
    "text/x-gwt-rpc": {
      compressible: true
    },
    "text/x-handlebars-template": {
      extensions: ["hbs"]
    },
    "text/x-java-source": {
      source: "apache",
      extensions: ["java"]
    },
    "text/x-jquery-tmpl": {
      compressible: true
    },
    "text/x-lua": {
      extensions: ["lua"]
    },
    "text/x-markdown": {
      compressible: true,
      extensions: ["mkd"]
    },
    "text/x-nfo": {
      source: "apache",
      extensions: ["nfo"]
    },
    "text/x-opml": {
      source: "apache",
      extensions: ["opml"]
    },
    "text/x-org": {
      compressible: true,
      extensions: ["org"]
    },
    "text/x-pascal": {
      source: "apache",
      extensions: ["p", "pas"]
    },
    "text/x-processing": {
      compressible: true,
      extensions: ["pde"]
    },
    "text/x-sass": {
      extensions: ["sass"]
    },
    "text/x-scss": {
      extensions: ["scss"]
    },
    "text/x-setext": {
      source: "apache",
      extensions: ["etx"]
    },
    "text/x-sfv": {
      source: "apache",
      extensions: ["sfv"]
    },
    "text/x-suse-ymp": {
      compressible: true,
      extensions: ["ymp"]
    },
    "text/x-uuencode": {
      source: "apache",
      extensions: ["uu"]
    },
    "text/x-vcalendar": {
      source: "apache",
      extensions: ["vcs"]
    },
    "text/x-vcard": {
      source: "apache",
      extensions: ["vcf"]
    },
    "text/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml"]
    },
    "text/xml-external-parsed-entity": {
      source: "iana"
    },
    "text/yaml": {
      compressible: true,
      extensions: ["yaml", "yml"]
    },
    "video/1d-interleaved-parityfec": {
      source: "iana"
    },
    "video/3gpp": {
      source: "iana",
      extensions: ["3gp", "3gpp"]
    },
    "video/3gpp-tt": {
      source: "iana"
    },
    "video/3gpp2": {
      source: "iana",
      extensions: ["3g2"]
    },
    "video/av1": {
      source: "iana"
    },
    "video/bmpeg": {
      source: "iana"
    },
    "video/bt656": {
      source: "iana"
    },
    "video/celb": {
      source: "iana"
    },
    "video/dv": {
      source: "iana"
    },
    "video/encaprtp": {
      source: "iana"
    },
    "video/ffv1": {
      source: "iana"
    },
    "video/flexfec": {
      source: "iana"
    },
    "video/h261": {
      source: "iana",
      extensions: ["h261"]
    },
    "video/h263": {
      source: "iana",
      extensions: ["h263"]
    },
    "video/h263-1998": {
      source: "iana"
    },
    "video/h263-2000": {
      source: "iana"
    },
    "video/h264": {
      source: "iana",
      extensions: ["h264"]
    },
    "video/h264-rcdo": {
      source: "iana"
    },
    "video/h264-svc": {
      source: "iana"
    },
    "video/h265": {
      source: "iana"
    },
    "video/iso.segment": {
      source: "iana",
      extensions: ["m4s"]
    },
    "video/jpeg": {
      source: "iana",
      extensions: ["jpgv"]
    },
    "video/jpeg2000": {
      source: "iana"
    },
    "video/jpm": {
      source: "apache",
      extensions: ["jpm", "jpgm"]
    },
    "video/jxsv": {
      source: "iana"
    },
    "video/mj2": {
      source: "iana",
      extensions: ["mj2", "mjp2"]
    },
    "video/mp1s": {
      source: "iana"
    },
    "video/mp2p": {
      source: "iana"
    },
    "video/mp2t": {
      source: "iana",
      extensions: ["ts"]
    },
    "video/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["mp4", "mp4v", "mpg4"]
    },
    "video/mp4v-es": {
      source: "iana"
    },
    "video/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
    },
    "video/mpeg4-generic": {
      source: "iana"
    },
    "video/mpv": {
      source: "iana"
    },
    "video/nv": {
      source: "iana"
    },
    "video/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogv"]
    },
    "video/parityfec": {
      source: "iana"
    },
    "video/pointer": {
      source: "iana"
    },
    "video/quicktime": {
      source: "iana",
      compressible: false,
      extensions: ["qt", "mov"]
    },
    "video/raptorfec": {
      source: "iana"
    },
    "video/raw": {
      source: "iana"
    },
    "video/rtp-enc-aescm128": {
      source: "iana"
    },
    "video/rtploopback": {
      source: "iana"
    },
    "video/rtx": {
      source: "iana"
    },
    "video/scip": {
      source: "iana"
    },
    "video/smpte291": {
      source: "iana"
    },
    "video/smpte292m": {
      source: "iana"
    },
    "video/ulpfec": {
      source: "iana"
    },
    "video/vc1": {
      source: "iana"
    },
    "video/vc2": {
      source: "iana"
    },
    "video/vnd.cctv": {
      source: "iana"
    },
    "video/vnd.dece.hd": {
      source: "iana",
      extensions: ["uvh", "uvvh"]
    },
    "video/vnd.dece.mobile": {
      source: "iana",
      extensions: ["uvm", "uvvm"]
    },
    "video/vnd.dece.mp4": {
      source: "iana"
    },
    "video/vnd.dece.pd": {
      source: "iana",
      extensions: ["uvp", "uvvp"]
    },
    "video/vnd.dece.sd": {
      source: "iana",
      extensions: ["uvs", "uvvs"]
    },
    "video/vnd.dece.video": {
      source: "iana",
      extensions: ["uvv", "uvvv"]
    },
    "video/vnd.directv.mpeg": {
      source: "iana"
    },
    "video/vnd.directv.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dlna.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dvb.file": {
      source: "iana",
      extensions: ["dvb"]
    },
    "video/vnd.fvt": {
      source: "iana",
      extensions: ["fvt"]
    },
    "video/vnd.hns.video": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsavc": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsmpeg2": {
      source: "iana"
    },
    "video/vnd.motorola.video": {
      source: "iana"
    },
    "video/vnd.motorola.videop": {
      source: "iana"
    },
    "video/vnd.mpegurl": {
      source: "iana",
      extensions: ["mxu", "m4u"]
    },
    "video/vnd.ms-playready.media.pyv": {
      source: "iana",
      extensions: ["pyv"]
    },
    "video/vnd.nokia.interleaved-multimedia": {
      source: "iana"
    },
    "video/vnd.nokia.mp4vr": {
      source: "iana"
    },
    "video/vnd.nokia.videovoip": {
      source: "iana"
    },
    "video/vnd.objectvideo": {
      source: "iana"
    },
    "video/vnd.radgamettools.bink": {
      source: "iana"
    },
    "video/vnd.radgamettools.smacker": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg1": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg4": {
      source: "iana"
    },
    "video/vnd.sealed.swf": {
      source: "iana"
    },
    "video/vnd.sealedmedia.softseal.mov": {
      source: "iana"
    },
    "video/vnd.uvvu.mp4": {
      source: "iana",
      extensions: ["uvu", "uvvu"]
    },
    "video/vnd.vivo": {
      source: "iana",
      extensions: ["viv"]
    },
    "video/vnd.youtube.yt": {
      source: "iana"
    },
    "video/vp8": {
      source: "iana"
    },
    "video/vp9": {
      source: "iana"
    },
    "video/webm": {
      source: "apache",
      compressible: false,
      extensions: ["webm"]
    },
    "video/x-f4v": {
      source: "apache",
      extensions: ["f4v"]
    },
    "video/x-fli": {
      source: "apache",
      extensions: ["fli"]
    },
    "video/x-flv": {
      source: "apache",
      compressible: false,
      extensions: ["flv"]
    },
    "video/x-m4v": {
      source: "apache",
      extensions: ["m4v"]
    },
    "video/x-matroska": {
      source: "apache",
      compressible: false,
      extensions: ["mkv", "mk3d", "mks"]
    },
    "video/x-mng": {
      source: "apache",
      extensions: ["mng"]
    },
    "video/x-ms-asf": {
      source: "apache",
      extensions: ["asf", "asx"]
    },
    "video/x-ms-vob": {
      source: "apache",
      extensions: ["vob"]
    },
    "video/x-ms-wm": {
      source: "apache",
      extensions: ["wm"]
    },
    "video/x-ms-wmv": {
      source: "apache",
      compressible: false,
      extensions: ["wmv"]
    },
    "video/x-ms-wmx": {
      source: "apache",
      extensions: ["wmx"]
    },
    "video/x-ms-wvx": {
      source: "apache",
      extensions: ["wvx"]
    },
    "video/x-msvideo": {
      source: "apache",
      extensions: ["avi"]
    },
    "video/x-sgi-movie": {
      source: "apache",
      extensions: ["movie"]
    },
    "video/x-smv": {
      source: "apache",
      extensions: ["smv"]
    },
    "x-conference/x-cooltalk": {
      source: "apache",
      extensions: ["ice"]
    },
    "x-shader/x-fragment": {
      compressible: true
    },
    "x-shader/x-vertex": {
      compressible: true
    }
  };
});

// node_modules/mime-db/index.js
var require_mime_db = __commonJS((exports, module) => {
  /*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   */
  module.exports = require_db();
});

// node_modules/mime-types/index.js
var require_mime_types = __commonJS((exports) => {
  var charset = function(type) {
    if (!type || typeof type !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var mime = match && db[match[1].toLowerCase()];
    if (mime && mime.charset) {
      return mime.charset;
    }
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
      return "UTF-8";
    }
    return false;
  };
  var contentType = function(str) {
    if (!str || typeof str !== "string") {
      return false;
    }
    var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
    if (!mime) {
      return false;
    }
    if (mime.indexOf("charset") === -1) {
      var charset2 = exports.charset(mime);
      if (charset2)
        mime += "; charset=" + charset2.toLowerCase();
    }
    return mime;
  };
  var extension = function(type) {
    if (!type || typeof type !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var exts = match && exports.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
      return false;
    }
    return exts[0];
  };
  var lookup = function(path) {
    if (!path || typeof path !== "string") {
      return false;
    }
    var extension2 = extname("x." + path).toLowerCase().substr(1);
    if (!extension2) {
      return false;
    }
    return exports.types[extension2] || false;
  };
  var populateMaps = function(extensions, types) {
    var preference = ["nginx", "apache", undefined, "iana"];
    Object.keys(db).forEach(function forEachMimeType(type) {
      var mime = db[type];
      var exts = mime.extensions;
      if (!exts || !exts.length) {
        return;
      }
      extensions[type] = exts;
      for (var i = 0;i < exts.length; i++) {
        var extension2 = exts[i];
        if (types[extension2]) {
          var from = preference.indexOf(db[types[extension2]].source);
          var to = preference.indexOf(mime.source);
          if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
            continue;
          }
        }
        types[extension2] = type;
      }
    });
  };
  /*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   */
  var db = require_mime_db();
  var extname = import.meta.require("path").extname;
  var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
  var TEXT_TYPE_REGEXP = /^text\//i;
  exports.charset = charset;
  exports.charsets = { lookup: charset };
  exports.contentType = contentType;
  exports.extension = extension;
  exports.extensions = Object.create(null);
  exports.lookup = lookup;
  exports.types = Object.create(null);
  populateMaps(exports.extensions, exports.types);
});

// node_modules/asynckit/lib/defer.js
var require_defer = __commonJS((exports, module) => {
  var defer = function(fn) {
    var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
    if (nextTick) {
      nextTick(fn);
    } else {
      setTimeout(fn, 0);
    }
  };
  module.exports = defer;
});

// node_modules/asynckit/lib/async.js
var require_async = __commonJS((exports, module) => {
  var async = function(callback) {
    var isAsync = false;
    defer(function() {
      isAsync = true;
    });
    return function async_callback(err, result) {
      if (isAsync) {
        callback(err, result);
      } else {
        defer(function nextTick_callback() {
          callback(err, result);
        });
      }
    };
  };
  var defer = require_defer();
  module.exports = async;
});

// node_modules/asynckit/lib/abort.js
var require_abort = __commonJS((exports, module) => {
  var abort = function(state) {
    Object.keys(state.jobs).forEach(clean.bind(state));
    state.jobs = {};
  };
  var clean = function(key) {
    if (typeof this.jobs[key] == "function") {
      this.jobs[key]();
    }
  };
  module.exports = abort;
});

// node_modules/asynckit/lib/iterate.js
var require_iterate = __commonJS((exports, module) => {
  var iterate = function(list, iterator, state, callback) {
    var key = state["keyedList"] ? state["keyedList"][state.index] : state.index;
    state.jobs[key] = runJob(iterator, key, list[key], function(error, output) {
      if (!(key in state.jobs)) {
        return;
      }
      delete state.jobs[key];
      if (error) {
        abort(state);
      } else {
        state.results[key] = output;
      }
      callback(error, state.results);
    });
  };
  var runJob = function(iterator, key, item, callback) {
    var aborter;
    if (iterator.length == 2) {
      aborter = iterator(item, async(callback));
    } else {
      aborter = iterator(item, key, async(callback));
    }
    return aborter;
  };
  var async = require_async();
  var abort = require_abort();
  module.exports = iterate;
});

// node_modules/asynckit/lib/state.js
var require_state = __commonJS((exports, module) => {
  var state = function(list, sortMethod) {
    var isNamedList = !Array.isArray(list), initState = {
      index: 0,
      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
      jobs: {},
      results: isNamedList ? {} : [],
      size: isNamedList ? Object.keys(list).length : list.length
    };
    if (sortMethod) {
      initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
        return sortMethod(list[a], list[b]);
      });
    }
    return initState;
  };
  module.exports = state;
});

// node_modules/asynckit/lib/terminator.js
var require_terminator = __commonJS((exports, module) => {
  var terminator = function(callback) {
    if (!Object.keys(this.jobs).length) {
      return;
    }
    this.index = this.size;
    abort(this);
    async(callback)(null, this.results);
  };
  var abort = require_abort();
  var async = require_async();
  module.exports = terminator;
});

// node_modules/asynckit/parallel.js
var require_parallel = __commonJS((exports, module) => {
  var parallel = function(list, iterator, callback) {
    var state = initState(list);
    while (state.index < (state["keyedList"] || list).length) {
      iterate(list, iterator, state, function(error, result) {
        if (error) {
          callback(error, result);
          return;
        }
        if (Object.keys(state.jobs).length === 0) {
          callback(null, state.results);
          return;
        }
      });
      state.index++;
    }
    return terminator.bind(state, callback);
  };
  var iterate = require_iterate();
  var initState = require_state();
  var terminator = require_terminator();
  module.exports = parallel;
});

// node_modules/asynckit/serialOrdered.js
var require_serialOrdered = __commonJS((exports, module) => {
  var serialOrdered = function(list, iterator, sortMethod, callback) {
    var state = initState(list, sortMethod);
    iterate(list, iterator, state, function iteratorHandler(error, result) {
      if (error) {
        callback(error, result);
        return;
      }
      state.index++;
      if (state.index < (state["keyedList"] || list).length) {
        iterate(list, iterator, state, iteratorHandler);
        return;
      }
      callback(null, state.results);
    });
    return terminator.bind(state, callback);
  };
  var ascending = function(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  };
  var descending = function(a, b) {
    return -1 * ascending(a, b);
  };
  var iterate = require_iterate();
  var initState = require_state();
  var terminator = require_terminator();
  module.exports = serialOrdered;
  module.exports.ascending = ascending;
  module.exports.descending = descending;
});

// node_modules/asynckit/serial.js
var require_serial = __commonJS((exports, module) => {
  var serial = function(list, iterator, callback) {
    return serialOrdered(list, iterator, null, callback);
  };
  var serialOrdered = require_serialOrdered();
  module.exports = serial;
});

// node_modules/asynckit/index.js
var require_asynckit = __commonJS((exports, module) => {
  module.exports = {
    parallel: require_parallel(),
    serial: require_serial(),
    serialOrdered: require_serialOrdered()
  };
});

// node_modules/form-data/lib/populate.js
var require_populate = __commonJS((exports, module) => {
  module.exports = function(dst, src) {
    Object.keys(src).forEach(function(prop) {
      dst[prop] = dst[prop] || src[prop];
    });
    return dst;
  };
});

// node_modules/form-data/lib/form_data.js
var require_form_data = __commonJS((exports, module) => {
  var FormData2 = function(options) {
    if (!(this instanceof FormData2)) {
      return new FormData2(options);
    }
    this._overheadLength = 0;
    this._valueLength = 0;
    this._valuesToMeasure = [];
    CombinedStream.call(this);
    options = options || {};
    for (var option in options) {
      this[option] = options[option];
    }
  };
  var CombinedStream = require_combined_stream();
  var util = import.meta.require("util");
  var path = import.meta.require("path");
  var http = import.meta.require("http");
  var https = import.meta.require("https");
  var parseUrl = import.meta.require("url").parse;
  var fs = import.meta.require("fs");
  var Stream = import.meta.require("stream").Stream;
  var mime = require_mime_types();
  var asynckit = require_asynckit();
  var populate = require_populate();
  module.exports = FormData2;
  util.inherits(FormData2, CombinedStream);
  FormData2.LINE_BREAK = "\r\n";
  FormData2.DEFAULT_CONTENT_TYPE = "application/octet-stream";
  FormData2.prototype.append = function(field, value, options) {
    options = options || {};
    if (typeof options == "string") {
      options = { filename: options };
    }
    var append = CombinedStream.prototype.append.bind(this);
    if (typeof value == "number") {
      value = "" + value;
    }
    if (util.isArray(value)) {
      this._error(new Error("Arrays are not supported."));
      return;
    }
    var header = this._multiPartHeader(field, value, options);
    var footer = this._multiPartFooter();
    append(header);
    append(value);
    append(footer);
    this._trackLength(header, value, options);
  };
  FormData2.prototype._trackLength = function(header, value, options) {
    var valueLength = 0;
    if (options.knownLength != null) {
      valueLength += +options.knownLength;
    } else if (Buffer.isBuffer(value)) {
      valueLength = value.length;
    } else if (typeof value === "string") {
      valueLength = Buffer.byteLength(value);
    }
    this._valueLength += valueLength;
    this._overheadLength += Buffer.byteLength(header) + FormData2.LINE_BREAK.length;
    if (!value || !value.path && !(value.readable && value.hasOwnProperty("httpVersion")) && !(value instanceof Stream)) {
      return;
    }
    if (!options.knownLength) {
      this._valuesToMeasure.push(value);
    }
  };
  FormData2.prototype._lengthRetriever = function(value, callback) {
    if (value.hasOwnProperty("fd")) {
      if (value.end != null && value.end != Infinity && value.start != null) {
        callback(null, value.end + 1 - (value.start ? value.start : 0));
      } else {
        fs.stat(value.path, function(err, stat) {
          var fileSize;
          if (err) {
            callback(err);
            return;
          }
          fileSize = stat.size - (value.start ? value.start : 0);
          callback(null, fileSize);
        });
      }
    } else if (value.hasOwnProperty("httpVersion")) {
      callback(null, +value.headers["content-length"]);
    } else if (value.hasOwnProperty("httpModule")) {
      value.on("response", function(response) {
        value.pause();
        callback(null, +response.headers["content-length"]);
      });
      value.resume();
    } else {
      callback("Unknown stream");
    }
  };
  FormData2.prototype._multiPartHeader = function(field, value, options) {
    if (typeof options.header == "string") {
      return options.header;
    }
    var contentDisposition = this._getContentDisposition(value, options);
    var contentType = this._getContentType(value, options);
    var contents = "";
    var headers = {
      "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
      "Content-Type": [].concat(contentType || [])
    };
    if (typeof options.header == "object") {
      populate(headers, options.header);
    }
    var header;
    for (var prop in headers) {
      if (!headers.hasOwnProperty(prop))
        continue;
      header = headers[prop];
      if (header == null) {
        continue;
      }
      if (!Array.isArray(header)) {
        header = [header];
      }
      if (header.length) {
        contents += prop + ": " + header.join("; ") + FormData2.LINE_BREAK;
      }
    }
    return "--" + this.getBoundary() + FormData2.LINE_BREAK + contents + FormData2.LINE_BREAK;
  };
  FormData2.prototype._getContentDisposition = function(value, options) {
    var filename, contentDisposition;
    if (typeof options.filepath === "string") {
      filename = path.normalize(options.filepath).replace(/\\/g, "/");
    } else if (options.filename || value.name || value.path) {
      filename = path.basename(options.filename || value.name || value.path);
    } else if (value.readable && value.hasOwnProperty("httpVersion")) {
      filename = path.basename(value.client._httpMessage.path || "");
    }
    if (filename) {
      contentDisposition = 'filename="' + filename + '"';
    }
    return contentDisposition;
  };
  FormData2.prototype._getContentType = function(value, options) {
    var contentType = options.contentType;
    if (!contentType && value.name) {
      contentType = mime.lookup(value.name);
    }
    if (!contentType && value.path) {
      contentType = mime.lookup(value.path);
    }
    if (!contentType && value.readable && value.hasOwnProperty("httpVersion")) {
      contentType = value.headers["content-type"];
    }
    if (!contentType && (options.filepath || options.filename)) {
      contentType = mime.lookup(options.filepath || options.filename);
    }
    if (!contentType && typeof value == "object") {
      contentType = FormData2.DEFAULT_CONTENT_TYPE;
    }
    return contentType;
  };
  FormData2.prototype._multiPartFooter = function() {
    return function(next) {
      var footer = FormData2.LINE_BREAK;
      var lastPart = this._streams.length === 0;
      if (lastPart) {
        footer += this._lastBoundary();
      }
      next(footer);
    }.bind(this);
  };
  FormData2.prototype._lastBoundary = function() {
    return "--" + this.getBoundary() + "--" + FormData2.LINE_BREAK;
  };
  FormData2.prototype.getHeaders = function(userHeaders) {
    var header;
    var formHeaders = {
      "content-type": "multipart/form-data; boundary=" + this.getBoundary()
    };
    for (header in userHeaders) {
      if (userHeaders.hasOwnProperty(header)) {
        formHeaders[header.toLowerCase()] = userHeaders[header];
      }
    }
    return formHeaders;
  };
  FormData2.prototype.setBoundary = function(boundary) {
    this._boundary = boundary;
  };
  FormData2.prototype.getBoundary = function() {
    if (!this._boundary) {
      this._generateBoundary();
    }
    return this._boundary;
  };
  FormData2.prototype.getBuffer = function() {
    var dataBuffer = new Buffer.alloc(0);
    var boundary = this.getBoundary();
    for (var i = 0, len = this._streams.length;i < len; i++) {
      if (typeof this._streams[i] !== "function") {
        if (Buffer.isBuffer(this._streams[i])) {
          dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
        } else {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
        }
        if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData2.LINE_BREAK)]);
        }
      }
    }
    return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
  };
  FormData2.prototype._generateBoundary = function() {
    var boundary = "--------------------------";
    for (var i = 0;i < 24; i++) {
      boundary += Math.floor(Math.random() * 10).toString(16);
    }
    this._boundary = boundary;
  };
  FormData2.prototype.getLengthSync = function() {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this.hasKnownLength()) {
      this._error(new Error("Cannot calculate proper length in synchronous way."));
    }
    return knownLength;
  };
  FormData2.prototype.hasKnownLength = function() {
    var hasKnownLength = true;
    if (this._valuesToMeasure.length) {
      hasKnownLength = false;
    }
    return hasKnownLength;
  };
  FormData2.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this._valuesToMeasure.length) {
      process.nextTick(cb.bind(this, null, knownLength));
      return;
    }
    asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
      if (err) {
        cb(err);
        return;
      }
      values.forEach(function(length) {
        knownLength += length;
      });
      cb(null, knownLength);
    });
  };
  FormData2.prototype.submit = function(params, cb) {
    var request, options, defaults = { method: "post" };
    if (typeof params == "string") {
      params = parseUrl(params);
      options = populate({
        port: params.port,
        path: params.pathname,
        host: params.hostname,
        protocol: params.protocol
      }, defaults);
    } else {
      options = populate(params, defaults);
      if (!options.port) {
        options.port = options.protocol == "https:" ? 443 : 80;
      }
    }
    options.headers = this.getHeaders(params.headers);
    if (options.protocol == "https:") {
      request = https.request(options);
    } else {
      request = http.request(options);
    }
    this.getLength(function(err, length) {
      if (err && err !== "Unknown stream") {
        this._error(err);
        return;
      }
      if (length) {
        request.setHeader("Content-Length", length);
      }
      this.pipe(request);
      if (cb) {
        var onResponse;
        var callback = function(error, responce) {
          request.removeListener("error", callback);
          request.removeListener("response", onResponse);
          return cb.call(this, error, responce);
        };
        onResponse = callback.bind(this, null);
        request.on("error", callback);
        request.on("response", onResponse);
      }
    }.bind(this));
    return request;
  };
  FormData2.prototype._error = function(err) {
    if (!this.error) {
      this.error = err;
      this.pause();
      this.emit("error", err);
    }
  };
  FormData2.prototype.toString = function() {
    return "[object FormData]";
  };
});

// node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  var parse = function(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  };
  var fmtShort = function(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  };
  var fmtLong = function(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  };
  var plural = function(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  };
  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
});

// node_modules/debug/src/common.js
var require_common = __commonJS((exports, module) => {
  var setup = function(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0;i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self2 = debug;
        const curr = Number(new Date);
        const ms = curr - (prevTime || curr);
        self2.diff = ms;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend2;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend2(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      let i;
      const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      const len = split.length;
      for (i = 0;i < len; i++) {
        if (!split[i]) {
          continue;
        }
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
        } else {
          createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      const namespaces = [
        ...createDebug.names.map(toNamespace),
        ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      if (name[name.length - 1] === "*") {
        return true;
      }
      let i;
      let len;
      for (i = 0, len = createDebug.skips.length;i < len; i++) {
        if (createDebug.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = createDebug.names.length;i < len; i++) {
        if (createDebug.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function toNamespace(regexp) {
      return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  };
  module.exports = setup;
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module) => {
  var useColors = function() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  };
  var formatArgs = function(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  };
  var save = function(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {
    }
  };
  var load = function() {
    let r;
    try {
      r = exports.storage.getItem("debug");
    } catch (error) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  };
  var localstorage = function() {
    try {
      return localStorage;
    } catch (error) {
    }
  };
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  exports.log = console.debug || console.log || (() => {
  });
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS((exports, module) => {
  module.exports = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS((exports, module) => {
  var translateLevel = function(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  };
  var supportsColor = function(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === undefined) {
      return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => (sign in env)) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min;
  };
  var getSupportLevel = function(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
  };
  var os = import.meta.require("os");
  var tty = import.meta.require("tty");
  var hasFlag = require_has_flag();
  var { env } = process;
  var forceColor;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
    forceColor = 0;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  module.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
});

// node_modules/debug/src/node.js
var require_node = __commonJS((exports, module) => {
  var useColors = function() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  };
  var formatArgs = function(args) {
    const { namespace: name, useColors: useColors2 } = this;
    if (useColors2) {
      const c = this.color;
      const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
      const prefix = `  ${colorCode};1m${name} \x1B[0m`;
      args[0] = prefix + args[0].split("\n").join("\n" + prefix);
      args.push(colorCode + "m+" + exports.humanize(this.diff) + "\x1B[0m");
    } else {
      args[0] = getDate() + name + " " + args[0];
    }
  };
  var getDate = function() {
    if (exports.inspectOpts.hideDate) {
      return "";
    }
    return new Date().toISOString() + " ";
  };
  var log = function(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
  };
  var save = function(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      delete process.env.DEBUG;
    }
  };
  var load = function() {
    return process.env.DEBUG;
  };
  var init = function(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for (let i = 0;i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
  };
  var tty = import.meta.require("tty");
  var util = import.meta.require("util");
  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.destroy = util.deprecate(() => {
  }, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  exports.colors = [6, 2, 3, 4, 5, 1];
  try {
    const supportsColor = require_supports_color();
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ];
    }
  } catch (error) {
  }
  exports.inspectOpts = Object.keys(process.env).filter((key) => {
    return /^debug_/i.test(key);
  }).reduce((obj, key) => {
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
      return k.toUpperCase();
    });
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === "null") {
      val = null;
    } else {
      val = Number(val);
    }
    obj[prop] = val;
    return obj;
  }, {});
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
  };
  formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});

// node_modules/debug/src/index.js
var require_src = __commonJS((exports, module) => {
  if (typeof process === "undefined" || process.type === "renderer" || false || process.__nwjs) {
    module.exports = require_browser();
  } else {
    module.exports = require_node();
  }
});

// node_modules/follow-redirects/debug.js
var require_debug = __commonJS((exports, module) => {
  var debug;
  module.exports = function() {
    if (!debug) {
      try {
        debug = require_src()("follow-redirects");
      } catch (error) {
      }
      if (typeof debug !== "function") {
        debug = function() {
        };
      }
    }
    debug.apply(null, arguments);
  };
});

// node_modules/follow-redirects/index.js
var require_follow_redirects = __commonJS((exports, module) => {
  var RedirectableRequest = function(options, responseCallback) {
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];
    if (responseCallback) {
      this.on("response", responseCallback);
    }
    var self2 = this;
    this._onNativeResponse = function(response) {
      try {
        self2._processResponse(response);
      } catch (cause) {
        self2.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
      }
    };
    this._performRequest();
  };
  var wrap = function(protocols) {
    var exports2 = {
      maxRedirects: 21,
      maxBodyLength: 10 * 1024 * 1024
    };
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function(scheme) {
      var protocol = scheme + ":";
      var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
      var wrappedProtocol = exports2[scheme] = Object.create(nativeProtocol);
      function request(input, options, callback) {
        if (isURL(input)) {
          input = spreadUrlObject(input);
        } else if (isString2(input)) {
          input = spreadUrlObject(parseUrl2(input));
        } else {
          callback = options;
          options = validateUrl(input);
          input = { protocol };
        }
        if (isFunction2(options)) {
          callback = options;
          options = null;
        }
        options = Object.assign({
          maxRedirects: exports2.maxRedirects,
          maxBodyLength: exports2.maxBodyLength
        }, input, options);
        options.nativeProtocols = nativeProtocols;
        if (!isString2(options.host) && !isString2(options.hostname)) {
          options.hostname = "::1";
        }
        assert.equal(options.protocol, protocol, "protocol mismatch");
        debug("options", options);
        return new RedirectableRequest(options, callback);
      }
      function get(input, options, callback) {
        var wrappedRequest = wrappedProtocol.request(input, options, callback);
        wrappedRequest.end();
        return wrappedRequest;
      }
      Object.defineProperties(wrappedProtocol, {
        request: { value: request, configurable: true, enumerable: true, writable: true },
        get: { value: get, configurable: true, enumerable: true, writable: true }
      });
    });
    return exports2;
  };
  var noop2 = function() {
  };
  var parseUrl2 = function(input) {
    var parsed;
    if (useNativeURL) {
      parsed = new URL2(input);
    } else {
      parsed = validateUrl(url2.parse(input));
      if (!isString2(parsed.protocol)) {
        throw new InvalidUrlError({ input });
      }
    }
    return parsed;
  };
  var resolveUrl = function(relative, base) {
    return useNativeURL ? new URL2(relative, base) : parseUrl2(url2.resolve(base, relative));
  };
  var validateUrl = function(input) {
    if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    return input;
  };
  var spreadUrlObject = function(urlObject, target) {
    var spread = target || {};
    for (var key of preservedUrlFields) {
      spread[key] = urlObject[key];
    }
    if (spread.hostname.startsWith("[")) {
      spread.hostname = spread.hostname.slice(1, -1);
    }
    if (spread.port !== "") {
      spread.port = Number(spread.port);
    }
    spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
    return spread;
  };
  var removeMatchingHeaders = function(regex, headers) {
    var lastValue;
    for (var header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return lastValue === null || typeof lastValue === "undefined" ? undefined : String(lastValue).trim();
  };
  var createErrorType = function(code, message, baseClass) {
    function CustomError(properties) {
      Error.captureStackTrace(this, this.constructor);
      Object.assign(this, properties || {});
      this.code = code;
      this.message = this.cause ? message + ": " + this.cause.message : message;
    }
    CustomError.prototype = new (baseClass || Error);
    Object.defineProperties(CustomError.prototype, {
      constructor: {
        value: CustomError,
        enumerable: false
      },
      name: {
        value: "Error [" + code + "]",
        enumerable: false
      }
    });
    return CustomError;
  };
  var destroyRequest = function(request, error) {
    for (var event of events) {
      request.removeListener(event, eventHandlers[event]);
    }
    request.on("error", noop2);
    request.destroy(error);
  };
  var isSubdomain = function(subdomain, domain) {
    assert(isString2(subdomain) && isString2(domain));
    var dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
  };
  var isString2 = function(value) {
    return typeof value === "string" || value instanceof String;
  };
  var isFunction2 = function(value) {
    return typeof value === "function";
  };
  var isBuffer2 = function(value) {
    return typeof value === "object" && "length" in value;
  };
  var isURL = function(value) {
    return URL2 && value instanceof URL2;
  };
  var url2 = import.meta.require("url");
  var URL2 = url2.URL;
  var http = import.meta.require("http");
  var https = import.meta.require("https");
  var Writable = import.meta.require("stream").Writable;
  var assert = import.meta.require("assert");
  var debug = require_debug();
  var useNativeURL = false;
  try {
    assert(new URL2);
  } catch (error) {
    useNativeURL = error.code === "ERR_INVALID_URL";
  }
  var preservedUrlFields = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash"
  ];
  var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
  var eventHandlers = Object.create(null);
  events.forEach(function(event) {
    eventHandlers[event] = function(arg1, arg2, arg3) {
      this._redirectable.emit(event, arg1, arg2, arg3);
    };
  });
  var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
  var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
  var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError);
  var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
  var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
  var destroy = Writable.prototype.destroy || noop2;
  RedirectableRequest.prototype = Object.create(Writable.prototype);
  RedirectableRequest.prototype.abort = function() {
    destroyRequest(this._currentRequest);
    this._currentRequest.abort();
    this.emit("abort");
  };
  RedirectableRequest.prototype.destroy = function(error) {
    destroyRequest(this._currentRequest, error);
    destroy.call(this, error);
    return this;
  };
  RedirectableRequest.prototype.write = function(data, encoding, callback) {
    if (this._ending) {
      throw new WriteAfterEndError;
    }
    if (!isString2(data) && !isBuffer2(data)) {
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (isFunction2(encoding)) {
      callback = encoding;
      encoding = null;
    }
    if (data.length === 0) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data, encoding });
      this._currentRequest.write(data, encoding, callback);
    } else {
      this.emit("error", new MaxBodyLengthExceededError);
      this.abort();
    }
  };
  RedirectableRequest.prototype.end = function(data, encoding, callback) {
    if (isFunction2(data)) {
      callback = data;
      data = encoding = null;
    } else if (isFunction2(encoding)) {
      callback = encoding;
      encoding = null;
    }
    if (!data) {
      this._ended = this._ending = true;
      this._currentRequest.end(null, null, callback);
    } else {
      var self2 = this;
      var currentRequest = this._currentRequest;
      this.write(data, encoding, function() {
        self2._ended = true;
        currentRequest.end(null, null, callback);
      });
      this._ending = true;
    }
  };
  RedirectableRequest.prototype.setHeader = function(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  };
  RedirectableRequest.prototype.removeHeader = function(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  };
  RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
    var self2 = this;
    function destroyOnTimeout(socket) {
      socket.setTimeout(msecs);
      socket.removeListener("timeout", socket.destroy);
      socket.addListener("timeout", socket.destroy);
    }
    function startTimer(socket) {
      if (self2._timeout) {
        clearTimeout(self2._timeout);
      }
      self2._timeout = setTimeout(function() {
        self2.emit("timeout");
        clearTimer();
      }, msecs);
      destroyOnTimeout(socket);
    }
    function clearTimer() {
      if (self2._timeout) {
        clearTimeout(self2._timeout);
        self2._timeout = null;
      }
      self2.removeListener("abort", clearTimer);
      self2.removeListener("error", clearTimer);
      self2.removeListener("response", clearTimer);
      self2.removeListener("close", clearTimer);
      if (callback) {
        self2.removeListener("timeout", callback);
      }
      if (!self2.socket) {
        self2._currentRequest.removeListener("socket", startTimer);
      }
    }
    if (callback) {
      this.on("timeout", callback);
    }
    if (this.socket) {
      startTimer(this.socket);
    } else {
      this._currentRequest.once("socket", startTimer);
    }
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);
    this.on("close", clearTimer);
    return this;
  };
  [
    "flushHeaders",
    "getHeader",
    "setNoDelay",
    "setSocketKeepAlive"
  ].forEach(function(method) {
    RedirectableRequest.prototype[method] = function(a, b) {
      return this._currentRequest[method](a, b);
    };
  });
  ["aborted", "connection", "socket"].forEach(function(property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
      get: function() {
        return this._currentRequest[property];
      }
    });
  });
  RedirectableRequest.prototype._sanitizeOptions = function(options) {
    if (!options.headers) {
      options.headers = {};
    }
    if (options.host) {
      if (!options.hostname) {
        options.hostname = options.host;
      }
      delete options.host;
    }
    if (!options.pathname && options.path) {
      var searchPos = options.path.indexOf("?");
      if (searchPos < 0) {
        options.pathname = options.path;
      } else {
        options.pathname = options.path.substring(0, searchPos);
        options.search = options.path.substring(searchPos);
      }
    }
  };
  RedirectableRequest.prototype._performRequest = function() {
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
      throw new TypeError("Unsupported protocol " + protocol);
    }
    if (this._options.agents) {
      var scheme = protocol.slice(0, -1);
      this._options.agent = this._options.agents[scheme];
    }
    var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    request._redirectable = this;
    for (var event of events) {
      request.on(event, eventHandlers[event]);
    }
    this._currentUrl = /^\//.test(this._options.path) ? url2.format(this._options) : this._options.path;
    if (this._isRedirect) {
      var i = 0;
      var self2 = this;
      var buffers = this._requestBodyBuffers;
      (function writeNext(error) {
        if (request === self2._currentRequest) {
          if (error) {
            self2.emit("error", error);
          } else if (i < buffers.length) {
            var buffer = buffers[i++];
            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          } else if (self2._ended) {
            request.end();
          }
        }
      })();
    }
  };
  RedirectableRequest.prototype._processResponse = function(response) {
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
      this._redirects.push({
        url: this._currentUrl,
        headers: response.headers,
        statusCode
      });
    }
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit("response", response);
      this._requestBodyBuffers = [];
      return;
    }
    destroyRequest(this._currentRequest);
    response.destroy();
    if (++this._redirectCount > this._options.maxRedirects) {
      throw new TooManyRedirectsError;
    }
    var requestHeaders;
    var beforeRedirect = this._options.beforeRedirect;
    if (beforeRedirect) {
      requestHeaders = Object.assign({
        Host: response.req.getHeader("host")
      }, this._options.headers);
    }
    var method = this._options.method;
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
    var currentUrlParts = parseUrl2(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url2.format(Object.assign(currentUrlParts, { host: currentHost }));
    var redirectUrl = resolveUrl(location, currentUrl);
    debug("redirecting to", redirectUrl.href);
    this._isRedirect = true;
    spreadUrlObject(redirectUrl, this._options);
    if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
      removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
    }
    if (isFunction2(beforeRedirect)) {
      var responseDetails = {
        headers: response.headers,
        statusCode
      };
      var requestDetails = {
        url: currentUrl,
        method,
        headers: requestHeaders
      };
      beforeRedirect(this._options, responseDetails, requestDetails);
      this._sanitizeOptions(this._options);
    }
    this._performRequest();
  };
  module.exports = wrap({ http, https });
  module.exports.wrap = wrap;
});

// node_modules/randombytes/index.js
var require_randombytes = __commonJS((exports, module) => {
  module.exports = import.meta.require("crypto").randomBytes;
});

// node_modules/randomstring/lib/charset.js
var require_charset = __commonJS((exports, module) => {
  var Charset = function() {
    this.chars = "";
  };
  Charset.prototype.setType = function(type) {
    if (Array.isArray(type)) {
      for (var i = 0;i < type.length; i++) {
        this.chars += this.getCharacters(type[i]);
      }
    } else {
      this.chars = this.getCharacters(type);
    }
  };
  Charset.prototype.getCharacters = function(type) {
    var chars;
    var numbers = "0123456789";
    var charsLower = "abcdefghijklmnopqrstuvwxyz";
    var charsUpper = charsLower.toUpperCase();
    var hexChars = "abcdef";
    var binaryChars = "01";
    var octalChars = "01234567";
    if (type === "alphanumeric") {
      chars = numbers + charsLower + charsUpper;
    } else if (type === "numeric") {
      chars = numbers;
    } else if (type === "alphabetic") {
      chars = charsLower + charsUpper;
    } else if (type === "hex") {
      chars = numbers + hexChars;
    } else if (type === "binary") {
      chars = binaryChars;
    } else if (type === "octal") {
      chars = octalChars;
    } else {
      chars = type;
    }
    return chars;
  };
  Charset.prototype.removeUnreadable = function() {
    var unreadableChars = /[0OIl]/g;
    this.chars = this.chars.replace(unreadableChars, "");
  };
  Charset.prototype.setcapitalization = function(capitalization) {
    if (capitalization === "uppercase") {
      this.chars = this.chars.toUpperCase();
    } else if (capitalization === "lowercase") {
      this.chars = this.chars.toLowerCase();
    }
  };
  Charset.prototype.removeDuplicates = function() {
    var charMap = this.chars.split("");
    charMap = [...new Set(charMap)];
    this.chars = charMap.join("");
  };
  module.exports = exports = Charset;
});

// node_modules/uuid/dist/max.js
var require_max = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _default = exports.default = "ffffffff-ffff-ffff-ffff-ffffffffffff";
});

// node_modules/uuid/dist/nil.js
var require_nil = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _default = exports.default = "00000000-0000-0000-0000-000000000000";
});

// node_modules/uuid/dist/regex.js
var require_regex = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _default = exports.default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
});

// node_modules/uuid/dist/validate.js
var require_validate = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var validate = function(uuid) {
    return typeof uuid === "string" && _regex.default.test(uuid);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _regex = _interopRequireDefault(require_regex());
  var _default = exports.default = validate;
});

// node_modules/uuid/dist/parse.js
var require_parse = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var parse = function(uuid) {
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Invalid UUID");
    }
    let v;
    const arr = new Uint8Array(16);
    arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
    arr[1] = v >>> 16 & 255;
    arr[2] = v >>> 8 & 255;
    arr[3] = v & 255;
    arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
    arr[5] = v & 255;
    arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
    arr[7] = v & 255;
    arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
    arr[9] = v & 255;
    arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
    arr[11] = v / 4294967296 & 255;
    arr[12] = v >>> 24 & 255;
    arr[13] = v >>> 16 & 255;
    arr[14] = v >>> 8 & 255;
    arr[15] = v & 255;
    return arr;
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _validate = _interopRequireDefault(require_validate());
  var _default = exports.default = parse;
});

// node_modules/uuid/dist/stringify.js
var require_stringify = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var unsafeStringify = function(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  };
  var stringify2 = function(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Stringified UUID is invalid");
    }
    return uuid;
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  exports.unsafeStringify = unsafeStringify;
  var _validate = _interopRequireDefault(require_validate());
  var byteToHex = [];
  for (let i = 0;i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  var _default = exports.default = stringify2;
});

// node_modules/uuid/dist/rng.js
var require_rng = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var rng = function() {
    if (poolPtr > rnds8Pool.length - 16) {
      _nodeCrypto.default.randomFillSync(rnds8Pool);
      poolPtr = 0;
    }
    return rnds8Pool.slice(poolPtr, poolPtr += 16);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = rng;
  var _nodeCrypto = _interopRequireDefault(import.meta.require("crypto"));
  var rnds8Pool = new Uint8Array(256);
  var poolPtr = rnds8Pool.length;
});

// node_modules/uuid/dist/v1.js
var require_v1 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var v1 = function(options, buf, offset) {
    let i = buf && offset || 0;
    const b = buf || new Array(16);
    options = options || {};
    let node2 = options.node;
    let clockseq = options.clockseq;
    if (!options._v6) {
      if (!node2) {
        node2 = _nodeId;
      }
      if (clockseq == null) {
        clockseq = _clockseq;
      }
    }
    if (node2 == null || clockseq == null) {
      const seedBytes = options.random || (options.rng || _rng.default)();
      if (node2 == null) {
        node2 = [seedBytes[0], seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
        if (!_nodeId && !options._v6) {
          node2[0] |= 1;
          _nodeId = node2;
        }
      }
      if (clockseq == null) {
        clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
        if (_clockseq === undefined && !options._v6) {
          _clockseq = clockseq;
        }
      }
    }
    let msecs = options.msecs !== undefined ? options.msecs : Date.now();
    let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
    const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
    if (dt < 0 && options.clockseq === undefined) {
      clockseq = clockseq + 1 & 16383;
    }
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
      nsecs = 0;
    }
    if (nsecs >= 1e4) {
      throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    msecs += 12219292800000;
    const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
    b[i++] = tl >>> 24 & 255;
    b[i++] = tl >>> 16 & 255;
    b[i++] = tl >>> 8 & 255;
    b[i++] = tl & 255;
    const tmh = msecs / 4294967296 * 1e4 & 268435455;
    b[i++] = tmh >>> 8 & 255;
    b[i++] = tmh & 255;
    b[i++] = tmh >>> 24 & 15 | 16;
    b[i++] = tmh >>> 16 & 255;
    b[i++] = clockseq >>> 8 | 128;
    b[i++] = clockseq & 255;
    for (let n = 0;n < 6; ++n) {
      b[i + n] = node2[n];
    }
    return buf || (0, _stringify.unsafeStringify)(b);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _rng = _interopRequireDefault(require_rng());
  var _stringify = require_stringify();
  var _nodeId;
  var _clockseq;
  var _lastMSecs = 0;
  var _lastNSecs = 0;
  var _default = exports.default = v1;
});

// node_modules/uuid/dist/v1ToV6.js
var require_v1ToV6 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var v1ToV6 = function(uuid) {
    const v1Bytes = typeof uuid === "string" ? (0, _parse.default)(uuid) : uuid;
    const v6Bytes = _v1ToV6(v1Bytes);
    return typeof uuid === "string" ? (0, _stringify.unsafeStringify)(v6Bytes) : v6Bytes;
  };
  var _v1ToV6 = function(v1Bytes, randomize = false) {
    return Uint8Array.of((v1Bytes[6] & 15) << 4 | v1Bytes[7] >> 4 & 15, (v1Bytes[7] & 15) << 4 | (v1Bytes[4] & 240) >> 4, (v1Bytes[4] & 15) << 4 | (v1Bytes[5] & 240) >> 4, (v1Bytes[5] & 15) << 4 | (v1Bytes[0] & 240) >> 4, (v1Bytes[0] & 15) << 4 | (v1Bytes[1] & 240) >> 4, (v1Bytes[1] & 15) << 4 | (v1Bytes[2] & 240) >> 4, 96 | v1Bytes[2] & 15, v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = v1ToV6;
  var _parse = _interopRequireDefault(require_parse());
  var _stringify = require_stringify();
});

// node_modules/uuid/dist/v35.js
var require_v35 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var stringToBytes = function(str) {
    str = unescape(encodeURIComponent(str));
    const bytes = [];
    for (let i = 0;i < str.length; ++i) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  };
  var v35 = function(name, version, hashfunc) {
    function generateUUID(value, namespace, buf, offset) {
      var _namespace;
      if (typeof value === "string") {
        value = stringToBytes(value);
      }
      if (typeof namespace === "string") {
        namespace = (0, _parse.default)(namespace);
      }
      if (((_namespace = namespace) === null || _namespace === undefined ? undefined : _namespace.length) !== 16) {
        throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
      }
      let bytes = new Uint8Array(16 + value.length);
      bytes.set(namespace);
      bytes.set(value, namespace.length);
      bytes = hashfunc(bytes);
      bytes[6] = bytes[6] & 15 | version;
      bytes[8] = bytes[8] & 63 | 128;
      if (buf) {
        offset = offset || 0;
        for (let i = 0;i < 16; ++i) {
          buf[offset + i] = bytes[i];
        }
        return buf;
      }
      return (0, _stringify.unsafeStringify)(bytes);
    }
    try {
      generateUUID.name = name;
    } catch (err) {
    }
    generateUUID.DNS = DNS;
    generateUUID.URL = URL2;
    return generateUUID;
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.URL = exports.DNS = undefined;
  exports.default = v35;
  var _stringify = require_stringify();
  var _parse = _interopRequireDefault(require_parse());
  var DNS = exports.DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  var URL2 = exports.URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
});

// node_modules/uuid/dist/md5.js
var require_md5 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var md53 = function(bytes) {
    if (Array.isArray(bytes)) {
      bytes = Buffer.from(bytes);
    } else if (typeof bytes === "string") {
      bytes = Buffer.from(bytes, "utf8");
    }
    return _nodeCrypto.default.createHash("md5").update(bytes).digest();
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _nodeCrypto = _interopRequireDefault(import.meta.require("crypto"));
  var _default = exports.default = md53;
});

// node_modules/uuid/dist/v3.js
var require_v3 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _v = _interopRequireDefault(require_v35());
  var _md = _interopRequireDefault(require_md5());
  var v3 = (0, _v.default)("v3", 48, _md.default);
  var _default = exports.default = v3;
});

// node_modules/uuid/dist/native.js
var require_native = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _nodeCrypto = _interopRequireDefault(import.meta.require("crypto"));
  var _default = exports.default = {
    randomUUID: _nodeCrypto.default.randomUUID
  };
});

// node_modules/uuid/dist/v4.js
var require_v4 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var v4 = function(options, buf, offset) {
    if (_native.default.randomUUID && !buf && !options) {
      return _native.default.randomUUID();
    }
    options = options || {};
    const rnds = options.random || (options.rng || _rng.default)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0;i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return (0, _stringify.unsafeStringify)(rnds);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _native = _interopRequireDefault(require_native());
  var _rng = _interopRequireDefault(require_rng());
  var _stringify = require_stringify();
  var _default = exports.default = v4;
});

// node_modules/uuid/dist/sha1.js
var require_sha1 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var sha1 = function(bytes) {
    if (Array.isArray(bytes)) {
      bytes = Buffer.from(bytes);
    } else if (typeof bytes === "string") {
      bytes = Buffer.from(bytes, "utf8");
    }
    return _nodeCrypto.default.createHash("sha1").update(bytes).digest();
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _nodeCrypto = _interopRequireDefault(import.meta.require("crypto"));
  var _default = exports.default = sha1;
});

// node_modules/uuid/dist/v5.js
var require_v5 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _v = _interopRequireDefault(require_v35());
  var _sha = _interopRequireDefault(require_sha1());
  var v5 = (0, _v.default)("v5", 80, _sha.default);
  var _default = exports.default = v5;
});

// node_modules/uuid/dist/v6.js
var require_v6 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var v6 = function(options = {}, buf, offset = 0) {
    let bytes = (0, _v.default)({
      ...options,
      _v6: true
    }, new Uint8Array(16));
    bytes = (0, _v1ToV.default)(bytes);
    if (buf) {
      for (let i = 0;i < 16; i++) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return (0, _stringify.unsafeStringify)(bytes);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = v6;
  var _stringify = require_stringify();
  var _v = _interopRequireDefault(require_v1());
  var _v1ToV = _interopRequireDefault(require_v1ToV6());
});

// node_modules/uuid/dist/v6ToV1.js
var require_v6ToV1 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var v6ToV1 = function(uuid) {
    const v6Bytes = typeof uuid === "string" ? (0, _parse.default)(uuid) : uuid;
    const v1Bytes = _v6ToV1(v6Bytes);
    return typeof uuid === "string" ? (0, _stringify.unsafeStringify)(v1Bytes) : v1Bytes;
  };
  var _v6ToV1 = function(v6Bytes) {
    return Uint8Array.of((v6Bytes[3] & 15) << 4 | v6Bytes[4] >> 4 & 15, (v6Bytes[4] & 15) << 4 | (v6Bytes[5] & 240) >> 4, (v6Bytes[5] & 15) << 4 | v6Bytes[6] & 15, v6Bytes[7], (v6Bytes[1] & 15) << 4 | (v6Bytes[2] & 240) >> 4, (v6Bytes[2] & 15) << 4 | (v6Bytes[3] & 240) >> 4, 16 | (v6Bytes[0] & 240) >> 4, (v6Bytes[0] & 15) << 4 | (v6Bytes[1] & 240) >> 4, v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = v6ToV1;
  var _parse = _interopRequireDefault(require_parse());
  var _stringify = require_stringify();
});

// node_modules/uuid/dist/v7.js
var require_v7 = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var v7 = function(options, buf, offset) {
    options = options || {};
    let i = buf && offset || 0;
    const b = buf || new Uint8Array(16);
    const rnds = options.random || (options.rng || _rng.default)();
    const msecs = options.msecs !== undefined ? options.msecs : Date.now();
    let seq = options.seq !== undefined ? options.seq : null;
    let seqHigh = _seqHigh;
    let seqLow = _seqLow;
    if (msecs > _msecs && options.msecs === undefined) {
      _msecs = msecs;
      if (seq !== null) {
        seqHigh = null;
        seqLow = null;
      }
    }
    if (seq !== null) {
      if (seq > 2147483647) {
        seq = 2147483647;
      }
      seqHigh = seq >>> 19 & 4095;
      seqLow = seq & 524287;
    }
    if (seqHigh === null || seqLow === null) {
      seqHigh = rnds[6] & 127;
      seqHigh = seqHigh << 8 | rnds[7];
      seqLow = rnds[8] & 63;
      seqLow = seqLow << 8 | rnds[9];
      seqLow = seqLow << 5 | rnds[10] >>> 3;
    }
    if (msecs + 1e4 > _msecs && seq === null) {
      if (++seqLow > 524287) {
        seqLow = 0;
        if (++seqHigh > 4095) {
          seqHigh = 0;
          _msecs++;
        }
      }
    } else {
      _msecs = msecs;
    }
    _seqHigh = seqHigh;
    _seqLow = seqLow;
    b[i++] = _msecs / 1099511627776 & 255;
    b[i++] = _msecs / 4294967296 & 255;
    b[i++] = _msecs / 16777216 & 255;
    b[i++] = _msecs / 65536 & 255;
    b[i++] = _msecs / 256 & 255;
    b[i++] = _msecs & 255;
    b[i++] = seqHigh >>> 4 & 15 | 112;
    b[i++] = seqHigh & 255;
    b[i++] = seqLow >>> 13 & 63 | 128;
    b[i++] = seqLow >>> 5 & 255;
    b[i++] = seqLow << 3 & 255 | rnds[10] & 7;
    b[i++] = rnds[11];
    b[i++] = rnds[12];
    b[i++] = rnds[13];
    b[i++] = rnds[14];
    b[i++] = rnds[15];
    return buf || (0, _stringify.unsafeStringify)(b);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _rng = _interopRequireDefault(require_rng());
  var _stringify = require_stringify();
  var _seqLow = null;
  var _seqHigh = null;
  var _msecs = 0;
  var _default = exports.default = v7;
});

// node_modules/uuid/dist/version.js
var require_version = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  var version = function(uuid) {
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Invalid UUID");
    }
    return parseInt(uuid.slice(14, 15), 16);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _validate = _interopRequireDefault(require_validate());
  var _default = exports.default = version;
});

// node_modules/uuid/dist/index.js
var require_dist = __commonJS((exports) => {
  var _interopRequireDefault = function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "MAX", {
    enumerable: true,
    get: function() {
      return _max.default;
    }
  });
  Object.defineProperty(exports, "NIL", {
    enumerable: true,
    get: function() {
      return _nil.default;
    }
  });
  Object.defineProperty(exports, "parse", {
    enumerable: true,
    get: function() {
      return _parse.default;
    }
  });
  Object.defineProperty(exports, "stringify", {
    enumerable: true,
    get: function() {
      return _stringify.default;
    }
  });
  Object.defineProperty(exports, "v1", {
    enumerable: true,
    get: function() {
      return _v.default;
    }
  });
  Object.defineProperty(exports, "v1ToV6", {
    enumerable: true,
    get: function() {
      return _v1ToV.default;
    }
  });
  Object.defineProperty(exports, "v3", {
    enumerable: true,
    get: function() {
      return _v2.default;
    }
  });
  Object.defineProperty(exports, "v4", {
    enumerable: true,
    get: function() {
      return _v3.default;
    }
  });
  Object.defineProperty(exports, "v5", {
    enumerable: true,
    get: function() {
      return _v4.default;
    }
  });
  Object.defineProperty(exports, "v6", {
    enumerable: true,
    get: function() {
      return _v5.default;
    }
  });
  Object.defineProperty(exports, "v6ToV1", {
    enumerable: true,
    get: function() {
      return _v6ToV.default;
    }
  });
  Object.defineProperty(exports, "v7", {
    enumerable: true,
    get: function() {
      return _v6.default;
    }
  });
  Object.defineProperty(exports, "validate", {
    enumerable: true,
    get: function() {
      return _validate.default;
    }
  });
  Object.defineProperty(exports, "version", {
    enumerable: true,
    get: function() {
      return _version.default;
    }
  });
  var _max = _interopRequireDefault(require_max());
  var _nil = _interopRequireDefault(require_nil());
  var _parse = _interopRequireDefault(require_parse());
  var _stringify = _interopRequireDefault(require_stringify());
  var _v = _interopRequireDefault(require_v1());
  var _v1ToV = _interopRequireDefault(require_v1ToV6());
  var _v2 = _interopRequireDefault(require_v3());
  var _v3 = _interopRequireDefault(require_v4());
  var _v4 = _interopRequireDefault(require_v5());
  var _v5 = _interopRequireDefault(require_v6());
  var _v6ToV = _interopRequireDefault(require_v6ToV1());
  var _v6 = _interopRequireDefault(require_v7());
  var _validate = _interopRequireDefault(require_validate());
  var _version = _interopRequireDefault(require_version());
});

// src/index.ts
var import_jsonc = __toESM(require_jsonc2(), 1);
import {existsSync, readFileSync} from "fs";

// src/utils/log.ts
var _log = console.log;
var _warn = console.warn;
var _err = console.error;
var isFailed = false;
var _setFailed = () => {
  if (isFailed)
    return;
  isFailed = true;
};
var _isFailed = () => isFailed;

// src/utils/sleep.ts
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// src/m/config.ts
var WEB_CLIENT_TYPE = "5";
var BBS_CLIENT_TYPE = "2";
var APP_VERSION = "2.62.2";
var DEFAULT_UA = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/${APP_VERSION}`;
var WEB_SALT = "0wr0OpH2BNuekYrfeRwkiDdshvt10cTY";
var BBS_SALT = "pIlzNr5SAZhdnFW8ZxauW8UlxRdZc45r";
var BBS_SALT_2 = "t0qEgfub6cvueAPgR5m9aQWWVciEer7v";
var WEB_API_BASE = "https://api-takumi.mihoyo.com";
var BBS_API_BASE = "https://bbs-api.miyoushe.com";
var WEB_SIGN_URL = `${WEB_API_BASE}/event/luna/sign`;
var WEB_AWARDS_URL = `${WEB_API_BASE}/event/luna/home?lang=zh-cn`;
var WEB_ROLES_URL = `${WEB_API_BASE}/binding/api/getUserGameRolesByCookie`;
var WEB_IS_SIGN_URL = `${WEB_API_BASE}/event/luna/info?lang=lang=zh-cn`;
var BBS_TASK_LIST_URL = `${BBS_API_BASE}/apihub/sapi/getUserMissionsState`;
var BBS_SIGN_URL = `${BBS_API_BASE}/apihub/app/api/signIn`;
var BBS_POST_LIST_URL = `${BBS_API_BASE}/post/api/getForumPostList`;
var BBS_VIEW_POST_URL = `${BBS_API_BASE}/post/api/getPostFull`;
var BBS_LIKE_POST_URL = `${BBS_API_BASE}/apihub/sapi/upvotePost`;
var BBS_SHARE_POST_URL = `${BBS_API_BASE}/apihub/api/getShareConf`;
var BBS_POST_LIST_URL_OLD = "https://bbs-api.mihoyo.com/post/wapi/getForumPostList";
var WEB_CAPTCHA_REFERER = "https://passport-api.mihoyo.com/account/ma-cn-passport/app/loginByPassword";
var BBS_CAPTCHA_REFERER = "https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html";
var GS_BIZ = "hk4e_cn";
var GS_ACT_ID = "e202311201442471";
var SR_BIZ = "hkrpg_cn";
var SR_ACT_ID = "e202304121516551";

// node_modules/axios/lib/helpers/bind.js
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// node_modules/axios/lib/utils.js
var isBuffer = function(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
};
var isArrayBufferView = function(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
};
var forEach = function(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length;i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0;i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
};
var findKey = function(obj, key) {
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
};
var merge = function() {
  const { caseless } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length;i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
};
var isSpecCompliantForm = function(thing) {
  return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === "FormData" && thing[Symbol.iterator]);
};
var { toString } = Object.prototype;
var { getPrototypeOf } = Object;
var kindOf = ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));
var kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
var typeOfTest = (type) => (thing) => typeof thing === type;
var { isArray } = Array;
var isUndefined = typeOfTest("undefined");
var isArrayBuffer = kindOfTest("ArrayBuffer");
var isString = typeOfTest("string");
var isFunction = typeOfTest("function");
var isNumber = typeOfTest("number");
var isObject = (thing) => thing !== null && typeof thing === "object";
var isBoolean = (thing) => thing === true || thing === false;
var isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype = getPrototypeOf(val);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
};
var isDate = kindOfTest("Date");
var isFile = kindOfTest("File");
var isBlob = kindOfTest("Blob");
var isFileList = kindOfTest("FileList");
var isStream = (val) => isObject(val) && isFunction(val.pipe);
var isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
var isURLSearchParams = kindOfTest("URLSearchParams");
var [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
var trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
var _global = (() => {
  if (typeof globalThis !== "undefined")
    return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
var isContextDefined = (context) => !isUndefined(context) && context !== _global;
var extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
var stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
var inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
var toFlatObject = (sourceObj, destObj, filter, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null)
    return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
var endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
var toArray = (thing) => {
  if (!thing)
    return null;
  if (isArray(thing))
    return thing;
  let i = thing.length;
  if (!isNumber(i))
    return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
var isTypedArray = ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
var forEachEntry = (obj, fn) => {
  const generator = obj && obj[Symbol.iterator];
  const iterator = generator.call(obj);
  let result;
  while ((result = iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
var matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
var isHTMLForm = kindOfTest("HTMLFormElement");
var toCamelCase = (str) => {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
    return p1.toUpperCase() + p2;
  });
};
var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
var isRegExp = kindOfTest("RegExp");
var reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
var freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value))
      return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method \'" + name + "\'");
      };
    }
  });
};
var toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
var noop = () => {
};
var toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
var ALPHA = "abcdefghijklmnopqrstuvwxyz";
var DIGIT = "0123456789";
var ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
};
var generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = "";
  const { length } = alphabet;
  while (size--) {
    str += alphabet[Math.random() * length | 0];
  }
  return str;
};
var toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = undefined;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
var isAsyncFn = kindOfTest("AsyncFunction");
var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
var utils_default = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  ALPHABET,
  generateString,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable
};

// node_modules/axios/lib/core/AxiosError.js
var AxiosError = function(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  response && (this.response = response);
};
utils_default.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: utils_default.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
var prototype = AxiosError.prototype;
var descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, "isAxiosError", { value: true });
AxiosError.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype);
  utils_default.toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  AxiosError.call(axiosError, error.message, code, config, request, response);
  axiosError.cause = error;
  axiosError.name = error.name;
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var AxiosError_default = AxiosError;

// node_modules/axios/lib/platform/node/classes/FormData.js
var import_form_data = __toESM(require_form_data(), 1);
var FormData_default = import_form_data.default;

// node_modules/axios/lib/helpers/toFormData.js
var isVisitable = function(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
};
var removeBrackets = function(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
};
var renderKey = function(path, key, dots) {
  if (!path)
    return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
};
var isFlatArray = function(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
};
var toFormData = function(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (FormData_default || FormData);
  options = utils_default.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils_default.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null)
      return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]", convertValue(el));
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils_default.isUndefined(value))
      return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(formData, el, utils_default.isString(key) ? key.trim() : key, path, exposedHelpers);
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
};
var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
var toFormData_default = toFormData;

// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
var encode = function(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
};
var AxiosURLSearchParams = function(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
};
var prototype2 = AxiosURLSearchParams.prototype;
prototype2.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype2.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode);
  } : encode;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
var AxiosURLSearchParams_default = AxiosURLSearchParams;

// node_modules/axios/lib/helpers/buildURL.js
var encode2 = function(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
};
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode2;
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}

// node_modules/axios/lib/core/InterceptorManager.js
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  forEach(fn) {
    utils_default.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
var InterceptorManager_default = InterceptorManager;

// node_modules/axios/lib/defaults/transitional.js
var transitional_default = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};

// node_modules/axios/lib/platform/node/classes/URLSearchParams.js
import url from "url";
var URLSearchParams_default = url.URLSearchParams;

// node_modules/axios/lib/platform/node/index.js
var node_default = {
  isNode: true,
  classes: {
    URLSearchParams: URLSearchParams_default,
    FormData: FormData_default,
    Blob: typeof Blob !== "undefined" && Blob || null
  },
  protocols: ["http", "https", "file", "data"]
};

// node_modules/axios/lib/platform/common/utils.js
var exports_utils = {};
__export(exports_utils, {
  origin: () => {
    {
      return origin;
    }
  },
  hasStandardBrowserWebWorkerEnv: () => {
    {
      return hasStandardBrowserWebWorkerEnv;
    }
  },
  hasStandardBrowserEnv: () => {
    {
      return hasStandardBrowserEnv;
    }
  },
  hasBrowserEnv: () => {
    {
      return hasBrowserEnv;
    }
  }
});
var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
var hasStandardBrowserEnv = ((product) => {
  return hasBrowserEnv && ["ReactNative", "NativeScript", "NS"].indexOf(product) < 0;
})(typeof navigator !== "undefined" && navigator.product);
var hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
var origin = hasBrowserEnv && window.location.href || "http://localhost";

// node_modules/axios/lib/platform/index.js
var platform_default = {
  ...exports_utils,
  ...node_default
};

// node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
  return toFormData_default(data, new platform_default.classes.URLSearchParams, Object.assign({
    visitor: function(value, key, path, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    }
  }, options));
}

// node_modules/axios/lib/helpers/formDataToJSON.js
var parsePropPath = function(name) {
  return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
};
var arrayToObject = function(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0;i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
};
var formDataToJSON = function(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__")
      return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
};
var formDataToJSON_default = formDataToJSON;

// node_modules/axios/lib/defaults/index.js
var stringifySafely = function(rawValue, parser, encoder) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
};
var defaults = {
  transitional: transitional_default,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils_default.isObject(data);
    if (isObjectPayload && utils_default.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils_default.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
    }
    if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
      return data;
    }
    if (utils_default.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils_default.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData_default(isFileList2 ? { "files[]": data } : data, _FormData && new _FormData, this.formSerializer);
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
      return data;
    }
    if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform_default.classes.FormData,
    Blob: platform_default.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": undefined
    }
  }
};
utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
var defaults_default = defaults;

// node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf = utils_default.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var parseHeaders_default = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};

// node_modules/axios/lib/core/AxiosHeaders.js
var normalizeHeader = function(header) {
  return header && String(header).trim().toLowerCase();
};
var normalizeValue = function(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
};
var parseTokens = function(str) {
  const tokens = Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
};
var matchHeaderValue = function(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value))
    return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
};
var formatHeader = function(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
};
var buildAccessors = function(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
};
var $internals = Symbol("internals");
var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils_default.findKey(self2, lHeader);
      if (!key || self2[key] === undefined || _rewrite === true || _rewrite === undefined && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders_default(header), valueOrRewrite);
    } else if (utils_default.isHeaders(header)) {
      for (const [key, value] of header.entries()) {
        setHeader(value, key, rewrite);
      }
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils_default.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils_default.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils_default.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils_default.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils_default.forEach(this, (value, header) => {
      const key = utils_default.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = Object.create(null);
    utils_default.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype3 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype3, _header);
        accessors[lHeader] = true;
      }
    }
    utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
}
AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils_default.freezeMethods(AxiosHeaders);
var AxiosHeaders_default = AxiosHeaders;

// node_modules/axios/lib/core/transformData.js
function transformData(fns, response) {
  const config = this || defaults_default;
  const context = response || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data = context.data;
  utils_default.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });
  headers.normalize();
  return data;
}

// node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

// node_modules/axios/lib/cancel/CanceledError.js
var CanceledError = function(message, config, request) {
  AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
  this.name = "CanceledError";
};
utils_default.inherits(CanceledError, AxiosError_default, {
  __CANCEL__: true
});
var CanceledError_default = CanceledError;

// node_modules/axios/lib/core/settle.js
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError_default("Request failed with status code " + response.status, [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4], response.config, response.request, response));
  }
}

// node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url2) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
}

// node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}

// node_modules/axios/lib/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

// node_modules/proxy-from-env/index.js
var getProxyForUrl = function(url2) {
  var parsedUrl = typeof url2 === "string" ? parseUrl(url2) : url2 || {};
  var proto = parsedUrl.protocol;
  var hostname = parsedUrl.host;
  var port = parsedUrl.port;
  if (typeof hostname !== "string" || !hostname || typeof proto !== "string") {
    return "";
  }
  proto = proto.split(":", 1)[0];
  hostname = hostname.replace(/:\d*$/, "");
  port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
  if (!shouldProxy(hostname, port)) {
    return "";
  }
  var proxy = getEnv("npm_config_" + proto + "_proxy") || getEnv(proto + "_proxy") || getEnv("npm_config_proxy") || getEnv("all_proxy");
  if (proxy && proxy.indexOf("://") === -1) {
    proxy = proto + "://" + proxy;
  }
  return proxy;
};
var shouldProxy = function(hostname, port) {
  var NO_PROXY = (getEnv("npm_config_no_proxy") || getEnv("no_proxy")).toLowerCase();
  if (!NO_PROXY) {
    return true;
  }
  if (NO_PROXY === "*") {
    return false;
  }
  return NO_PROXY.split(/[,\s]/).every(function(proxy) {
    if (!proxy) {
      return true;
    }
    var parsedProxy = proxy.match(/^(.+):(\d+)$/);
    var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
    var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
    if (parsedProxyPort && parsedProxyPort !== port) {
      return true;
    }
    if (!/^[.*]/.test(parsedProxyHostname)) {
      return hostname !== parsedProxyHostname;
    }
    if (parsedProxyHostname.charAt(0) === "*") {
      parsedProxyHostname = parsedProxyHostname.slice(1);
    }
    return !stringEndsWith.call(hostname, parsedProxyHostname);
  });
};
var getEnv = function(key) {
  return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || "";
};
var parseUrl = import.meta.require("url").parse;
var DEFAULT_PORTS = {
  ftp: 21,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};
var stringEndsWith = String.prototype.endsWith || function(s) {
  return s.length <= this.length && this.indexOf(s, this.length - s.length) !== -1;
};
var $getProxyForUrl = getProxyForUrl;

// node_modules/axios/lib/adapters/http.js
var import_follow_redirects = __toESM(require_follow_redirects(), 1);
import http from "http";
import https from "https";
import util from "util";
import zlib from "zlib";

// node_modules/axios/lib/env/data.js
var VERSION = "1.7.2";

// node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url2) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url2);
  return match && match[1] || "";
}

// node_modules/axios/lib/helpers/fromDataURI.js
var DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;
function fromDataURI(uri, asBlob, options) {
  const _Blob = options && options.Blob || platform_default.classes.Blob;
  const protocol = parseProtocol(uri);
  if (asBlob === undefined && _Blob) {
    asBlob = true;
  }
  if (protocol === "data") {
    uri = protocol.length ? uri.slice(protocol.length + 1) : uri;
    const match = DATA_URL_PATTERN.exec(uri);
    if (!match) {
      throw new AxiosError_default("Invalid URL", AxiosError_default.ERR_INVALID_URL);
    }
    const mime = match[1];
    const isBase64 = match[2];
    const body = match[3];
    const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? "base64" : "utf8");
    if (asBlob) {
      if (!_Blob) {
        throw new AxiosError_default("Blob is not supported", AxiosError_default.ERR_NOT_SUPPORT);
      }
      return new _Blob([buffer], { type: mime });
    }
    return buffer;
  }
  throw new AxiosError_default("Unsupported protocol " + protocol, AxiosError_default.ERR_NOT_SUPPORT);
}

// node_modules/axios/lib/adapters/http.js
import stream3 from "stream";

// node_modules/axios/lib/helpers/AxiosTransformStream.js
import stream from "stream";

// node_modules/axios/lib/helpers/throttle.js
var throttle = function(fn, freq) {
  let timestamp = 0;
  const threshold = 1000 / freq;
  let timer = null;
  return function throttled() {
    const force = this === true;
    const now = Date.now();
    if (force || now - timestamp > threshold) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timestamp = now;
      return fn.apply(null, arguments);
    }
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        timestamp = Date.now();
        return fn.apply(null, arguments);
      }, threshold - (now - timestamp));
    }
  };
};
var throttle_default = throttle;

// node_modules/axios/lib/helpers/speedometer.js
var speedometer = function(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== undefined ? min : 1000;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
  };
};
var speedometer_default = speedometer;

// node_modules/axios/lib/helpers/AxiosTransformStream.js
var kInternals = Symbol("internals");

class AxiosTransformStream extends stream.Transform {
  constructor(options) {
    options = utils_default.toFlatObject(options, {
      maxRate: 0,
      chunkSize: 64 * 1024,
      minChunkSize: 100,
      timeWindow: 500,
      ticksRate: 2,
      samplesCount: 15
    }, null, (prop, source) => {
      return !utils_default.isUndefined(source[prop]);
    });
    super({
      readableHighWaterMark: options.chunkSize
    });
    const self2 = this;
    const internals = this[kInternals] = {
      length: options.length,
      timeWindow: options.timeWindow,
      ticksRate: options.ticksRate,
      chunkSize: options.chunkSize,
      maxRate: options.maxRate,
      minChunkSize: options.minChunkSize,
      bytesSeen: 0,
      isCaptured: false,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null
    };
    const _speedometer = speedometer_default(internals.ticksRate * options.samplesCount, internals.timeWindow);
    this.on("newListener", (event) => {
      if (event === "progress") {
        if (!internals.isCaptured) {
          internals.isCaptured = true;
        }
      }
    });
    let bytesNotified = 0;
    internals.updateProgress = throttle_default(function throttledHandler() {
      const totalBytes = internals.length;
      const bytesTransferred = internals.bytesSeen;
      const progressBytes = bytesTransferred - bytesNotified;
      if (!progressBytes || self2.destroyed)
        return;
      const rate = _speedometer(progressBytes);
      bytesNotified = bytesTransferred;
      process.nextTick(() => {
        self2.emit("progress", {
          loaded: bytesTransferred,
          total: totalBytes,
          progress: totalBytes ? bytesTransferred / totalBytes : undefined,
          bytes: progressBytes,
          rate: rate ? rate : undefined,
          estimated: rate && totalBytes && bytesTransferred <= totalBytes ? (totalBytes - bytesTransferred) / rate : undefined,
          lengthComputable: totalBytes != null
        });
      });
    }, internals.ticksRate);
    const onFinish = () => {
      internals.updateProgress.call(true);
    };
    this.once("end", onFinish);
    this.once("error", onFinish);
  }
  _read(size) {
    const internals = this[kInternals];
    if (internals.onReadCallback) {
      internals.onReadCallback();
    }
    return super._read(size);
  }
  _transform(chunk, encoding, callback) {
    const self2 = this;
    const internals = this[kInternals];
    const maxRate = internals.maxRate;
    const readableHighWaterMark = this.readableHighWaterMark;
    const timeWindow = internals.timeWindow;
    const divider = 1000 / timeWindow;
    const bytesThreshold = maxRate / divider;
    const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;
    function pushChunk(_chunk, _callback) {
      const bytes = Buffer.byteLength(_chunk);
      internals.bytesSeen += bytes;
      internals.bytes += bytes;
      if (internals.isCaptured) {
        internals.updateProgress();
      }
      if (self2.push(_chunk)) {
        process.nextTick(_callback);
      } else {
        internals.onReadCallback = () => {
          internals.onReadCallback = null;
          process.nextTick(_callback);
        };
      }
    }
    const transformChunk = (_chunk, _callback) => {
      const chunkSize = Buffer.byteLength(_chunk);
      let chunkRemainder = null;
      let maxChunkSize = readableHighWaterMark;
      let bytesLeft;
      let passed = 0;
      if (maxRate) {
        const now = Date.now();
        if (!internals.ts || (passed = now - internals.ts) >= timeWindow) {
          internals.ts = now;
          bytesLeft = bytesThreshold - internals.bytes;
          internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
          passed = 0;
        }
        bytesLeft = bytesThreshold - internals.bytes;
      }
      if (maxRate) {
        if (bytesLeft <= 0) {
          return setTimeout(() => {
            _callback(null, _chunk);
          }, timeWindow - passed);
        }
        if (bytesLeft < maxChunkSize) {
          maxChunkSize = bytesLeft;
        }
      }
      if (maxChunkSize && chunkSize > maxChunkSize && chunkSize - maxChunkSize > minChunkSize) {
        chunkRemainder = _chunk.subarray(maxChunkSize);
        _chunk = _chunk.subarray(0, maxChunkSize);
      }
      pushChunk(_chunk, chunkRemainder ? () => {
        process.nextTick(_callback, null, chunkRemainder);
      } : _callback);
    };
    transformChunk(chunk, function transformNextChunk(err, _chunk) {
      if (err) {
        return callback(err);
      }
      if (_chunk) {
        transformChunk(_chunk, transformNextChunk);
      } else {
        callback(null);
      }
    });
  }
  setLength(length) {
    this[kInternals].length = +length;
    return this;
  }
}
var AxiosTransformStream_default = AxiosTransformStream;

// node_modules/axios/lib/adapters/http.js
import {EventEmitter} from "events";

// node_modules/axios/lib/helpers/formDataToStream.js
import {TextEncoder as TextEncoder2} from "util";
import {Readable} from "stream";

// node_modules/axios/lib/helpers/readBlob.js
var { asyncIterator } = Symbol;
var readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream();
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer();
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
    yield blob;
  }
};
var readBlob_default = readBlob;

// node_modules/axios/lib/helpers/formDataToStream.js
var BOUNDARY_ALPHABET = utils_default.ALPHABET.ALPHA_DIGIT + "-_";
var textEncoder = new TextEncoder2;
var CRLF = "\r\n";
var CRLF_BYTES = textEncoder.encode(CRLF);
var CRLF_BYTES_COUNT = 2;

class FormDataPart {
  constructor(name, value) {
    const { escapeName } = this.constructor;
    const isStringValue = utils_default.isString(value);
    let headers = `Content-Disposition: form-data; name="${escapeName(name)}"${!isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ""}${CRLF}`;
    if (isStringValue) {
      value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
    } else {
      headers += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
    }
    this.headers = textEncoder.encode(headers + CRLF);
    this.contentLength = isStringValue ? value.byteLength : value.size;
    this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;
    this.name = name;
    this.value = value;
  }
  async* encode() {
    yield this.headers;
    const { value } = this;
    if (utils_default.isTypedArray(value)) {
      yield value;
    } else {
      yield* readBlob_default(value);
    }
    yield CRLF_BYTES;
  }
  static escapeName(name) {
    return String(name).replace(/[\r\n"]/g, (match) => ({
      "\r": "%0D",
      "\n": "%0A",
      '"': "%22"
    })[match]);
  }
}
var formDataToStream = (form, headersHandler, options) => {
  const {
    tag = "form-data-boundary",
    size = 25,
    boundary = tag + "-" + utils_default.generateString(size, BOUNDARY_ALPHABET)
  } = options || {};
  if (!utils_default.isFormData(form)) {
    throw TypeError("FormData instance required");
  }
  if (boundary.length < 1 || boundary.length > 70) {
    throw Error("boundary must be 10-70 characters long");
  }
  const boundaryBytes = textEncoder.encode("--" + boundary + CRLF);
  const footerBytes = textEncoder.encode("--" + boundary + "--" + CRLF + CRLF);
  let contentLength = footerBytes.byteLength;
  const parts = Array.from(form.entries()).map(([name, value]) => {
    const part = new FormDataPart(name, value);
    contentLength += part.size;
    return part;
  });
  contentLength += boundaryBytes.byteLength * parts.length;
  contentLength = utils_default.toFiniteNumber(contentLength);
  const computedHeaders = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`
  };
  if (Number.isFinite(contentLength)) {
    computedHeaders["Content-Length"] = contentLength;
  }
  headersHandler && headersHandler(computedHeaders);
  return Readable.from(async function* () {
    for (const part of parts) {
      yield boundaryBytes;
      yield* part.encode();
    }
    yield footerBytes;
  }());
};
var formDataToStream_default = formDataToStream;

// node_modules/axios/lib/helpers/ZlibHeaderTransformStream.js
import stream2 from "stream";

class ZlibHeaderTransformStream extends stream2.Transform {
  __transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
  _transform(chunk, encoding, callback) {
    if (chunk.length !== 0) {
      this._transform = this.__transform;
      if (chunk[0] !== 120) {
        const header = Buffer.alloc(2);
        header[0] = 120;
        header[1] = 156;
        this.push(header, encoding);
      }
    }
    this.__transform(chunk, encoding, callback);
  }
}
var ZlibHeaderTransformStream_default = ZlibHeaderTransformStream;

// node_modules/axios/lib/helpers/callbackify.js
var callbackify = (fn, reducer) => {
  return utils_default.isAsyncFn(fn) ? function(...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err) {
        cb(err);
      }
    }, cb);
  } : fn;
};
var callbackify_default = callbackify;

// node_modules/axios/lib/adapters/http.js
var dispatchBeforeRedirect = function(options, responseDetails) {
  if (options.beforeRedirects.proxy) {
    options.beforeRedirects.proxy(options);
  }
  if (options.beforeRedirects.config) {
    options.beforeRedirects.config(options, responseDetails);
  }
};
var setProxy = function(options, configProxy, location) {
  let proxy = configProxy;
  if (!proxy && proxy !== false) {
    const proxyUrl = $getProxyForUrl(location);
    if (proxyUrl) {
      proxy = new URL(proxyUrl);
    }
  }
  if (proxy) {
    if (proxy.username) {
      proxy.auth = (proxy.username || "") + ":" + (proxy.password || "");
    }
    if (proxy.auth) {
      if (proxy.auth.username || proxy.auth.password) {
        proxy.auth = (proxy.auth.username || "") + ":" + (proxy.auth.password || "");
      }
      const base64 = Buffer.from(proxy.auth, "utf8").toString("base64");
      options.headers["Proxy-Authorization"] = "Basic " + base64;
    }
    options.headers.host = options.hostname + (options.port ? ":" + options.port : "");
    const proxyHost = proxy.hostname || proxy.host;
    options.hostname = proxyHost;
    options.host = proxyHost;
    options.port = proxy.port;
    options.path = location;
    if (proxy.protocol) {
      options.protocol = proxy.protocol.includes(":") ? proxy.protocol : `${proxy.protocol}:`;
    }
  }
  options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
    setProxy(redirectOptions, configProxy, redirectOptions.href);
  };
};
var zlibOptions = {
  flush: zlib.constants.Z_SYNC_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH
};
var brotliOptions = {
  flush: zlib.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
};
var isBrotliSupported = utils_default.isFunction(zlib.createBrotliDecompress);
var { http: httpFollow, https: httpsFollow } = import_follow_redirects.default;
var isHttps = /https:?/;
var supportedProtocols = platform_default.protocols.map((protocol) => {
  return protocol + ":";
});
var isHttpAdapterSupported = typeof process !== "undefined" && utils_default.kindOf(process) === "process";
var wrapAsync = (asyncExecutor) => {
  return new Promise((resolve, reject) => {
    let onDone;
    let isDone;
    const done = (value, isRejected) => {
      if (isDone)
        return;
      isDone = true;
      onDone && onDone(value, isRejected);
    };
    const _resolve = (value) => {
      done(value);
      resolve(value);
    };
    const _reject = (reason) => {
      done(reason, true);
      reject(reason);
    };
    asyncExecutor(_resolve, _reject, (onDoneHandler) => onDone = onDoneHandler).catch(_reject);
  });
};
var resolveFamily = ({ address, family }) => {
  if (!utils_default.isString(address)) {
    throw TypeError("address must be a string");
  }
  return {
    address,
    family: family || (address.indexOf(".") < 0 ? 6 : 4)
  };
};
var buildAddressEntry = (address, family) => resolveFamily(utils_default.isObject(address) ? address : { address, family });
var http_default = isHttpAdapterSupported && function httpAdapter(config) {
  return wrapAsync(async function dispatchHttpRequest(resolve, reject, onDone) {
    let { data: data2, lookup, family } = config;
    const { responseType, responseEncoding } = config;
    const method = config.method.toUpperCase();
    let isDone;
    let rejected = false;
    let req;
    if (lookup) {
      const _lookup = callbackify_default(lookup, (value) => utils_default.isArray(value) ? value : [value]);
      lookup = (hostname, opt, cb) => {
        _lookup(hostname, opt, (err, arg0, arg1) => {
          if (err) {
            return cb(err);
          }
          const addresses = utils_default.isArray(arg0) ? arg0.map((addr) => buildAddressEntry(addr)) : [buildAddressEntry(arg0, arg1)];
          opt.all ? cb(err, addresses) : cb(err, addresses[0].address, addresses[0].family);
        });
      };
    }
    const emitter = new EventEmitter;
    const onFinished = () => {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(abort);
      }
      if (config.signal) {
        config.signal.removeEventListener("abort", abort);
      }
      emitter.removeAllListeners();
    };
    onDone((value, isRejected) => {
      isDone = true;
      if (isRejected) {
        rejected = true;
        onFinished();
      }
    });
    function abort(reason) {
      emitter.emit("abort", !reason || reason.type ? new CanceledError_default(null, config, req) : reason);
    }
    emitter.once("abort", reject);
    if (config.cancelToken || config.signal) {
      config.cancelToken && config.cancelToken.subscribe(abort);
      if (config.signal) {
        config.signal.aborted ? abort() : config.signal.addEventListener("abort", abort);
      }
    }
    const fullPath = buildFullPath(config.baseURL, config.url);
    const parsed = new URL(fullPath, "http://localhost");
    const protocol = parsed.protocol || supportedProtocols[0];
    if (protocol === "data:") {
      let convertedData;
      if (method !== "GET") {
        return settle(resolve, reject, {
          status: 405,
          statusText: "method not allowed",
          headers: {},
          config
        });
      }
      try {
        convertedData = fromDataURI(config.url, responseType === "blob", {
          Blob: config.env && config.env.Blob
        });
      } catch (err) {
        throw AxiosError_default.from(err, AxiosError_default.ERR_BAD_REQUEST, config);
      }
      if (responseType === "text") {
        convertedData = convertedData.toString(responseEncoding);
        if (!responseEncoding || responseEncoding === "utf8") {
          convertedData = utils_default.stripBOM(convertedData);
        }
      } else if (responseType === "stream") {
        convertedData = stream3.Readable.from(convertedData);
      }
      return settle(resolve, reject, {
        data: convertedData,
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders_default,
        config
      });
    }
    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError_default("Unsupported protocol " + protocol, AxiosError_default.ERR_BAD_REQUEST, config));
    }
    const headers = AxiosHeaders_default.from(config.headers).normalize();
    headers.set("User-Agent", "axios/" + VERSION, false);
    const onDownloadProgress = config.onDownloadProgress;
    const onUploadProgress = config.onUploadProgress;
    const maxRate = config.maxRate;
    let maxUploadRate = undefined;
    let maxDownloadRate = undefined;
    if (utils_default.isSpecCompliantForm(data2)) {
      const userBoundary = headers.getContentType(/boundary=([-_\w\d]{10,70})/i);
      data2 = formDataToStream_default(data2, (formHeaders) => {
        headers.set(formHeaders);
      }, {
        tag: `axios-${VERSION}-boundary`,
        boundary: userBoundary && userBoundary[1] || undefined
      });
    } else if (utils_default.isFormData(data2) && utils_default.isFunction(data2.getHeaders)) {
      headers.set(data2.getHeaders());
      if (!headers.hasContentLength()) {
        try {
          const knownLength = await util.promisify(data2.getLength).call(data2);
          Number.isFinite(knownLength) && knownLength >= 0 && headers.setContentLength(knownLength);
        } catch (e) {
        }
      }
    } else if (utils_default.isBlob(data2)) {
      data2.size && headers.setContentType(data2.type || "application/octet-stream");
      headers.setContentLength(data2.size || 0);
      data2 = stream3.Readable.from(readBlob_default(data2));
    } else if (data2 && !utils_default.isStream(data2)) {
      if (Buffer.isBuffer(data2)) {
      } else if (utils_default.isArrayBuffer(data2)) {
        data2 = Buffer.from(new Uint8Array(data2));
      } else if (utils_default.isString(data2)) {
        data2 = Buffer.from(data2, "utf-8");
      } else {
        return reject(new AxiosError_default("Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream", AxiosError_default.ERR_BAD_REQUEST, config));
      }
      headers.setContentLength(data2.length, false);
      if (config.maxBodyLength > -1 && data2.length > config.maxBodyLength) {
        return reject(new AxiosError_default("Request body larger than maxBodyLength limit", AxiosError_default.ERR_BAD_REQUEST, config));
      }
    }
    const contentLength = utils_default.toFiniteNumber(headers.getContentLength());
    if (utils_default.isArray(maxRate)) {
      maxUploadRate = maxRate[0];
      maxDownloadRate = maxRate[1];
    } else {
      maxUploadRate = maxDownloadRate = maxRate;
    }
    if (data2 && (onUploadProgress || maxUploadRate)) {
      if (!utils_default.isStream(data2)) {
        data2 = stream3.Readable.from(data2, { objectMode: false });
      }
      data2 = stream3.pipeline([data2, new AxiosTransformStream_default({
        length: contentLength,
        maxRate: utils_default.toFiniteNumber(maxUploadRate)
      })], utils_default.noop);
      onUploadProgress && data2.on("progress", (progress) => {
        onUploadProgress(Object.assign(progress, {
          upload: true
        }));
      });
    }
    let auth = undefined;
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password || "";
      auth = username + ":" + password;
    }
    if (!auth && parsed.username) {
      const urlUsername = parsed.username;
      const urlPassword = parsed.password;
      auth = urlUsername + ":" + urlPassword;
    }
    auth && headers.delete("authorization");
    let path;
    try {
      path = buildURL(parsed.pathname + parsed.search, config.params, config.paramsSerializer).replace(/^\?/, "");
    } catch (err) {
      const customErr = new Error(err.message);
      customErr.config = config;
      customErr.url = config.url;
      customErr.exists = true;
      return reject(customErr);
    }
    headers.set("Accept-Encoding", "gzip, compress, deflate" + (isBrotliSupported ? ", br" : ""), false);
    const options = {
      path,
      method,
      headers: headers.toJSON(),
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth,
      protocol,
      family,
      beforeRedirect: dispatchBeforeRedirect,
      beforeRedirects: {}
    };
    !utils_default.isUndefined(lookup) && (options.lookup = lookup);
    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
      setProxy(options, config.proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
    }
    let transport;
    const isHttpsRequest = isHttps.test(options.protocol);
    options.agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsRequest ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      if (config.beforeRedirect) {
        options.beforeRedirects.config = config.beforeRedirect;
      }
      transport = isHttpsRequest ? httpsFollow : httpFollow;
    }
    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    } else {
      options.maxBodyLength = Infinity;
    }
    if (config.insecureHTTPParser) {
      options.insecureHTTPParser = config.insecureHTTPParser;
    }
    req = transport.request(options, function handleResponse(res) {
      if (req.destroyed)
        return;
      const streams = [res];
      const responseLength = +res.headers["content-length"];
      if (onDownloadProgress) {
        const transformStream = new AxiosTransformStream_default({
          length: utils_default.toFiniteNumber(responseLength),
          maxRate: utils_default.toFiniteNumber(maxDownloadRate)
        });
        onDownloadProgress && transformStream.on("progress", (progress) => {
          onDownloadProgress(Object.assign(progress, {
            download: true
          }));
        });
        streams.push(transformStream);
      }
      let responseStream = res;
      const lastRequest = res.req || req;
      if (config.decompress !== false && res.headers["content-encoding"]) {
        if (method === "HEAD" || res.statusCode === 204) {
          delete res.headers["content-encoding"];
        }
        switch ((res.headers["content-encoding"] || "").toLowerCase()) {
          case "gzip":
          case "x-gzip":
          case "compress":
          case "x-compress":
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "deflate":
            streams.push(new ZlibHeaderTransformStream_default);
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "br":
            if (isBrotliSupported) {
              streams.push(zlib.createBrotliDecompress(brotliOptions));
              delete res.headers["content-encoding"];
            }
        }
      }
      responseStream = streams.length > 1 ? stream3.pipeline(streams, utils_default.noop) : streams[0];
      const offListeners = stream3.finished(responseStream, () => {
        offListeners();
        onFinished();
      });
      const response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: new AxiosHeaders_default(res.headers),
        config,
        request: lastRequest
      };
      if (responseType === "stream") {
        response.data = responseStream;
        settle(resolve, reject, response);
      } else {
        const responseBuffer = [];
        let totalResponseBytes = 0;
        responseStream.on("data", function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;
          if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
            rejected = true;
            responseStream.destroy();
            reject(new AxiosError_default("maxContentLength size of " + config.maxContentLength + " exceeded", AxiosError_default.ERR_BAD_RESPONSE, config, lastRequest));
          }
        });
        responseStream.on("aborted", function handlerStreamAborted() {
          if (rejected) {
            return;
          }
          const err = new AxiosError_default("maxContentLength size of " + config.maxContentLength + " exceeded", AxiosError_default.ERR_BAD_RESPONSE, config, lastRequest);
          responseStream.destroy(err);
          reject(err);
        });
        responseStream.on("error", function handleStreamError(err) {
          if (req.destroyed)
            return;
          reject(AxiosError_default.from(err, null, config, lastRequest));
        });
        responseStream.on("end", function handleStreamEnd() {
          try {
            let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (responseType !== "arraybuffer") {
              responseData = responseData.toString(responseEncoding);
              if (!responseEncoding || responseEncoding === "utf8") {
                responseData = utils_default.stripBOM(responseData);
              }
            }
            response.data = responseData;
          } catch (err) {
            return reject(AxiosError_default.from(err, null, config, response.request, response));
          }
          settle(resolve, reject, response);
        });
      }
      emitter.once("abort", (err) => {
        if (!responseStream.destroyed) {
          responseStream.emit("error", err);
          responseStream.destroy();
        }
      });
    });
    emitter.once("abort", (err) => {
      reject(err);
      req.destroy(err);
    });
    req.on("error", function handleRequestError(err) {
      reject(AxiosError_default.from(err, null, config, req));
    });
    req.on("socket", function handleRequestSocket(socket) {
      socket.setKeepAlive(true, 1000 * 60);
    });
    if (config.timeout) {
      const timeout = parseInt(config.timeout, 10);
      if (Number.isNaN(timeout)) {
        reject(new AxiosError_default("error trying to parse `config.timeout` to int", AxiosError_default.ERR_BAD_OPTION_VALUE, config, req));
        return;
      }
      req.setTimeout(timeout, function handleRequestTimeout() {
        if (isDone)
          return;
        let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional3 = config.transitional || transitional_default;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(new AxiosError_default(timeoutErrorMessage, transitional3.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED, config, req));
        abort();
      });
    }
    if (utils_default.isStream(data2)) {
      let ended = false;
      let errored = false;
      data2.on("end", () => {
        ended = true;
      });
      data2.once("error", (err) => {
        errored = true;
        req.destroy(err);
      });
      data2.on("close", () => {
        if (!ended && !errored) {
          abort(new CanceledError_default("Request stream has been aborted", config, req));
        }
      });
      data2.pipe(req);
    } else {
      req.end(data2);
    }
  });
};

// node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer_default = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer_default(50, 250);
  return throttle_default((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : undefined;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data2 = {
      loaded,
      total,
      progress: total ? loaded / total : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e,
      lengthComputable: total != null
    };
    data2[isDownloadStream ? "download" : "upload"] = true;
    listener(data2);
  }, freq);
};

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? function standardBrowserEnv() {
  const msie = /(msie|trident)/i.test(navigator.userAgent);
  const urlParsingNode = document.createElement("a");
  let originURL;
  function resolveURL(url2) {
    let href = url2;
    if (msie) {
      urlParsingNode.setAttribute("href", href);
      href = urlParsingNode.href;
    }
    urlParsingNode.setAttribute("href", href);
    return {
      href: urlParsingNode.href,
      protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
      host: urlParsingNode.host,
      search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
      hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
      hostname: urlParsingNode.hostname,
      port: urlParsingNode.port,
      pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
    };
  }
  originURL = resolveURL(window.location.href);
  return function isURLSameOrigin(requestURL) {
    const parsed = utils_default.isString(requestURL) ? resolveURL(requestURL) : requestURL;
    return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
  };
}() : function nonStandardBrowserEnv() {
  return function isURLSameOrigin() {
    return true;
  };
}();

// node_modules/axios/lib/helpers/cookies.js
var cookies_default = platform_default.hasStandardBrowserEnv ? {
  write(name, value, expires, path, domain, secure) {
    const cookie = [name + "=" + encodeURIComponent(value)];
    utils_default.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
    utils_default.isString(path) && cookie.push("path=" + path);
    utils_default.isString(domain) && cookie.push("domain=" + domain);
    secure === true && cookie.push("secure");
    document.cookie = cookie.join("; ");
  },
  read(name) {
    const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
    return match ? decodeURIComponent(match[3]) : null;
  },
  remove(name) {
    this.write(name, "", Date.now() - 86400000);
  }
} : {
  write() {
  },
  read() {
    return null;
  },
  remove() {
  }
};

// node_modules/axios/lib/core/mergeConfig.js
var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, caseless) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(a, b, caseless);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(undefined, a, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(undefined, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(undefined, b);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(undefined, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(undefined, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
  };
  utils_default.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}

// node_modules/axios/lib/helpers/resolveConfig.js
var resolveConfig_default = (config) => {
  const newConfig = mergeConfig({}, config);
  let { data: data2, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders_default.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url), config.params, config.paramsSerializer);
  if (auth) {
    headers.set("Authorization", "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : "")));
  }
  let contentType;
  if (utils_default.isFormData(data2)) {
    if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(undefined);
    } else if ((contentType = headers.getContentType()) !== false) {
      const [type, ...tokens] = contentType ? contentType.split(";").map((token) => token.trim()).filter(Boolean) : [];
      headers.setContentType([type || "multipart/form-data", ...tokens].join("; "));
    }
  }
  if (platform_default.hasStandardBrowserEnv) {
    withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};

// node_modules/axios/lib/adapters/xhr.js
var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
var xhr_default = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig_default(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
    let { responseType } = _config;
    let onCanceled;
    function done() {
      if (_config.cancelToken) {
        _config.cancelToken.unsubscribe(onCanceled);
      }
      if (_config.signal) {
        _config.signal.removeEventListener("abort", onCanceled);
      }
    }
    let request = new XMLHttpRequest;
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders_default.from("getAllResponseHeaders" in request && request.getAllResponseHeaders());
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, _config, request));
      request = null;
    };
    request.onerror = function handleError() {
      reject(new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, _config, request));
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional4 = _config.transitional || transitional_default;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError_default(timeoutErrorMessage, transitional4.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED, _config, request));
      request = null;
    };
    requestData === undefined && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils_default.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (typeof _config.onDownloadProgress === "function") {
      request.addEventListener("progress", progressEventReducer_default(_config.onDownloadProgress, true));
    }
    if (typeof _config.onUploadProgress === "function" && request.upload) {
      request.upload.addEventListener("progress", progressEventReducer_default(_config.onUploadProgress));
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};

// node_modules/axios/lib/helpers/composeSignals.js
var composeSignals = (signals, timeout) => {
  let controller = new AbortController;
  let aborted;
  const onabort = function(cancel) {
    if (!aborted) {
      aborted = true;
      unsubscribe();
      const err = cancel instanceof Error ? cancel : this.reason;
      controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
    }
  };
  let timer = timeout && setTimeout(() => {
    onabort(new AxiosError_default(`timeout ${timeout} of ms exceeded`, AxiosError_default.ETIMEDOUT));
  }, timeout);
  const unsubscribe = () => {
    if (signals) {
      timer && clearTimeout(timer);
      timer = null;
      signals.forEach((signal2) => {
        signal2 && (signal2.removeEventListener ? signal2.removeEventListener("abort", onabort) : signal2.unsubscribe(onabort));
      });
      signals = null;
    }
  };
  signals.forEach((signal2) => signal2 && signal2.addEventListener && signal2.addEventListener("abort", onabort));
  const { signal } = controller;
  signal.unsubscribe = unsubscribe;
  return [signal, () => {
    timer && clearTimeout(timer);
    timer = null;
  }];
};
var composeSignals_default = composeSignals;

// node_modules/axios/lib/helpers/trackStream.js
var streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (!chunkSize || len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
var readBytes = async function* (iterable, chunkSize, encode3) {
  for await (const chunk of iterable) {
    yield* streamChunk(ArrayBuffer.isView(chunk) ? chunk : await encode3(String(chunk)), chunkSize);
  }
};
var trackStream = (stream4, chunkSize, onProgress, onFinish, encode3) => {
  const iterator = readBytes(stream4, chunkSize, encode3);
  let bytes = 0;
  return new ReadableStream({
    type: "bytes",
    async pull(controller) {
      const { done, value } = await iterator.next();
      if (done) {
        controller.close();
        onFinish();
        return;
      }
      let len = value.byteLength;
      onProgress && onProgress(bytes += len);
      controller.enqueue(new Uint8Array(value));
    },
    cancel(reason) {
      onFinish(reason);
      return iterator.return();
    }
  }, {
    highWaterMark: 2
  });
};

// node_modules/axios/lib/adapters/fetch.js
var fetchProgressDecorator = (total, fn) => {
  const lengthComputable = total != null;
  return (loaded) => setTimeout(() => fn({
    lengthComputable,
    total,
    loaded
  }));
};
var isFetchSupported = typeof fetch === "function" && typeof Request === "function" && typeof Response === "function";
var isReadableStreamSupported = isFetchSupported && typeof ReadableStream === "function";
var encodeText = isFetchSupported && (typeof TextEncoder === "function" ? ((encoder) => (str) => encoder.encode(str))(new TextEncoder) : async (str) => new Uint8Array(await new Response(str).arrayBuffer()));
var supportsRequestStream = isReadableStreamSupported && (() => {
  let duplexAccessed = false;
  const hasContentType = new Request(platform_default.origin, {
    body: new ReadableStream,
    method: "POST",
    get duplex() {
      duplexAccessed = true;
      return "half";
    }
  }).headers.has("Content-Type");
  return duplexAccessed && !hasContentType;
})();
var DEFAULT_CHUNK_SIZE = 64 * 1024;
var supportsResponseStream = isReadableStreamSupported && !!(() => {
  try {
    return utils_default.isReadableStream(new Response("").body);
  } catch (err) {
  }
})();
var resolvers = {
  stream: supportsResponseStream && ((res) => res.body)
};
isFetchSupported && ((res) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
    !resolvers[type] && (resolvers[type] = utils_default.isFunction(res[type]) ? (res2) => res2[type]() : (_, config) => {
      throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
    });
  });
})(new Response);
var getBodyLength = async (body) => {
  if (body == null) {
    return 0;
  }
  if (utils_default.isBlob(body)) {
    return body.size;
  }
  if (utils_default.isSpecCompliantForm(body)) {
    return (await new Request(body).arrayBuffer()).byteLength;
  }
  if (utils_default.isArrayBufferView(body)) {
    return body.byteLength;
  }
  if (utils_default.isURLSearchParams(body)) {
    body = body + "";
  }
  if (utils_default.isString(body)) {
    return (await encodeText(body)).byteLength;
  }
};
var resolveBodyLength = async (headers, body) => {
  const length = utils_default.toFiniteNumber(headers.getContentLength());
  return length == null ? getBodyLength(body) : length;
};
var fetch_default = isFetchSupported && (async (config) => {
  let {
    url: url2,
    method,
    data: data2,
    signal,
    cancelToken,
    timeout,
    onDownloadProgress,
    onUploadProgress,
    responseType,
    headers,
    withCredentials = "same-origin",
    fetchOptions
  } = resolveConfig_default(config);
  responseType = responseType ? (responseType + "").toLowerCase() : "text";
  let [composedSignal, stopTimeout] = signal || cancelToken || timeout ? composeSignals_default([signal, cancelToken], timeout) : [];
  let finished, request;
  const onFinish = () => {
    !finished && setTimeout(() => {
      composedSignal && composedSignal.unsubscribe();
    });
    finished = true;
  };
  let requestContentLength;
  try {
    if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data2)) !== 0) {
      let _request = new Request(url2, {
        method: "POST",
        body: data2,
        duplex: "half"
      });
      let contentTypeHeader;
      if (utils_default.isFormData(data2) && (contentTypeHeader = _request.headers.get("content-type"))) {
        headers.setContentType(contentTypeHeader);
      }
      if (_request.body) {
        data2 = trackStream(_request.body, DEFAULT_CHUNK_SIZE, fetchProgressDecorator(requestContentLength, progressEventReducer_default(onUploadProgress)), null, encodeText);
      }
    }
    if (!utils_default.isString(withCredentials)) {
      withCredentials = withCredentials ? "cors" : "omit";
    }
    request = new Request(url2, {
      ...fetchOptions,
      signal: composedSignal,
      method: method.toUpperCase(),
      headers: headers.normalize().toJSON(),
      body: data2,
      duplex: "half",
      withCredentials
    });
    let response = await fetch(request);
    const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
    if (supportsResponseStream && (onDownloadProgress || isStreamResponse)) {
      const options = {};
      ["status", "statusText", "headers"].forEach((prop) => {
        options[prop] = response[prop];
      });
      const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
      response = new Response(trackStream(response.body, DEFAULT_CHUNK_SIZE, onDownloadProgress && fetchProgressDecorator(responseContentLength, progressEventReducer_default(onDownloadProgress, true)), isStreamResponse && onFinish, encodeText), options);
    }
    responseType = responseType || "text";
    let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
    !isStreamResponse && onFinish();
    stopTimeout && stopTimeout();
    return await new Promise((resolve, reject) => {
      settle(resolve, reject, {
        data: responseData,
        headers: AxiosHeaders_default.from(response.headers),
        status: response.status,
        statusText: response.statusText,
        config,
        request
      });
    });
  } catch (err) {
    onFinish();
    if (err && err.name === "TypeError" && /fetch/i.test(err.message)) {
      throw Object.assign(new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request), {
        cause: err.cause || err
      });
    }
    throw AxiosError_default.from(err, err && err.code, config, request);
  }
});

// node_modules/axios/lib/adapters/adapters.js
var knownAdapters = {
  http: http_default,
  xhr: xhr_default,
  fetch: fetch_default
};
utils_default.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
var renderReason = (reason) => `- ${reason}`;
var isResolvedHandle = (adapter) => utils_default.isFunction(adapter) || adapter === null || adapter === false;
var adapters_default = {
  getAdapter: (adapters) => {
    adapters = utils_default.isArray(adapters) ? adapters : [adapters];
    const { length } = adapters;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0;i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === undefined) {
          throw new AxiosError_default(`Unknown adapter '${id}'`);
        }
      }
      if (adapter) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build"));
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError_default(`There is no suitable adapter to dispatch the request ` + s, "ERR_NOT_SUPPORT");
    }
    return adapter;
  },
  adapters: knownAdapters
};

// node_modules/axios/lib/core/dispatchRequest.js
var throwIfCancellationRequested = function(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
};
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(config, config.transformRequest);
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters_default.getAdapter(config.adapter || defaults_default.adapter);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(config, config.transformResponse, response);
    response.headers = AxiosHeaders_default.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(config, config.transformResponse, reason.response);
        reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}

// node_modules/axios/lib/helpers/validator.js
var assertOptions = function(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
};
var validators = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
var deprecatedWarnings = {};
validators.transitional = function transitional4(validator, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION + "] Transitional option \'" + opt + "\'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator === false) {
      throw new AxiosError_default(formatMessage(opt, " has been removed" + (version ? " in " + version : "")), AxiosError_default.ERR_DEPRECATED);
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(formatMessage(opt, " has been deprecated since v" + version + " and will be removed in the near future"));
    }
    return validator ? validator(value, opt, opts) : true;
  };
};
var validator_default = {
  assertOptions,
  validators
};

// node_modules/axios/lib/core/Axios.js
var validators2 = validator_default.validators;

class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_default,
      response: new InterceptorManager_default
    };
  }
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy;
        Error.captureStackTrace ? Error.captureStackTrace(dummy = {}) : dummy = new Error;
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig(this.defaults, config);
    const { transitional: transitional5, paramsSerializer, headers } = config;
    if (transitional5 !== undefined) {
      validator_default.assertOptions(transitional5, {
        silentJSONParsing: validators2.transitional(validators2.boolean),
        forcedJSONParsing: validators2.transitional(validators2.boolean),
        clarifyTimeoutError: validators2.transitional(validators2.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils_default.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator_default.assertOptions(paramsSerializer, {
          encode: validators2.function,
          serialize: validators2.function
        }, true);
      }
    }
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils_default.merge(headers.common, headers[config.method]);
    headers && utils_default.forEach(["delete", "get", "head", "post", "put", "patch", "common"], (method) => {
      delete headers[method];
    });
    config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), undefined];
      chain.unshift.apply(chain, requestInterceptorChain);
      chain.push.apply(chain, responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i = 0;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
}
utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url2, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url: url2,
      data: (config || {}).data
    }));
  };
});
utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url2, data3, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: url2,
        data: data3
      }));
    };
  }
  Axios.prototype[method] = generateHTTPMethod();
  Axios.prototype[method + "Form"] = generateHTTPMethod(true);
});
var Axios_default = Axios;

// node_modules/axios/lib/cancel/CancelToken.js
class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners)
        return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError_default(message, config, request);
      resolvePromise(token.reason);
    });
  }
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
}
var CancelToken_default = CancelToken;

// node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

// node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}

// node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});
var HttpStatusCode_default = HttpStatusCode;

// node_modules/axios/lib/axios.js
var createInstance = function(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
};
var axios = createInstance(defaults_default);
axios.Axios = Axios_default;
axios.CanceledError = CanceledError_default;
axios.CancelToken = CancelToken_default;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData_default;
axios.AxiosError = AxiosError_default;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.mergeConfig = mergeConfig;
axios.AxiosHeaders = AxiosHeaders_default;
axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters_default.getAdapter;
axios.HttpStatusCode = HttpStatusCode_default;
axios.default = axios;
var axios_default = axios;

// node_modules/randomstring/lib/randomstring.js
var unsafeRandomBytes = function(length) {
  var stack = [];
  for (var i = 0;i < length; i++) {
    stack.push(Math.floor(Math.random() * 255));
  }
  return {
    length,
    readUInt8: function(index) {
      return stack[index];
    }
  };
};
var safeRandomBytes = function(length) {
  try {
    return randomBytes(length);
  } catch (e) {
    return unsafeRandomBytes(length);
  }
};
var processString = function(buf, initialString, chars, reqLen, maxByte) {
  var string = initialString;
  for (var i = 0;i < buf.length && string.length < reqLen; i++) {
    var randomByte = buf.readUInt8(i);
    if (randomByte < maxByte) {
      string += chars.charAt(randomByte % chars.length);
    }
  }
  return string;
};
var getAsyncString = function(string, chars, length, maxByte, cb) {
  randomBytes(length, function(err, buf) {
    if (err) {
      cb(err);
    }
    var generatedString = processString(buf, string, chars, length, maxByte);
    if (generatedString.length < length) {
      getAsyncString(generatedString, chars, length, maxByte, cb);
    } else {
      cb(null, generatedString);
    }
  });
};
var randomBytes = require_randombytes();
var Charset = require_charset();
var $generate = function(options, cb) {
  var charset = new Charset;
  var length, chars, capitalization, string = "";
  if (typeof options === "object") {
    length = typeof options.length === "number" ? options.length : 32;
    if (options.charset) {
      charset.setType(options.charset);
    } else {
      charset.setType("alphanumeric");
    }
    if (options.capitalization) {
      charset.setcapitalization(options.capitalization);
    }
    if (options.readable) {
      charset.removeUnreadable();
    }
    charset.removeDuplicates();
  } else if (typeof options === "number") {
    length = options;
    charset.setType("alphanumeric");
  } else {
    length = 32;
    charset.setType("alphanumeric");
  }
  var charsLen = charset.chars.length;
  var maxByte = 256 - 256 % charsLen;
  if (!cb) {
    while (string.length < length) {
      var buf = safeRandomBytes(Math.ceil(length * 256 / maxByte));
      string = processString(buf, string, charset.chars, length, maxByte);
    }
    return string;
  }
  getAsyncString(string, charset.chars, length, maxByte, cb);
};

// src/utils/qs.ts
var stringify = (data4) => new URLSearchParams(data4).toString();

// src/utils/md5.ts
var md5 = (msg) => {
  const hasher = new Bun.CryptoHasher("md5");
  hasher.update(msg);
  return hasher.digest("hex");
};

// src/m/ds.ts
var randStr = () => $generate({ length: 6, charset: "abcdefghijklmnopqrstuvwxyz0123456789" });
var ds = (web = false) => {
  const salt = web ? WEB_SALT : BBS_SALT;
  const t = Math.floor(Date.now() / 1000);
  const r = randStr();
  const m = md5(stringify({ salt, t, r }));
  return [t, r, m].join(",");
};
var ds2 = (data4) => {
  const salt = BBS_SALT_2;
  const t = Math.floor(Date.now() / 1000);
  const r = randStr();
  const m = md5(`${stringify({ salt, t, r })}&b=${JSON.stringify(data4)}&q=`);
  return [t, r, m].join(",");
};

// node_modules/uuid/wrapper.mjs
var dist = __toESM(require_dist(), 1);
var v1 = dist.default.v1;
var v1ToV6 = dist.default.v1ToV6;
var v3 = dist.default.v3;
var v4 = dist.default.v4;
var v5 = dist.default.v5;
var v6 = dist.default.v6;
var v6ToV1 = dist.default.v6ToV1;
var v7 = dist.default.v7;
var NIL = dist.default.NIL;
var MAX = dist.default.MAX;
var version = dist.default.version;
var validate = dist.default.validate;
var stringify2 = dist.default.stringify;
var parse = dist.default.parse;

// src/m/dvid.ts
var dvid = () => v4().replace(/-/g, "").toUpperCase();

// src/utils/retry.ts
var retryAsync = async (fn, onError, retry = 9, interval = 3000) => {
  try {
    return await fn();
  } catch (e) {
    if (retry <= 0)
      throw e;
    onError?.(e);
    await sleep(interval);
    return await retryAsync(fn, onError, retry - 1);
  }
};

// src/utils/mask.ts
var maskId = (uid, len = 3) => {
  uid = String(uid);
  return uid.substr(-len).padStart(uid.length, "*");
};

// src/utils/dama.ts
class DamaError extends Error {
  applySavingMode;
  constructor(message, applySavingMode = false) {
    super(message);
    this.applySavingMode = applySavingMode;
  }
}

class Dama {
  get savingModeAvailable() {
    return false;
  }
  get available() {
    return true;
  }
  gameCaptcha(gt, challenge, applySavingMode) {
    return this.geetest(gt, challenge, WEB_CAPTCHA_REFERER, applySavingMode);
  }
  bbsCaptcha(gt, challenge, applySavingMode) {
    return this.geetest(gt, challenge, BBS_CAPTCHA_REFERER, applySavingMode);
  }
  async geetest(gt, challenge, referer, applySavingMode) {
    return "";
  }
}

class RenrenDama extends Dama {
  token;
  constructor(token) {
    super();
    this.token = token;
  }
  get savingModeAvailable() {
    return true;
  }
  get available() {
    return !!this.token;
  }
  async geetest(gt, challenge, referer) {
    const { data: data4 } = await axios_default.post("http://api.rrocr.com/api/recognize.html", stringify({
      appkey: this.token,
      gt,
      challenge,
      referer
    }));
    if (data4.status !== 0) {
      throw new Error(`RR\u6253\u7801\u5931\u8D25\uFF1A(${data4.status})${data4.msg}`);
    }
    _log("RR\u6253\u7801\u6210\u529F");
    return data4.data.validate;
  }
}

class UnifiedDama extends Dama {
  constructor() {
    super(...arguments);
  }
  servers = [];
  get availableServers() {
    return this.servers.filter((server) => server.available);
  }
  get available() {
    return this.availableServers.length > 0;
  }
  get savingModeAvailable() {
    return !!this.availableServers[0]?.savingModeAvailable;
  }
  config(config3) {
    if (config3.rrocrAppkey)
      this.servers.push(new RenrenDama(config3.rrocrAppkey));
  }
  async geetest(gt, challenge, referer, applySavingMode) {
    for (const server of this.availableServers) {
      if (server.savingModeAvailable && applySavingMode) {
        throw new DamaError("\u8282\u7EA6\u6A21\u5F0F\u751F\u6548\uFF0C\u7EC8\u6B62\u6253\u7801", true);
      }
      try {
        return await server.geetest(gt, challenge, referer, applySavingMode);
      } catch (error) {
        if (server.available)
          throw error;
        _warn(error.toString());
      }
    }
    throw new Error("\u6253\u7801\u5168\u5931\u8D25");
  }
}
var dama = new UnifiedDama;

// src/m/client/base.ts
var awardsCache = new Map;

class MBaseClient {
  cookie;
  ua;
  savingMode;
  totalSignDay = NaN;
  _axios;
  constructor(cookie, ua, savingMode = false) {
    this.cookie = cookie;
    this.ua = ua;
    this.savingMode = savingMode;
  }
  get axios() {
    if (this._axios)
      return this._axios;
    this._axios = axios_default.create({
      timeout: 1e4,
      baseURL: WEB_API_BASE,
      headers: {
        ...this.config.headers,
        "x-rpc-device_id": dvid(),
        "x-rpc-client_type": WEB_CLIENT_TYPE,
        "x-rpc-app_version": APP_VERSION,
        referer: "https://act.mihoyo.com/",
        origin: "https://act.mihoyo.com",
        "user-agent": this.ua || DEFAULT_UA,
        cookie: this.cookie
      }
    });
    return this._axios;
  }
  get awards() {
    return awardsCache.get(this.config.actId);
  }
  set awards(val) {
    if (val)
      awardsCache.set(this.config.actId, val);
  }
  get award() {
    const award = this.awards?.[this.totalSignDay + 1];
    if (!award)
      return "\u672A\u77E5";
    return `${award.name}*${award.cnt}`;
  }
  get hasGotAllKeyAwards() {
    if (!this.awards || !this.totalSignDay)
      return false;
    const keyAwards = this.awards.filter(({ name }) => name === this.config.keyAward);
    const gotKeyAwards = this.awards.slice(0, this.totalSignDay).filter(({ name }) => name === this.config.keyAward);
    return keyAwards.length === gotKeyAwards.length;
  }
  get applySavingMode() {
    return this.savingMode && this.hasGotAllKeyAwards;
  }
  async getRoles() {
    try {
      return await retryAsync(() => this.axios.get(WEB_ROLES_URL, { params: { game_biz: this.config.biz } }).then(({ data: data4 }) => {
        const list = data4?.data?.list;
        if (!list) {
          _setFailed();
          _err(JSON.stringify(data4));
          return [];
        }
        return list;
      }), (e) => _warn("\u89D2\u8272\u4FE1\u606F\u8BF7\u6C42\u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5", e.toString()));
    } catch (e) {
      _setFailed();
      _err("\u89D2\u8272\u4FE1\u606F\u8BF7\u6C42\u5931\u8D25", e.toString());
      return [];
    }
  }
  async getSignStatus(role) {
    const { region, game_uid: uid, region_name: regionName } = role;
    const maskedUid = maskId(uid);
    try {
      return await retryAsync(async () => {
        const { data: data4 } = await this.axios.get(this.config.isSignUrl, { params: { act_id: this.config.actId, region, uid } });
        if (data4.retcode !== 0) {
          _err(maskedUid, regionName, `\u83B7\u53D6\u7B7E\u5230\u72B6\u6001\u5931\u8D25\uFF1A(${data4.retcode})${data4.message}`);
          return;
        }
        const { total_sign_day: totalSignDay, is_sign: isSign } = data4.data;
        this.totalSignDay = totalSignDay;
        _log(maskedUid, regionName, `\u5DF2\u7B7E\u5230${totalSignDay}\u5929`, `\u4ECA\u5929${isSign ? "\u5DF2\u7B7E\u5230" : "\u672A\u7B7E\u5230"}`);
        return { totalSignDay, isSign };
      }, (e) => _warn("\u83B7\u53D6\u7B7E\u5230\u72B6\u6001\u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5", e.toString()));
    } catch (e) {
      _err(maskedUid, regionName, "\u83B7\u53D6\u7B7E\u5230\u72B6\u6001\u5931\u8D25", e.toString());
    }
  }
  async signIn(role, captcha) {
    await this.fetchAwards();
    const { region, game_uid: uid } = role;
    const act_id = this.config.actId;
    try {
      await retryAsync(async () => {
        const { data: data4 } = await this.axios.post(this.config.signUrl, { act_id, region, uid }, {
          headers: {
            ds: ds(true),
            ...captcha ? {
              "x-rpc-challenge": captcha.challenge,
              "x-rpc-validate": captcha.validate,
              "x-rpc-seccode": `${captcha.validate}|jordan`
            } : {}
          }
        });
        switch (data4.retcode) {
          case 0:
            if (data4.data.success !== 0) {
              if (dama.available && !captcha) {
                if (this.applySavingMode && dama.savingModeAvailable) {
                  _log("\u51FA\u73B0\u9A8C\u8BC1\u7801\uFF0C\u8282\u7EA6\u6A21\u5F0F\u751F\u6548\uFF0C\u8DF3\u8FC7");
                  return;
                }
                _log("\u51FA\u73B0\u9A8C\u8BC1\u7801\uFF0C\u5C1D\u8BD5\u6253\u7801");
                const { gt, challenge } = data4.data;
                const validate2 = await dama.gameCaptcha(gt, challenge, this.applySavingMode);
                await this.signIn(role, { challenge, validate: validate2 });
                return;
              }
              _setFailed();
              _err("\u7531\u4E8E\u9A8C\u8BC1\u7801\uFF0C\u7B7E\u5230\u8BF7\u6C42\u5931\u8D25");
              break;
            }
            _log(`\u7B7E\u5230\u6210\u529F\uFF0C\u83B7\u5F97\u3010${this.award}\u3011`);
            break;
          case -5003:
            _warn(`\u7B7E\u5230\u5931\u8D25\uFF1A(${data4.retcode})${data4.message}`);
            return _warn;
          default:
            _setFailed();
            _err(`\u7B7E\u5230\u5931\u8D25\uFF1A(${data4.retcode})${data4.message}`);
            break;
        }
      }, (e) => {
        if (e.applySavingMode)
          throw e;
        _warn("\u7B7E\u5230\u8BF7\u6C42\u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5", e.toString());
      });
    } catch (e) {
      if (e.applySavingMode) {
        _log(e.toString());
        return;
      }
      _setFailed();
      _err("\u7B7E\u5230\u8BF7\u6C42\u5931\u8D25", e.toString());
    }
  }
  async fetchAwards() {
    if (this.awards)
      return;
    try {
      return await retryAsync(async () => {
        const { data: data4 } = await this.axios.get(this.config.awardsUrl, { params: { act_id: this.config.actId } });
        if (data4.retcode !== 0) {
          _err(`\u83B7\u53D6\u7B7E\u5230\u5956\u52B1\u4FE1\u606F\u5931\u8D25\uFF1A(${data4.retcode})${data4.message}`);
          return;
        }
        this.awards = data4.data.awards;
      }, (e) => _warn("\u83B7\u53D6\u7B7E\u5230\u5956\u52B1\u4FE1\u606F\u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5", e.toString()));
    } catch (e) {
      _err("\u83B7\u53D6\u7B7E\u5230\u5956\u52B1\u4FE1\u606F\u5931\u8D25", e.toString());
    }
  }
}

// src/m/client/gs.ts
class MGSClient extends MBaseClient {
  constructor() {
    super(...arguments);
  }
  config = {
    biz: GS_BIZ,
    actId: GS_ACT_ID,
    keyAward: "\u539F\u77F3",
    awardsUrl: WEB_AWARDS_URL,
    isSignUrl: WEB_IS_SIGN_URL,
    signUrl: WEB_SIGN_URL,
    headers: {
      "x-rpc-signgame": "hk4e"
    }
  };
}

// src/m/client/sr.ts
class MSRClient extends MBaseClient {
  constructor() {
    super(...arguments);
  }
  config = {
    biz: SR_BIZ,
    actId: SR_ACT_ID,
    keyAward: "\u661F\u743C",
    awardsUrl: WEB_AWARDS_URL,
    isSignUrl: WEB_IS_SIGN_URL,
    signUrl: WEB_SIGN_URL
  };
}

// node_modules/lodash-es/_freeGlobal.js
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var _freeGlobal_default = freeGlobal;

// node_modules/lodash-es/_root.js
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = _freeGlobal_default || freeSelf || Function("return this")();
var _root_default = root;

// node_modules/lodash-es/_Symbol.js
var Symbol2 = _root_default.Symbol;
var _Symbol_default = Symbol2;

// node_modules/lodash-es/_getRawTag.js
var getRawTag = function(value) {
  var isOwn = hasOwnProperty2.call(value, symToStringTag), tag = value[symToStringTag];
  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
};
var objectProto = Object.prototype;
var hasOwnProperty2 = objectProto.hasOwnProperty;
var nativeObjectToString = objectProto.toString;
var symToStringTag = _Symbol_default ? _Symbol_default.toStringTag : undefined;
var _getRawTag_default = getRawTag;

// node_modules/lodash-es/_objectToString.js
var objectToString = function(value) {
  return nativeObjectToString2.call(value);
};
var objectProto2 = Object.prototype;
var nativeObjectToString2 = objectProto2.toString;
var _objectToString_default = objectToString;

// node_modules/lodash-es/_baseGetTag.js
var baseGetTag = function(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag2 && symToStringTag2 in Object(value) ? _getRawTag_default(value) : _objectToString_default(value);
};
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var symToStringTag2 = _Symbol_default ? _Symbol_default.toStringTag : undefined;
var _baseGetTag_default = baseGetTag;

// node_modules/lodash-es/isObjectLike.js
var isObjectLike = function(value) {
  return value != null && typeof value == "object";
};
var isObjectLike_default = isObjectLike;

// node_modules/lodash-es/isSymbol.js
var isSymbol = function(value) {
  return typeof value == "symbol" || isObjectLike_default(value) && _baseGetTag_default(value) == symbolTag;
};
var symbolTag = "[object Symbol]";
var isSymbol_default = isSymbol;

// node_modules/lodash-es/_arrayMap.js
var arrayMap = function(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
};
var _arrayMap_default = arrayMap;

// node_modules/lodash-es/isArray.js
var isArray2 = Array.isArray;
var isArray_default = isArray2;

// node_modules/lodash-es/_baseToString.js
var baseToString = function(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray_default(value)) {
    return _arrayMap_default(value, baseToString) + "";
  }
  if (isSymbol_default(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
};
var INFINITY = 1 / 0;
var symbolProto = _Symbol_default ? _Symbol_default.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;
var _baseToString_default = baseToString;

// node_modules/lodash-es/isObject.js
var isObject2 = function(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
};
var isObject_default = isObject2;

// node_modules/lodash-es/identity.js
var identity = function(value) {
  return value;
};
var identity_default = identity;

// node_modules/lodash-es/isFunction.js
var isFunction2 = function(value) {
  if (!isObject_default(value)) {
    return false;
  }
  var tag = _baseGetTag_default(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
};
var asyncTag = "[object AsyncFunction]";
var funcTag = "[object Function]";
var genTag = "[object GeneratorFunction]";
var proxyTag = "[object Proxy]";
var isFunction_default = isFunction2;

// node_modules/lodash-es/_coreJsData.js
var coreJsData = _root_default["__core-js_shared__"];
var _coreJsData_default = coreJsData;

// node_modules/lodash-es/_isMasked.js
var isMasked = function(func) {
  return !!maskSrcKey && maskSrcKey in func;
};
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(_coreJsData_default && _coreJsData_default.keys && _coreJsData_default.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
var _isMasked_default = isMasked;

// node_modules/lodash-es/_toSource.js
var toSource = function(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
};
var funcProto = Function.prototype;
var funcToString = funcProto.toString;
var _toSource_default = toSource;

// node_modules/lodash-es/_baseIsNative.js
var baseIsNative = function(value) {
  if (!isObject_default(value) || _isMasked_default(value)) {
    return false;
  }
  var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource_default(value));
};
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto2 = Function.prototype;
var objectProto3 = Object.prototype;
var funcToString2 = funcProto2.toString;
var hasOwnProperty3 = objectProto3.hasOwnProperty;
var reIsNative = RegExp("^" + funcToString2.call(hasOwnProperty3).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
var _baseIsNative_default = baseIsNative;

// node_modules/lodash-es/_getValue.js
var getValue = function(object, key) {
  return object == null ? undefined : object[key];
};
var _getValue_default = getValue;

// node_modules/lodash-es/_getNative.js
var getNative = function(object, key) {
  var value = _getValue_default(object, key);
  return _baseIsNative_default(value) ? value : undefined;
};
var _getNative_default = getNative;

// node_modules/lodash-es/_WeakMap.js
var WeakMap2 = _getNative_default(_root_default, "WeakMap");
var _WeakMap_default = WeakMap2;

// node_modules/lodash-es/_copyArray.js
var copyArray = function(source, array) {
  var index = -1, length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
};
var _copyArray_default = copyArray;

// node_modules/lodash-es/_defineProperty.js
var defineProperty = function() {
  try {
    var func = _getNative_default(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
var _defineProperty_default = defineProperty;

// node_modules/lodash-es/_baseFindIndex.js
var baseFindIndex = function(array, predicate, fromIndex, fromRight) {
  var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
};
var _baseFindIndex_default = baseFindIndex;

// node_modules/lodash-es/_baseIsNaN.js
var baseIsNaN = function(value) {
  return value !== value;
};
var _baseIsNaN_default = baseIsNaN;

// node_modules/lodash-es/_strictIndexOf.js
var strictIndexOf = function(array, value, fromIndex) {
  var index = fromIndex - 1, length = array.length;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
};
var _strictIndexOf_default = strictIndexOf;

// node_modules/lodash-es/_baseIndexOf.js
var baseIndexOf = function(array, value, fromIndex) {
  return value === value ? _strictIndexOf_default(array, value, fromIndex) : _baseFindIndex_default(array, _baseIsNaN_default, fromIndex);
};
var _baseIndexOf_default = baseIndexOf;

// node_modules/lodash-es/_isIndex.js
var isIndex = function(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
};
var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
var _isIndex_default = isIndex;

// node_modules/lodash-es/_baseAssignValue.js
var baseAssignValue = function(object, key, value) {
  if (key == "__proto__" && _defineProperty_default) {
    _defineProperty_default(object, key, {
      configurable: true,
      enumerable: true,
      value,
      writable: true
    });
  } else {
    object[key] = value;
  }
};
var _baseAssignValue_default = baseAssignValue;

// node_modules/lodash-es/eq.js
var eq = function(value, other) {
  return value === other || value !== value && other !== other;
};
var eq_default = eq;

// node_modules/lodash-es/isLength.js
var isLength = function(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER2;
};
var MAX_SAFE_INTEGER2 = 9007199254740991;
var isLength_default = isLength;

// node_modules/lodash-es/isArrayLike.js
var isArrayLike = function(value) {
  return value != null && isLength_default(value.length) && !isFunction_default(value);
};
var isArrayLike_default = isArrayLike;

// node_modules/lodash-es/_isPrototype.js
var isPrototype = function(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto4;
  return value === proto;
};
var objectProto4 = Object.prototype;
var _isPrototype_default = isPrototype;

// node_modules/lodash-es/_baseTimes.js
var baseTimes = function(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
};
var _baseTimes_default = baseTimes;

// node_modules/lodash-es/_baseIsArguments.js
var baseIsArguments = function(value) {
  return isObjectLike_default(value) && _baseGetTag_default(value) == argsTag;
};
var argsTag = "[object Arguments]";
var _baseIsArguments_default = baseIsArguments;

// node_modules/lodash-es/isArguments.js
var objectProto5 = Object.prototype;
var hasOwnProperty4 = objectProto5.hasOwnProperty;
var propertyIsEnumerable = objectProto5.propertyIsEnumerable;
var isArguments = _baseIsArguments_default(function() {
  return arguments;
}()) ? _baseIsArguments_default : function(value) {
  return isObjectLike_default(value) && hasOwnProperty4.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
};
var isArguments_default = isArguments;

// node_modules/lodash-es/isBuffer.js
var exports_isBuffer = {};
__export(exports_isBuffer, {
  default: () => {
    {
      return isBuffer_default;
    }
  }
});

// node_modules/lodash-es/stubFalse.js
var stubFalse = function() {
  return false;
};
var stubFalse_default = stubFalse;

// node_modules/lodash-es/isBuffer.js
var freeExports = typeof exports_isBuffer == "object" && exports_isBuffer && !exports_isBuffer.nodeType && exports_isBuffer;
var freeModule = freeExports && typeof module_isBuffer == "object" && module_isBuffer && !module_isBuffer.nodeType && module_isBuffer;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer2 = moduleExports ? _root_default.Buffer : undefined;
var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : undefined;
var isBuffer2 = nativeIsBuffer || stubFalse_default;
var isBuffer_default = isBuffer2;

// node_modules/lodash-es/_baseIsTypedArray.js
var baseIsTypedArray = function(value) {
  return isObjectLike_default(value) && isLength_default(value.length) && !!typedArrayTags[_baseGetTag_default(value)];
};
var argsTag2 = "[object Arguments]";
var arrayTag = "[object Array]";
var boolTag = "[object Boolean]";
var dateTag = "[object Date]";
var errorTag = "[object Error]";
var funcTag2 = "[object Function]";
var mapTag = "[object Map]";
var numberTag = "[object Number]";
var objectTag = "[object Object]";
var regexpTag = "[object RegExp]";
var setTag = "[object Set]";
var stringTag = "[object String]";
var weakMapTag = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]";
var dataViewTag = "[object DataView]";
var float32Tag = "[object Float32Array]";
var float64Tag = "[object Float64Array]";
var int8Tag = "[object Int8Array]";
var int16Tag = "[object Int16Array]";
var int32Tag = "[object Int32Array]";
var uint8Tag = "[object Uint8Array]";
var uint8ClampedTag = "[object Uint8ClampedArray]";
var uint16Tag = "[object Uint16Array]";
var uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag2] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag2] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
var _baseIsTypedArray_default = baseIsTypedArray;

// node_modules/lodash-es/_baseUnary.js
var baseUnary = function(func) {
  return function(value) {
    return func(value);
  };
};
var _baseUnary_default = baseUnary;

// node_modules/lodash-es/_nodeUtil.js
var exports__nodeUtil = {};
__export(exports__nodeUtil, {
  default: () => {
    {
      return _nodeUtil_default;
    }
  }
});
var freeExports2 = typeof exports__nodeUtil == "object" && exports__nodeUtil && !exports__nodeUtil.nodeType && exports__nodeUtil;
var freeModule2 = freeExports2 && typeof module__nodeUtil == "object" && module__nodeUtil && !module__nodeUtil.nodeType && module__nodeUtil;
var moduleExports2 = freeModule2 && freeModule2.exports === freeExports2;
var freeProcess = moduleExports2 && _freeGlobal_default.process;
var nodeUtil = function() {
  try {
    var types = freeModule2 && freeModule2.require && freeModule2.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {
  }
}();
var _nodeUtil_default = nodeUtil;

// node_modules/lodash-es/isTypedArray.js
var nodeIsTypedArray = _nodeUtil_default && _nodeUtil_default.isTypedArray;
var isTypedArray2 = nodeIsTypedArray ? _baseUnary_default(nodeIsTypedArray) : _baseIsTypedArray_default;
var isTypedArray_default = isTypedArray2;

// node_modules/lodash-es/_arrayLikeKeys.js
var arrayLikeKeys = function(value, inherited) {
  var isArr = isArray_default(value), isArg = !isArr && isArguments_default(value), isBuff = !isArr && !isArg && isBuffer_default(value), isType = !isArr && !isArg && !isBuff && isTypedArray_default(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? _baseTimes_default(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty5.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || _isIndex_default(key, length)))) {
      result.push(key);
    }
  }
  return result;
};
var objectProto6 = Object.prototype;
var hasOwnProperty5 = objectProto6.hasOwnProperty;
var _arrayLikeKeys_default = arrayLikeKeys;

// node_modules/lodash-es/_overArg.js
var overArg = function(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
};
var _overArg_default = overArg;

// node_modules/lodash-es/_nativeKeys.js
var nativeKeys = _overArg_default(Object.keys, Object);
var _nativeKeys_default = nativeKeys;

// node_modules/lodash-es/_baseKeys.js
var baseKeys = function(object) {
  if (!_isPrototype_default(object)) {
    return _nativeKeys_default(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty6.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
};
var objectProto7 = Object.prototype;
var hasOwnProperty6 = objectProto7.hasOwnProperty;
var _baseKeys_default = baseKeys;

// node_modules/lodash-es/keys.js
var keys = function(object) {
  return isArrayLike_default(object) ? _arrayLikeKeys_default(object) : _baseKeys_default(object);
};
var keys_default = keys;

// node_modules/lodash-es/_isKey.js
var isKey = function(value, object) {
  if (isArray_default(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
};
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
var _isKey_default = isKey;

// node_modules/lodash-es/_nativeCreate.js
var nativeCreate = _getNative_default(Object, "create");
var _nativeCreate_default = nativeCreate;

// node_modules/lodash-es/_hashClear.js
var hashClear = function() {
  this.__data__ = _nativeCreate_default ? _nativeCreate_default(null) : {};
  this.size = 0;
};
var _hashClear_default = hashClear;

// node_modules/lodash-es/_hashDelete.js
var hashDelete = function(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
};
var _hashDelete_default = hashDelete;

// node_modules/lodash-es/_hashGet.js
var hashGet = function(key) {
  var data4 = this.__data__;
  if (_nativeCreate_default) {
    var result = data4[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty7.call(data4, key) ? data4[key] : undefined;
};
var HASH_UNDEFINED = "__lodash_hash_undefined__";
var objectProto8 = Object.prototype;
var hasOwnProperty7 = objectProto8.hasOwnProperty;
var _hashGet_default = hashGet;

// node_modules/lodash-es/_hashHas.js
var hashHas = function(key) {
  var data4 = this.__data__;
  return _nativeCreate_default ? data4[key] !== undefined : hasOwnProperty8.call(data4, key);
};
var objectProto9 = Object.prototype;
var hasOwnProperty8 = objectProto9.hasOwnProperty;
var _hashHas_default = hashHas;

// node_modules/lodash-es/_hashSet.js
var hashSet = function(key, value) {
  var data4 = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data4[key] = _nativeCreate_default && value === undefined ? HASH_UNDEFINED2 : value;
  return this;
};
var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
var _hashSet_default = hashSet;

// node_modules/lodash-es/_Hash.js
var Hash = function(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
};
Hash.prototype.clear = _hashClear_default;
Hash.prototype["delete"] = _hashDelete_default;
Hash.prototype.get = _hashGet_default;
Hash.prototype.has = _hashHas_default;
Hash.prototype.set = _hashSet_default;
var _Hash_default = Hash;

// node_modules/lodash-es/_listCacheClear.js
var listCacheClear = function() {
  this.__data__ = [];
  this.size = 0;
};
var _listCacheClear_default = listCacheClear;

// node_modules/lodash-es/_assocIndexOf.js
var assocIndexOf = function(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_default(array[length][0], key)) {
      return length;
    }
  }
  return -1;
};
var _assocIndexOf_default = assocIndexOf;

// node_modules/lodash-es/_listCacheDelete.js
var listCacheDelete = function(key) {
  var data4 = this.__data__, index = _assocIndexOf_default(data4, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data4.length - 1;
  if (index == lastIndex) {
    data4.pop();
  } else {
    splice.call(data4, index, 1);
  }
  --this.size;
  return true;
};
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
var _listCacheDelete_default = listCacheDelete;

// node_modules/lodash-es/_listCacheGet.js
var listCacheGet = function(key) {
  var data4 = this.__data__, index = _assocIndexOf_default(data4, key);
  return index < 0 ? undefined : data4[index][1];
};
var _listCacheGet_default = listCacheGet;

// node_modules/lodash-es/_listCacheHas.js
var listCacheHas = function(key) {
  return _assocIndexOf_default(this.__data__, key) > -1;
};
var _listCacheHas_default = listCacheHas;

// node_modules/lodash-es/_listCacheSet.js
var listCacheSet = function(key, value) {
  var data4 = this.__data__, index = _assocIndexOf_default(data4, key);
  if (index < 0) {
    ++this.size;
    data4.push([key, value]);
  } else {
    data4[index][1] = value;
  }
  return this;
};
var _listCacheSet_default = listCacheSet;

// node_modules/lodash-es/_ListCache.js
var ListCache = function(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
};
ListCache.prototype.clear = _listCacheClear_default;
ListCache.prototype["delete"] = _listCacheDelete_default;
ListCache.prototype.get = _listCacheGet_default;
ListCache.prototype.has = _listCacheHas_default;
ListCache.prototype.set = _listCacheSet_default;
var _ListCache_default = ListCache;

// node_modules/lodash-es/_Map.js
var Map2 = _getNative_default(_root_default, "Map");
var _Map_default = Map2;

// node_modules/lodash-es/_mapCacheClear.js
var mapCacheClear = function() {
  this.size = 0;
  this.__data__ = {
    hash: new _Hash_default,
    map: new (_Map_default || _ListCache_default),
    string: new _Hash_default
  };
};
var _mapCacheClear_default = mapCacheClear;

// node_modules/lodash-es/_isKeyable.js
var isKeyable = function(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
};
var _isKeyable_default = isKeyable;

// node_modules/lodash-es/_getMapData.js
var getMapData = function(map, key) {
  var data4 = map.__data__;
  return _isKeyable_default(key) ? data4[typeof key == "string" ? "string" : "hash"] : data4.map;
};
var _getMapData_default = getMapData;

// node_modules/lodash-es/_mapCacheDelete.js
var mapCacheDelete = function(key) {
  var result = _getMapData_default(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
};
var _mapCacheDelete_default = mapCacheDelete;

// node_modules/lodash-es/_mapCacheGet.js
var mapCacheGet = function(key) {
  return _getMapData_default(this, key).get(key);
};
var _mapCacheGet_default = mapCacheGet;

// node_modules/lodash-es/_mapCacheHas.js
var mapCacheHas = function(key) {
  return _getMapData_default(this, key).has(key);
};
var _mapCacheHas_default = mapCacheHas;

// node_modules/lodash-es/_mapCacheSet.js
var mapCacheSet = function(key, value) {
  var data4 = _getMapData_default(this, key), size = data4.size;
  data4.set(key, value);
  this.size += data4.size == size ? 0 : 1;
  return this;
};
var _mapCacheSet_default = mapCacheSet;

// node_modules/lodash-es/_MapCache.js
var MapCache = function(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
};
MapCache.prototype.clear = _mapCacheClear_default;
MapCache.prototype["delete"] = _mapCacheDelete_default;
MapCache.prototype.get = _mapCacheGet_default;
MapCache.prototype.has = _mapCacheHas_default;
MapCache.prototype.set = _mapCacheSet_default;
var _MapCache_default = MapCache;

// node_modules/lodash-es/memoize.js
var memoize = function(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || _MapCache_default);
  return memoized;
};
var FUNC_ERROR_TEXT = "Expected a function";
memoize.Cache = _MapCache_default;
var memoize_default = memoize;

// node_modules/lodash-es/_memoizeCapped.js
var memoizeCapped = function(func) {
  var result = memoize_default(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
};
var MAX_MEMOIZE_SIZE = 500;
var _memoizeCapped_default = memoizeCapped;

// node_modules/lodash-es/_stringToPath.js
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = _memoizeCapped_default(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
var _stringToPath_default = stringToPath;

// node_modules/lodash-es/toString.js
var toString3 = function(value) {
  return value == null ? "" : _baseToString_default(value);
};
var toString_default = toString3;

// node_modules/lodash-es/_castPath.js
var castPath = function(value, object) {
  if (isArray_default(value)) {
    return value;
  }
  return _isKey_default(value, object) ? [value] : _stringToPath_default(toString_default(value));
};
var _castPath_default = castPath;

// node_modules/lodash-es/_toKey.js
var toKey = function(value) {
  if (typeof value == "string" || isSymbol_default(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY2 ? "-0" : result;
};
var INFINITY2 = 1 / 0;
var _toKey_default = toKey;

// node_modules/lodash-es/_baseGet.js
var baseGet = function(object, path) {
  path = _castPath_default(path, object);
  var index = 0, length = path.length;
  while (object != null && index < length) {
    object = object[_toKey_default(path[index++])];
  }
  return index && index == length ? object : undefined;
};
var _baseGet_default = baseGet;

// node_modules/lodash-es/get.js
var get = function(object, path, defaultValue) {
  var result = object == null ? undefined : _baseGet_default(object, path);
  return result === undefined ? defaultValue : result;
};
var get_default = get;

// node_modules/lodash-es/_arrayPush.js
var arrayPush = function(array, values) {
  var index = -1, length = values.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
};
var _arrayPush_default = arrayPush;

// node_modules/lodash-es/_stackClear.js
var stackClear = function() {
  this.__data__ = new _ListCache_default;
  this.size = 0;
};
var _stackClear_default = stackClear;

// node_modules/lodash-es/_stackDelete.js
var stackDelete = function(key) {
  var data4 = this.__data__, result = data4["delete"](key);
  this.size = data4.size;
  return result;
};
var _stackDelete_default = stackDelete;

// node_modules/lodash-es/_stackGet.js
var stackGet = function(key) {
  return this.__data__.get(key);
};
var _stackGet_default = stackGet;

// node_modules/lodash-es/_stackHas.js
var stackHas = function(key) {
  return this.__data__.has(key);
};
var _stackHas_default = stackHas;

// node_modules/lodash-es/_stackSet.js
var stackSet = function(key, value) {
  var data4 = this.__data__;
  if (data4 instanceof _ListCache_default) {
    var pairs = data4.__data__;
    if (!_Map_default || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data4.size;
      return this;
    }
    data4 = this.__data__ = new _MapCache_default(pairs);
  }
  data4.set(key, value);
  this.size = data4.size;
  return this;
};
var LARGE_ARRAY_SIZE = 200;
var _stackSet_default = stackSet;

// node_modules/lodash-es/_Stack.js
var Stack = function(entries) {
  var data4 = this.__data__ = new _ListCache_default(entries);
  this.size = data4.size;
};
Stack.prototype.clear = _stackClear_default;
Stack.prototype["delete"] = _stackDelete_default;
Stack.prototype.get = _stackGet_default;
Stack.prototype.has = _stackHas_default;
Stack.prototype.set = _stackSet_default;
var _Stack_default = Stack;

// node_modules/lodash-es/_arrayFilter.js
var arrayFilter = function(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
};
var _arrayFilter_default = arrayFilter;

// node_modules/lodash-es/stubArray.js
var stubArray = function() {
  return [];
};
var stubArray_default = stubArray;

// node_modules/lodash-es/_getSymbols.js
var objectProto10 = Object.prototype;
var propertyIsEnumerable2 = objectProto10.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray_default : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter_default(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable2.call(object, symbol);
  });
};
var _getSymbols_default = getSymbols;

// node_modules/lodash-es/_baseGetAllKeys.js
var baseGetAllKeys = function(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_default(object) ? result : _arrayPush_default(result, symbolsFunc(object));
};
var _baseGetAllKeys_default = baseGetAllKeys;

// node_modules/lodash-es/_getAllKeys.js
var getAllKeys = function(object) {
  return _baseGetAllKeys_default(object, keys_default, _getSymbols_default);
};
var _getAllKeys_default = getAllKeys;

// node_modules/lodash-es/_DataView.js
var DataView = _getNative_default(_root_default, "DataView");
var _DataView_default = DataView;

// node_modules/lodash-es/_Promise.js
var Promise2 = _getNative_default(_root_default, "Promise");
var _Promise_default = Promise2;

// node_modules/lodash-es/_Set.js
var Set2 = _getNative_default(_root_default, "Set");
var _Set_default = Set2;

// node_modules/lodash-es/_getTag.js
var mapTag2 = "[object Map]";
var objectTag2 = "[object Object]";
var promiseTag = "[object Promise]";
var setTag2 = "[object Set]";
var weakMapTag2 = "[object WeakMap]";
var dataViewTag2 = "[object DataView]";
var dataViewCtorString = _toSource_default(_DataView_default);
var mapCtorString = _toSource_default(_Map_default);
var promiseCtorString = _toSource_default(_Promise_default);
var setCtorString = _toSource_default(_Set_default);
var weakMapCtorString = _toSource_default(_WeakMap_default);
var getTag = _baseGetTag_default;
if (_DataView_default && getTag(new _DataView_default(new ArrayBuffer(1))) != dataViewTag2 || _Map_default && getTag(new _Map_default) != mapTag2 || _Promise_default && getTag(_Promise_default.resolve()) != promiseTag || _Set_default && getTag(new _Set_default) != setTag2 || _WeakMap_default && getTag(new _WeakMap_default) != weakMapTag2) {
  getTag = function(value) {
    var result = _baseGetTag_default(value), Ctor = result == objectTag2 ? value.constructor : undefined, ctorString = Ctor ? _toSource_default(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag2;
        case mapCtorString:
          return mapTag2;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag2;
        case weakMapCtorString:
          return weakMapTag2;
      }
    }
    return result;
  };
}
var _getTag_default = getTag;

// node_modules/lodash-es/_Uint8Array.js
var Uint8Array2 = _root_default.Uint8Array;
var _Uint8Array_default = Uint8Array2;

// node_modules/lodash-es/_setCacheAdd.js
var setCacheAdd = function(value) {
  this.__data__.set(value, HASH_UNDEFINED3);
  return this;
};
var HASH_UNDEFINED3 = "__lodash_hash_undefined__";
var _setCacheAdd_default = setCacheAdd;

// node_modules/lodash-es/_setCacheHas.js
var setCacheHas = function(value) {
  return this.__data__.has(value);
};
var _setCacheHas_default = setCacheHas;

// node_modules/lodash-es/_SetCache.js
var SetCache = function(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new _MapCache_default;
  while (++index < length) {
    this.add(values[index]);
  }
};
SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd_default;
SetCache.prototype.has = _setCacheHas_default;
var _SetCache_default = SetCache;

// node_modules/lodash-es/_arraySome.js
var arraySome = function(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
};
var _arraySome_default = arraySome;

// node_modules/lodash-es/_cacheHas.js
var cacheHas = function(cache, key) {
  return cache.has(key);
};
var _cacheHas_default = cacheHas;

// node_modules/lodash-es/_equalArrays.js
var equalArrays = function(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new _SetCache_default : undefined;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!_arraySome_default(other, function(othValue2, othIndex) {
        if (!_cacheHas_default(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
};
var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;
var _equalArrays_default = equalArrays;

// node_modules/lodash-es/_mapToArray.js
var mapToArray = function(map) {
  var index = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
};
var _mapToArray_default = mapToArray;

// node_modules/lodash-es/_setToArray.js
var setToArray = function(set) {
  var index = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
};
var _setToArray_default = setToArray;

// node_modules/lodash-es/_equalByTag.js
var equalByTag = function(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag3:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag2:
      if (object.byteLength != other.byteLength || !equalFunc(new _Uint8Array_default(object), new _Uint8Array_default(other))) {
        return false;
      }
      return true;
    case boolTag2:
    case dateTag2:
    case numberTag2:
      return eq_default(+object, +other);
    case errorTag2:
      return object.name == other.name && object.message == other.message;
    case regexpTag2:
    case stringTag2:
      return object == other + "";
    case mapTag3:
      var convert = _mapToArray_default;
    case setTag3:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG2;
      convert || (convert = _setToArray_default);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG2;
      stack.set(object, other);
      var result = _equalArrays_default(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag2:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
};
var COMPARE_PARTIAL_FLAG2 = 1;
var COMPARE_UNORDERED_FLAG2 = 2;
var boolTag2 = "[object Boolean]";
var dateTag2 = "[object Date]";
var errorTag2 = "[object Error]";
var mapTag3 = "[object Map]";
var numberTag2 = "[object Number]";
var regexpTag2 = "[object RegExp]";
var setTag3 = "[object Set]";
var stringTag2 = "[object String]";
var symbolTag2 = "[object Symbol]";
var arrayBufferTag2 = "[object ArrayBuffer]";
var dataViewTag3 = "[object DataView]";
var symbolProto2 = _Symbol_default ? _Symbol_default.prototype : undefined;
var symbolValueOf = symbolProto2 ? symbolProto2.valueOf : undefined;
var _equalByTag_default = equalByTag;

// node_modules/lodash-es/_equalObjects.js
var equalObjects = function(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG3, objProps = _getAllKeys_default(object), objLength = objProps.length, othProps = _getAllKeys_default(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty9.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && (("constructor" in object) && ("constructor" in other)) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
};
var COMPARE_PARTIAL_FLAG3 = 1;
var objectProto11 = Object.prototype;
var hasOwnProperty9 = objectProto11.hasOwnProperty;
var _equalObjects_default = equalObjects;

// node_modules/lodash-es/_baseIsEqualDeep.js
var baseIsEqualDeep = function(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_default(object), othIsArr = isArray_default(other), objTag = objIsArr ? arrayTag2 : _getTag_default(object), othTag = othIsArr ? arrayTag2 : _getTag_default(other);
  objTag = objTag == argsTag3 ? objectTag3 : objTag;
  othTag = othTag == argsTag3 ? objectTag3 : othTag;
  var objIsObj = objTag == objectTag3, othIsObj = othTag == objectTag3, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer_default(object)) {
    if (!isBuffer_default(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new _Stack_default);
    return objIsArr || isTypedArray_default(object) ? _equalArrays_default(object, other, bitmask, customizer, equalFunc, stack) : _equalByTag_default(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG4)) {
    var objIsWrapped = objIsObj && hasOwnProperty10.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty10.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new _Stack_default);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new _Stack_default);
  return _equalObjects_default(object, other, bitmask, customizer, equalFunc, stack);
};
var COMPARE_PARTIAL_FLAG4 = 1;
var argsTag3 = "[object Arguments]";
var arrayTag2 = "[object Array]";
var objectTag3 = "[object Object]";
var objectProto12 = Object.prototype;
var hasOwnProperty10 = objectProto12.hasOwnProperty;
var _baseIsEqualDeep_default = baseIsEqualDeep;

// node_modules/lodash-es/_baseIsEqual.js
var baseIsEqual = function(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike_default(value) && !isObjectLike_default(other)) {
    return value !== value && other !== other;
  }
  return _baseIsEqualDeep_default(value, other, bitmask, customizer, baseIsEqual, stack);
};
var _baseIsEqual_default = baseIsEqual;

// node_modules/lodash-es/_baseIsMatch.js
var baseIsMatch = function(object, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data4 = matchData[index];
    if (noCustomizer && data4[2] ? data4[1] !== object[data4[0]] : !(data4[0] in object)) {
      return false;
    }
  }
  while (++index < length) {
    data4 = matchData[index];
    var key = data4[0], objValue = object[key], srcValue = data4[1];
    if (noCustomizer && data4[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new _Stack_default;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined ? _baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG5 | COMPARE_UNORDERED_FLAG3, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
};
var COMPARE_PARTIAL_FLAG5 = 1;
var COMPARE_UNORDERED_FLAG3 = 2;
var _baseIsMatch_default = baseIsMatch;

// node_modules/lodash-es/_isStrictComparable.js
var isStrictComparable = function(value) {
  return value === value && !isObject_default(value);
};
var _isStrictComparable_default = isStrictComparable;

// node_modules/lodash-es/_getMatchData.js
var getMatchData = function(object) {
  var result = keys_default(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, _isStrictComparable_default(value)];
  }
  return result;
};
var _getMatchData_default = getMatchData;

// node_modules/lodash-es/_matchesStrictComparable.js
var matchesStrictComparable = function(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== undefined || (key in Object(object)));
  };
};
var _matchesStrictComparable_default = matchesStrictComparable;

// node_modules/lodash-es/_baseMatches.js
var baseMatches = function(source) {
  var matchData = _getMatchData_default(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return _matchesStrictComparable_default(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || _baseIsMatch_default(object, source, matchData);
  };
};
var _baseMatches_default = baseMatches;

// node_modules/lodash-es/_baseHasIn.js
var baseHasIn = function(object, key) {
  return object != null && key in Object(object);
};
var _baseHasIn_default = baseHasIn;

// node_modules/lodash-es/_hasPath.js
var hasPath = function(object, path, hasFunc) {
  path = _castPath_default(path, object);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = _toKey_default(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength_default(length) && _isIndex_default(key, length) && (isArray_default(object) || isArguments_default(object));
};
var _hasPath_default = hasPath;

// node_modules/lodash-es/hasIn.js
var hasIn = function(object, path) {
  return object != null && _hasPath_default(object, path, _baseHasIn_default);
};
var hasIn_default = hasIn;

// node_modules/lodash-es/_baseMatchesProperty.js
var baseMatchesProperty = function(path, srcValue) {
  if (_isKey_default(path) && _isStrictComparable_default(srcValue)) {
    return _matchesStrictComparable_default(_toKey_default(path), srcValue);
  }
  return function(object) {
    var objValue = get_default(object, path);
    return objValue === undefined && objValue === srcValue ? hasIn_default(object, path) : _baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG6 | COMPARE_UNORDERED_FLAG4);
  };
};
var COMPARE_PARTIAL_FLAG6 = 1;
var COMPARE_UNORDERED_FLAG4 = 2;
var _baseMatchesProperty_default = baseMatchesProperty;

// node_modules/lodash-es/_baseProperty.js
var baseProperty = function(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
};
var _baseProperty_default = baseProperty;

// node_modules/lodash-es/_basePropertyDeep.js
var basePropertyDeep = function(path) {
  return function(object) {
    return _baseGet_default(object, path);
  };
};
var _basePropertyDeep_default = basePropertyDeep;

// node_modules/lodash-es/property.js
var property = function(path) {
  return _isKey_default(path) ? _baseProperty_default(_toKey_default(path)) : _basePropertyDeep_default(path);
};
var property_default = property;

// node_modules/lodash-es/_baseIteratee.js
var baseIteratee = function(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity_default;
  }
  if (typeof value == "object") {
    return isArray_default(value) ? _baseMatchesProperty_default(value[0], value[1]) : _baseMatches_default(value);
  }
  return property_default(value);
};
var _baseIteratee_default = baseIteratee;

// node_modules/lodash-es/_arrayAggregator.js
var arrayAggregator = function(array, setter, iteratee, accumulator) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    var value = array[index];
    setter(accumulator, value, iteratee(value), array);
  }
  return accumulator;
};
var _arrayAggregator_default = arrayAggregator;

// node_modules/lodash-es/_createBaseFor.js
var createBaseFor = function(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
};
var _createBaseFor_default = createBaseFor;

// node_modules/lodash-es/_baseFor.js
var baseFor = _createBaseFor_default();
var _baseFor_default = baseFor;

// node_modules/lodash-es/_baseForOwn.js
var baseForOwn = function(object, iteratee) {
  return object && _baseFor_default(object, iteratee, keys_default);
};
var _baseForOwn_default = baseForOwn;

// node_modules/lodash-es/_createBaseEach.js
var createBaseEach = function(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike_default(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
};
var _createBaseEach_default = createBaseEach;

// node_modules/lodash-es/_baseEach.js
var baseEach = _createBaseEach_default(_baseForOwn_default);
var _baseEach_default = baseEach;

// node_modules/lodash-es/_baseAggregator.js
var baseAggregator = function(collection, setter, iteratee, accumulator) {
  _baseEach_default(collection, function(value, key, collection2) {
    setter(accumulator, value, iteratee(value), collection2);
  });
  return accumulator;
};
var _baseAggregator_default = baseAggregator;

// node_modules/lodash-es/_createAggregator.js
var createAggregator = function(setter, initializer) {
  return function(collection, iteratee) {
    var func = isArray_default(collection) ? _arrayAggregator_default : _baseAggregator_default, accumulator = initializer ? initializer() : {};
    return func(collection, setter, _baseIteratee_default(iteratee, 2), accumulator);
  };
};
var _createAggregator_default = createAggregator;

// node_modules/lodash-es/_baseMap.js
var baseMap = function(collection, iteratee) {
  var index = -1, result = isArrayLike_default(collection) ? Array(collection.length) : [];
  _baseEach_default(collection, function(value, key, collection2) {
    result[++index] = iteratee(value, key, collection2);
  });
  return result;
};
var _baseMap_default = baseMap;

// node_modules/lodash-es/map.js
var map = function(collection, iteratee) {
  var func = isArray_default(collection) ? _arrayMap_default : _baseMap_default;
  return func(collection, _baseIteratee_default(iteratee, 3));
};
var map_default = map;

// node_modules/lodash-es/keyBy.js
var keyBy = _createAggregator_default(function(result, value, key) {
  _baseAssignValue_default(result, key, value);
});
var keyBy_default = keyBy;
// node_modules/lodash-es/_baseIndexOfWith.js
var baseIndexOfWith = function(array, value, fromIndex, comparator) {
  var index = fromIndex - 1, length = array.length;
  while (++index < length) {
    if (comparator(array[index], value)) {
      return index;
    }
  }
  return -1;
};
var _baseIndexOfWith_default = baseIndexOfWith;

// node_modules/lodash-es/_basePullAll.js
var basePullAll = function(array, values, iteratee, comparator) {
  var indexOf = comparator ? _baseIndexOfWith_default : _baseIndexOf_default, index = -1, length = values.length, seen = array;
  if (array === values) {
    values = _copyArray_default(values);
  }
  if (iteratee) {
    seen = _arrayMap_default(array, _baseUnary_default(iteratee));
  }
  while (++index < length) {
    var fromIndex = 0, value = values[index], computed = iteratee ? iteratee(value) : value;
    while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
      if (seen !== array) {
        splice2.call(seen, fromIndex, 1);
      }
      splice2.call(array, fromIndex, 1);
    }
  }
  return array;
};
var arrayProto2 = Array.prototype;
var splice2 = arrayProto2.splice;
var _basePullAll_default = basePullAll;

// node_modules/lodash-es/pullAll.js
var pullAll = function(array, values) {
  return array && array.length && values && values.length ? _basePullAll_default(array, values) : array;
};
var pullAll_default = pullAll;
// src/utils/cookie.ts
class Cookie extends Map {
  constructor(cookie) {
    super(cookie.split(";").map((kvStr) => {
      const [key, ...value] = kvStr.split("=");
      return [key.trim(), value.join("=").trim()];
    }));
  }
  toString() {
    return Array.from(this.entries()).map(([key, value]) => `${key}=${value}`).join("; ");
  }
}

// src/m/client/coin.ts
var forumMap = {
  gs: {
    id: 2,
    forumId: 26
  },
  sr: {
    id: 6,
    forumId: 52
  }
};

class MCClient {
  savingMode;
  static postIdsMap = new Map;
  static failedPostIdsMap = new Map;
  axios;
  forum = "gs";
  constructor({ cookie: cookie2, stoken, ua, forum }, savingMode = false) {
    this.savingMode = savingMode;
    const cookieMap = new Cookie(cookie2);
    const stuid = cookieMap.get("login_uid") || cookieMap.get("ltuid") || cookieMap.get("account_id");
    if (!stuid)
      throw new Error("Cookie \u4E0D\u5B8C\u6574\uFF0C\u8BF7\u5C1D\u8BD5\u91CD\u65B0\u83B7\u53D6");
    cookieMap.set("stuid", stuid);
    cookieMap.set("stoken", stoken);
    if (forum)
      this.forum = forum;
    this.axios = axios_default.create({
      headers: {
        "x-rpc-client_type": BBS_CLIENT_TYPE,
        "x-rpc-app_version": APP_VERSION,
        "x-rpc-sys_version": "12",
        "x-rpc-channel": "miyousheluodi",
        "x-rpc-device_name": "XiaoMi",
        "x-rpc-device_model": "Mi 10",
        "x-rpc-device_id": dvid(),
        ds: ds(),
        referer: "https://app.mihoyo.com",
        cookie: cookieMap.toString(),
        "user-agent": ua || DEFAULT_UA
      }
    });
  }
  get applySavingMode() {
    return this.savingMode;
  }
  get gids() {
    return forumMap[this.forum].id;
  }
  get forumId() {
    return forumMap[this.forum].forumId;
  }
  get postIds() {
    if (!MCClient.postIdsMap.has(this.forumId)) {
      MCClient.postIdsMap.set(this.forumId, []);
    }
    return MCClient.postIdsMap.get(this.forumId);
  }
  set postIds(ids) {
    MCClient.postIdsMap.set(this.forumId, ids);
  }
  get failedPostIds() {
    if (!MCClient.failedPostIdsMap.has(this.forumId)) {
      MCClient.failedPostIdsMap.set(this.forumId, []);
    }
    return MCClient.failedPostIdsMap.get(this.forumId);
  }
  set failedPostIds(ids) {
    MCClient.failedPostIdsMap.set(this.forumId, ids);
  }
  async doTasks() {
    const taskList = await this.getTaskList();
    if (!taskList)
      return;
    if (!taskList.length) {
      _log("\u4EFB\u52A1\u5DF2\u5168\u90E8\u5B8C\u6210");
      return;
    }
    await this.fetchPostIds();
    if (!this.postIds.length) {
      _warn("\u65E0\u8D34\u53EF\u7528");
      _setFailed();
    }
    for (const { times, func } of taskList) {
      await func.call(this, times);
    }
  }
  async getTaskList() {
    try {
      const taskMap = {
        58: {
          times: 1,
          func: this.signIn
        },
        59: {
          times: 3,
          func: this.viewPost
        },
        60: {
          times: 5,
          func: this.likePost
        },
        61: {
          times: 1,
          func: this.sharePost
        }
      };
      const {
        data: { retcode, message, data: data4 }
      } = await this.axios.get(BBS_TASK_LIST_URL);
      if (retcode !== 0) {
        _err(`\u83B7\u53D6\u4EFB\u52A1\u5217\u8868\u5931\u8D25(${retcode})\uFF1A${message}`);
        _setFailed();
        return;
      }
      const taskStateMap = keyBy_default(data4.states, "mission_id");
      return map_default(taskMap, ({ times, func }, id) => ({
        times: times - (taskStateMap[id]?.happened_times ?? 0),
        func
      })).filter(({ times }) => times > 0);
    } catch (e) {
      _err("\u83B7\u53D6\u4EFB\u52A1\u5217\u8868\u5931\u8D25", e);
      _setFailed();
    }
  }
  async signIn(times, challenge) {
    try {
      const postData = { gids: this.gids };
      const {
        data: { retcode, message, data: data4 }
      } = await retryAsync(() => this.axios.post(BBS_SIGN_URL, postData, {
        headers: {
          ds: ds2(postData),
          ...challenge ? { "x-rpc-challenge": challenge } : {}
        }
      }), (e) => _warn("\u7B7E\u5230\u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5", e.toString()));
      if (retcode === 0) {
        _log(`\u7B7E\u5230\u6210\u529F\uFF0C\u83B7\u5F97 ${data4?.points || "?"} \u5E01`);
        return;
      }
      if (retcode === 1034) {
        if (dama.available && !challenge) {
          if (this.applySavingMode && dama.savingModeAvailable) {
            _log("\u51FA\u73B0\u9A8C\u8BC1\u7801\uFF0C\u8282\u7EA6\u6A21\u5F0F\u751F\u6548\uFF0C\u8DF3\u8FC7");
            return;
          }
          _log("\u51FA\u73B0\u9A8C\u8BC1\u7801\uFF0C\u5C1D\u8BD5\u6253\u7801");
          const challenge2 = await this.getChallenge();
          if (challenge2) {
            await this.signIn(times, challenge2);
            return;
          }
        }
        _err("\u7531\u4E8E\u9A8C\u8BC1\u7801\uFF0C\u7B7E\u5230\u8BF7\u6C42\u5931\u8D25");
        _setFailed();
        return;
      }
      _err(`\u7B7E\u5230\u5931\u8D25(${retcode})\uFF1A${message}`);
      _setFailed();
    } catch (e) {
      if (e.applySavingMode) {
        _log(e.toString());
        return;
      }
      _err("\u7B7E\u5230\u5931\u8D25", e);
      _setFailed();
    }
  }
  async fetchPostIds() {
    if (this.postIds.length)
      return;
    try {
      const {
        data: { retcode, message, data: data4 }
      } = await retryAsync(() => axios_default.get(BBS_POST_LIST_URL_OLD, {
        params: {
          forum_id: this.forumId,
          gids: this.gids,
          is_good: false,
          is_hot: false,
          page_size: 20,
          sort_type: 1
        }
      }), (e) => _warn(`\u83B7\u53D6\u5E16\u5B50\u5217\u8868(${this.forum})\u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5`, e.toString()));
      if (retcode !== 0) {
        _err(`\u83B7\u53D6\u5E16\u5B50\u5217\u8868(${this.forum})\u5931\u8D25(${retcode})\uFF1A${message}`);
        _setFailed();
        return;
      }
      this.postIds = data4?.list.map((item) => item.post.post_id) || [];
    } catch (e) {
      _err(`\u83B7\u53D6\u5E16\u5B50\u5217\u8868(${this.forum})\u5931\u8D25`, e);
      _setFailed();
    }
  }
  async viewPost(times = 3, postIds = this.postIds) {
    times += 1;
    let success = 0;
    for (const post_id of postIds) {
      if (success >= times)
        break;
      await sleep(1000);
      const maskedPostId = maskId(post_id);
      try {
        const {
          data: { retcode, message }
        } = await retryAsync(() => this.axios.get(BBS_VIEW_POST_URL, { params: { post_id } }), (e) => _warn(`\u770B\u5E16 ${maskedPostId} \u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5`, e.toString()));
        if (retcode !== 0) {
          _warn(`\u770B\u5E16 ${maskedPostId} \u5931\u8D25(${retcode})\uFF1A${message}`);
          this.markFailedPostId(post_id);
          continue;
        }
        success++;
        _log(`\u770B\u5E16 ${maskedPostId} \u6210\u529F`);
      } catch (e) {
        _warn(`\u770B\u5E16 ${maskedPostId} \u5931\u8D25`, e);
      }
    }
    if (success < times) {
      _err(`\u672A\u80FD\u5B8C\u6210\u770B\u5E16 ${times} \u4E2A\u4EFB\u52A1`);
      _setFailed();
    }
    this.removeFailedPostIds();
  }
  async likePost(times = 5, postIds = this.postIds) {
    times += 1;
    let success = 0;
    for (const post_id of postIds) {
      if (success >= times)
        break;
      await sleep(1000);
      const maskedPostId = maskId(post_id);
      try {
        const {
          data: { retcode, message }
        } = await retryAsync(() => this.axios.post(BBS_LIKE_POST_URL, { post_id, is_cancel: false }), (e) => _warn(`\u70B9\u8D5E ${maskedPostId} \u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5`, e.toString()));
        if (retcode !== 0) {
          _warn(`\u70B9\u8D5E ${maskedPostId} \u5931\u8D25(${retcode})\uFF1A${message}`);
          this.markFailedPostId(post_id);
          continue;
        }
        success++;
        _log(`\u70B9\u8D5E ${maskedPostId} \u6210\u529F`);
        await sleep(500);
        try {
          const {
            data: { retcode: retcode2, message: message2 }
          } = await retryAsync(() => this.axios.post(BBS_LIKE_POST_URL, { post_id, is_cancel: true }), (e) => _warn(`\u53D6\u6D88\u70B9\u8D5E ${maskedPostId} \u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5`, e.toString()));
          if (retcode2 !== 0) {
            _warn(`\u53D6\u6D88\u70B9\u8D5E ${maskedPostId} \u5931\u8D25(${retcode2})\uFF1A${message2}`);
          }
        } catch (e) {
          _warn(`\u53D6\u6D88\u70B9\u8D5E ${maskedPostId} \u5931\u8D25`, e);
        }
      } catch (e) {
        _warn(`\u70B9\u8D5E ${maskedPostId} \u5931\u8D25`, e);
      }
    }
    if (success < times) {
      _err(`\u672A\u80FD\u5B8C\u6210\u70B9\u8D5E ${times} \u6B21\u4EFB\u52A1`);
      _setFailed();
    }
    this.removeFailedPostIds();
  }
  async sharePost(times = 1, postIds = this.postIds) {
    let success = 0;
    for (const post_id of postIds) {
      if (success >= times)
        break;
      await sleep(1000);
      const maskedPostId = maskId(post_id);
      try {
        const {
          data: { retcode, message }
        } = await retryAsync(() => this.axios.get(BBS_SHARE_POST_URL, {
          params: { entity_id: post_id, entity_type: 1 }
        }), (e) => _warn(`\u5206\u4EAB ${maskedPostId} \u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5`, e.toString()));
        if (retcode !== 0) {
          _warn(`\u5206\u4EAB ${maskedPostId} \u5931\u8D25(${retcode})\uFF1A${message}`);
          this.markFailedPostId(post_id);
          continue;
        }
        success++;
        _log(`\u5206\u4EAB ${maskedPostId} \u6210\u529F`);
      } catch (e) {
        _warn(`\u5206\u4EAB ${maskedPostId} \u5931\u8D25`, e);
      }
    }
    if (success < times) {
      _err(`\u672A\u80FD\u5B8C\u6210\u5206\u4EAB ${times} \u6B21\u4EFB\u52A1`);
      _setFailed();
    }
    this.removeFailedPostIds();
  }
  getChallenge() {
    return retryAsync(async () => {
      const { data: gtData } = await this.axios.get("https://bbs-api.mihoyo.com/misc/api/createVerification?is_high=true");
      if (gtData.retcode !== 0)
        return;
      const { gt, challenge } = gtData.data;
      const validate2 = await dama.bbsCaptcha(gt, challenge);
      const { data: checkData } = await this.axios.post("https://bbs-api.mihoyo.com/misc/api/verifyVerification", {
        geetest_challenge: challenge,
        geetest_seccode: `${validate2}|jordan`,
        geetest_validate: validate2
      });
      if (checkData.retcode === 0)
        return checkData.data.challenge;
    }, (e) => _warn("\u9A8C\u8BC1\u7801\u5931\u8D25\uFF0C\u8FDB\u884C\u91CD\u8BD5", e.toString()));
  }
  markFailedPostId(id) {
    this.failedPostIds.push(id);
  }
  removeFailedPostIds() {
    if (!this.failedPostIds.length)
      return;
    pullAll_default(this.postIds, this.failedPostIds);
    this.failedPostIds = [];
  }
}

// src/m/client/index.ts
class MClient {
  clients = [];
  coinClient;
  constructor(options, savingMode) {
    let {
      cookie: cookie2,
      stoken,
      ua,
      forum,
      enableGs = true,
      enableSr = false
    } = typeof options === "string" ? { cookie: options } : options;
    if (!cookie2)
      throw new Error("cookie is required");
    if (ua) {
      const bbsUaReg = /miHoYoBBS\/[\d.]+$/;
      if (bbsUaReg.test(ua))
        ua = ua.replace(bbsUaReg, "miHoYoBBS/2.34.1");
      else
        ua = ua.replace(/ *$/, " miHoYoBBS/2.34.1");
    }
    if (enableGs)
      this.clients.push(new MGSClient(cookie2, ua, savingMode));
    if (enableSr)
      this.clients.push(new MSRClient(cookie2, ua, savingMode));
    if (stoken)
      this.coinClient = new MCClient({ cookie: cookie2, stoken, ua, forum }, savingMode);
  }
  async signIn() {
    for (const client of this.clients) {
      const roles = await client.getRoles();
      for (const role of roles) {
        const status = await client.getSignStatus(role);
        if (status?.isSign)
          continue;
        await client.signIn(role);
        await sleep(3000);
      }
    }
  }
  async earnCoin() {
    if (!this.coinClient)
      return;
    await this.coinClient.doTasks();
  }
}

// src/index.ts
var readJsonSync = (path) => JSON.parse(readFileSync(path).toString());
var getConfig = async () => {
  let config7 = {};
  if (process.env.CONFIG_URL) {
    try {
      const data4 = await fetch(process.env.CONFIG_URL).then((r) => r.text());
      config7 = import_jsonc.jsonc.parse(data4);
    } catch (e) {
      _err("CONFIG_URL \u914D\u7F6E\u9519\u8BEF", e.toString());
    }
  } else if (existsSync("config.json")) {
    try {
      config7 = readJsonSync("config.json");
    } catch (e) {
      _err("config.json \u683C\u5F0F\u9519\u8BEF", e.toString());
    }
  } else if (existsSync("config.jsonc")) {
    try {
      config7 = import_jsonc.jsonc.parse(readFileSync("config.jsonc").toString());
    } catch (e) {
      _err("config.jsonc \u683C\u5F0F\u9519\u8BEF", e.toString());
    }
  }
  return config7;
};
(async () => {
  const config7 = await getConfig();
  dama.config(config7);
  const mConfig = config7.users || config7.m || [];
  const { savingMode } = config7;
  if (mConfig.length) {
    for (const [i, config8] of Object.entries(mConfig)) {
      _log(`\nM[${i}]`);
      if (!config8 || typeof config8 !== "string" && !config8.cookie)
        continue;
      const mClient = new MClient(config8, savingMode);
      await mClient.signIn();
      await mClient.earnCoin();
    }
  }
  _log();
  if (_isFailed() && config7.failedWebhook) {
    try {
      await fetch(config7.failedWebhook);
    } catch (error) {
      _err("Webhook \u8C03\u7528\u5931\u8D25");
      _err(error);
    }
  }
})();
