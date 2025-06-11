import { useRef, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthContext } from '../../context/auth'
import { MdSpaceDashboard, MdOutlineVerifiedUser } from 'react-icons/md'
import { AiOutlineReload } from 'react-icons/ai'
import { VscError } from 'react-icons/vsc'
import Loading from '../../components/Loading'
import axiosPublic from '../../api/axios' 
import jwt_decode from 'jwt-decode'

const Activate = () => {
  const navigate = useNavigate()
  const { dispatch } = useAuthContext()
  const { activation_token } = useParams()
  const [ email, setEmail ] = useState(null)
  const [ activate, setActivate ] = useState(false)
  const [ expire, setExpire ] = useState(false)
  const [ inUse, setInUse ] = useState(false)
  const [ isLoading, setIsLoading ] = useState(false)
  const executeOnce = useRef(false)

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()
      
    if(!activation_token) navigate('/not-found')

    const activateAccount = async () => {
      setIsLoading(true)

      try {
        const response = await axiosPublic.post('/api/auth/activate', { 
          activation_token,
          signal: abortController.signal
        })
        const decoded = jwt_decode(response.data)
        setEmail(decoded.email)
        isMounted && dispatch({type: 'LOGIN', payload: {...decoded.userInfo, accessToken: response.data}})
        setIsLoading(false)
        setActivate(true)
      } catch (error) {
        setIsLoading(false)
        const errorHandlers = {
          "Forbidden token expired": () => setExpire(true),
          "Email already in use": () => setInUse(true),
        }
      
        const errorHandler = errorHandlers[error.response?.data.error] || (() => navigate('/not-found'));
        errorHandler()
      }
    }

    (executeOnce.current === true || process.env.NODE_ENV !== 'development') && activateAccount()

    return () => { 
      isMounted = false 
      executeOnce.current = true
      abortController.abort()
    }
  }, [])

  return (
    <>
      {isLoading && (<Loading />)}
      {expire && (<div className="expire center shadow">
        <div className="icon">
          <VscError className="fa"/>
        </div>
        <div className="fs-3 fw-semibold">Link i skaduar</div>
        <div className="description">Lidhja e dhënë ka skaduar, ju lutemi klikoni butonin më poshtë për t'u regjistruar për një llogari të re.</div>
        <div className="dismiss-btn mt-3">
          <Link to="/signup"><button><AiOutlineReload />&ensp;Provo perseri!</button></Link>
        </div>
      </div>)}

      {inUse && (<div className="in-use center shadow">
        <div className="icon">
          <VscError className="fa"/>
        </div>
        <div className="fs-3 fw-semibold">Email tashmë në përdorim</div>
        <div className="description">{email} tashmë në përdorim, ju lutemi zgjidhni një email tjetër.</div>
        <div className="dismiss-btn mt-3">
          <Link to="/signup"><button><AiOutlineReload />&ensp;Provo perseri</button></Link>
        </div>
      </div>)}

      {activate && (<div className="popup center shadow">
        <div className="icon">
          <MdOutlineVerifiedUser className="fa"/>
        </div>
        <div className="fs-3 fw-semibold">Llogaria u aktivizua</div>
        <div className="description">Email-i juaj është konfirmuar, kontrolloni panelin për më shumë detaje.</div>
        <div className="dismiss-btn mt-3">
          <Link to="/"><button><MdSpaceDashboard />&ensp;DASHBOARD</button></Link>
        </div>
      </div>)}
    </>
  )
}

export default Activate