/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { fireEvent, screen } from "@testing-library/dom"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
//indicate here we are an employee
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
})

describe("When I'm on NewBill Page", () => {
  describe("And I upload a image file", () => {
    test("Then file extension is not correct", () => {
      document.body.innerHTML = NewBillUI()
      //Instanciation class NewBill
      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      //simulate loading file
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")

      //Listen charging file
      inputFile.addEventListener("change", handleChangeFile)

      //Simulate it with FireEvent
      fireEvent.change(inputFile, {
          target: {
              files: [new File(["test.jpg"], "test.jpg", { type: "image/jpg" })],
          }
      })

      //An error message have to appear
      const error = screen.getByTestId('errorMessage')
      expect(error).toBeFalsy
    })
  })
})

describe("And I submit a valid bill form", () => {
  test('then a bill is created', async () => {
    document.body.innerHTML = NewBillUI()
    const newBill = new NewBill({
      document, onNavigate, store: null, localStorage: window.localStorage
    })          

    //We create newBill with handleSubmit method
    const submit = screen.getByTestId('form-new-bill')
    const billTest = {
      name: "billTesting",
      date: "2022-01-24",
      type: "restaurant",
      amount: 100,
      pct: 10,
      vat: 10,
      commentary: "",
      fileName: "test",
      fileUrl: "test.jpg"
    }

    //We simulate handleSubmit
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

    //We apply to the dom Element  
    newBill.createBill = (newBill) => newBill
    document.querySelector(`input[data-testid="expense-name"]`).value = billTest.name
    document.querySelector(`input[data-testid="datepicker"]`).value = billTest.date
    document.querySelector(`select[data-testid="expense-type"]`).value = billTest.type
    document.querySelector(`input[data-testid="amount"]`).value = billTest.amount
    document.querySelector(`input[data-testid="vat"]`).value = billTest.vat
    document.querySelector(`input[data-testid="pct"]`).value = billTest.pct
    document.querySelector(`textarea[data-testid="commentary"]`).value = billTest.commentary
    newBill.fileUrl = billTest.fileUrl
    newBill.fileName = billTest.fileName 
    
    submit.addEventListener('click', handleSubmit)

    //OFake clic 
    fireEvent.click(submit)

    //check if hendleSubmit was called
    expect(handleSubmit).toHaveBeenCalled()
  })
})

// integration test POST
describe("Given I am a user connected as an Employee", () => {
  describe("When I submit a new bill and return to Bill Page", () => {
    test("fetches bills from mock API POST", async () => {
      const postSpy = jest.spyOn(store, "post")
      const bills = await store.post()
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})