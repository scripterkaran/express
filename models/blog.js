var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title: {type: String, required: true},
  content: { type: String, required: true},
  created_by :{type:Schema.Types.ObjectId , ref: 'User', required:true },
  cover : {type: String, required: false}
});



var Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;