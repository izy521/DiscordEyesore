//"What even is this you madman?!"
//https://gist.github.com/izy521/4d394dec28054d54684269d91b16cb8a
//Minor changes from that one though

function fastClone(o) {
    if (!o) return;
    var k = Object.keys(o), io = (o instanceof Array ? [] : {}), i = k.length;
    for (;i--;) {
        if ( o[k[i]] && o[k[i]].constructor === Object ) {
            io[ k[i] ] = fastClone(o[k[i]]);
            continue;
        }
        io[ k[i] ] = copy(o[k[i]]);
    }
    return io;
}

function copy(v) {
    if (v === null) return null;
    switch(v.constructor) {
        case Array:
            var i = v.length, a = Array(i);
            for (;i--;) {
                a[i] = v[i];
            }
            return a;
        case Number:
            return v * 1;
        case String:
            return String(v);
        case Function:
            return eval(v);
        case Boolean:
            return !!v;
    }
}

module.exports = {
    fastClone: fastClone
};