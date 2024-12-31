const { countDocuments } = require("../models/productModel");

class ApiFeatures {
  constructor(mongooseQuery, queryObj) {
    this.mongooseQuery = mongooseQuery;
    this.queryObj = queryObj;
    this.paginationResult = {};
  }

  // Filteration
  filter() {
    const queryStringObj = { ...this.queryObj };
    // not excluded things make faulty results
    const excludedFields = ["page", "limit", "fields", "sort", "keyword"];
    excludedFields.forEach((field) => delete queryStringObj[field]);
    // Apply filtration using [gte, gt, lte, lt]
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const filterQueryObj = JSON.parse(queryStr);

    // Update mongooseQuery
    this.mongooseQuery = this.mongooseQuery.find(filterQueryObj);

    return this;
  }

  // Sorting
  sort() {
    if (this.queryObj.sort) {
      // -price, sold -> "price sold"
      // req.quey.sort is string not like filter object
      const sortBy = this.queryObj.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  // Field Limiting
  fieldLimit() {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  // Search
  search(modelName) {
    if (this.queryObj.keyword) {
      const keword = this.queryObj.keyword;
      const searchQuery = {};
      if (modelName === "Product") {
        searchQuery.$or = [
          { title: { $regex: keword, $options: "i" } },
          { description: { $regex: keword, $options: "i" } },
        ];
      } else if (modelName === "Review") {
        searchQuery.$or = [{ title: { $regex: keword, $options: "i" } }];
      } else {
        searchQuery.$or = [{ name: { $regex: keword, $options: "i" } }];
      }
      this.mongooseQuery = this.mongooseQuery.find(searchQuery);
    }
    // console.log(this.mongooseQuery.countDocuments());
    return this;
  }

  // Pagination
  paginate(documentsCount) {
    const page = +this.queryObj.page || 1;
    const limit = +this.queryObj.limit || 10; // limit = results per page
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    this.paginationResult.currentPage = page;
    this.paginationResult.limit = limit;
    this.paginationResult.numberOfPages = Math.ceil(documentsCount / limit);
    // next page
    if (endIndex < documentsCount) {
      this.paginationResult.next = page + 1;
    }
    // Previous page
    if (page !== 1) {
      this.paginationResult.prev = page - 1;
    }
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;

// Update paginationResult
//  this.mongooseQuery.countDocuments().then((count) => {
//   this.paginationResult.numberOfPages = Math.ceil(
//     count / this.paginationResult.limit
//   );
//   const endIndex =
//     this.paginationResult.currentPage * this.paginationResult.limit;
//   if (endIndex < count) {
//     this.paginationResult.next = page + 1;
//   }
// });
