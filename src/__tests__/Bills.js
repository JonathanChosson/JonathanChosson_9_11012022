/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { fireEvent, screen } from "@testing-library/dom"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import Bills from "../containers/Bills"
import BillsUI from "../views/BillsUI.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe('Given I try to connect on app as an Employee', () => {
  describe('When I am on Login Page', () => {
    test('Then it should render LoadingPage', () => {
      //Showing loading page
    const html = BillsUI({loading : true})
    document.body.innerHTML = html
    //check if loading text is on page
    expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
    //Testing error 
    test('Then it should render ErrorPage', () => {
      const html = BillsUI({error : true})
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})

//integration test

describe('Given i am an employee', () => {
  describe('When i navigate to dashboard', () => {

    test('When i click on new bill then a modal should open', ()=>{
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
    
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
    
      const html = BillsUI({data : bills})
      document.body.innerHTML = html
    
      const bill = new Bills({
        document, onNavigate, store: null, bills, localStorage: window.localStorage
      })
      $.fn.modal = jest.fn()
  
      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill)
  
      const iconNewBill = screen.getByTestId("btn-new-bill")
      iconNewBill.addEventListener('click', handleClickNewBill)
      fireEvent.click(iconNewBill)
  
      expect(handleClickNewBill).toHaveBeenCalled()
  
      const modale = screen.getByTestId('form-new-bill')
      expect(modale).toBeTruthy()
    })
  
    test('When i click on eye to show details of bill then a modal should open', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
    
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
    
      const html = BillsUI({data : bills})
      document.body.innerHTML = html
    
      const bill = new Bills({
        document, onNavigate, store: null, bills, localStorage: window.localStorage
      })
      $.fn.modal = jest.fn()
  
      const handleClickIconEye = jest.fn((e) => bill.handleClickIconEye(eye[0]))  
  
      const eye = screen.getAllByTestId("icon-eye")
      eye[0].addEventListener('click', handleClickIconEye)
      fireEvent.click(eye[0])
  
      expect(handleClickIconEye).toHaveBeenCalled()
  
      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })

    test("fetches bill from mock API then return status 200 and data.length = 4", async () => {
      const getSpy = jest.spyOn(store, "get")
      const bills = await store.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills).toBeDefined()
      expect(bills.data.length).toBe(4)
    })

    test("fetches bills from an API then fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
    
  })
  
})


