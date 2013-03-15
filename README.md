## What is it? ##

This is JavaScript template engine for BEM methodology (http://bem.github.com/bem-method/html/all.ru.html) and allows to write templates in the form of declarations on pure js.

###Template

```js
BEM.JSON.decl('b-block', {
    onBlock: function (ctx) {
        ctx.content({elem: 'item'});
    },
    onElem: {
        'item': function (ctx) {
            ctx.tag('h1').content('Hello world');
        }
    }
});
```

###Output json

```js
console.log(BEM.JSON.build({block: 'b-block'}));
```
```js
{
  "block": "b-block",
    "content": {
        "elem": "item",
        "tag": "h1",
        "content": "Hello world"
    }
}
```

###Output html

```js
console.log(BEM.HTML.build({block: 'b-block'}));
```
```html
<div class="b-block">
    <h1 class="b-block__item">Hello world</h1>
</div>
```

## API ##

### ctx.pos() ###

Returns `Number` for current block/element position

### ctx.isFirst()

Checks if current block/element is first, returns `Boolean`

### ctx.isLast()

Checks if current block/element is last, returns `Boolean`

### ctx.params()

Returns block/element params

### ctx.params(blockParams)

Sets block/element params, returns `ctx`

### ctx.param(paramName)

Returns block/element param

### ctx.param(paramName, paramValue, [force=false], [needExtend=false])

Sets block/element param, returns `ctx`

 * If `force` is `true` it overrides previous value. Otherwise it's not.

### ctx.content()

Returns block/element content

### ctx.content(val, [force=false])

Set block/element content

 * If `force` is `true` it overrides previous value. Otherwise it's not.

### ctx.mods()

Returns block/element mods (modifications) object

### ctx.mods(val, [force=false])

Set block/element modifications, return `ctx`

 * If `force` is `true` it overrides previous value. Otherwise it's not.

### ctx.mod(name)

Return block/element modification value

### ctx.mod(name, [val], [force=false])

Sets block/element modification value, returns `ctx`

 * If `force` is `true` it overrides previous value. Otherwise it's not.

### ctx.attr(name)

Returns block/element html attribute value.

### ctx.attr(name, val, [force=false])

Set block/element html attribute value, returns `ctx`

 * If `force` is `true` it overrides previous value. Otherwise it's not.

### ctx.attrs()

Returns block/element html attributes.

### ctx.attrs(attributsObj, [force=false])

Set block/element html attributes.

 * If `force` is `true` it overrides previous value. Otherwise it's not.

### ctx.tag()

Returns block/element tag name

### ctx.tag(tagName, [force=false])

Sets block/element tag name, returns `ctx`

 * If `force` is `true` it overrides previous value. Otherwise it's not.

### ctx.cls()

Returns additional (may be not BEM) css class for block/element

### ctx.cls(val, [force=false])

Sets additional (may be not BEM) css class for block/element

 * If `force` is `true` it overrides previous value. Otherwise it's not.

### ctx.mix()

Returns mixed blocks/elements `Array`

### ctx.mix(mixArray, [force=false])

Adds (mix) block/elements on current block/element, return `ctx`

 * If `force` is `true` it overrides previous value. Otherwise it adds mixed elements.

### ctx.js()

Returns js params (params, saved in onclick attribute and accessible in BEM.DOM)

### ctx.js(val)

Sets js params (params, saved in onclick attribute and accessible in BEM.DOM), returns `ctx`

### ctx.wrapContent(obj)

Wraps content of block/element with other blocks/elements, returns `ctx`

### ctx.beforeContent(obj)

Adds blocks/elements before current content, returns `ctx`

### ctx.afterContent(obj)

Adds blocks/elements after current content, returns `ctx`

### ctx.wrap(obj)

Wrap block/element with other blocks/elements, returns `ctx`

### ctx.generateId()

Generates unique id, returns `String`

### ctx.stop()

Stop execution of more basics declarations

### ctx.remove()

Removes block/element

## How to use with bem-bl ##

You can use these bundles:

* json (data) → BEM.HTML.build → html
* json (data) → BEM.JSON.build → bemjson → bemhtml → html
* json (data) → BEM.XML.build → lego:xml → xsl → html


