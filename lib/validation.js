const ok_result = (description) => {
    return { description: description }
}

const error_result = (description, err) => {
    err.includes = (text) => (err + '').includes(text)
    return {
        description: description,
        error: err
    }
}

const id = a => a

const append_error_origin = (msg, add_frame = 0) => `${msg}\n\t--> ${new Error().stack.split("\n")[3 + add_frame]}`

const invald_test_message = 'invalid test !! expected test(string, { [async] function || promise || boolean } [,function])'
const missing_body = () => { throw append_error_origin(invald_test_message) }

const test = (description = 'empty test', body = missing_body, then_func = id) => {
    switch (typeof body) {
        case 'boolean':
            return body ? test_now(description, () => true, then_func) : error_result(description, '(false)')
        case 'function':
            return function_test(description, body, then_func)
        case 'object':
            if (body && body.constructor.name === 'Promise')
                return test_async(description, body, then_func)
    }
    return error_result(description,
        `invalid test body type in test(string, ${typeof body}). Did you want test(name, () => {.. code ..}) ?`)
}

const function_test = (description, body, then_func) => {
    switch (body.constructor.name) {
        case 'Function':
            return test_now(description, body, then_func)
        case 'AsyncFunction':
            return test_async(description, body(), then_func)
    }
}

const test_now = (description, func, then_func) => {
    try {
        then_func(func())
        return ok_result(description)
    } catch (err) {
        return error_result(description, err)
    }
}

const test_async = (description, promise, then_func) => promise
    .then(result => result)
    .catch(err => {
        if (typeof err !== 'object' || err.constructor.name !== 'Error') {
            err = new Error(`unexpected error [${err}]`)
        }
        err.message = 'Promise rejected >> ' + err.message
        throw err
    })
    .then((result) => then_func(result))
    .then(_ => ok_result(description))
    .catch(err => error_result(description, err))

const quote_wrap = (value) => typeof value === 'string' ? `'${value}'` : value

const assert_hint = () => {
    throw append_error_origin(`assert(?,?) missing or undefined argument(s).
        You could explicitly state : assert(true, typeof something === 'undefined')
        ~ Or did you intend to use : affirm([...propositions,] function => boolean) ?`, 1)
}

const assert = (assumption = assert_hint(), expected = assert_hint()) => {
    if (assumption !== expected) {
        const tE = typeof assumption
        const tA = typeof expected
        const type_error = (tE === tA) ? '' : ` !! Type mismatch: assert(${tE}, ${tA}).`
        throw append_error_origin(`Evaluation [${quote_wrap(assumption)}] === [${quote_wrap(expected)}]${type_error}`)
    }
    return true
}

const affirm = (...factors) => {
    if (factors.length === 0)
        throw append_error_origin('affirm expected (...values, function => boolean)')
    const [assumption, ...reversed_propositions] = factors.reverse()
    const propositions = reversed_propositions.reverse()

    const error_message = evaluate(assumption, propositions)
    if (error_message) {
        const precondition = propositions.reduce((xs, s) => `${xs}\n\t--> ${quote_wrap(s)}`, error_message) + '\n\t-->'
        throw append_error_origin(`${precondition} Evaluation [${assumption}]`)
    } else return true
}

const evaluate = (assumption, propositions) => {
    try {
        const ok = assumption(...propositions)
        if (typeof ok === 'boolean') {
            if (ok) return ''
            else return '!! false assertion'
        } else return '!! expected affirm(function => boolean), not affirm(function => truthy)'
    } catch (err) {
        return `!! affirm failed *before* assertion\n\t--> !! ${err}`
    }
}

module.exports = {
    test,
    assert,
    affirm
}

// maybe, when needed: extra data & fuzzy functions
// const same = (assumption, expected) => assert(JSON.stringify(assumption), JSON.stringify(expected))
// const asserty = (assumption, expected) => assert(true, assumption == expected)