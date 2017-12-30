module.exports = (obj, rparams) => {
    if (!obj)
        return { error: true, message: 'BAD_REQUEST', params: rparams }

    m = []
    let keys = Object.keys(obj)
    for (let i = 0; i < rparams; i++) {
        if (keys.indexOf(rparams[i]) == -1) {
            m.push(rparams[i])
        }
    }

    if (m.length)
        return { error: true, message: 'BAD_REQUEST', params: m }
    console.log("object seems to be all ok")
    return { error: false }
}