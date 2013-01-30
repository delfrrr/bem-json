describe('declaration', function () {
    it('public methods', function () {
        expect(BEM.JSON).toBeDefined();
        expect(BEM.JSON.decl).toBeDefined();
        expect(BEM.JSON.build).toBeDefined();
    });
});

describe('process json', function () {
    BEM.JSON.decl('b-test', {
        onBlock: function (ctx) {
            ctx.content({elem: 'item'});
        },
        onElem: {
            'item': function (ctx) {
                ctx.content('test string');
            }
        }
    });
    var json = BEM.JSON.build({block: 'b-test'});
    it('build bemjson', function () {
        expect(json).toBeDefined();
        expect(json.block).toBeDefined();
    });

    it('build content', function () {
        expect(json.block).toBe('b-test');
        expect(json.content).toBeDefined();
    });

    it('build element', function () {
        expect(json.content.elem).toBeDefined();
        expect(json.content.elem).toBe('item');
        expect(json.content.content).toBe('test string');
    });
});

describe('modes', function () {
    BEM.JSON.decl({
        name: 'b-test', modName: 'hasmode', modVal: 'yes'
    }, {
        onBlock: function (ctx) {
            ctx.content([
                'hasmode='+ctx.mod('hasmode'),
                {elem: 'item', mods: {'addMode': 'yes'}, content: 'default'},
                {elem: 'item', mods: {'force': 'yes'}, content: 'default'},
                {elem: 'item'}
            ], true);
        },
        onElem: {
            'item': function (ctx) {
                var mods = ctx.mods();
                ctx.content('changed', ctx.mod('force') === 'yes');
                if (ctx.mod('addMode') === 'yes') {
                    ctx.mods({
                        addMode: 'added',
                        addedMode: 'yes'
                    }, true);
                }
            }
        }
    });
    var bemjson = BEM.JSON.build({
        block: 'b-test',
        mods: {hasmode: 'yes'}
    });
    it('apply mode', function () {
        expect(Array.isArray(bemjson.content)).toBe(true);
        expect(bemjson.content[0]).toBe('hasmode=yes');
    });
    it('mode forse', function () {
        expect(bemjson.content[1].content).toBe('default');
        expect(bemjson.content[2].content).toBe('changed');
        expect(bemjson.content[3].content).toBe('changed');
    });
});

describe('position', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'position'
    }, {
        onBlock: function (ctx) {
            ctx.content([
                {elem: 'item'},
                {elem: 'item'},
                {elem: 'item'}
            ], true);
        },
        onElem: function (ctx) {
            ctx.param('position', ctx.pos());
            ctx.param('isFirst', ctx.isFirst() ? 'yes' : 'no');
            ctx.param('isLast', ctx.isLast() ? 'yes' : 'no');
        }
    });
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'position'
    }, {
        onElem: {
            'item': function (ctx) {
                if (ctx.isLast()) {
                    ctx.content({block: 'b-test-inner', mods: {test: 'position'}});
                }
            }
        }
    });
    BEM.JSON.decl({
        name:'b-test-inner',
        modName: 'test',
        modVal: 'position'
    }, {
        onBlock: function (ctx) {
            ctx.param('position', ctx.pos());
            ctx.param('isFirst', ctx.isFirst() ? 'yes' : 'no');
            ctx.param('isLast', ctx.isLast() ? 'yes' : 'no');
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'position'}});
    it('position', function () {
        expect(bemjson.content[0].position).toBe(1);
        expect(bemjson.content[1].position).toBe(2);
        expect(bemjson.content[2].position).toBe(3);
        expect(bemjson.content[2].content.position).toBe(1);
    });
    it('isLast', function () {
        expect(bemjson.content[0].isLast).toBe('no');
        expect(bemjson.content[1].isLast).toBe('no');
        expect(bemjson.content[2].isLast).toBe('yes');
        expect(bemjson.content[2].content.isLast).toBe('yes');
    });
    it('isFirst', function () {
        expect(bemjson.content[0].isFirst).toBe('yes');
        expect(bemjson.content[1].isFirst).toBe('no');
        expect(bemjson.content[2].isFirst).toBe('no');
        expect(bemjson.content[2].content.isFirst).toBe('yes');
    });
});

describe('attrs', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'attrs'
    }, {
        onBlock: function (ctx) {
            ctx.content([
                {elem: 'item', attrs:{test: 'yes'}},
                {elem: 'item', attrs:{test: 'yes'}, mods: {force: 'yes'}},
                {elem: 'item', attrs:{}},
                {elem: 'item'}
            ], true);
        },
        onElem: function (ctx) {
            ctx.attr('test', 'tested', ctx.mod('force') === 'yes');
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'attrs'}});
    it('element attrs', function () {
        expect(bemjson.content[0].attrs.test).toBe('yes');
        expect(bemjson.content[1].attrs.test).toBe('tested');
        expect(bemjson.content[2].attrs.test).toBe('tested');
        expect(bemjson.content[3].attrs.test).toBe('tested');
    });
});

describe('mix', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'mix'
    }, {
        onBlock: function (ctx) {
            ctx.content([
                {elem: 'item', mix:[{elem: 'mixed'}], mods: {force: 'yes'}},
                {elem: 'item', mix:[{elem: 'mixed'}]},
                {elem: 'item'},
                {elem: 'item', mods: {force: 'yes'}}
            ], true);
        },
        onElem: function (ctx) {
            ctx.mix({elem: 'test-mix-obj'}, ctx.mod('force') === 'yes');
            ctx.mix([{elem: 'test-mix-arr'}], ctx.mod('force') === 'yes');
            ctx.mix([{elem: 'test-mix-add'}]);
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'mix'}});
    it('mix', function () {
        expect(bemjson.content[0].mix).toBeDefined();

        expect(bemjson.content[0].mix[0].elem).toBe('test-mix-arr');
        expect(bemjson.content[0].mix[1].elem).toBe('test-mix-add');

        expect(bemjson.content[1].mix[0].elem).toBe('mixed');
        expect(bemjson.content[1].mix[1].elem).toBe('test-mix-obj');
        expect(bemjson.content[1].mix[2].elem).toBe('test-mix-arr');
        expect(bemjson.content[1].mix[3].elem).toBe('test-mix-add');

        expect(bemjson.content[2].mix[0].elem).toBe('test-mix-obj');
        expect(bemjson.content[2].mix[1].elem).toBe('test-mix-arr');
        expect(bemjson.content[2].mix[2].elem).toBe('test-mix-add');

        expect(bemjson.content[3].mix[0].elem).toBe('test-mix-arr');
        expect(bemjson.content[3].mix[1].elem).toBe('test-mix-add');

    });
});

describe('content wrapers', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'wrap-content'
    }, {
        onBlock: function (ctx) {
            ctx.content({elem:'holder', content: [
                'string',
                {elem: 'item', content: 'content'}
            ]});
        },
        onElem: {
            'holder': function (ctx) {
                ctx.wrapContent({elem: 'wraper'});
            },
            'item': function (ctx) {
                ctx.beforeContent({elem: 'before'});
                ctx.beforeContent('before');
                ctx.afterContent([
                    {elem: 'after'},
                    'after'
                ]);
            }
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'wrap-content'}});
    it('wrapContent', function () {
        expect(bemjson.content.elem).toBe('holder');
        expect(bemjson.content.content.elem).toBe('wraper');
        expect(bemjson.content.content.content[0]).toBe('string');
        expect(bemjson.content.content.content[1].elem).toBe('item');
    });
    it('before after content', function () {
        var item = bemjson.content.content.content[1];
        expect(item).toBeDefined();
        expect(item.content).toBeDefined();
        expect(item.content[0]).toBe('before');
        expect(item.content[1].elem).toBe('before');
        expect(item.content[2]).toBe('content');
        expect(item.content[3].elem).toBe('after');
        expect(item.content[4]).toBe('after');
    });
});

describe('wrap', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'wrap'
    }, {
        onBlock: function (ctx) {
            ctx.content({elem: 'item'});
            ctx.wrap({block: 'b-test-wraper'});
        },
        onElem: {
            'item': function (ctx) {
                ctx.wrap({elem: 'wraper'});
            },
            'wraper': function (ctx) {
                ctx.afterContent('string');
            }
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'wrap'}});
    it('wrap block', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.block).toBe('b-test-wraper');
        expect(bemjson.content.block).toBe('b-test');
    });
    it('wrap elem', function () {
        expect(bemjson.content.content).toBeDefined();
        expect(bemjson.content.content.elem).toBe('wraper');
        expect(bemjson.content.content.content[0]).toBeDefined();
        expect(bemjson.content.content.content[0].elem).toBe('item');
        expect(bemjson.content.content.content[1]).toBe('string');
    });
});

describe('multiple wrap', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'multiple-wrap'
    }, {
        onBlock: function (ctx) {
            ctx.content({elem: 'item'});
        },
        onElem: {
            'item': function (ctx) {
                ctx.wrap({elem: 'wrap-block-level-1'})
                   .wrap({elem: 'wrap-block-level-2'})
                   .wrap({elem: 'wrap-block-level-3'});
            }
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'multiple-wrap'}});
    it('wrap block', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.content).toBeDefined();
        expect(bemjson.content.elem).toBe('wrap-block-level-3');
        expect(bemjson.content.content).toBeDefined();
        expect(bemjson.content.content.elem).toBe('wrap-block-level-2');
        expect(bemjson.content.content.content).toBeDefined();
        expect(bemjson.content.content.content.elem).toBe('wrap-block-level-1');
        expect(bemjson.content.content.content.content).toBeDefined();
        expect(bemjson.content.content.content.content.elem).toBe('item');
    });
});

describe('wrap with not BEM obj', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'wrap-no-bem'
    }, {
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
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'wrap-no-bem'}});
    it('wrap block', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.content).toBeDefined();
        expect(bemjson.content.elem).toBe('wrap-block-level-3');
        expect(bemjson.content.content).toBeDefined();
        expect(bemjson.content.content.tag).toBe('span');
        expect(bemjson.content.content.content).toBeDefined();
        expect(bemjson.content.content.content.elem).toBe('wrap-block-level-1');
        expect(bemjson.content.content.content.content).toBeDefined();
        expect(bemjson.content.content.content.content.elem).toBe('item');
    });
});

describe('tParams', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 't-params'
    }, {
        onBlock: function (ctx) {
            ctx.content({elem: 'item'});
            ctx.tParam('constant', 'init');
            ctx.tParam('canChange', 'init');
        },
        onElem: {
            'item': function (ctx) {
                ctx.content([
                    {elem: 'inner'}
                ]);
                ctx.param('constant', ctx.tParam('constant'));
                ctx.param('canChange', ctx.tParam('canChange'));
                ctx.tParam('canChange', 'inner');
            },
            'inner': function (ctx) {
                ctx.param('constant', ctx.tParam('constant'));
                ctx.param('canChange', ctx.tParam('canChange'));
            }
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 't-params'}});
    it('tParam pass', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.content).toBeDefined();
        expect(bemjson.content.constant).toBe('init');
        expect(bemjson.content.canChange).toBe('init');
    });
    it('tParam few levels pass', function () {
        expect(bemjson.content.content).toBeDefined();
        expect(bemjson.content.content[0]).toBeDefined();
        expect(bemjson.content.content[0].constant).toBe('init');
    });
});

describe('generateId', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'generateId'
    }, {
        onBlock: function (ctx) {
            ctx.content({elem: 'item'});
            ctx.param('id', ctx.generateId());
        },
        onElem: function (ctx) {
            ctx.param('id', ctx.generateId());
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'generateId'}});
    it('id defined', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.id).toBeDefined();
        expect(bemjson.content.id).toBeDefined();
    });
    it('ids are not equal', function () {
        expect(bemjson.id).not.toEqual(bemjson.content.id);
    });
});

describe('stop', function () {
    var bemjson, bemjsonProcessed, bemjsonStoped;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'stop'
    }, {
        onBlock: function (ctx) {
            ctx.mod('processed', 'no');
        }
    });
    BEM.JSON.decl({
        name:'b-test',
        modName: 'processing',
        modVal: 'yes'
    }, {
        onBlock: function (ctx) {
            ctx.mod('processed', 'yes');
        }
    });
    BEM.JSON.decl({
        name:'b-test',
        modName: 'stop-processing',
        modVal: 'yes'
    }, {
        onBlock: function (ctx) {
            ctx.stop();
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'stop'}});
    bemjsonProcessed = BEM.JSON.build({block: 'b-test', mods: {
        test: 'stop',
        processing: 'yes'
    }});
    bemjsonStoped = BEM.JSON.build({block: 'b-test', mods: {
        test: 'stop',
        processing: 'yes',
        'stop-processing': 'yes'
    }});
    it('processing defined', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.mods).toBeDefined();
        expect(bemjson.mods.processed).toBeDefined();
        expect(bemjson.mods.processed).toBe('no');
    });
    it('processed', function () {
        expect(bemjsonProcessed.mods.processed).toBe('yes');
    });
    it('processing stoped', function () {
        expect(bemjsonStoped.mods.processed).not.toBeDefined();
    });
});


describe('context', function () {
    var bemjsonContext, bemjsonOtherContext;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'context'
    }, {
        onBlock: function (ctx) {
            ctx.afterContent(this.testMethod(), true);
        },

        testProp: 'context',

        testMethod: function () {
            return this.testProp;
        }
    });
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test-context',
        modVal: 'yes'
    }, {
        onBlock: function (ctx) {
            ctx.beforeContent(this.testProp);
        },

        testProp: 'other-context'

    });
    bemjsonContext = BEM.JSON.build({block: 'b-test', mods: {test: 'context'}});
    bemjsonOtherContext = BEM.JSON.build({block: 'b-test', mods: {test: 'context', 'test-context': 'yes'}});
    it('context methods and props', function () {
        expect(bemjsonContext).toBeDefined();
        expect(bemjsonContext.content).toBeDefined();
        expect(Array.isArray(bemjsonContext.content)).toBe(true);
        expect(bemjsonContext.content.pop()).toBe('context');
    });
    it('multiple context', function () {
        expect(bemjsonOtherContext).toBeDefined();
        expect(bemjsonOtherContext.content).toBeDefined();
        expect(Array.isArray(bemjsonOtherContext.content)).toBe(true);
        expect(bemjsonOtherContext.content.pop()).toBe('context');
        expect(bemjsonOtherContext.content.shift()).toBe('other-context');
    });
});

describe('nested elems', function () {
    var bemjson;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'nested-elems'
    }, {
        onBlock: function (ctx) {
            ctx.content({
                elem: 'item-level-1',
                content: {
                    block: 'b-test-nested-elems',
                    elem: 'item-level-2',
                    content: {
                        elem: 'item-level-3'
                    }
                }
            }, true);
        },
        onElem: {
            'item-level-3': function (ctx) {
                ctx.content('b-test', true);
            }
        }
    });
    BEM.JSON.decl('b-test-nested-elems', {
        onElem: {
            'item-level-3': function (ctx) {
                ctx.content('b-test-nested-elems', true);
            }
        }
    });
    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'nested-elems'}});
    it('context methods and props', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.content).toBeDefined();
        expect(bemjson.content.content).toBeDefined();
        expect(bemjson.content.content.content).toBeDefined();
        expect(bemjson.content.content.content.content).toBeDefined();
        expect(bemjson.content.content.content.content).toBe('b-test-nested-elems');
    });
});

describe('remove', function () {
    var bemjson, bemjsonRemoveElem, bemjsonRemoveBlock;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'remove'
    }, {
        onBlock: function (ctx) {
            if (ctx.mod('remove') === 'block') {
                ctx.remove();
            } else {
                ctx.content([
                    {elem: 'item', mods: { 'remove':  ctx.mod('remove') }},
                    {elem: 'item'}
                ], true);
            }
        },
        onElem: {
            'item': function (ctx) {
                if (ctx.mod('remove') === 'elem') {
                    ctx.remove();
                }
            }
        }
    });

    bemjson = BEM.JSON.build({block: 'b-test', mods: {test: 'remove'}});
    bemjsonRemoveBlock = BEM.JSON.build({block: 'b-test', mods: {test: 'remove', remove: 'block'}});
    bemjsonRemoveElem = BEM.JSON.build({block: 'b-test', mods: {test: 'remove', remove: 'elem'}});

    it('not removed', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.content).toBeDefined();
        expect(Array.isArray(bemjson.content)).toBe(true);
        expect(bemjson.content[0].elem).toBeDefined();
        expect(bemjson.content[1].elem).toBeDefined();
    });
    it('not removed block', function () {
        expect(bemjsonRemoveBlock).toBe(null);
    });
    it('not removed element', function () {
        expect(bemjsonRemoveElem).toBeDefined();
        expect(bemjsonRemoveElem.content).toBeDefined();
        expect(Array.isArray(bemjsonRemoveElem.content)).toBe(true);
        expect(bemjsonRemoveElem.content[0]).toBe(null);
        expect(bemjsonRemoveElem.content[1].elem).toBeDefined();
    });
});

describe('decl error', function () {
    var bemjson, commonOnBlock = 0, commonOnElem = 0;
    BEM.JSON.decl({
        name:'b-test',
        modName: 'common-decl',
        modVal: 'yes'
    }, {
        onBlock: function () {
            commonOnBlock++;
        },
        onElem: {
            'item': function () {
                commonOnElem++;
            }
        }
    });
    BEM.JSON.decl({
        name:'b-test',
        modName: 'test',
        modVal: 'decl-error'
    }, {
        onBlock: function (ctx) {
            ctx.content({elem: 'item', mods: {
                error: ctx.mod('elemError')
            }});
            if (ctx.mod('error') === 'yes') {
                throw new Error('Tets decl error handle');
            }
        },
        onElem: {
            'item': function (ctx) {
                if (ctx.mod('error') === 'yes') {
                    throw new Error('Tets decl error handle');
                }
            }
        }
    });

    bemjson = BEM.JSON.build([
        {block: 'b-test', mods: {test: 'decl-error', error: 'yes', 'common-decl': 'yes'}},
        {block: 'b-test', mods: {test: 'decl-error', error: 'no', elemError: 'yes', 'common-decl': 'yes'}},
        {block: 'b-test', mods: {test: 'decl-error', error: 'no', elemError: 'no', 'common-decl': 'yes'}},
    ]);

    it ('common decl', function () {
        expect(commonOnElem).toBe(1);
        expect(commonOnBlock).toBe(2);
    });

    it('handle', function () {
        expect(bemjson).toBeDefined();
        expect(bemjson.length).toBeDefined();
        expect(bemjson[0]).toBe(null);
        expect(bemjson[1]).toBeDefined();
        expect(bemjson[1].content).toBeDefined();
        expect(bemjson[1].content).toBe(null);
        expect(bemjson[2].content).toBeDefined();
        expect(bemjson[2].content.elem).toBeDefined();
    });
});
