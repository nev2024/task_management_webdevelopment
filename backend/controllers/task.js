const Task = require("../models/Task");
const User = require("../models/user/User");
const ROLES_LIST = require("../config/rolesList");
const { CustomError } = require("../middleware/errorHandler");
const {
  validateAuthInputField,
  validateObjectId,
} = require("../utils/validation");

exports.getAll = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const task = {
      Root: await Task.find()
        .sort({ createdAt: -1 })
        .populate("createdBy", "name")
        .lean(),
      Admin: await Task.find({ createdBy: userId })
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .lean(),
      User: await Task.find({ assignedTo: userId })
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .lean(),
    };

    const tasks = task[req.roles];
    if (!tasks?.length) throw new CustomError("No tasks record found", 404);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.inspect = async (req, res, next) => {
  try {
    const admin_id = req.user._id;
    const user_id = req.body.id;

    validateObjectId(user_id, "Task");
    if (!user_id && admin_id === user_id)
      throw new CustomError("User id not found", 404);

    const tasks = await Task.find({ assignedTo: user_id })
      .sort({ createdAt: -1 })
      .lean();
    if (!tasks?.length) throw new CustomError("No tasks record found", 404);

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateObjectId(id, "Task");

    const task = await Task.findById(id).lean().exec();
    if (!task) throw new CustomError("No such task record found", 404);

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    validateAuthInputField({ title, description });

    const adminId = req.user._id;

    const task = await Task.create({ title, description, createdBy: adminId });
    if (!task)
      throw new CustomError("Something went wrong while creating task", 400);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateObjectId(id, "Task");

    const task = await Task.findById(id).lean().exec();
    if (!task) throw new CustomError("No such task record found", 404);

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const canUpdate =
      (req.roles.includes(ROLES_LIST.Admin) && isOwner) ||
      req.roles.includes(ROLES_LIST.Root);

    if (!canUpdate)
      throw new CustomError("Not authorized to edit this task", 401);

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .lean()
      .exec();

    const tasks = await Task.find({
      $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "Task");

    const task = await Task.findById(id).lean().exec();
    if (!task) throw new CustomError("No such task record found", 404);

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const canDelete =
      (req.roles.includes(ROLES_LIST.Admin) && isOwner) ||
      req.roles.includes(ROLES_LIST.Root);

    if (!canDelete)
      throw new CustomError("Not authorized to delete this task", 401);

    const deletedTask = await Task.findByIdAndDelete(id).lean().exec();
    res.status(200).json(deletedTask);
  } catch (error) {
    next(error);
  }
};

exports.getAssignUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "Task");

    const task = await Task.findById(id)
      .populate("assignedTo", "name")
      .select("assignedTo")
      .lean()
      .exec();
    if (!task) throw new CustomError("Not assigned to user", 400);

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

exports.assignUser = async (req, res, next) => {
  try {
    const { task_id, user_id } = req.body;

    validateObjectId(task_id, "Task");
    user_id.map((id) => validateObjectId(id, "User"));

    const task = await Task.findById(task_id).select("createdBy").lean().exec();
    if (!task) throw new CustomError("Task not found", 404);

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const canAssign =
      (req.roles.includes(ROLES_LIST.Admin) && isOwner) ||
      req.roles.includes(ROLES_LIST.Root);
    if (!canAssign) throw new CustomError("Not authorized to assign user", 401);

    const updatedTask = await Task.findByIdAndUpdate(
      task_id,
      { $addToSet: { assignedTo: { $each: user_id } } },
      { new: true }
    )
      .populate("assignedTo", "name")
      .lean()
      .exec();

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

exports.deleteAssign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    validateObjectId(id, "Task");

    const task = await Task.findById(id).lean().exec();
    if (!task) throw new CustomError("Task not found", 404);

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const canRemove =
      (req.roles.includes(ROLES_LIST.Admin) && isOwner) ||
      req.roles.includes(ROLES_LIST.Root);
    if (!canRemove)
      throw new CustomError("Not authorized to remove assignment", 401);

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $pull: { assignedTo: user_id } },
      { new: true }
    )
      .populate("assignedTo", "name")
      .lean()
      .exec();

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

exports.getNotAssignUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "Task");

    const task = await Task.findById(id).select("assignedTo").lean().exec();
    if (!task) throw new CustomError("Task not found", 404);

    const baseQuery = { active: true };
    if (!req.roles.includes(ROLES_LIST.Root)) {
      baseQuery.roles = { $nin: [ROLES_LIST.Root, ROLES_LIST.Admin] };
    } else {
      baseQuery.roles = { $ne: ROLES_LIST.Root };
    }

    const notAssigned = await User.find({
      ...baseQuery,
      _id: { $nin: task.assignedTo },
    })
      .select("_id name")
      .lean()
      .exec();

    res.status(200).json(notAssigned);
  } catch (error) {
    next(error);
  }
};
