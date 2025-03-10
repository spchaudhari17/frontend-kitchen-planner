import { useAuthContext } from '../context/auth'
import { useSleepsContext } from '../context/sleep'
import { useUserContext } from '../context/user'
import usePersist from './usePersist'
import axios from '../api/axios' 
import io from 'socket.io-client'

export const useLogout = () => {
  const { dispatch } = useAuthContext()
  const { dispatch: dispatchSleeps } = useSleepsContext()
  const { dispatch: dispatchUsers } = useUserContext()
  const { setPersist } = usePersist()
  
  
  const logout = async (userId) => {
    try {
      const socket = io(process.env.SERVER_SOCKET_URL)
      await axios.post('/api/auth/logout',{_id : userId})
      dispatch({ type: 'LOGOUT' })
      dispatchUsers({ type: 'SET_USER', payload: null })
      dispatchSleeps({ type: 'SET_SLEEPS', payload: null })
      setPersist(false)
      socket.emit('disconnet')
    } catch (error) {
      // console.log(error)
    }
  }

  return { logout }
}