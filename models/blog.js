var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title: {type: String},
  content: { type: String, required: true},
  created_by :{type:Schema.Types.ObjectId , ref: 'User' }
});



var Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;