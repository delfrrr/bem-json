/**
 * Converts bemjson to html. Use it with BEM.JSON
 *
 * @name BEM.HTML
 * @requires BEM.JSON
 */

if ('undefined' === typeof BEM) {
    BEM = {};
}
(function (BEM) {
    var INTERNAL = BEM.INTERNAL || (function () {
        var MOD_DELIM = '_',
        ELEM_DELIM = '__',
        NAME_PATTERN = '[a-zA-Z0-9-]+';

        function buildModPostfix(modName, modVal, buffer) {
            buffer.push(MOD_DELIM, modName, MOD_DELIM, modVal);
        }

        function buildBlockClass(name, modName, modVal, buffer) {
            buffer.push(name);
            if (modVal) {
                buildModPostfix(modName, modVal, buffer);
            }
        }

        function buildElemClass(block, name, modName, modVal, buffer) {
            buildBlockClass(block, undefined, undefined, buffer);
            buffer.push(ELEM_DELIM, name);
            if (modVal) {
                buildModPostfix(modName, modVal, buffer);
            }
        }

        return {
            NAME_PATTERN: NAME_PATTERN,
            MOD_DELIM: MOD_DELIM,
            ELEM_DELIM: ELEM_DELIM,
            buildModPostfix: function(modName, modVal, buffer) {
                var res = buffer || [];
                buildModPostfix(modName, modVal, res);
                return buffer ? res : res.join('');
            },

            /**
            * Строит класс блока или элемента с учетом модификатора
            * @private
            * @param {String} block имя блока
            * @param {String} [elem] имя элемента
            * @param {String} [modName] имя модификатора
            * @param {String} [modVal] значение модификатора
            * @param {Array} [buffer] буфер
            * @returns {String|Array} строка класса или буфер (в зависимости от наличия параметра buffer)
            */
            buildClass: function (block, elem, modName, modVal, buffer) {
                var typeOf = typeof modName, res;
                if (typeOf === 'string') {
                    if (typeof modVal !== 'string') {
                        buffer = modVal;
                        modVal = modName;
                        modName = elem;
                        elem = undefined;
                    }
                } else if (typeOf !=='undefined') {
                    buffer = modName;
                    modName = undefined;
                } else if (elem && typeof elem !== 'string') {
                    buffer = elem;
                    elem = undefined;
                }
                if (!(elem || modName || buffer)) {
                    return block;
                }
                res = buffer || [];
                if (elem) {
                    buildElemClass(block, elem, modName, modVal, res);
                } else {
                    buildBlockClass(block, modName, modVal, res);
                }
                return buffer ? res : res.join('');
            },

            /**
            * Строит полные классы блока или элемента с учетом модификаторов
            * @private
            * @param {String} block имя блока
            * @param {String} [elem] имя элемента
            * @param {Object} [mods] модификаторы
            * @param {Array} [buffer] буфер
            * @returns {String|Array} строка класса или буфер (в зависимости от наличия параметра buffer)
            */
            buildClasses : function(block, elem, mods, buffer) {
                var res, modVal, modName, elemType = typeof elem
                if (elemType === 'object' || elemType === 'array') {
                    console.log(elem, typeof elem);
                    buffer = mods;
                    mods = elem;
                    elem = undefined;
                }
                res = buffer || [];
                if (elem) {
                    buildElemClass(block, elem, undefined, undefined, res);
                } else {
                    buildBlockClass(block, undefined, undefined, res);
                }
                if (mods) {
                    for (modName in mods){
                        if (mods.hasOwnProperty(modName)) {
                            modVal = mods[modName];
                            if (modVal) {
                                res.push(' ');
                                if (elem) {
                                    buildElemClass(block, elem, modName, modVal, res);
                                } else {
                                    buildBlockClass(block, modName, modVal, res);
                                }
                            }
                        }
                    }
                }
                return buffer ? res : res.join('');
            }

        }
    }()),
    ELEM_DELIM = INTERNAL.ELEM_DELIM,
    SHORT_TAGS = {
        area : 1, base : 1, br : 1, col : 1, command : 1, embed : 1, hr : 1, img : 1,
        input : 1, keygen : 1, link : 1, meta : 1, param : 1, source : 1, wbr : 1 },
    buildClass = INTERNAL.buildClass,
    buildClasses = INTERNAL.buildClasses,
    attrEscapes = { '"': '\'', '&': '&amp;', '<': '&lt;', '>': '&gt;' },
    attrEscapesRE = /['"&<>]/g;

    BEM.HTML = {

        /**
         * Escapes attributes values
         *
         * @param {String} attrVal attribute value
         * @return {String} attribute escaped value
         */
        _escapeAttr: function (attrVal) {
            if (attrVal) {
                return String(attrVal).replace(attrEscapesRE, function(needToEscape) {
                    return attrEscapes[needToEscape];
                });
            }
            return '';
        },

        /**
         * Set block declaration
         *
         * @alias BEM.JSON.decl
         * @param {String|Object} decl block name
         * @param {String} decl.name name
         * @param {String} [decl.modName] modifier name
         * @param {String} [decl.modVal] modifier value
         * @param {Object} props declarations
         * @param {Function} props.onBlock block root declaration
         * @param {Function|Object} props.onElem elems declarations
         */
        decl: BEM.JSON.decl.bind(BEM.JSON),

        /**
         * Add attributes of html tag for current block or elem
         *
         * @param {Object} attrs attributes hashmap
         * @param {Array} buffer output buffer
         */
        _addAttrs: function (attrs, buffer) {
            var output = buffer || [],
                attribute;
            for (attribute in attrs) {
                if (attrs.hasOwnProperty(attribute)) {
                    output.push(' ', attribute, '="', this._escapeAttr(attrs[attribute]), '"');
                }
            }
        },

        /**
         * Convert bem object to html
         *
         * @param {Object} param bem object
         * @param {Object} [block] current block name
         * @return {String} html
         */
        _buildBem: function (params, block) {
            var buffer = [],
            mix = [],
            jsParams,
            addInitClass = false;
            params.tag = params.tag || 'div';
            if (params.js) {
                jsParams = {};
                jsParams[buildClass(params.block || block, params.elem)] = params.js === true ? {} : params.js;
                addInitClass = !Boolean(params.elem);
            }
            buffer.push(
                '<',
                params.tag
            );
            if (params.block || params.elem) {
                //build class
                buffer.push(
                    ' class="',
                    buildClasses(params.block || block, params.elem, params.mods)
                );
                //console.log([buildClasses(params.block || block, params.elem, params.mods), [params.block || block, params.elem, params.mods]]);
                if (params.mix) {
                    mix.concat(params.mix).forEach(function (mixedParams) {
                        buffer.push(' ');
                        buildClasses(mixedParams.block || block, mixedParams.elem, mixedParams.mods, buffer);
                        if (mixedParams.js) {
                            jsParams = jsParams || {};
                            jsParams[buildClass(mixedParams.block || block, mixedParams.elem)] = mixedParams.js === true ? {} : mixedParams.js;
                            addInitClass = addInitClass || !Boolean(params.elem);
                        }
                    });
                }
                if (addInitClass) {
                    buffer.push(' i-bem');
                }
                if (params.cls) {
                    buffer.push(' ' + String(params.cls));
                }
                buffer.push('"');
            }
            if (jsParams) {
                buffer.push(
                    ' onclick="return ',
                    this._escapeAttr(JSON.stringify(jsParams)),
                    '"'
                );
            }
            if (params.attrs) {
                this._addAttrs(params.attrs, buffer);
            }
            if (SHORT_TAGS[params.tag]) {
                buffer.push('/>');
            } else {
                buffer.push('>');
                if (params.content) {
                    buffer.push(this._build(
                        params.content,
                        params.block || block
                    ));
                }
                buffer.push('</', params.tag,'>');
            }
            return buffer.join('');
        },


        /**
         * Convert bemjson to html
         *
         * @param {Object} param bemjson object
         * @param {Object} [block] current block name
         * @return {String} html
         */
        _build: function (params, block) {
            if (params) {
                if (Array.isArray(params)) {
                    return params.map(function (params) {
                        return this._build(params, block);
                    }.bind(this)).join('');
                } else if (params.block || params.elem || params.tag || params.content) {
                    return this._buildBem(params, block);
                } else {
                    return String(params);
                }
            } else {
                return '';
            }
        },

        /**
         * Applies declarations to bemjson and return html
         *
         * @param {Object} param bemjson object
         * @return {String} html
         */
        build: function (params) {
            return this._build(BEM.JSON.build(params));
        }
    };
}(BEM));
