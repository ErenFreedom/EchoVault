const Document = require('../models/Document');
const User = require('../models/UserModel');
const Locker = require('../models/Locker');
const createError = require('http-errors');
const Joi = require('joi');

// Joi schema for document validation
const documentSchema = Joi.object({
  lockerId: Joi.string().hex().length(24).required(),
  documentType: Joi.string().required(),
  title: Joi.string().required(),
  fileName: Joi.string().required(),
  filePath: Joi.string().required(),
  encryptionKey: Joi.string().required(),
  metaData: Joi.object().pattern(/.*/, Joi.string())
});

exports.uploadDocument = async (req, res, next) => {
  try {
    // Validate the request body against schema
    const { error, value } = documentSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    // Check user existence
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Validate locker ownership
    const locker = await Locker.findOne({ _id: value.lockerId, userId: req.user._id });
    if (!locker) {
      return next(createError(403, 'Locker not found or not owned by the user'));
    }

    const document = new Document({
      ...value,
      userId: req.user._id
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate('userId', 'lockerId');
    if (!document) {
      return next(createError(404, 'Document not found'));
    }
    if (document.userId._id.toString() !== req.user._id.toString()) {
      return next(createError(403, 'Not authorized to access this document'));
    }
    res.json(document);
  } catch (error) {
    next(error);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const { error, value } = documentSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: value },
      { new: true }
    );

    if (!document) {
      return next(createError(404, 'Document not found or not authorized to update'));
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return next(createError(404, 'Document not found or not authorized to delete'));
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.shareDocument = async (req, res, next) => {
  try {
    const { documentId, recipientId } = req.body;
    const { _id: userId, isPremium } = req.user;

    if (!isPremium) {
      throw createError(403, 'Only premium users can share documents');
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser || !recipientUser.isPremium) {
      throw createError(400, 'Document can only be shared with another premium user');
    }

    // Logic to share the document, e.g., create a SharedDocument entry

    res.status(200).json({ message: 'Document shared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  shareDocument
};