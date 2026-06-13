import '@testing-library/jest-dom'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  localStorage.clear()
  consoleWarnSpy.mockClear()
  consoleErrorSpy.mockClear()
})

afterAll(() => {
  consoleWarnSpy.mockRestore()
  consoleErrorSpy.mockRestore()
})
