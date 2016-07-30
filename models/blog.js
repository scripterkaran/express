var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title: {type: String},
  content: { type: String, required: true}
  //email: {type: String, required: true, unique: true}
});





var Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;