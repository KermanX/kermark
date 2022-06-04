# Kermark Spec

## Markers

## Preliminaries

Symbols of special chars in the examples:

- `·` stands for a space

- `→` stands for a tab

- `↲` stands for a line break

- `▢` stands for a blank line

### Headings

```kermark
# HEADING1
## HEADING2
### HEADING3
#### HEADING4
##### HEADING5
###### HEADING6
```

```html
<h1>HEADING1</h1>
<h2>HEADING2</h2>
<h3>HEADING3</h3>
<h4>HEADING4</h4>
<h5>HEADING5</h5>
<h6>HEADING6</h6>
```

### Multiple Language First-level Heading

If there are more than one first level headings together, the first will be considered as the heading in the main language of this article, and the others will be considered in other languages.

```kermark
# 家猫名唤穆尔西
# Morsi the Cat
# Foo
```

```html
<h1>家猫名唤穆尔西</h1>
<div class="h1-lang2">Morsi the Cat</div>
<div class="h1-lang3">Foo</div>
```

### Authors

Authors **must** follow the **first-level** [heading](#headings) (may be [multiple-language](#multiple-language-first-level-heading))

- More than one authors are allowed
- You can add styles to authorss

```kermark
# 家猫名唤穆尔西
[*Peter Hessler* 文]
[*何雨珈* 译]
```

```html
<h1>家猫名唤穆尔西</h1>
<div class="author"><em>Peter Hessler</em> 文</div>
<div class="author"><em>何雨珈</em> 译</div>
```

### Topic Sentences

Topic sentences **must** follow a [heading](#headings) (may be [multiple-language first-level heading](#multiple-language-first-level-heading) or other headings)

- More than one topic sentences are allowed

```kermark
# 家猫名唤穆尔西
>> 事件是不可靠的，因为它们打乱了自然秩序。
>> foo.
```

```html
<h1>家猫名唤穆尔西</h1>
<div class="topic">事件是不可靠的，因为它们打乱了自然秩序。</div>
<div class="topic">foo.</div>
```

### Block quotes

```kermark
> ## Foo
>
> bar
```

```html
<blockquote>
  <h2>Foo</h2>
  <p>bar</p>
</blockquote>
```

### Quote source

```kermark

> Workers of all countries, unite!
>
> --The Communist Manifesto
```

```html
<blockquote>
  <p>Workers of all countries, unite!</p>
  <div class="quote-source">The Communist Manifesto</div>
</blockquote>
```

### Links

```kermark
[Link Text](https://url/ "title")
```

```html
<a href="https://url/" title="title">Link Text</a>
```

### Set class, id and tagname

```kermark
[Foo1]{.classA.classB}
[Foo2]{#id2}
[Foo3]{div.classC}
```

```html
<span class="classA classB">Foo1</span>
<span id="id2">Foo2</span>
<div class="classC">Foo3</div>
```

### Images

```kermark
![Alt](https://src/ "title" (300x400))
![Alt2](https://src2/ (500))
```

```html
<img src="https://src/" alt="Alt" title="title" width="300" height="400" />
<img src="https://src2/" alt="Alt2" width="500" />
```

### Data references

```kermark
[Link]([:data1])
[:data2]
/*...*/
/*Maybe the end of the document*/
[:data1=https://12234567t6785678/]
[:data2=Message **here**!]
```

```html
<a href="https://12234567t6785678/">Link</a> Message <strong>here</strong>!
```

### Comments

```kermark
/*Comment here!*/
```

```html
<!--Comment here!-->
```

### Hard line breaks

```kermark
abc\
def
```

```html
<p>
  abc<br />
  def
</p>
```

### Lists

#### Unordered lists

```kermark
- a
- b
  - c
  - d
- e
```

```html
<ul>
  <li>a</li>
  <li>b</li>
  <ul>
    <li>c</li>
    <li>d</li>
  </ul>
  <li>e</li>
</ul>
```

#### Ordered lists

```kermark
1. a
2. b
  3. c
  4. d
5. e
```

```html
<ol>
  <li>a</li>
  <li>b</li>
  <ol start="3">
    <li>c</li>
    <li>d</li>
  </ol>
  <li>e</li>
</ol>
```

#### Wrong cases

```kermark
1.a
-b
```

```html
<p>1.a -b</p>
```

### Styles

```kermark
[WARNING]{"color:yellow;font-size:large"}
```

```html
<span style="color:yellow;font-size:large">WARNING</span>
```

You can use it with [Set class, id and tagname](#set-class-id-and-tagname):

```kermark
[FOO]{"z-index:2147483647"#top}
```

```html
<span style="z-index:2147483647" id="top">FOO</span>
```

### Task list items

```kermark
- [ ] Unfinished
- [x] Finished

1. [ ] Unfinished
2. [x] Finished
```

```html
<p>
<ul>
<li><input disabled="" type="checkbox"> Unfinished</li>
<li><input checked="" disabled="" type="checkbox"> Finished</li>
</ul>
</p>
<p>
<ol>
<li><input disabled="" type="checkbox"> Unfinished</li>
<li><input checked="" disabled="" type="checkbox"> Finished</li>
</ol>
</p>
```

If there is only one task list item:

```kermark
- [ ] Unfinished
[ ] Wrong
```

```html
<p>
<div><input disabled="" type="checkbox"> Unfinished</div>
[ ] Wrong
</p>
```

### Tables

- It is both OK to have head a header row or not.
- "`:`" stands for aligning.
- You can add custom style to a column use the syntax like [Styles](#styles).

```kermark
| ID  |   NAME   |    TEL |
| :-- | :---{"font-style:italic"}---: | -----: |
| 1   | \_Kerman | 123456 |
```

```html
<table>
<thead>
<tr>
<th style="text-align:left">ID</th>
<th style="text-align:center">NAME</th>
<th style="text-align:right">TEL</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left">1</td>
<td style="text-align:center;font-style:italic">_Kerman</td>
<td style="text-align:right">123456</td>
</tr>
</tbody>
</table>
```

### Thematic breaks

Works like markdown.

<span style="color:yellow">⚠</span> It is not recommended to use "`***`".

### Emphasis and strong emphasis

Works likes markdown.

<span style="color:yellow">⚠</span> It is not recommended to use "`_`" or "`__`".

### Code spans and fenced code blocks

Works likes markdown.

### Strikethrough

Works likes markdown.

## Priority
