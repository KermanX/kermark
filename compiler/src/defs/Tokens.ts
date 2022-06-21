export enum TokenTypes {}


export type Tokens = Token[] & { links?: Object };

export type Token = 
{
    type:"blankLine",
    times:number
}
| {

};