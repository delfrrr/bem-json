/**
 * Processing bemjson using same declarations and api as BEM.HTML
 *
 * @name BEM.JSON
*/
if (typeof BEM === 'undefined') {
    BEM = {};
}
(function (BEM, $) {
    var decls = {},
        addPropToDecl = function (decl, name, fn) {
            if (!decl[name]) {
                decl[name] = [];
            }
            decl[name].unshift(fn);
        },
        buildDeclFn = function (fn, desc, props) {
            return desc.modName ?
                   function (ctx) {
                        //FIXME: do not apply when declaration has no modVal but have modName
                        if (ctx._currBlock.mods && ctx._currBlock.mods[desc.modName] === desc.modVal) {
                            fn.call(props, ctx);
                        }
                    } :
                    fn.bind(props);
        },
        class2type = {},
        type =  function (obj) {
            return obj === null || typeof(obj) === 'undefined' ?
                String(obj) :
                class2type[Object.prototype.toString.call(obj)] || "object";
        },
        isFunction = function (fn) {
            return (typeof fn === 'function');
        },
        isArray =  Array.isArray || function (obj) {
            return type(obj) === "array";
        },
        isBem = function (obj) {
            return Boolean(obj && (obj.block || obj.elem || obj.tag));
        },

        /**
         * Extend object with other objects
         *
         * @param {object} targetObj
         * @param {...object} [sourceObj]
         */
        extend = function (targetObj) {
            var options, name, src, copy,
                target = typeof targetObj === 'object' ? targetObj : {},
                i = 1,
                length = arguments.length;

            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                options = arguments[i];
                if (options !== null) {
                    // Extend the base object
                    for (name in options) {
                        if (options.hasOwnProperty(name)) {
                            src = target[name];
                            copy = options[name];
                            // Prevent never-ending loop
                            if (target !== copy) {
                                target[name] = copy;
                            }
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        },
        identify = function () {
            var counter = 0;
            //using self defined functions pattern
            //see https://github.com/shichuan/javascript-patterns/blob/master/function-patterns/self-defining-functions.html
            if ($ && $.identify) {
                identify = function () {
                    return $.identify();
                };
            } else {
                identify = function () {
                    return 'uniq' + (++counter);
                };
            }
            return identify();
        },
        join = Array.prototype.concat.bind([]),
        ELEM_DELIM = (BEM && BEM.INTERNAL && BEM.INTERNAL.ELEM_DELIM) || '__',
        Ctx;

    //define class2type
    ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object'].forEach(function (name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    /**
    * Context
    *
    * @constructor
    * @param {*} params bemjson object
    * @param {Number} [pos] pos position of bem element in parent content (start from 1)
    * @param {Number} [params] siblingsCount amount of elents in parent content
    * @param {Object} [currBlock] parent block of element
    * @param {Object} [tParams] tunneled params
    * @return {*} bemjson
    */
    Ctx = function (params, pos, siblingsCount, currBlock, tParams) {
        this._params = params;
        this._currBlock = currBlock;
        this._tParams = tParams;
        this._pos = pos || 1;
        this._siblingsCount = siblingsCount || 1;
        this._isStopped = false;
        this._isRemoved = false;
        if (
            params.block &&
            !(params.elem && currBlock && currBlock.block === params.block)//element form same block as current
        ) {
            this._currBlock = params;
        }
    };
    Ctx.prototype = {

        _buildWithNewCtx: function (params, pos, siblingsCount, currBlock, tParams) {
            return (new Ctx(
                params,
                pos,
                siblingsCount,
                currBlock,
                tParams
            )).build();
        },

        /**
        * Recursive init Ctx for inner elements
        *
        * @private
        * @param {*} params bemjson with inner elements
        * @param {number} [pos] position of bem element in parent content (start from 1)
        * @param {number} [siblingsCount] amount of elents in parent content
        * @return {*} bemjson
        */
        _buildInner: function (params, pos, siblingsCount, parent) {
            var currBlock,
                paramsType = type(params);
            if (parent && isBem(params)) {
                params._parent = parent;
            }
            if (paramsType === 'object' || paramsType === 'array') {
                if (
                    (!params.block) || //not block (elem or array)
                    (this._currBlock && (params.block === this._currBlock.block) && params.elem) //elem with defined block param
                ) {
                    currBlock = this._currBlock;
                }
                return this._buildWithNewCtx(
                    params,
                    pos,
                    siblingsCount,
                    currBlock,
                    this._tParams && extend({}, this._tParams)
                );
            }
            return params;
        },

        /**
         * Context position
         *
         * @returns {Number}
         */
        pos: function () {
            return this._pos;
        },

        /**
         * Checks if current context is first
         *
         * @returns {Boolean}
         */
        isFirst: function () {
            return this._pos === 1;
        },

        /**
         * Checks if current context is last
         *
         * @returns {Boolean}
         */
        isLast: function () {
            return this._pos === this._siblingsCount;
        },

        /**
         * Return or set context params
         *
         * @param {Object} [params] params
         */
        params: function (params) {
            if (typeof params === 'undefined') {
                return this._params;
            }
            this._params = params;
            return this;
        },


        /**
         * Return or set one context param
         *
         * @param {String} param name
         * @param {String} [val] param value
         * @param {Boolean} [force=false] set param, even if it exists
         * @param {Boolean} [needExtend=false] extend param
         */
        param: function (name, val, force, needExtend) {
            var params = this._params;
            if (typeof val === 'undefined') {
                return params[name];
            }
            if (force || !(params.hasOwnProperty(name))) {
                params[name] = val;
            } else if (needExtend) {
                params[name] = extend(val, params[name]);
            }
            return this;
        },

        /**
         * Return or set content of context (shortcut to params('content', val))
         *
         * @param {String|Object|Array} [val] content
         * @param {Boolean} [force=false] set content, even if it exists
         */
        content: function (val, force) {
            return this.param('content', val, force);
        },

        /**
         * Return or set modifiers of context (shortcut to params('mods', val))
         *
         * @param {Object} [val] modifiers
         * @param {Boolean} [force=false] set modifiers, even if it exists
         */
        mods: function (val, force) {
            return this.param('mods', val, force, true);
        },

        _property: function (propName, args) {
            var properties = this._params[propName] = this._params[propName] || {},
                name = args[0],
                val = args[1],
                force = args[2];
            if (arguments.length < 2) {
                return properties[name];
            }
            if (force || !(properties.hasOwnProperty(name))) {
                properties[name] = val;
            }
            return this;
        },

        /**
         * Return or set modifier
         *
         * @param {String} name modifier name
         * @param {String} [val] modifier value
         * @param {Boolean} [force=false] set modifier, even if it exists
         */
        mod: function () {
            return this._property('mods', arguments);
        },

        /**
         * Return or set HTML attribute
         *
         * @param {String} name attribute name
         * @param {String} [val] attribute value
         * @param {Boolean} [force=false] set attribute, even if it exists
         */
        attr: function () {
            return this._property('attrs', arguments);
        },

        /**
         * Return or set HTML attributes of context (shortcut to params('attrs', val))
         *
         * @param {Object} [val] HTML attributes
         * @param {Boolean} [force=false] set HTML attributes, even if they exists
         */
        attrs: function (val, force) {
            return this.param('attrs', val, force, true);
        },

        /**
         * Return or set tag name for context (shortcut to params('tag', val))
         *
         * @param {String} [val] tag name
         * @param {Boolean} [force=false] set tag, even if it exists
         */
        tag: function (val, force) {
            return this.param('tag', val, force);
        },

        /**
         * Return or set additional CSS class for context (shortcut to params('cls', val))
         *
         * @param {String} [val] class name
         * @param {Boolean} [force=false] set additional class, even if it exists
         */
        cls: function (val, force) {
            return this.param('cls', val, force);
        },

        /**
         * Return or set mixed blocks and elements
         *
         * @param {Array} [val] array with blocks and elements to mix
         * @param {Boolean} [force=false] set mix, even if it exists; otherwise add mixes
         */
        mix: function (val, force) {
            var params = this._params;

            if (typeof val === 'undefined') {
                return params.mix;
            }

            //params.mix should be array
            if (force || !(params.hasOwnProperty('mix'))) {
                params.mix = [].concat(val);
            } else {
                params.mix = (params.mix || []).concat(val);
            }

            return this;
        },

        /**
         * Return or set js params (shortcut to params('js', val))
         *
         * @param {String|Object|Array} [val] js params
         * @param {Boolean} [force=false] set js params, even if it exists
         */
        js: function (val) {
            return this.param('js', val);
        },


        /**
         * Wrap content of context with other bem object
         *
         * @param {Object} obj
         */
        wrapContent: function (obj) {
            var params = this._params;
            obj.content = params.content;
            params.content = obj;
            return this;
        },


        /**
         * Add one or few bem objects before content of context
         *
         * @param {Object|Array} obj
         */
        beforeContent: function (obj) {
            var params = this._params;
            params.content = join(obj, params.content);
            return this;
        },

        /**
         * Add one or few bem objects after content of context
         *
         * @param {Object|Array} obj
         */
        afterContent: function (obj) {
            var params = this._params;
            params.content = join(params.content, obj);
            return this;
        },

        /**
         * Wrap context with other bem object
         *
         * @param {Object} obj bem object
         */
        wrap: function (obj) {
            if (isBem(obj)) {
                obj.content = this._params._wrapper || this._params;
            }
            this._params._wrapper = obj;
            return this;
        },

        /**
         * Return or set tunneled param of context.
         * Tunneled params are passed in to context of sub-elements
         *
         * @param {String} name param name
         * @param {String} [val] param value
         */
        tParam: function (name, val) {
            var tParams = this._tParams = this._tParams || {};
            if (typeof val === 'undefined') {
                return tParams[name];
            }
            tParams[name] = val;
            return this;
        },

        /**
         * generate unique id
         *
         * returns {String}
         */
        generateId: function () {
            return identify();
        },

        /**
         * Stop the execution of the basic patterns
         */
        stop: function () {
            this._isStopped = true;
        },

        /**
         * Remove bem object
         */
        remove: function () {
            this._isRemoved = true;
            this.stop();
        },

        /**
         * Continue building bem block/element
         */
        _buildBem: function () {
            var params = this._params,
                parent = params._parent;
            delete params._parent;

            //remove
            if (this._isRemoved) {
                //remove from parent
                if (parent) {
                    //remove from array
                    if (isArray(parent)) {
                        parent[this._pos - 1] = null;
                    } else if (parent.content) { //remove from parent.content
                        parent.content = null;
                    }
                }
                //remove param
                this._params = null;
                return;
            }


            //build content
            params.content = this._buildInner(params.content, 1, 1, params);

            //build wraper
            if (params._wrapper) {
                this._params =  this._buildInner(params._wrapper, 1, 1, parent);
                if (parent) {
                    if (isArray(parent)) {
                        parent[this._pos - 1] = this._params;
                    } else if (parent.content) {
                        parent.content = this._params;
                    }
                }

            }

        },

        /**
         * Applies block declarations to context
         *
         * @return {Object} bemjson object
         */
        build: function () {
            var params = this._params,
                ctx = this,
                decl;
            if (params._wrapper) { //obj was processed before and wraped
                delete params._wrapper;
                return params;
            }
            if (params.block || params.elem) { //build bem obj
                decl = this._currBlock && decls[this._currBlock.block];
                if (decl) {
                    this._fns = [];
                    if (params.elem) {
                        this._fns.push.apply(this._fns, decl['_elem' + ELEM_DELIM + params.elem] || []);
                        this._fns.push.apply(this._fns, decl['_elem'] || []);
                    } else {
                        this._fns.push.apply(this._fns, decl._block || []);
                    }
                    this._runDecls();
                }
                this._buildBem();
                params = this._params;
            } else if (isArray(params)) { //build array
                params.forEach(function (param, pos) {
                    params[pos] = ctx._buildInner(param, pos + 1, params.length, params); //pos start from 1
                });
                // params = params.map(function (param, pos) {
                //     return ctx._buildInner(param, pos + 1, params.length, params); //pos start from 1
                // });
            } else if (params.content) { //some object with content
                params.content = this._buildInner(params.content, 1, 1, params);
            }
            return params;
        },

        /**
         * call chain of declarations for block or element
         */
        _runDecls: function () {
            var i;
            if (this._fns.length) {
                try {
                    for (i = 0; i < this._fns.length; i++) {
                        this._fns[i](this);
                        if (this._isStopped) {
                            break;
                        }
                    }
                } catch (err) {
                    this.remove();
                    this._declErrorHandler(err);
                }
            }
        },

        /**
         * Default handler for errors in decls
         */
        _declErrorHandler: function (err) {
            console.error(err);
        }
    };
    BEM.JSON = {

        _ctx: Ctx,

        /**
         * Set declarations
         *
         * @param {String|Object} decl block name
         * @param {String} decl.name name
         * @param {String} [decl.modName] modifier name
         * @param {String} [decl.modVal] modifier value
         * @param {Object} props declarations
         * @param {Function} props.onBlock block root declaration
         * @param {Function|Object} props.onElem elems declarations
         */
        decl: function (desc, props) {
            var descObj = typeof desc === 'string' ? { name: desc } : desc,
                decl = decls[descObj.name] = decls[descObj.name] || {};
            if (props.onBlock) {
                addPropToDecl(decl, '_block', buildDeclFn(props.onBlock, desc, props));
            }
            if (props.onElem) {
                if (isFunction(props.onElem)) {
                    addPropToDecl(decl, '_elem', buildDeclFn(props.onElem, desc, props));
                } else {
                    Object.keys(props.onElem).forEach(function (elem) {
                        addPropToDecl(
                            decl,
                            '_elem' + (elem === '*' ? '' : ELEM_DELIM + elem),
                            buildDeclFn(props.onElem[elem], desc, props)
                        );
                    });
                }
            }

        },
        /**
         * Applies declarations to bemjson
         *
         * @param {Object} param bemjson object
         * @return {Object} bemjson object
         */
        build: function (params) {
            return (new Ctx(params)).build();
        }
    };
}(BEM, typeof jQuery !== 'undefined' ? jQuery : null));

