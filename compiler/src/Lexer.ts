import { Options } from "./options";
import { Token, Tokens } from "./defs/Tokens.js";

/**
 * Block Lexer
 */
export function lexBlock(src: string, options: Options): Tokens {
  let tokens: Tokens = [];

  let lines = src
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "    ")
    .split("\n")
    .map((v) => v.trimEnd());

  type LRBlockType = " " | ">" | "-" | "1";
  interface LRBlock {
    type: LRBlockType;
    data?: any;
    endToken: Token;
  }

  let LRBlockStack: LRBlock[] = [];
  let content: string[] = [];

  for (const line of lines) {
    function scan(idx: number, si: number | null) {
      function proc(
        goTo: number,
        beginToken: Token,
        endToken: Token,
        type: LRBlockType,
        data?: any
      ) {
        if (
          si !== null &&
          LRBlockStack[si] &&
          LRBlockStack[si].type === type &&
          LRBlockStack[si].data === data
        ) {
          si++;
        } else {
          tokens = tokens.concat(lexInline(content, options));
          if (si) {
            LRBlockStack.slice(si)
              .reverse()
              .forEach((s) => tokens.push(s.endToken));
            content = [];
            LRBlockStack = LRBlockStack.slice(0, si);
          }
          si = null;
          LRBlockStack.push({
            type,
            data,
            endToken,
          });
          tokens.push(beginToken);
        }
        scan(goTo, si);
      }
      function repeatTo(char: string): number {
        let i = idx;
        for (; i < line.length && line[i] === char; i++);
        return i;
      }
      function is(char: string): boolean {
        return line[idx] === char;
      }
      function exec(regexp: RegExp): RegExpExecArray | null {
        return regexp.exec(line.slice(idx));
      }
      {
        // indent
        let i = repeatTo(" ");
        if (i > idx) {
          proc(
            i,
            {
              type: "indent-begin",
              len: i - idx,
            },
            {
              type: "indent-end",
            },
            " ",
            i - idx
          );
          return;
        }
      }
      {
        // quote
        let res = exec(/^>(?: {1,3}|$)/);
        if (res !== null) {
          proc(
            idx + res[0].length,
            {
              type: "quote-begin",
            },
            {
              type: "quote-end",
            },
            ">"
          );
          return;
        }
      }
      {
        // ulist
        let res = exec(/^- {1,3}/);
        if (res !== null) {
          proc(
            idx + res[0].length,
            {
              type: "ulist-begin",
            },
            {
              type: "ulist-end",
            },
            "-"
          );
          return;
        }
      }
      {
        // olist
        let res = exec(/^[0-9]+\. {1,3}/);
        if (res !== null) {
          proc(
            idx + res[0].length,
            {
              type: "olist-begin",
            },
            {
              type: "olist-end",
            },
            "1"
          );
          return;
        }
      }
      {
        // raw
        if (si && LRBlockStack.length > si) {
          tokens = tokens.concat(lexInline(content, options));
          LRBlockStack.slice(si)
            .reverse()
            .forEach((s) => tokens.push(s.endToken));
        }
        content.push(line.slice(idx));
        return;
      }
    }

    scan(0, 0);
  }

  return tokens;
}

export function lexInline(content: string[], options: Options): Token[] {
  let tokens: Tokens = content.flatMap((line): Token => {
    if (line === "") {
      return {
        type: "blankLine",
      };
    } else {
      return [
        {
          type: "raw",
          content: line,
        },
        { type: "return" },
      ];
    }
  });
  return tokens;
}

//     let token: Token;

//     // blank line
//     if (line === "") {
//       token = {};
//     }

//     // code
//     if ((token = this.tokenizer.code(src))) {
//       src = src.substring(token.raw.length);
//       lastToken = tokens[tokens.length - 1];
//       // An indented code block cannot interrupt a paragraph.
//       if (
//         lastToken &&
//         (lastToken.type === "paragraph" || lastToken.type === "text")
//       ) {
//         lastToken.raw += "\n" + token.raw;
//         lastToken.text += "\n" + token.text;
//         inlineQueue[inlineQueue.length - 1].src = lastToken.text;
//       } else {
//         tokens.push(token);
//       }
//       continue;
//     }

//     // fences
//     if ((token = this.tokenizer.fences(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // heading
//     if ((token = this.tokenizer.heading(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // hr
//     if ((token = this.tokenizer.hr(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // blockquote
//     if ((token = this.tokenizer.blockquote(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // list
//     if ((token = this.tokenizer.list(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // html
//     if ((token = this.tokenizer.html(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // def
//     if ((token = this.tokenizer.def(src))) {
//       src = src.substring(token.raw.length);
//       lastToken = tokens[tokens.length - 1];
//       if (
//         lastToken &&
//         (lastToken.type === "paragraph" || lastToken.type === "text")
//       ) {
//         lastToken.raw += "\n" + token.raw;
//         lastToken.text += "\n" + token.raw;
//         inlineQueue[inlineQueue.length - 1].src = lastToken.text;
//       } else if (!tokens.links[token.tag]) {
//         tokens.links[token.tag] = {
//           href: token.href,
//           title: token.title,
//         };
//       }
//       continue;
//     }

//     // table (gfm)
//     if ((token = this.tokenizer.table(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // lheading
//     if ((token = this.tokenizer.lheading(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     if (this.state.top && (token = this.tokenizer.paragraph(src))) {
//       lastToken = tokens[tokens.length - 1];
//       if (lastParagraphClipped && lastToken.type === "paragraph") {
//         lastToken.raw += "\n" + token.raw;
//         lastToken.text += "\n" + token.text;
//         inlineQueue.pop();
//         inlineQueue[inlineQueue.length - 1].src = lastToken.text;
//       } else {
//         tokens.push(token);
//       }
//       lastParagraphClipped = src.length !== src.length;
//       src = src.substring(token.raw.length);
//       continue;
//     }

//     // text
//     if ((token = this.tokenizer.text(src))) {
//       src = src.substring(token.raw.length);
//       lastToken = tokens[tokens.length - 1];
//       if (lastToken && lastToken.type === "text") {
//         lastToken.raw += "\n" + token.raw;
//         lastToken.text += "\n" + token.text;
//         inlineQueue.pop();
//         inlineQueue[inlineQueue.length - 1].src = lastToken.text;
//       } else {
//         tokens.push(token);
//       }
//       continue;
//     }

//     lastToken = token;
//     tokens.push(token);

//     if (src) {
//       const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);

//       throw new Error(errMsg);
//     }
//   }

//   this.state.top = true;
//   return { tokens, inlineQueue };
// }

// lexInline(src: string): Tokens {
//   let tokens: Tokens;
//   let token, lastToken;

//   // String with links masked to avoid interference with em and strong
//   let maskedSrc = src;
//   let match;
//   let keepPrevChar, prevChar;

//   // Mask out reflinks
//   if (tokens.links) {
//     const links = Object.keys(tokens.links);
//     if (links.length > 0) {
//       while (
//         (match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) !=
//         null
//       ) {
//         if (
//           links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))
//         ) {
//           maskedSrc =
//             maskedSrc.slice(0, match.index) +
//             "[" +
//             repeatString("a", match[0].length - 2) +
//             "]" +
//             maskedSrc.slice(
//               this.tokenizer.rules.inline.reflinkSearch.lastIndex
//             );
//         }
//       }
//     }
//   }
//   // Mask out other blocks
//   while (
//     (match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null
//   ) {
//     maskedSrc =
//       maskedSrc.slice(0, match.index) +
//       "[" +
//       repeatString("a", match[0].length - 2) +
//       "]" +
//       maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
//   }

//   // Mask out escaped em & strong delimiters
//   while (
//     (match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null
//   ) {
//     maskedSrc =
//       maskedSrc.slice(0, match.index) +
//       "++" +
//       maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
//   }

//   while (src) {
//     if (!keepPrevChar) {
//       prevChar = "";
//     }
//     keepPrevChar = false;

//     // extensions
//     if (
//       this.options.extensions &&
//       this.options.extensions.inline &&
//       this.options.extensions.inline.some((extTokenizer) => {
//         if ((token = extTokenizer.call({ lexer: this }, src, tokens))) {
//           src = src.substring(token.raw.length);
//           tokens.push(token);
//           return true;
//         }
//         return false;
//       })
//     ) {
//       continue;
//     }

//     // escape
//     if ((token = this.tokenizer.escape(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // tag
//     if ((token = this.tokenizer.tag(src))) {
//       src = src.substring(token.raw.length);
//       lastToken = tokens[tokens.length - 1];
//       if (lastToken && token.type === "text" && lastToken.type === "text") {
//         lastToken.raw += token.raw;
//         lastToken.text += token.text;
//       } else {
//         tokens.push(token);
//       }
//       continue;
//     }

//     // link
//     if ((token = this.tokenizer.link(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // reflink, nolink
//     if ((token = this.tokenizer.reflink(src, tokens.links))) {
//       src = src.substring(token.raw.length);
//       lastToken = tokens[tokens.length - 1];
//       if (lastToken && token.type === "text" && lastToken.type === "text") {
//         lastToken.raw += token.raw;
//         lastToken.text += token.text;
//       } else {
//         tokens.push(token);
//       }
//       continue;
//     }

//     // em & strong
//     if ((token = this.tokenizer.emStrong(src, maskedSrc, prevChar))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // code
//     if ((token = this.tokenizer.codespan(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // br
//     if ((token = this.tokenizer.br(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // del (gfm)
//     if ((token = this.tokenizer.del(src))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // autolink
//     if ((token = this.tokenizer.autolink(src, mangle))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // url (gfm)
//     if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
//       src = src.substring(token.raw.length);
//       tokens.push(token);
//       continue;
//     }

//     // text
//     // prevent inlineText consuming extensions by clipping 'src' to extension start
//     cutSrc = src;
//     if (this.options.extensions && this.options.extensions.startInline) {
//       let startIndex = Infinity;
//       const tempSrc = src.slice(1);
//       let tempStart;
//       this.options.extensions.startInline.forEach(function (getStartIndex) {
//         tempStart = getStartIndex.call({ lexer: this }, tempSrc);
//         if (typeof tempStart === "number" && tempStart >= 0) {
//           startIndex = Math.min(startIndex, tempStart);
//         }
//       });
//       if (startIndex < Infinity && startIndex >= 0) {
//         cutSrc = src.substring(0, startIndex + 1);
//       }
//     }
//     if ((token = this.tokenizer.inlineText(cutSrc, smartypants))) {
//       src = src.substring(token.raw.length);
//       if (token.raw.slice(-1) !== "_") {
//         // Track prevChar before string of ____ started
//         prevChar = token.raw.slice(-1);
//       }
//       keepPrevChar = true;
//       lastToken = tokens[tokens.length - 1];
//       if (lastToken && lastToken.type === "text") {
//         lastToken.raw += token.raw;
//         lastToken.text += token.text;
//       } else {
//         tokens.push(token);
//       }
//       continue;
//     }

//     if (src) {
//       const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
//       if (this.options.silent) {
//         console.error(errMsg);
//         break;
//       } else {
//         throw new Error(errMsg);
//       }
//     }
