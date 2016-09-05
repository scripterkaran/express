var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//{
//    _id: ObjectId(...),
//    discussion_id: ObjectId(...),
//    slug: '34db',
//    posted: ISODateTime(...),
//    author: {
//              id: ObjectId(...),
//              name: 'Rick'
//             },
//    text: 'This is so bogus ... '
//}


var commentSchema = new Schema({
    slug: {type: String, required: true},
    created_by: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    blog: {type: Schema.Types.ObjectId, ref: 'Blog', required: true},
    created_at: Date,
    updated_at: Date
});

commentSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;