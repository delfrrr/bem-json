/*global describe: false, it: false, waitsFor: false, runs: false, expect: false */
describe('__async bem-json', function () {

    it('declaration', function () {
        expect(BEM.JSON.buildAsync).toBeDefined();
    });

    it('process sync bemjson', function () {
        var json;

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

        BEM.JSON.buildAsync({block: 'b-test'}, function (jsonParam) {
            json = jsonParam;
        });
        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.block).toBe('b-test');
            expect(json.content).toBeDefined();
            expect(json.content.elem).toBeDefined();
            expect(json.content.elem).toBe('item');
            expect(json.content.content).toBe('test string');
        });

    });

    it('process async bemjson', function () {
        var json;

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'async'}, {
            onBlock: function (ctx) {
                ctx.wait();
                setTimeout(function () {
                    ctx.content('async content', true);
                    ctx.resume();
                }, 100);
            }
        });

        BEM.JSON.buildAsync({block: 'b-test', mods: {test: 'async'}}, function (jsonParam) {
            json = jsonParam;
        });

        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.content).toBe('async content');
        });

    });

    it('process async multiple elems', function () {
        var json;

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'multiple-elems'}, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item-sync'},
                    {elem: 'item-async', timeout: 100},
                    {elem: 'item-async', timeout: 200, mods: {'async-param': 'yes'}}
                ], true);
            },
            onElem: {
                'item-sync': function (ctx) {
                    ctx.content('item-sync');
                },
                'item-async': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.content('item-async');
                        ctx.resume();
                    }, ctx.param('timeout'));
                    if (ctx.mod('async-param') === 'yes') {
                        ctx.wait();
                        setTimeout(function () {
                            ctx.param('async-param', 'yes');
                            ctx.resume();
                        }, ctx.param('timeout'));
                    }
                }
            }
        });

        BEM.JSON.buildAsync({block: 'b-test', mods: {test: 'multiple-elems'}}, function (jsonParam) {
            json = jsonParam;
        });

        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.content).toBeDefined();
            expect(json.content[0]).toBeDefined();
            expect(json.content[0].content).toBe('item-sync');
            expect(json.content[1]).toBeDefined();
            expect(json.content[1].content).toBe('item-async');
            expect(json.content[2]).toBeDefined();
            expect(json.content[2].content).toBe('item-async');
            expect(json.content[2]['async-param']).toBe('yes');
            expect(typeof json.content[0]['async-param']).toBe('undefined');
            expect(typeof json.content[1]['async-param']).toBe('undefined');
        });

    });

    it('process async multiple elems', function () {
        var json;

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'multiple-elems'}, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item-sync'},
                    {elem: 'item-async', timeout: 100},
                    {elem: 'item-async', timeout: 200, mods: {'async-param': 'yes'}}
                ], true);
            },
            onElem: {
                'item-sync': function (ctx) {
                    ctx.content('item-sync');
                },
                'item-async': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.content('item-async');
                        ctx.resume();
                    }, ctx.param('timeout'));
                    if (ctx.mod('async-param') === 'yes') {
                        ctx.wait();
                        setTimeout(function () {
                            ctx.param('async-param', 'yes');
                            ctx.resume();
                        }, ctx.param('timeout'));
                    }
                }
            }
        });

        BEM.JSON.buildAsync({block: 'b-test', mods: {test: 'multiple-elems'}}, function (jsonParam) {
            json = jsonParam;
        });

        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.content).toBeDefined();
            expect(json.content[0]).toBeDefined();
            expect(json.content[0].content).toBe('item-sync');
            expect(json.content[1]).toBeDefined();
            expect(json.content[1].content).toBe('item-async');
            expect(json.content[2]).toBeDefined();
            expect(json.content[2].content).toBe('item-async');
            expect(json.content[2]['async-param']).toBe('yes');
            expect(typeof json.content[0]['async-param']).toBe('undefined');
            expect(typeof json.content[1]['async-param']).toBe('undefined');
        });

    });

    it('process async for nested blocks', function () {
        var json;

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'nested-blocks'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'}, true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.content({block: 'b-test', mods: {nested: 'yes'}}, true);
                        ctx.resume();
                    }, 100);
                }
            }
        });

        BEM.JSON.decl({name: 'b-test', modName: 'nested', modVal: 'yes'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'}, true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.content('async-content', true);
                        ctx.resume();
                    }, 100);
                }
            }
        });

        BEM.JSON.buildAsync({block: 'b-test', mods: {test: 'nested-blocks'}}, function (jsonParam) {
            json = jsonParam;
        });

        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.content).toBeDefined();
            expect(json.content.content).toBeDefined();
            expect(json.content.content.content).toBeDefined();
            expect(json.content.content.content.content).toBe('async-content');
        });

    });

    it('wait for processing decls', function () {
        var json;

        BEM.JSON.decl({name: 'b-test', modName: 'common-for', modVal: 'wait-for-decls'}, {
            onBlock: function (ctx) {
                ctx.content([
                    String(ctx.params().someParam),
                    {elem: 'item'}
                ]);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.beforeContent('async-item-content');
                        ctx.resume();
                    }, 100);

                }
            }
        });

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'wait-for-decls'}, {
            onBlock: function (ctx) {
                ctx.wait();
                setTimeout(function () {
                    ctx.params().someParam = 'async-content';
                    ctx.resume();
                }, 100);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.content('sync-item-content');
                }
            }
        });

        BEM.JSON.buildAsync({block: 'b-test', mods: {test: 'wait-for-decls', 'common-for': 'wait-for-decls'}}, function (jsonParam) {
            json = jsonParam;
        });

        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.content).toBeDefined();
            expect(json.content[0]).toBe('async-content');
            expect(json.content[1]).toBeDefined();
            expect(json.content[1].content).toBeDefined();
            expect(json.content[1].content[0]).toBe('async-item-content');
            expect(json.content[1].content[1]).toBe('sync-item-content');
        });

    });

    it('async remove', function () {
        var json;


        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'async-remove'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item', content: 'test string'}, true);
            },
            onElem: function (ctx) {
                ctx.wait();
                setTimeout(function () {
                    ctx.remove();
                    ctx.resume();
                }, 100);
            }
        });

        BEM.JSON.buildAsync({block: 'b-test', mods: {test: 'async-remove'}}, function (jsonParam) {
            json = jsonParam;
        });

        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.content).toBe(null);
        });

    });

    it('async remove from array', function () {
        var json;


        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'async-remove-from-arr'}, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item', content: 'test string'},
                    {elem: 'item2', content: 'test string'}
                ], true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.remove();
                        ctx.resume();
                    }, 100);
                }
            }
        });

        BEM.JSON.buildAsync({block: 'b-test', mods: {test: 'async-remove-from-arr'}}, function (jsonParam) {
            json = jsonParam;
        });

        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.content).toBeDefined();
            expect(json.content[0]).toBe(null);
            expect(json.content[1].content).toBe('test string');
        });

    });

    it('async wrap', function () {
        var json;


        BEM.JSON.decl({name: 'b-test-wrap', modName: 'test', modVal: 'async-wrap'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item', content: 'test string'}, true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.wrap({elem: 'item-wraper', block: 'b-test-wrap'});
                        ctx.resume();
                    }, 100);
                }
            }
        });

        BEM.JSON.buildAsync({block: 'b-test-wrap', mods: {test: 'async-wrap'}}, function (jsonParam) {
            json = jsonParam;
        });

        waitsFor(function () {
            return json;
        }, 'json never builded', 1000);

        runs(function () {
            expect(json).toBeDefined();
            expect(json.content).toBeDefined();
            expect(json.content.elem).toBe('item-wraper');
            expect(json.content.content).toBeDefined();
            expect(json.content.content.elem).toBe('item');
            expect(json.content.content.content).toBe('test string');
        });

    });



});
