const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors');
const cookieParser = require('cookie-parser');
const routes=require('./routes/routes');


require('dotenv').config();
const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(routes);

const corsOptions = {
  origin: ['http://localhost:4200','https://task-canvas-frontend1.vercel.app'], // Allow requests from these origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors());



mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
