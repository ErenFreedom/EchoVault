const IdentityProofs = require('../models/IdentityProof');
const Document = require('../models/Document');
const createError = require('http-errors');
const Joi = require('joi');

// Validation schema
const identityProofSchema = Joi.object({
  proofType: Joi.string().required().trim(),
  proofNumber: Joi.string().required().trim(),
  documentIds: Joi.array().items(Joi.string().trim()).unique()
});

exports.addIdentityProof = async (req, res, next) => {
  try {
    const { value, error } = identityProofSchema.validate(req.body);
    if (error) throw createError(400, error.details[0].message);

    const { proofType, proofNumber, documentIds } = value;

    // Ensure that the documents exist and belong to the user
    for (const docId of documentIds) {
      const document = await Document.findById(docId);
      if (!document || document.userId.toString() !== req.user._id.toString()) {
        throw createError(404, `Document with ID ${docId} not found or does not belong to the user.`);
      }
    }

    const identityProof = new IdentityProofs({
      userId: req.user._id,
      proofType,
      proofNumber,
      documentIds
    });

    await identityProof.save();
    res.status(201).json(identityProof);
  } catch (error) {
    next(error);
  }
};

exports.getIdentityProofs = async (req, res, next) => {
  try {
    const identityProofs = await IdentityProofs.find({ userId: req.user._id });
    if (!identityProofs.length) {
      throw createError(404, 'No identity proofs found for this user.');
    }
    res.json(identityProofs);
  } catch (error) {
    next(error);
  }
};

exports.updateIdentityProof = async (req, res, next) => {
  try {
    const { value, error } = identityProofSchema.validate(req.body);
    if (error) throw createError(400, error.details[0].message);

    const updatedProof = await IdentityProofs.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      value,
      { new: true, runValidators: true }
    );

    if (!updatedProof) throw createError(404, 'Identity proof not found or user not authorized.');
    res.json(updatedProof);
  } catch (error) {
    next(error);
  }
};

exports.deleteIdentityProof = async (req, res, next) => {
  try {
    const deletedProof = await IdentityProofs.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deletedProof) throw createError(404, 'Identity proof not found or user not authorized.');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.linkDocumentToProof = async (identityProofId, documentId, userId) => {
  // Additional method to link a document to an identity proof
  const proof = await IdentityProofs.findById(identityProofId);
  if (!proof || proof.userId.toString() !== userId) throw createError(404, 'Identity proof not found or user not authorized.');

  const document = await Document.findById(documentId);
  if (!document || document.userId.toString() !== userId) throw createError(404, 'Document not found or user not authorized.');

  proof.documentIds.addToSet(documentId); // Prevents adding duplicate document references
  await proof.save();
};

exports.unlinkDocumentFromProof = async (identityProofId, documentId, userId) => {
  // Additional method to unlink a document from an identity proof
  const proof = await IdentityProofs.findById(identityProofId);
  if (!proof || proof.userId.toString() !== userId) throw createError(404, 'Identity proof not found or user not authorized.');

  proof.documentIds.pull(documentId); // Removes the document reference
  await proof.save();
};

// Additional methods as needed...
