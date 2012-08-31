var myPath = require('bem/lib/path');

exports.techs = {
    'js': '../i-bem/bem/techs/js.js'
};

for (var alias in exports.techs) {
    var p = exports.techs[alias];
    if (/\.{1,2}\//.test(p)) exports.techs[alias] = myPath.absolute(p, __dirname);
}

exports.defaultTechs = ['js'];

exports.isIgnorablePath = function(path) {
    return (/\.(git|svn)$/.test(path) ||
        /(GNU|MAC)?[Mm]akefile/.test(path));
};
