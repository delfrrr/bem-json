/**
 * BEM.INTERNAL without dependence on jQuery
 * Can be executed on server side
 *
 * @name BEM.INTERNAL
 */

if (typeof BEM === 'undefined') {
    BEM = {};
}
(function (BEM) {
    BEM.INTERNAL = BEM.INTERNAL || (function () {
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
            * Build block or element clsss name
            *
            * @param {String} block
            * @param {String} [elem]
            * @param {String} [modName]
            * @param {String} [modVal]
            * @param {Array} [buffer] output buffer
            * @returns {String|Array} result string or buffer
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
            * Build full class name with  mods
            *
            * @param {String} block
            * @param {String} [elem]
            * @param {Object} [mods]
            * @param {Array} [buffer] output buffer
            * @returns {String|Array} result string or buffer
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
    }());
}(BEM));
