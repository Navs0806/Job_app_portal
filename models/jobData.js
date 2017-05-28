var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/register');

var Schema = mongoose.Schema;

var jobsSchema = new Schema({
	name: String,
	description: String,
	requirements: String,
	vacancies: Number
}, {collection: 'job_data'});

var jobData = mongoose.model('jobData', jobsSchema);

module.exports = jobData;