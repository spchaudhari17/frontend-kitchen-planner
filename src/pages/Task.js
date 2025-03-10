import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BiArrowBack } from 'react-icons/bi'
import { useUserContext } from '../context/user'
import { useAuthContext } from '../context/auth'
import { useTasksContext } from '../context/task'
import { usePathContext } from '../context/path'
import { ROLES } from '../config/roles'
import { FaAddressCard } from "react-icons/fa"
import { BsFillPersonFill } from "react-icons/bs"
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import Details from '../components/tasks/Index'
import Add from '../components/tasks/Add'

const Task = () => {
  const navigate = useNavigate()
  const { auth } = useAuthContext()
  const { targetUser } = useUserContext()
  const { setTitle } = usePathContext()
  const { tasks, dispatch } =  useTasksContext()
  const [ error, setError ] = useState(null)
  const axiosPrivate = useAxiosPrivate()
  const admin = auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Staff)

  const statusBar = {
    Staff: "bg-danger",
    Admin: "bg-warning",
    User: "bg-primary"
  }
  
  const color = statusBar[targetUser?.userRoles]

  const handleBack = () => {
    setTitle("Welcome")
    navigate("/")
  }

  useEffect(() => {
    setTitle("Task Management")
    let isMounted = true
    const abortController = new AbortController()

    const getAllTask = async () => {
      try {
        const endpoint = targetUser?.userId && admin ? '/api/tasks/inspect' : '/api/tasks'
        const method = targetUser?.userId && admin ? 'post' : 'get'
        const data = targetUser?.userId && admin ? { id: targetUser.userId } : undefined
  
        const response = await axiosPrivate({
          method,
          url: endpoint,
          data,
          signal: abortController.signal
        })
  
        isMounted && dispatch({ type: 'SET_TASKS', payload: response.data })
        setError(null)
      } catch (err) {
        dispatch({ type: 'SET_TASKS', payload: [] })
        setError(err.response?.data.error)
        // console.log(err)
      }
    }

    if(auth){
      getAllTask()
    }

    return () => {
      isMounted = false
      abortController.abort()
    }
  },[])

  return (
    <>
      {auth && (
        <>
          {targetUser?.userName && tasks && (<div className={`${color} bg-opacity-25 rounded pt-2 mb-3`}>
            <span className="mx-3 d-inline-flex align-items-center"><FaAddressCard className="fs-4"/>&ensp;{targetUser?.userName}</span>
            <span className="d-inline-flex align-items-center"><BsFillPersonFill className="fs-4"/>&ensp;{targetUser?.userRoles}</span>
          </div>)}

          {admin && <Add />}
          {auth.roles.includes(ROLES.User) && (
            <div className="d-flex justify-content-between">
              <button className="btn btn-outline-primary mb-2" onClick={handleBack}><BiArrowBack /></button>
            </div>
          )}
          {tasks && <Details tasks={tasks}/>}
          {error && !tasks?.length && <div className="error">{error}</div>}
        </>
      )}
    </>
  )
}

export default Task