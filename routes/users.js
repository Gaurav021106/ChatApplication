const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/ChatApplication");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  FullName: String,
  profilePicture: {
    type: String,
    default: './images/default.jpg'
  },
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

userSchema.plugin(plm);

const User = mongoose.model('User', userSchema);
module.exports = User;
