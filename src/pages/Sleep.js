import { useEffect, useState } from 'react'
import { ROLES } from '../config/roles'
import { usePathContext } from '../context/path'
import { useUserContext } from '../context/user'
import { useAuthContext } from '../context/auth'
import { useSleepsContext } from '../context/sleep'
import { BsFillPersonFill } from "react-icons/bs"
import { FaAddressCard } from "react-icons/fa"
import useAxiosPrivate from "../hooks/useAxiosPrivate"
import Details from '../components/sleeps/Index'
import Navbar from '../components/sleeps/Navbar'

const Sleep = () => {
  const { auth } = useAuthContext()
  const { setTitle } = usePathContext()
  const { targetUser } = useUserContext()
  const { sleeps, dispatch } = useSleepsContext()
  const [ error, setError ] = useState(null)
  const axiosPrivate = useAxiosPrivate()
  const admin = auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Staff)

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()
    setTitle("Sleep Hour Management")

    const getSleeps = async () => {
      try {
        let response
        if(targetUser?.userId && (auth.email !== targetUser.userEmail) && admin){
          // Admin view
          response = await axiosPrivate.post('/api/sleeps/admin', {
            id: targetUser.userId,
            signal: abortController.signal
          })
        }else{
          response = await axiosPrivate.get('/api/sleeps', {
            signal: abortController.signal
          })
        }

        isMounted && dispatch({type: 'SET_SLEEPS', payload: response.data})
        setError(null)
      } catch (err) {
        dispatch({type: 'SET_SLEEPS', payload: []})
        setError(err.response?.data.error)
        // console.log(err)
      }
    }

    if(auth){
      getSleeps()
    }

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [])

  return (
    <>
      <Navbar/>

     {targetUser?.userName && sleeps && (<div className="bg-primary bg-opacity-25 rounded pt-2">
        <span className="mx-3 d-inline-flex align-items-center"><FaAddressCard className="fs-4"/>&ensp;{targetUser?.userName}</span>
        <span className="d-inline-flex align-items-center"><BsFillPersonFill className="fs-4"/>&ensp;{targetUser?.userRoles}</span>
      </div>)}
      <div className="row mt-3">
        {sleeps && sleeps.map(sleep => (
          <Details sleep={sleep} key={sleep._id} />
        ))}
        {error && !sleeps?.length && <div className="error">{error}</div>}
      </div>
    </>
  )
}

export default Sleep