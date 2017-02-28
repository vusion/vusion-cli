const restMerge = function (target, source) {
    const result = target;

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key].REST_PROPS) {
                target[key] = restMerge(target[key] ? target[key] : {}, source[key]);
                delete target[key].REST_PROPS;
            } else
                target[key] = source[key];
        }
    }

    return result;
};

module.exports = function (target, ...sources) {
    sources.forEach((source) => target = restMerge(target, source));
    return target;
};
