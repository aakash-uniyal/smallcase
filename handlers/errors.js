er = {
    'BAD_REQUEST': { code: 400, message: '' },
    'SERVER_ERROR': { code: 500, message: '' }
}

module.exports = (code, error) => {
    sa = er[code]
    if (error)
        sa.message = error

    return sa
}