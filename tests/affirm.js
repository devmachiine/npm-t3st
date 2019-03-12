module.exports = (framework) => {

    const { test, assert, affirm } = framework

    const fun_chain_tests = [
        test("true assert returns true", () =>
            assert(true, affirm(() => true))
        )
        , test("chained assert stops at first error", () => {
            const err_third = test("_", () =>
                affirm(() => true)
                && affirm(() => 1 === 1)
                && affirm(() => 1 === 5)
                && affirm(() => 6 === 7)
            )
            assert(true, err_third.error.includes('Evaluation [() => 1 === 5]'))
        })
    ]

    const fun_tests = [
        test("includes error message of invalid assertion", () => {
            const err_false = test("_", () => affirm(() => mark))
            assert(true, err_false.error.includes("failed *before* assertion"))
            assert(true, err_false.error.includes("ReferenceError: mark is not defined"))
        })
        , test("expects a boolean result", () => {
            const non_boolean = test("_", () => affirm(() => 'truthy'))
            assert(true, !!non_boolean.error)
            affirm(non_boolean.error, () =>
                non_boolean.error.includes('expected affirm(function => boolean)'))

            assert(false, non_boolean.error.includes("failed *before* assertion"))
        })
        , test("ok assert truthy with !!", () => affirm(() => !!'truthy'))
        , test("includes evaluation in false assertion", () => {
            const err_false = test("_", () => affirm(() => 50 < 1))
            assert(true, err_false.error.includes("Evaluation [() => 50 < 1]"))

            assert(false, err_false.error.includes("failed *before* assertion"))
        })
        , test("description is optional", () => affirm(() => true))
        , test("description can be added", () => affirm("something", () => true))
        , test("description is shown in error message", () => {
            const flavor = "cinnamon"
            const err_description = test("_", () => affirm(flavor, () => flavor == "vanilla"))
            assert(true, err_description.error.includes("cinnamon"))
            assert(true, err_description.error.includes(`Evaluation [() => flavor == "vanilla"]`))
        })
        , test("propositions are passed into assertion", () => {
            const one = 1
            const two = 2
            affirm(one, two, (x, y) => x === 1 && x + y === 3)
        })
        , test("invalid assertion shows each preposition value", () => {
            const fluid = "paint"
            const stone = "amethyst"
            const false_affirm = test("_", () => affirm(fluid, stone, (_na) => false))
            assert(true, false_affirm.error.includes(fluid))
            assert(true, false_affirm.error.includes(stone))
        })
    ]

    return [fun_chain_tests, fun_tests]
}
