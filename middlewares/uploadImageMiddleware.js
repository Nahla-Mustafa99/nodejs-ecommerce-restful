const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/apiError");

const uploadwithMulterMiddleware = ({ destFolderName, fileNamePrefix }) => {
  // Define where project photos will be stored
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${destFolderName}`);
    },
    filename: function (req, file, cb) {
      cb(null, fileNamePrefix + "-" + uuidv4() + "-" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images allowed", 400), false);
    }
  };

  return multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
    fileFilter,
  });
};

module.exports = uploadwithMulterMiddleware;
