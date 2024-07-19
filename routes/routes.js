const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task'); // Adjust paths as per your file structure
const User = require('../models/users'); // Adjust paths as per your file structure

const router = Router();

const authenticate = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).send('Access Denied');
    }
    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = { _id: verified._id }; // Set req.user as an object containing _id
        req.cookies.userId = verified._id; // Set req.cookies.userId directly to _id if needed
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

router.get('/', async (req, res) => {
    try {
        res.send('<html><body><h1>Hello</h1></body></html>');
    } catch (err) {
        res.status(500).send('An error occurred');
    }
});
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({
        username,
        email,
        password: hashPassword
    });

    try {
        const result = await user.save();
        const { _id } = result.toJSON();

        const token = jwt.sign({ _id }, process.env.SECRET_KEY);
        res.cookie("jwt", token, {
              secure: true, 
             sameSite: 'None', 
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login',async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
        res.cookie("jwt", token, {
              secure: true, 
            sameSite: 'None', 
            httpOnly: true,
            maxAge:  24 * 60 * 60 * 1000 // 1 day
        });
        
        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/userInfo', authenticate, async (req, res) => {
    try {
        const userId = req.cookies.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User info retrieved successfully", userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/task/:id', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, description, date, priority, status } = req.body;

        const task = new Task({
            userId,
            title,
            description,
            due_date:date,
            priority,
            status,
        });

        const result = await task.save();
        res.status(200).json({ message: "Task added successfully", task: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/tasks', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const tasks = await Task.find({ userId });
       
         
        res.status(200).json({ message: "All your tasks", tasks});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findByIdAndDelete(taskId);
       
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        res.status(200).json({ message: "Task deleted successfully", task: task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const updatedTask = req.body;
        const task = await Task.findByIdAndUpdate(taskId, updatedTask, { new: true });
        
        res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
