
import { useState } from 'react'
import { FcGoogle } from "react-icons/fc"
import { Button, Modal } from 'react-bootstrap'
import PersistLoginAlert from './PersistLoginAlert'
import PersistLoginCheckbox from './PersistLoginCheckbox'

const SignInWithGoogleButton = ({ persist, setPersist }) => {
  const [ show, setShow ] = useState(false)

  const handleLogin = () => window.location.href = `${process.env.REACT_APP_SERVER_URL}/api/auth/google?persist=${persist}`

  return (
    <>
      <button className="btn btn-light google-sign-in" onClick={() => setShow(!show)}>
        <FcGoogle className="me-2" size={17}/>
      Hyr me Google
      </button>

      <Modal show={show} onHide={() => {setShow(!show)}} centered>
        <Modal.Body>
          <PersistLoginCheckbox persist={persist} setPersist={setPersist} className="mt-2 mb-3" bold />
          <PersistLoginAlert maxWidth="467px" marginAuto={false}/>
          <Button className="float-end" variant="primary" onClick={handleLogin}>Vazhdo</Button>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default SignInWithGoogleButton
