import { BsInfoCircleFill } from 'react-icons/bs'

const PersistLoginAlert = ({ maxWidth, marginAuto }) => {
  return (
    <div className="alert alert-info" role="alert" style={{maxWidth, margin: marginAuto ? "0 auto" : undefined}}>
        <div className="d-flex align-items-center mx-3">
          <BsInfoCircleFill/><div className="mx-2"><strong>Info:</strong></div>
        </div>
        <ul>
          <li>Duke zgjedhur <strong>"Me mbaj te loguar"</strong> zvogëlon numrin e herëve që ju kërkohet të identifikoheni në këtë pajisje.</li>
          <li>Për ta mbajtur llogarinë tuaj të sigurt, përdoreni këtë opsion vetëm në <strong>Pajisjet e besuara</strong>.</li>
        </ul>
    </div>
  )
}

export default PersistLoginAlert