import { createContext, useReducer, useContext } from 'react'

export const SleepsContext = createContext()

export const sleepsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SLEEPS':
      return { sleeps: action.payload }
    case 'CREATE_SLEEP':
      return { sleeps: [action.payload, ...state.sleeps] }
    case 'UPDATE_SLEEP':
      return { sleeps: action.payload }
    case 'DELETE_SLEEP':
      return { sleeps: state.sleeps.filter(s => s._id !== action.payload._id) }
    default:
      return state
  }
}

export const SleepsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sleepsReducer, { sleeps: null })
  return (<SleepsContext.Provider value={{ ...state, dispatch }}>{ children }</SleepsContext.Provider>)
}

export const useSleepsContext = () => {
  const context = useContext(SleepsContext)
  if(!context) throw Error('useSleepsContext must be used inside an SleepsContextProvider')
  return context
}