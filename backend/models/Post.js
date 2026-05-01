const mongoose=require('mongoose');
const postSchema=mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref:'User',
        },
        content:{
            type: String,
            required:true,
        },
        image:{
            type: String,
            default: '',
        },
        likes:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:'User',
        },
    ],
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    },
],
    },
    {timestamps:true}
);

const Post= mongoose.model('Post', postSchema);
module.exports=Post;