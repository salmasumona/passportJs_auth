var mongoose = require("mongoose"),
	Schema = mongoose.Schema;

	var UserInfoSchema = new Schema({
		FirstName: String,
		LastName: String,
		photo: String,
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		created:String

	});
	module.exports = mongoose.model('Users',UserInfoSchema);