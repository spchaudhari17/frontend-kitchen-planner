import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { usePathContext } from '../../context/path'
import { useTasksContext } from '../../context/task'
import { useAuthContext } from '../../context/auth'
import { BiArrowBack } from 'react-icons/bi'
import { BsPlusLg } from 'react-icons/bs'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

const Add = () => {
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()
  const { setTitle } = usePathContext()
  const { dispatch } =  useTasksContext()
  const { auth } = useAuthContext()
  const [error, setError] = useState(null)
  const [show, setShow] = useState(false)
  const titleRef = useRef('')
  const descriptionRef = useRef('')

  const handleAdd = async () => {
    if (!auth) {
      setError('You must be logged in')
      return
    }
   
    try {
      const response = await axiosPrivate.post('/api/tasks', {
        title: titleRef.current.value,
        description: descriptionRef.current.value
      })
      dispatch({type: 'CREATE_TASK', payload: response.data})
      setError(null)
      setShow(false)
    } catch (error) {
      // console.log(error)
      setError(error.response?.data.error)
    }
  }

  const handleBack = () => {
    setTitle("Welcome")
    navigate("/")
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-primary mb-2" onClick={handleBack}><BiArrowBack /></button>
        <button className="btn btn-outline-primary mb-2" onClick={() => setShow(!show)}><BsPlusLg /></button>
      </div>

      <Modal show={show} onHide={() => {setShow(!show);setError(null)}} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Task</Modal.Title>
        </Modal.Header> 
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title:</Form.Label>
            <Form.Control type="text" ref={titleRef}/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description:</Form.Label>
            <Form.Control as="textarea" rows={3} ref={descriptionRef}/>
          </Form.Group>
          {error && (<Alert variant={'danger'}>{error}</Alert>)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAdd}>Add Task</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Add