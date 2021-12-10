import 'regenerator-runtime/runtime'
import { goBackAYear } from "../src/client/js/processAPI"

describe("Testing the goBackAYear functionality", () => { 
    test("Testing the goBackAYear() function", () => {
           expect(goBackAYear("2021-12-09", "2021-12-10")).toStrictEqual({start_date : "2020-12-09", end_date : "2020-12-10"});
    })
});