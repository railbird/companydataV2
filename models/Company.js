const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { Schema } = mongoose;

const companySchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: [1, "Company name is required."],
    unique: true
  },
  data: [],
  history: {}
}, {timestamps: true});


const Company = mongoose.model('Company', companySchema);
module.exports = Company;
