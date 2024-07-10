require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/assignments', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const assignmentSchema = new mongoose.Schema({
    name: String,
    roll_no: String,
    course: String,
    assignment_attachment: String
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendConfirmationEmail = (assignment) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'shahzaibshakir999@gmail.com',
        subject: 'New Assignment Submission Confirmation',
        text: `A new assignment has been submitted:\n\nName: ${assignment.name}\nRoll No: ${assignment.roll_no}\nCourse: ${assignment.course}\nAttachment: ${assignment.assignment_attachment}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

// Create a new assignment
app.post('/assignments', upload.single('assignment_attachment'), async (req, res) => {
    const { name, roll_no, course } = req.body;
    const assignment_attachment = req.file ? req.file.path : '';

    const assignment = new Assignment({ name, roll_no, course, assignment_attachment });
    try {
        await assignment.save();
        sendConfirmationEmail(assignment);
        res.status(201).send(assignment);
    } catch (e) {
        console.error('Error saving assignment:', e);
        res.status(400).send(e);
    }
});

// Read all assignments
app.get('/assignments', async (req, res) => {
    try {
        const assignments = await Assignment.find({});
        res.send(assignments);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Read a single assignment by ID
app.get('/assignments/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const assignment = await Assignment.findById(_id);
        if (!assignment) {
            return res.status(404).send();
        }
        res.send(assignment);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Update an assignment by ID
app.patch('/assignments/:id', upload.single('assignment_attachment'), async (req, res) => {
    const _id = req.params.id;
    const updates = req.body;
    if (req.file) {
        updates.assignment_attachment = req.file.path;
    }

    try {
        const assignment = await Assignment.findByIdAndUpdate(_id, updates, { new: true, runValidators: true });
        if (!assignment) {
            return res.status(404).send();
        }
        res.send(assignment);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete an assignment by ID
app.delete('/assignments/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const assignment = await Assignment.findByIdAndDelete(_id);
        if (!assignment) {
            return res.status(404).send();
        }
        res.send(assignment);
    } catch (e) {
        res.status(500).send(e);
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
