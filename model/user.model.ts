import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    timestamp: { type: Date, default: Date.now },
  });
  
  const userModel = mongoose.model('user', userSchema);

  export default userModel;