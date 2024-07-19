const mongoose = require('mongoose');


// Define the User schema
const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
});



// Create the User model
const User = mongoose.model('User', UserSchema);

// Export the User model
module.exports = User;
