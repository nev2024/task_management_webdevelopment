import { useState } from 'react'
import { FaEye } from 'react-icons/fa'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { GiNightSleep } from 'react-icons/gi'
import { FaTasks, FaStickyNote } from 'react-icons/fa'
import { useUserContext } from '../../context/user'

const View = ({ user }) => {
  const [show, setShow] = useState(false)
  const { setTargetUser } = useUserContext()
 
  const handleClick = () => {
    setTargetUser({ userId: user._id, userName: user.name, userEmail: user.email, userRoles: user.roles })
  }

  return (
    <>
      <button className="btn btn-outline-secondary p-1" onClick={() => setShow(!show)}><FaEye className="fs-4"/></button>

      <Modal show={show} onHide={() => {setShow(!show)}} centered>
        <Modal.Header closeButton>
          <Modal.Title>Shiko regjistrimet</Modal.Title>
        </Modal.Header> 
        <Modal.Body>
          <Link to="/task" onClick={ handleClick }><button className="btn btn-outline-primary mb-3"><FaTasks/>&ensp;Detyrat</button></Link><br/>
          <Link to="/note" onClick={ handleClick }><button className="btn btn-outline-primary mb-3"><FaStickyNote/>&ensp;Shenimet</button></Link><br/>
          <Link to="/sleep" onClick={ handleClick }><button className="btn btn-outline-primary"><GiNightSleep/>&ensp;Oret e punes</button></Link>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default View