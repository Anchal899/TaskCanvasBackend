const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Define the Task schema
const TaskSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    due_date: {
        type: Date,
    },
    priority: {
        type: String,
    },
    status:{
        type: String,
    },
    history: [{
        timestamp: { type: Date, default: Date.now },
        action: { type: String, enum: ['created', 'updated', 'status_changed'] },
        details: { type: String }
    }]
});

// Apply the auto-increment plugin to taskid
TaskSchema.plugin(AutoIncrement, { inc_field: 'taskid' });

// Create the Task model
const Task = mongoose.model('Task', TaskSchema);

// Export the Task model
module.exports = Task;
