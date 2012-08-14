## Что это? ##

Это JavaScript шаблонизатор, который использует методологию БЭМ (http://bem.github.com/bem-method/html/all.ru.html) и позволяет писать шаблоны в виде деклараций на чистом js.

Декларация (шаблон)
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

Позволяет получить json
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

или html
```js
console.log(BEM.HTML.build({block: 'b-block'}));
```
```html
<div class="b-block">
    <h1 class="b-block__item">Hello world</h1>
</div>
```

## Цель проекта ##

* Расширяемые шаблоны на чистом JS в Лего и bem-bl проекте.
* Обратная совместимость с BEMHTML и XSL шаблонами
* Повторное использование кода шаблона на клиенте и сервере

## Как использовать ##

BEM.JSON.decl обратно совместима с BEM.HTML.decl из Лего

Можно использовать в таких связках
* json (данные) → BEM.HTML.build → html
* json (данные) → BEM.JSON.build → bemjson → bemhtml → html 
* json (данные) → BEM.XML.build → lego:xml → xsl → html 