const DocumentTags = require('../models/DocumentTags');
const UserDocumentTags = require('../models/UserDocumentTags');
const Document = require('../models/Document'); // Assuming you have a Document model

// Create a new tag
exports.createTag = async (req, res) => {
  const { tagName, description } = req.body;

  try {
    const newTag = new DocumentTags({ tagName, description });
    await newTag.save();
    res.status(201).json({ message: "Tag created successfully.", tag: newTag });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating tag", error: error.toString() });
  }
};

// Update a tag
exports.updateTag = async (req, res) => {
  const { tagId } = req.params;
  const { description } = req.body;

  try {
    const updatedTag = await DocumentTags.findByIdAndUpdate(tagId, { description }, { new: true });
    if (!updatedTag) {
      return res.status(404).json({ message: "Tag not found." });
    }
    res.status(200).json({ message: "Tag updated successfully.", tag: updatedTag });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating tag", error: error.toString() });
  }
};

// Delete a tag
exports.deleteTag = async (req, res) => {
  const { tagId } = req.params;

  try {
    const deletedTag = await DocumentTags.findByIdAndDelete(tagId);
    if (!deletedTag) {
      return res.status(404).json({ message: "Tag not found." });
    }
    res.status(200).json({ message: "Tag deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting tag", error: error.toString() });
  }
};

// Associate a tag with a document
exports.associateTagWithDocument = async (req, res) => {
  const { userId, documentId, tagName } = req.body;

  try {
    const tag = await DocumentTags.findOne({ tagName });
    if (!tag) {
      return res.status(404).json({ message: "Tag not found." });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const userTag = new UserDocumentTags({
      tagName: tag.tagName,
      description: tag.description,
      userId,
      documents: [documentId]
    });
    await userTag.save();

    res.status(201).json({ message: "Tag associated with document successfully.", userTag });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error associating tag with document", error: error.toString() });
  }
};


