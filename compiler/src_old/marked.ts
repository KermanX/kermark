import { Lexer } from "./Lexer.js";
import { Parser } from "./Parser.js";
import { Tokenizer } from "./Tokenizer.js";
import { Renderer } from "./Renderer.js";
import { TextRenderer } from "./TextRenderer.js";
import { Slugger } from "./Slugger.js";
import { checkSanitizeDeprecation, escape } from "./helpers.js";
import { getDefaults, changeDefaults, defaults } from "./defaults.js";
import { Tokens } from "./tokens.js";
import { Options } from "./options";

/**
 * Marked
 */
export function marked(
  arg1: string,
  arg2: Function | Options ,
  arg3: Function
) {
  let src: string;
  let opt: Options;
  let callback: Function | null;
  // throw error in case of non string input
  if (typeof arg1 === "undefined" || arg1 === null) {
    throw new Error("marked(): input parameter is undefined or null");
  }
  if (typeof arg1 !== "string") {
    throw new Error(
      "marked(): input parameter is of type " +
        Object.prototype.toString.call(arg1) +
        ", string expected"
    );
  }

  if (typeof arg2 === "function") {
    callback = arg2;
    opt = null as unknown as Options;
  } else {
    callback = null;
    opt = arg2 as Options;
  }

  opt = Object.assign({}, marked.defaults, opt || {});

  checkSanitizeDeprecation(opt);

  if (callback) {
    const highlight = opt.highlight;
    let tokens: Tokens;

    try {
      tokens = Lexer.lex(src, opt);
    } catch (e) {
      return callback(e);
    }

    const done = function (err?: unknown) {
      let out;

      if (!err) {
        try {
          if (opt.walkTokens) {
            marked.walkTokens(tokens, opt.walkTokens);
          }
          out = Parser.parse(tokens, opt);
        } catch (e: unknown) {
          err = e;
        }
      }

      opt.highlight = highlight;

      return err ? callback(err) : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!tokens.length) return done();

    let pending = 0;
    marked.walkTokens(tokens, function (token) {
      if (token.type === "code") {
        pending++;
        setTimeout(() => {
          highlight(token.text, token.lang, function (err, code) {
            if (err) {
              return done(err);
            }
            if (code != null && code !== token.text) {
              token.text = code;
              token.escaped = true;
            }

            pending--;
            if (pending === 0) {
              done();
            }
          });
        }, 0);
      }
    });

    if (pending === 0) {
      done();
    }

    return;
  }

  try {
    const tokens = Lexer.lex(src, opt);
    if (opt.walkTokens) {
      marked.walkTokens(tokens, opt.walkTokens);
    }
    return Parser.parse(tokens, opt);
  } catch (e) {
    e.message += "\nPlease report this to https://github.com/markedjs/marked.";
    if (opt.silent) {
      return (
        "<p>An error occurred:</p><pre>" +
        escape(e.message + "", true) +
        "</pre>"
      );
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options = marked.setOptions = function (opt) {
  Object.assign(marked.defaults, opt);
  changeDefaults(marked.defaults);
  return marked;
};

marked.getDefaults = getDefaults;

marked.defaults = defaults;

/**
 * Use Extension
 */

marked.use = function (...args) {
  const opts = Object.assign({}, ...args);
  const extensions = marked.defaults.extensions || {
    renderers: {},
    childTokens: {},
  };
  let hasExtensions;

  args.forEach((pack) => {
    // ==-- Parse "addon" extensions --== //
    if (pack.extensions) {
      hasExtensions = true;
      pack.extensions.forEach((ext) => {
        if (!ext.name) {
          throw new Error("extension name required");
        }
        if (ext.renderer) {
          // Renderer extensions
          const prevRenderer = extensions.renderers
            ? extensions.renderers[ext.name]
            : null;
          if (prevRenderer) {
            // Replace extension with func to run new extension but fall back if false
            extensions.renderers[ext.name] = function (...args) {
              let ret = ext.renderer.apply(this, args);
              if (ret === false) {
                ret = prevRenderer.apply(this, args);
              }
              return ret;
            };
          } else {
            extensions.renderers[ext.name] = ext.renderer;
          }
        }
        if (ext.tokenizer) {
          // Tokenizer Extensions
          if (!ext.level || (ext.level !== "block" && ext.level !== "inline")) {
            throw new Error("extension level must be 'block' or 'inline'");
          }
          if (extensions[ext.level]) {
            extensions[ext.level].unshift(ext.tokenizer);
          } else {
            extensions[ext.level] = [ext.tokenizer];
          }
          if (ext.start) {
            // Function to check for start of token
            if (ext.level === "block") {
              if (extensions.startBlock) {
                extensions.startBlock.push(ext.start);
              } else {
                extensions.startBlock = [ext.start];
              }
            } else if (ext.level === "inline") {
              if (extensions.startInline) {
                extensions.startInline.push(ext.start);
              } else {
                extensions.startInline = [ext.start];
              }
            }
          }
        }
        if (ext.childTokens) {
          // Child tokens to be visited by walkTokens
          extensions.childTokens[ext.name] = ext.childTokens;
        }
      });
    }

    // ==-- Parse "overwrite" extensions --== //
    if (pack.renderer) {
      const renderer = marked.defaults.renderer || new Renderer();
      for (const prop in pack.renderer) {
        const prevRenderer = renderer[prop];
        // Replace renderer with func to run extension, but fall back if false
        renderer[prop] = (...args) => {
          let ret = pack.renderer[prop].apply(renderer, args);
          if (ret === false) {
            ret = prevRenderer.apply(renderer, args);
          }
          return ret;
        };
      }
      opts.renderer = renderer;
    }
    if (pack.tokenizer) {
      const tokenizer = marked.defaults.tokenizer || new Tokenizer();
      for (const prop in pack.tokenizer) {
        const prevTokenizer = tokenizer[prop];
        // Replace tokenizer with func to run extension, but fall back if false
        tokenizer[prop] = (...args) => {
          let ret = pack.tokenizer[prop].apply(tokenizer, args);
          if (ret === false) {
            ret = prevTokenizer.apply(tokenizer, args);
          }
          return ret;
        };
      }
      opts.tokenizer = tokenizer;
    }

    // ==-- Parse WalkTokens extensions --== //
    if (pack.walkTokens) {
      const walkTokens = marked.defaults.walkTokens;
      opts.walkTokens = function (token) {
        pack.walkTokens.call(this, token);
        if (walkTokens) {
          walkTokens.call(this, token);
        }
      };
    }

    if (hasExtensions) {
      opts.extensions = extensions;
    }

    marked.setOptions(opts);
  });
};

/**
 * Run callback for every token
 */

marked.walkTokens = function (tokens, callback) {
  for (const token of tokens) {
    callback.call(marked, token);
    switch (token.type) {
      case "table": {
        for (const cell of token.header) {
          marked.walkTokens(cell.tokens, callback);
        }
        for (const row of token.rows) {
          for (const cell of row) {
            marked.walkTokens(cell.tokens, callback);
          }
        }
        break;
      }
      case "list": {
        marked.walkTokens(token.items, callback);
        break;
      }
      default: {
        if (
          marked.defaults.extensions &&
          marked.defaults.extensions.childTokens &&
          marked.defaults.extensions.childTokens[token.type]
        ) {
          // Walk any extensions
          marked.defaults.extensions.childTokens[token.type].forEach(function (
            childTokens
          ) {
            marked.walkTokens(token[childTokens], callback);
          });
        } else if (token.tokens) {
          marked.walkTokens(token.tokens, callback);
        }
      }
    }
  }
};

/**
 * Parse Inline
 * @param {string} src
 */
marked.parseInline = function (src, opt) {
  // throw error in case of non string input
  if (typeof src === "undefined" || src === null) {
    throw new Error(
      "marked.parseInline(): input parameter is undefined or null"
    );
  }
  if (typeof src !== "string") {
    throw new Error(
      "marked.parseInline(): input parameter is of type " +
        Object.prototype.toString.call(src) +
        ", string expected"
    );
  }

  opt = Object.assign({}, marked.defaults, opt || {});
  checkSanitizeDeprecation(opt);

  try {
    const tokens = Lexer.lexInline(src, opt);
    if (opt.walkTokens) {
      marked.walkTokens(tokens, opt.walkTokens);
    }
    return Parser.parseInline(tokens, opt);
  } catch (e) {
    e.message += "\nPlease report this to https://github.com/markedjs/marked.";
    if (opt.silent) {
      return (
        "<p>An error occurred:</p><pre>" +
        escape(e.message + "", true) +
        "</pre>"
      );
    }
    throw e;
  }
};

/**
 * Expose
 */
marked.Parser = Parser;
marked.parser = Parser.parse;
marked.Renderer = Renderer;
marked.TextRenderer = TextRenderer;
marked.Lexer = Lexer;
marked.lexer = Lexer.lex;
marked.Tokenizer = Tokenizer;
marked.Slugger = Slugger;
marked.parse = marked;

export const options = marked.options;
export const setOptions = marked.setOptions;
export const use = marked.use;
export const walkTokens = marked.walkTokens;
export const parseInline = marked.parseInline;
export const parse = marked;
export const parser = Parser.parse;
export const lexer = Lexer.lex;
export { defaults, getDefaults } from "./defaults.js";
export { Lexer } from "./Lexer.js";
export { Parser } from "./Parser.js";
export { Tokenizer } from "./Tokenizer.js";
export { Renderer } from "./Renderer.js";
export { TextRenderer } from "./TextRenderer.js";
export { Slugger } from "./Slugger.js";
