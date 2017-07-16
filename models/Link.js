const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { Schema } = mongoose;

const linkSchema = new Schema({
  name: String,
  hrb: {
    type: Number,
    unique: true
  },
  link: String
}, {timestamps: true});


const Link = mongoose.model('Link', linkSchema);
module.exports = Link;
