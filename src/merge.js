const smartMerge = function (target, source) {
    if (source === undefined || source === null)
        return target;

    let result;

    if (target instanceof Array ^ source instanceof Array)
        throw new Error('Type of target and source are not same!');
    else if (target instanceof Array && source instanceof Array) {
        // Copy source, not to change it directly.
        source = Array.from(source);
        const index = source.indexOf('EXTENDS');
        ~index && source.splice(index, 1, ...target);
        result = source;
    } else if (target instanceof Object && source instanceof Object) {
        result = target;
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] instanceof Array)
                    target[key] = smartMerge(target[key] || [], source[key]);
                else if (source[key] instanceof Object && source[key].EXTENDS) {
                    target[key] = smartMerge(target[key] || {}, source[key]);
                    delete target[key].EXTENDS;
                } else
                    target[key] = source[key];
            }
        }
    } else
        throw new Error('Type of target and source are not supported to merge!');

    return result;
};

module.exports = function (target, ...sources) {
    sources.forEach((source) => target = smartMerge(target, source));
    return target;
};