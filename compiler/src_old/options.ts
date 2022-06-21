import { Tokenizer } from './Tokenizer';
export interface Options {
  baseUrl: string|null;
  breaks: boolean;
  gfm: boolean;
  headerIds: boolean;
  headerPrefix: string;
  highlight: null;
  langPrefix: string;
  mangle: boolean;
  pedantic: boolean;
  renderer: null;
  sanitize: boolean;
  sanitizer: null;
  silent: boolean;
  smartLists: boolean;
  smartypants: boolean;
  tokenizer: Tokenizer|null;
  walkTokens: null;
  xhtml: boolean;
}
