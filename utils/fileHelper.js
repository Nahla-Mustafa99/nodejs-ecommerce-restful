const fs = require("fs");

exports.deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    // console.log("delete", filePath);
    // if (err) {
    //   throw err;
    // }
  });
};

exports.deleteImagesInCaseOfValError = (reqBody) => {
  let imagesToDelete = [];
  if (reqBody.images)
    reqBody.images.forEach((img) => imagesToDelete.push(`products/${img}`));
  if (reqBody.image)
    imagesToDelete.push(
      `${reqBody.image.startsWith("brand") ? "brands" : "categories"}/${
        reqBody.image
      }`
    );
  if (reqBody.imageCover) imagesToDelete.push(`products/${reqBody.imageCover}`);
  if (reqBody.profileImg) imagesToDelete.push(`users/${reqBody.profileImg}`);

  imagesToDelete.forEach((img) => this.deleteFile(`uploads/${img}`));
};
