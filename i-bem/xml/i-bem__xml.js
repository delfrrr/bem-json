/**
 * Convers bemjson to lego xml
 *
 * @name BEM.XML
 * @requires xscript
 */



if ('undefined' === typeof BEM) {
    BEM = {};
}
(function (BEM) {
    var
    /**
     * Xml ns for lego
     *
     * @access private
     * @var {String}
     */
    LEGO_NS = 'lego:',

    /**
     * Xml ns for xhtml
     *
     * @access private
     * @var {String}
     */
    XHTML_NS = 'xhtml:',


    /**
     * List of xml ns that will be added to all of root nodes
     *
     * @access private
     * @var {Object}
     */
    _xmlNs = {
        'xmlns:lego': 'https://lego.yandex-team.ru',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
    },

    /**
     * Map of defined builders
     *
     * @access private
     * @var {Object}
     */
    _builders = {},

    /**
     * Map of builder's names for special declaration's attributes
     *
     * @access private
     * @var {Object}
     */
    _attrBuildersMap = {
        mods: 'mods',
        elemMods: 'mods',
        attrs: 'attrs',
        mix: 'mix',
        content: 'content',
        block: 'block',
        elem: 'elem',
        tag: 'tag'
    },

    /**
     * List of declaration's attributes that will be ignored
     *
     * @access private
     * @var {Array}
     */
    _attrIgnoreList = ['block', 'elem', 'tag', 'mix', 'content', 'mods', 'elemMods', 'attrs'],

    /**
     * Name of default builder for declaration's attribute
     *
     * @access private
     * @var {String}
     */
    _attrDefaultBuilder = 'attr',

    /**
     * Context declaration for BEM.XML
     *
     * @access private
     * @var {Function}
     */
    Ctx;


    /**
     * Builder for declaration's 'block' attribute
     *  If 'elem' attribute is present at the declaration,
     *  adds 'b' attribute to xml with value of 'block' attribute.
     *  Otherwise set 'block' with lego-ns as node name
     *
     * @access private
     * @param {Ctx} ctx instance of BEM.XML context
     * @param {String} attrName name of 'elem' attribute
     */
    _builders.block = function(ctx, attrName) {
        var nodeDecl = ctx._currDecl;
        if (nodeDecl.elem) {
            ctx.addNodeAttr('b', nodeDecl[attrName]);
        } else {
            ctx._currXmlData.nodeName = LEGO_NS + nodeDecl[attrName];
        }
    };

    /**
     * Builder for declaration's 'elem' attribute
     *  Set 'elem' with lego-ns as node name
     *
     * @access private
     * @param {Ctx} ctx instance of BEM.XML context
     * @param {String} attrName name of 'elem' attribute
     */
    _builders.elem = function(ctx, attrName) {
        ctx._currXmlData.nodeName = LEGO_NS + ctx._currDecl[attrName];
    };

    /**
     * Builder for declaration's 'tag' attribute
     *  If 'block' or 'eleme' attribute is present at the declaration,
     *  adds 'tag' attribute to xml.
     *  Otherwise set 'tag' with xhtml-ns as node name
     *
     * @access private
     * @param {Ctx} ctx instance of BEM.XML context
     * @param {String} attrName name of 'tag' attribute
     */
    _builders.tag = function(ctx, attrName) {
        var nodeDecl = ctx._currDecl;
        if (nodeDecl.elem || nodeDecl.block) {
            ctx.addNodeAttr(attrName, nodeDecl[attrName]);
        } else {
            ctx._currXmlData.nodeName = XHTML_NS + nodeDecl[attrName];
        }
    };

    /**
     * Builder for declaration's 'mods' attribute
     *
     * @access private
     * @param {Ctx} ctx instance of BEM.XML context
     * @param {String} inAttrName name of declaration's attribute with mods list
     */
    _builders.mods = function(ctx, inAttrName) {
        var attrValue = ctx._currDecl[inAttrName],
            attrName;
        for (attrName in attrValue) {
            if (attrValue.hasOwnProperty(attrName)) {
                ctx.addNodeAttr(attrName, attrValue[attrName], LEGO_NS);
            }
        }
    };

    /**
     * Builder for declaration's 'attrs' attribute
     *
     * @access private
     * @param {Ctx} ctx instance of BEM.XML context
     * @param {String} inAttrName name of declaration's attribute
     */
    _builders.attrs = function(ctx, inAttrName) {
        var attrValue = ctx._currDecl[inAttrName],
            attrName;
        for (attrName in attrValue) {
            if (attrValue.hasOwnProperty(attrName)) {
                ctx.addNodeAttr(attrName, attrValue[attrName], XHTML_NS);
            }
        }
    };

    /**
     * Builder for declaration's attribute
     *
     * @access private
     * @param {Ctx} ctx instance of BEM.XML context
     * @param {String} attrName name of declaration's attribute
     */
    _builders.attr = function(ctx, attrName) {
        var attrValue = ctx._currDecl[attrName];
        if ('object' === typeof attrValue) {
            attrValue = JSON.stringify(attrValue);
        }
        ctx.addNodeAttr(attrName, attrValue);
    };

    /**
     * Builder for declaration's 'mix' attribute
     *
     * @access private
     * @param {Ctx} ctx instance of BEM.XML context
     */
    _builders.mix = function(ctx) {
        var decl = ctx._currDecl;
        if (decl.mix && decl.mix.length) {
            ctx.addContent([
                '<', LEGO_NS, 'mix>',
                    (new Ctx(decl.mix)).build(),
                '</', LEGO_NS, 'mix>'
            ].join(''));
        }
    };

    /**
     * Builder for declaration's content
     *
     * @access private
     * @param {Ctx} ctx instance of BEM.XML context
     */
    _builders.content = function(ctx) {
        ctx.addContent(
            (new Ctx(ctx._currDecl.content)).build()
        );
    };


    /**
     * Utilitary function
     * Extend root nodes with given ns attributes
     *
     * @param {Object|Array} params bem json declaration
     * @param {Object} ns hash of ns attributes
     */
    function defineNamespace(params, ns) {
        var i;
        if (Array.isArray(params)) {
            params.map(function(param) {
                defineNamespace(param, ns);
            });
        } else if (null !== params && 'object' === typeof params) {
            for (i in ns) {
                if (ns.hasOwnProperty(i)) {
                    params[i] = ns[i];
                }
            }
        }
    }


    /**
     * Context declaration for BEM.XML
     *
     * @access private
     * @param {*} params. Bem Json declaration
     */
    Ctx = function(params) {
        this._params = params;
        this._currDecl = params;
        this._currXmlData = {
            nodeName: null,
            nodeAttrs: [],
            children: []
        };
    };

    Ctx.prototype = {
        /**
         * Convert current BEM.JSON declaration to XML
         *
         * @return {String} Bem Xml for current BEM.JSON declaration
         */
        build: function() {
            var decl = this._currDecl,
                attrName, xml, i;
            if (Array.isArray(decl)) {
                xml = [];
                for (i = 0; i < decl.length; i ++) {
                    xml.push((new Ctx(decl[i])).build());
                }
                xml = xml.join('');
            } else if (null === decl || undefined === decl) {
                xml = '';
            } else if ('object' === typeof decl) {
                for (attrName in decl) {
                    if (decl.hasOwnProperty(attrName)) {
                        // build xml for known attributes
                        if (_attrBuildersMap[attrName]) {
                            this.callBuilder(_attrBuildersMap[attrName], [attrName]);
                        // build xml for unknown attributes
                        } else if (-1 === _attrIgnoreList.indexOf(attrName)) {
                            this.callBuilder(_attrDefaultBuilder, [attrName]);
                        }
                    }
                }
                xml = this.convertToXml();
            } else {
                xml = String(decl);
            }

            return xml;
        },

        /**
         * Call registered builder with given name and arguments
         *
         * @param {String} name. Builder name
         * @param {Array} args. optional. Arguments for builder
         *  first arguments that will be passed to a builder is always current context
         */
        callBuilder: function(name, args) {
            args = [this].concat(args);
            _builders[name].apply(this, args);
        },

        /**
         * Add an attribute to the current xml element
         *
         * @param {String} attr. An attribute name
         * @param {String} value. An attribute value
         * @param {String} ns. optional. Additional ns for an attribute
         */
        addNodeAttr: function(attr, value, ns) {
            value = String(value);
            if (-1 !== value.indexOf('"')) {
                value = xscript.xmlescape(value);
            }
            this._currXmlData.nodeAttrs.push(
                [ns || '', attr, '="', value, '"'].join('')
            );
        },

        /**
         * Add a content to the current xml element
         *
         * @param {String} xml. Xml content that will be added to the current xml element
         */
        addContent: function(xml) {
            this._currXmlData.children.push(xml);
        },

        /**
         * Convert current declaration to lego xml
         *
         * @return {String} xml
         */
        convertToXml: function() {
            var xmlData = this._currXmlData,
                xml = ['<', xmlData.nodeName];
            if (xmlData.nodeAttrs.length) {
                xml.push(' ', xmlData.nodeAttrs.join(' '));
            }
            if (xmlData.children.length) {
                xml.push('>', xmlData.children.join(''), '</', xmlData.nodeName, '>');
            } else {
                xml.push('/>');
            }
            return xml.join('');
        }
    };

    BEM.XML = {
        build: function (params, xmlNs) {
            defineNamespace(params, _xmlNs);
            if (xmlNs) {
                defineNamespace(params, xmlNs);
            }
            return (new Ctx(params)).build();
        }
    };
}(BEM));
