import { createContext, useReducer, useContext } from "react"

export const AuthContext = createContext()

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            localStorage.setItem("user", JSON.stringify(action.payload)); 
            return { auth: action.payload }
        case 'LOGOUT':
            localStorage.removeItem("user");
            return { auth: null }
        default:
            return state
    }
}

export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, { auth: JSON.parse(localStorage.getItem("user")) || null })
    return (<AuthContext.Provider value={{ ...state, dispatch }}>{ children }</AuthContext.Provider>)
}

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if(!context) throw Error('useAuthContext must be used inside an AuthContextProvider')
    return context
}