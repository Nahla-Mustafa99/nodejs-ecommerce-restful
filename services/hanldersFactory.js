const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

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

    const document = await Model.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    if (!document) {
      const error = new ApiError(
        `No document is found for this id: ${id}`,
        404
      );
      return next(error);
    }

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
    res.status(204).send();
  });
