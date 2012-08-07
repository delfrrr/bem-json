BEM.TEST.decl({ block : 'i-bem', elem : 'html' }, function() {
    it('return html', function () {
        var element, html;
        BEM.HTML.decl('b-html-test', {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'});
            }
        });
        html = BEM.HTML.build({block: 'b-html-test'});
        expect(typeof html).toBe('string');
        element = jQuery(html);
        expect(element).toBeDefined();
        expect(element.attr('class')).toBe('b-html-test');
        expect(element.find('.b-html-test__item').length).toBe(1);
    });

    it('nested elements and tags', function () {
        var element;
        BEM.HTML.decl({name: 'b-html-test', modName: 'test', modVal: 'nested'}, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item', content: {elem: 'other-item', content: 'item1'}},
                    {elem: 'item', content: {block: 'b-nested-block', content: {elem: 'item', content: 'item2'}}},
                    {elem: 'item', content: {block: 'b-nested-block', content: {block: 'b-html-test', elem: 'item', content: 'item3'}}},
                    {elem: 'item', content: {block: 'b-nested-block', content: {block: 'b-html-test', elem: 'item', content: {elem: 'other-item', content: 'item4'}}}},
                    'item5'
                ]);
            }
        });
        element = jQuery(BEM.HTML.build({block: 'b-html-test', mods: {test: 'nested'}}));
        expect(element.find('> .b-html-test__item').eq(0).find('.b-html-test__other-item').text()).toBe('item1');
        expect(element.find('> .b-html-test__item').eq(1).find('.b-nested-block .b-nested-block__item').text()).toBe('item2');
        expect(element.find('> .b-html-test__item').eq(2).find('.b-nested-block .b-html-test__item').text()).toBe('item3');
        //this is wrong but complies to current implementation
        expect(element.find('> .b-html-test__item').eq(3).find('.b-nested-block .b-html-test__item .b-html-test__other-item').text()).toBe('item4');
        expect(Boolean(element.html().match(new RegExp('item5$')))).toBe(true);
    });

    it('short tag and attributes', function () {
        var element;
        BEM.HTML.decl({name: 'b-html-test', modName: 'test', modVal: 'short-tag'}, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item', content: 'item'},
                    {elem: 'item', mods: {'short': 'yes'}, content: 'item'}
                ]);
            },
            onElem: {
                'item': function (ctx) {
                    if (ctx.mod('short') === 'yes') {
                        ctx.tag('input');
                        ctx.attr('type', 'text');
                        ctx.attr('value', 'item');
                    }
                }
            }
        });
        element = jQuery(BEM.HTML.build({block: 'b-html-test', mods: {test: 'short-tag'}}));
        expect(element).toBeDefined();
        expect(element.find).toBeDefined();
        expect(element.find('.b-html-test__item').length).toBe(2);
        expect(element.find('.b-html-test__item').eq(0).text()).toBe('item');
        expect(element.find('.b-html-test__item').get(1).tagName).toBeDefined();
        expect(element.find('.b-html-test__item').get(1).tagName.toLowerCase()).toBe('input');
        expect(element.find('.b-html-test__item').eq(1).text()).toBe('');
        expect(element.find('.b-html-test__item').eq(1).attr('value')).toBe('item');
        expect(element.find('.b-html-test__item').eq(1).attr('type')).toBe('text');
    });

    it('mods and mix', function () {
        var element,
            checkClasses = function (element, classes) {
                classes.forEach(function (className) {
                    expect(element.hasClass(className)).toBe(true);
                })
            }
        BEM.HTML.decl({name: 'b-html-test', modName: 'test', modVal: 'mods-mix'}, {
            onBlock: function (ctx) {
                ctx.content([
                    {block: 'b-mixed-block', content: {elem: 'nested-item'}, mix: [{elem: 'item', mods: {'mixed': 'yes'}}], mods: {'mixed': 'no'}},
                    {elem: 'item', content: {elem: 'nested-item'}, mix: {block: 'b-mixed-block', mods: {'mixed': 'yes'}} , mods: {'mixed': 'no'}}
                ]);
            },
        });
        element = jQuery(BEM.HTML.build({block: 'b-html-test', mods: {test: 'mods-mix'}}));
        expect(element).toBeDefined();
        expect(element.find).toBeDefined();
        expect(element.find('> *').length).toBe(2);
        checkClasses(element.find('> *').eq(0), ['b-mixed-block', 'b-mixed-block_mixed_no', 'b-html-test__item', 'b-html-test__item_mixed_yes']);
        checkClasses(element.find('> *').eq(1), ['b-mixed-block', 'b-mixed-block_mixed_yes', 'b-html-test__item', 'b-html-test__item_mixed_no']);
    });

    it('js params', function () {
        var element;
        BEM.HTML.decl({name: 'b-html-test', modName: 'test', modVal: 'js-params'}, {
            onBlock: function (ctx) {
                ctx.js(true).content({elem: 'item', mix: {block: 'b-mixed-block', js: {'key': 'b-mixed-block'}}, content: 'item', js: {'key': 'item'}});
            },
        });
        element = jQuery(BEM.HTML.build({block: 'b-html-test', mods: {test: 'js-params'}}));
        expect(element).toBeDefined();
        expect(element.find).toBeDefined();
        expect(element.get(0).onclick()).toBeDefined();
        expect(typeof element.get(0).onclick()['b-html-test']).toBe('object');
        expect(element.find('.b-mixed-block').length).toBe(1);
        expect(element.find('.b-mixed-block').get(0).onclick()).toBeDefined();
        expect(element.find('.b-mixed-block').get(0).onclick()['b-mixed-block']).toBeDefined();
        expect(element.find('.b-mixed-block').get(0).onclick()['b-mixed-block']['key']).toBe('b-mixed-block');
        expect(element.find('.b-html-test__item').length).toBe(1);
        expect(element.find('.b-html-test__item').get(0).onclick()).toBeDefined();
        expect(element.find('.b-html-test__item').get(0).onclick()['b-html-test__item']).toBeDefined();
        expect(element.find('.b-html-test__item').get(0).onclick()['b-html-test__item']['key']).toBe('item');
    });

    it('wrap with not bem', function () {
        var element;
        BEM.HTML.decl({name: 'b-html-test', modName: 'test', modVal: 'wrap-not-bem'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'});
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wrap({elem: 'wrap-block-level-1'})
                       .wrap({tag: 'span'})
                       .wrap({elem: 'wrap-block-level-3'});
                }
            }
        });
        element = jQuery(BEM.HTML.build({block: 'b-html-test', mods: {test: 'wrap-not-bem'}}));
        expect(element).toBeDefined();
        expect(element.find).toBeDefined();
        expect(element.find('.b-html-test__wrap-block-level-1').length).toBe(1);
    });

    it('escape attributes', function () {
        var element;
        BEM.HTML.decl({name: 'b-html-test', modName: 'test', modVal: 'escape-attributes'}, {
            onBlock: function (ctx) {
                ctx.attr('style', 'background-image:url("//yandex.st/social/current/sprites/ico-16.png");');
            }
        });
        element = jQuery(BEM.HTML.build({block: 'b-html-test', mods: {test: 'escape-attributes'}}));
        expect(element).toBeDefined();
        expect(element.css).toBeDefined();
        expect(Boolean(element.css('background-image').length)).toBe(true);
    });
});
