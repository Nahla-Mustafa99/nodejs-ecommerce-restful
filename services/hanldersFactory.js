const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const fileHelper = require("../utils/fileHelper");

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);
    return res.status(201).json({ data: document });
  });

// return function
exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res, next) => {
    // const documentsCount = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(
      Model.find(req.filterObj ? req.filterObj : {}),
      req.query
    )
      .search(modelName)
      .filter();
    const documentsCount = await apiFeatures.mongooseQuery.countDocuments();
    apiFeatures.mongooseQuery = Model.find(req.filterObj ? req.filterObj : {});
    apiFeatures
      .sort()
      .fieldLimit()
      .paginate(documentsCount)
      .search(modelName)
      .filter();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    let data;
    if (modelName === "User") {
      data = documents.map((i) => {
        delete i._doc.password;
        return i;
      });
    } else {
      data = documents;
    }

    return res
      .status(200)
      .json({ results: documents.length, paginationResult, data });
  });

//
exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);
    if (!document) {
      return next(new ApiError("No document found for this id: " + id, 404));
    }

    if (document._doc.password) delete document._doc.password;
    res.status(200).json({ data: document });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const documentBefore = await Model.findById(id);

    const document = await Model.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    if (!document) {
      // Delete any saved related images embedded with the request if any..
      deleteRelatedImages({
        functionType: "updateFailure",
        reqBody: req.body,
      });

      // Send 404 error
      const error = new ApiError(
        `No document is found for this id: ${id}`,
        404
      );
      return next(error);
    }

    // Delete related removed images if any..
    deleteRelatedImages({
      functionType: "update",
      reqBody: req.body,
      documentBefore,
      documentAfter: document,
    });

    if (document._doc.password) delete document._doc.password;
    res.status(200).json({ data: document });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError("No document found for this id: " + id, 404));
    }

    // Delete related images if any
    deleteRelatedImages({
      functionType: "delete",
      documentBefore: document,
    });

    res.status(204).send();
  });

// @desc helper function for images deletion
const deleteRelatedImages = asyncHandler(
  async ({ functionType, reqBody, documentBefore, documentAfter }) => {
    let imagesToDelete = [];

    // Delete case
    if (functionType === "delete") {
      const deletedDoc = documentBefore;
      if (deletedDoc.images)
        deletedDoc.images.forEach((img) => imagesToDelete.push(img));
      if (deletedDoc.image) imagesToDelete.push(deletedDoc.image);
      if (deletedDoc.imageCover) imagesToDelete.push(deletedDoc.imageCover);
      if (deletedDoc.profileImg) imagesToDelete.push(deletedDoc.profileImg);
    }

    // Update case: successful
    if (functionType === "update") {
      const updatedDoc = documentAfter;
      if (updatedDoc.images)
        documentBefore.images.forEach((img) =>
          !updatedDoc.images.includes(img) ? imagesToDelete.push(img) : ""
        );

      if (
        (updatedDoc.image || updatedDoc.image === "") &&
        documentBefore.image !== updatedDoc.image
      ) {
        imagesToDelete.push(documentBefore.image);
      }
      if (
        (updatedDoc.imageCover || updatedDoc.imageCover === "") &&
        documentBefore.imageCover !== updatedDoc.imageCover
      ) {
        imagesToDelete.push(documentBefore.imageCover);
      }
      if (
        (updatedDoc.profileImg || updatedDoc.profileImg === "") &&
        documentBefore.profileImg !== updatedDoc.profileImg
      ) {
        imagesToDelete.push(documentBefore.profileImg);
      }
    }

    // Update Failure case (404 error)
    if (functionType === "updateFailure") {
      if (reqBody.images)
        reqBody.images.forEach((img) => imagesToDelete.push(`products/${img}`));
      if (reqBody.image)
        imagesToDelete.push(
          `${reqBody.image.startsWith("brand") ? "brands" : "categories"}/${
            reqBody.image
          }`
        );
      if (reqBody.imageCover)
        imagesToDelete.push(`products/${reqBody.imageCover}`);
      if (reqBody.profileImg)
        imagesToDelete.push(`users/${reqBody.profileImg}`);
    }

    // Delete images
    if (imagesToDelete.length > 0)
      imagesToDelete.forEach((img) =>
        fileHelper.deleteFile(
          `uploads/${img?.replace(process.env.BASE_URL, "")}`
        )
      );
    return;
  }
);
