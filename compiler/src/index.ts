import { defaultOptions, Options } from "./options.js";
import { lexBlock } from "./Lexer.js";

function compile(src: string, options: Options = defaultOptions): string {
  let tokens = lexBlock(src, options);
  console.log(tokens);
  return JSON.stringify(tokens);
}

compile(
  `> abcde
> - eee
> - efg
> 1. gfg
>


`
);
