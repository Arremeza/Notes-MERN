const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(bodyParser.json())

//connect to mongodb atlas
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI);

//define note model
const Note = mongoose.model("Note", {
    title: String,
    content: String,
});

//listen for successful Mongodb connection
mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB Atlas");
});

//listen for mongoDB connection errors
mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

//routes
app.get("/", (req, res) => {
    res.send("Hello this is the root")
})
app.get("/api/notes", async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes);
    } catch (error) {
        res.status(500).json({message: error.message });
    }
});

//update note by id
app.put("/api/notes/:id", async (req,res) => {
    const {title, content} = req.body;
    const noteId = req.params.id;

    try {
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            {title, content},
            {new: true}
        );
        if(!updatedNote) {
            return res.status(404).json({message: "Note not found"})
        }
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({message:"Server error", error: error.message});
    }
});

//delete note by id
app.delete("/api/notes/:id", async (req, res) => {
    const noteId = req.params.id;

    try {
        const deletedNote = await Note.findByIdAndDelete(noteId);

        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


//add new note
app.post("/api/notes", async(req, res) => {
    const {title, content} = req.body;

    const note = new Note({title, content});

    try {
        const newNote = await note.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
}) 
