import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  streetAddress: {
    type: String,
    trim: true,
  },
  postalCode: {
    type: String,
    trim: true,
  },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false },
  },
});

export const UserModel = mongoose.model("User", userSchema);

//fetch all users
export const getUsers = () => UserModel.find();

//find per username
export const getUserByUsername = (username: string) =>
  UserModel.findOne({ username });

export const getUserByEmail = (email: string) => UserModel.findOne({ email });

//fetch user per id
export const getUserById = (id: string) => UserModel.findById(id);

export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());

//delete user per id
export const deleteUserById = (id: string) =>
  UserModel.findOneAndDelete({ _id: id });

//update user per id
export const updateUserById = (id: string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values);
