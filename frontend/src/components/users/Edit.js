import { useRef, useState } from 'react';
import { ROLES } from '../../config/roles';
import { BsPencilSquare } from 'react-icons/bs';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useUserContext } from '../../context/user';
import { useAuthContext } from '../../context/auth';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
const validator = require('validator');

const Edit = ({ user }) => {
  const axiosPrivate = useAxiosPrivate();
  const { dispatch } = useUserContext();
  const { auth } = useAuthContext();

  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [changeIcon, setChangeIcon] = useState(false);
  const [active, setActive] = useState(user.active);

  const nameRef = useRef('');
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const rolesRef = useRef(null);
  const activeRef = useRef(null);

  const permitEditRole =
    auth.roles.includes(ROLES.Root) && !user.roles.includes(ROLES.Root);
  const permitEditActive =
    permitEditRole || user.roles.includes(ROLES.User);

  const handleShowPassword = (e) => {
    e.preventDefault();
    const inputType = passwordRef.current.type === 'password' ? 'text' : 'password';
    passwordRef.current.type = inputType;
    setChangeIcon(inputType === 'text');
  };

  const handleUpdate = async () => {
    const updateUser = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      roles: rolesRef.current?.value,
      active: activeRef.current?.checked,
    };

    const prevUser = [user.name, user.email, user.roles[0], user.active];

    Object.keys(updateUser).forEach((key) => {
      if (
        validator.isEmpty(updateUser[key]?.toString() || '', { ignore_whitespace: true }) ||
        prevUser.includes(updateUser[key])
      ) {
        delete updateUser[key];
      }
    });

    if (!auth) {
      setError('You must be logged in');
      return;
    }

    if (Object.keys(updateUser).length === 0) {
      setError('Nothing Changed');
      return;
    }

    updateUser.id = user._id;

    if (updateUser.roles) {
      updateUser.roles = [updateUser.roles];
    }

    try {
      const response = await axiosPrivate.patch('/api/users', updateUser);
      dispatch({ type: 'UPDATE_USER', payload: response.data }); // Make sure your reducer supports this
      setError(null);
      setShow(false);
    } catch (error) {
      console.error(error);
      rolesRef.current.value = user.roles;
      activeRef.current.checked = user.active;
      setError(error.response?.data?.error || 'Failed to update user');
    }
  };

  return (
    <>
      <button
        className="btn btn-outline-primary mx-2 p-1"
        onClick={() => {
          setShow(true);
          setError(null);
        }}
      >
        <BsPencilSquare className="fs-4" />
      </button>

      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          setError(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name:</Form.Label>
            <Form.Control type="text" defaultValue={user.name} ref={nameRef} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email:</Form.Label>
            <Form.Control type="text" defaultValue={user.email} ref={emailRef} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password: </Form.Label>
            <div className="d-flex">
              <Form.Control type="password" ref={passwordRef} autoComplete="on" />
              <Button variant="default" className="mb-2" onClick={handleShowPassword}>
                {changeIcon ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </div>
          </Form.Group>

          {permitEditRole && (
            <Form.Group className="mb-3">
              <Form.Label>Roles:</Form.Label>
              <select
                className="form-select"
                ref={rolesRef}
                defaultValue={user.roles[0]}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </Form.Group>
          )}

          {permitEditActive && (
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Label>Active:</Form.Label>
              <Form.Check
                type="switch"
                ref={activeRef}
                defaultChecked={active}
                onChange={() => setActive(!active)}
              />
            </Form.Group>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Edit;