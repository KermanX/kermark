# Kermark Spec

## Markers

## Preliminaries

Symbols of special chars in the examples:

- ` ` stands for a space

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
- Names and types are separated by "`|`"
- You can add styles to names and types

```kermark
# 家猫名唤穆尔西
[Peter Hessler | 文]
[何雨珈 | 译]
[N**a**me | Type]
```

```html
<h1>家猫名唤穆尔西</h1>
<div class="author-name">Peter Hessler</div><div class="author-type">文</div>
<div class="author-name">何雨珈</div><div class="author-type">译</div>
<div class="author-name">N<strong>a</strong>me</div><div class="author-type">Type</div>
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

### 

## Priority

1.
