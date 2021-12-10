/**
 * @jest-environment jsdom
 */
import 'regenerator-runtime/runtime'
import { validateDates } from "../src/client/js/validators"

describe("Testing the validateDates functionality", () => { 
    test("Testing the validateDates() function", () => {
        expect(validateDates("2030-12-09", "2030-12-10")).toBe(true);
    })
});
