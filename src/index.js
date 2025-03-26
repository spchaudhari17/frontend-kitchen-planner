import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'
import { PathContextProvider } from './context/path'
import { AuthContextProvider } from './context/auth'
import { UserContextProvider } from './context/user'
import { TasksContextProvider } from './context/task'
import { SleepsContextProvider } from './context/sleep'
import { disableReactDevTools } from '@fvilers/disable-react-devtools'
import { ColorProvider } from './context/colorcontext'

if (process.env.NODE_ENV === 'production') disableReactDevTools()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <>
    <PathContextProvider>
      <AuthContextProvider>
        <UserContextProvider>
          <TasksContextProvider>
            <SleepsContextProvider>
            <ColorProvider>
              <App />
              </ColorProvider>
            </SleepsContextProvider>
          </TasksContextProvider>
        </UserContextProvider>
      </AuthContextProvider>
    </PathContextProvider>
  </>
)