import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: true,
    },
    gamePlay: {
        type: Number,
        default: 0
    },
    winNumber: {
        type: Number,
        default: 0
    },
    loseNumber: {
        type: Number,
        default: 0
    }
}) 

const User = mongoose.model('User', userSchema)
export default User