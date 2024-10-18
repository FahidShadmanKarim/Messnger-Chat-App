const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
   
   conversationId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Conversation',
      required : true
   },
   sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
   },
   content:{
        type:String,
        required : true,
   },
   seen:{
        type:Boolean,
        default:false,
   },
   timestamp:{
        type:Date,
        default:Date.now
   }

})

const Message = mongoose.model('Message',messageSchema);

module.exports = Message;