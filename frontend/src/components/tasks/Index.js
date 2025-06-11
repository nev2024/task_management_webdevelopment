import Edit from "./Edit";
import Delete from "./Delete";
import { useTasksContext } from "../../context/task";
import { useAuthContext } from "../../context/auth";
import { ROLES } from "../../config/roles";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { FaUserCheck, FaTrashAlt, FaEdit } from "react-icons/fa";

const Index = () => {
  const { tasks } = useTasksContext();
  const { auth } = useAuthContext();

  const permitDeleteTask = (task) => {
    const isAdmin = auth.roles.includes(ROLES.Admin);
    const isRoot = auth.roles.includes(ROLES.Root);
    const isOwner =
      task.createdBy?._id === auth._id || task.createdBy === auth._id;
    return isRoot || (isAdmin && isOwner);
  };

  if (!Array.isArray(tasks)) {
    return (
      <p className="text-danger mt-3">
        Gabim në marrjen e të dhënave të detyrave.
      </p>
    );
  }

  return (
    <div className="container mt-4">
      {tasks.map((task, index) => (
        <div key={task._id} className="card mb-4 shadow-sm border-0">
          <div className="card-body">
            <h5 className="card-title fw-bold">{task.title}</h5>
            <div className="mb-2 text-muted small d-flex flex-wrap gap-3">
              <span>
                📌 <strong>{task.status}</strong>
              </span>
              <span>📅 {new Date(task.createdAt).toLocaleDateString()}</span>
              <span>
                ⏱{" "}
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span>
                🕒{" "}
                {formatDistanceToNow(new Date(task.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="card-text">{task.description}</p>
            <hr />
            <div className="d-flex gap-3">
              <Edit task={task} />
              {permitDeleteTask(task) && <Delete task={task} />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Index;
