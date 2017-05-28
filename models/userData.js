var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/register');

var Schema = mongoose.Schema;
var userDataSchema = new Schema({
                firstname: String,
                 lastname: String,
                 username: String,
                 email: String,
                 gender: String,
                 password: String
              }, {collection: 'user_data'});

var userData = mongoose.model('userData', userDataSchema);

module.exports = userData;