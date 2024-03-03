const UserDocumentTags = require('../models/UserDocumentTags');
const Document = require('../models/Document');
const createError = require('http-errors');
const Joi = require('joi');

// Joi schema for tag validation
const tagSchema = Joi.object({
  tagName: Joi.string().required().trim(),
  description: Joi.string().trim(),
  parentTag: Joi.string().trim().allow(null)
});

exports.createTag = async (req, res, next) => {
  try {
    const { value, error } = tagSchema.validate(req.body);
    if (error) throw createError(400, error.details[0].message);

    const tag = new UserDocumentTags({
      ...value,
      userId: req.user._id // assuming user is added to req via auth middleware
    });

    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

exports.getUserTags = async (req, res, next) => {
  try {
    const tags = await UserDocumentTags.find({ userId: req.user._id });
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    const { value, error } = tagSchema.validate(req.body);
    if (error) throw createError(400, error.details[0].message);

    const tag = await UserDocumentTags.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      value,
      { new: true }
    );

    if (!tag) throw createError(404, 'Tag not found');
    res.json(tag);
  } catch (error) {
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const tag = await UserDocumentTags.findById(req.params.id);
    if (!tag) throw createError(404, 'Tag not found');
    if (tag.userId.toString() !== req.user._id.toString()) {
      throw createError(403, 'Not authorized to delete this tag');
    }

    // Option 1: Reassign documents to a default/parent tag
    // const defaultTagId = 'someDefaultTagId';
    // await Document.updateMany({ tags: tag._id }, { $set: { tags: defaultTagId } });

    // Option 2: Untag the documents - remove the tag reference from the documents
    await Document.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });

    // Delete the tag
    await tag.remove();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.associateDocumentWithTag = async (req, res, next) => {
  try {
    const { documentId, tagId } = req.params;
    const tag = await UserDocumentTags.findOne({ _id: tagId, userId: req.user._id });
    if (!tag) throw createError(404, 'Tag not found');

    const document = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!document) throw createError(404, 'Document not found');

    tag.documents.push(documentId);
    await tag.save();

    res.status(200).json({ message: 'Document associated with tag successfully' });
  } catch (error) {
    next(error);
  }
};

exports.disassociateDocumentFromTag = async (req, res, next) => {
  try {
    const { documentId, tagId } = req.params;
    const tag = await UserDocumentTags.findOne({ _id: tagId, userId: req.user._id });
    if (!tag) throw createError(404, 'Tag not found');

    tag.documents.pull(documentId);
    await tag.save();

    res.status(200).json({ message: 'Document disassociated from tag successfully' });
  } catch (error) {
    next(error);
  }
};

// Additional methods as needed...

module.exports={
  createTag,
  getUserTags,
  updateTag,
  deleteTag,
  associateDocumentWithTag,
  disassociateDocumentFromTag
}