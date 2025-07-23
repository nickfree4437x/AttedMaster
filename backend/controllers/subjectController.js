const Subject = require("../models/Subject");

// ADD Subject
const addSubject = async (req, res) => {
  try {
    const { course, subjectName } = req.body;
    const userid = req.user.userid;

    const newSubject = new Subject({ course, subjectName, userid });
    await newSubject.save();

    res.status(201).json({ message: "Subject added successfully", subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: "Error adding subject", error });
  }
};

// GET Subjects (only for logged-in admin)
const getSubjects = async (req, res) => {
  try {
    const userid = req.user.userid;
    const subjects = await Subject.find({ userid });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subjects", error });
  }
};

// DELETE Subject
const deleteSubject = async (req, res) => {
  try {
    const userid = req.user.userid;
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userid });
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subject", error });
  }
};

// UPDATE Subject
const updateSubject = async (req, res) => {
  try {
    const { course, subjectName } = req.body;
    const userid = req.user.userid;

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userid },
      { course, subjectName },
      { new: true }
    );

    if (!subject) return res.status(404).json({ message: "Subject not found" });

    res.status(200).json({ message: "Subject updated successfully", subject });
  } catch (error) {
    res.status(500).json({ message: "Error updating subject", error });
  }
};

module.exports = {
  addSubject,
  getSubjects,
  deleteSubject,
  updateSubject,
};
