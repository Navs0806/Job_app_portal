var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/register');

var Schema = mongoose.Schema;

var applicantsDataSchema = new Schema({
	username: String,
	jobname: String,
	status: String
}, {collection: 'applicants_data'});

var applicantsData = mongoose.model('applicantsData', applicantsDataSchema);

module.exports = applicantsData;
