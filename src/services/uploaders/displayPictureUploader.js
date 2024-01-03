// DisplayPicture uploader
const { firebaseStorage } = require("../../../config/storages/firebase.config");

//to upload single DisplayPicture (multer config set to single in index.js)
const uploadSingleDisplayPicture = (file, folderName, userId) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.FIRE_STORAGE_BUCKET_NAME;
    const bucket = firebaseStorage.bucket(bucketName);
    const imageName = userId;
    const options = {
      destination: `${folderName}/${imageName}`,
      public: true,
    };
    bucket.upload(file.path, options, (err, uploadedFile) => {
      if (err) {
        reject(err);
      } else {
        const fileUrl = uploadedFile.publicUrl();
        resolve(fileUrl);
      }
    });
  });
};

//to upload multiple DisplayPictures (multer config set to multiple in index.js)
const uploadMultipleDisplayPictures = (files, folderName, userId) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.FIRE_STORAGE_BUCKET_NAME;
    const bucket = firebaseStorage.bucket(bucketName);
    const uploadPromises = [];

    files.forEach((image) => {
      const fileExtension = image.originalname.split(".").pop();
      const imageName = userId;
      const options = {
        destination: `${folderName}/${imageName}.${fileExtension}`,
        public: true,
        force: true,
      };

      const uploadPromise = new Promise((resolve, reject) => {
        bucket.upload(image.path, options, (err, uploadedImage) => {
          if (err) {
            reject(err);
          } else {
            const imageUrl = uploadedImage.publicUrl();
            resolve(imageUrl);
          }
        });
      });

      uploadPromises.push(uploadPromise);
    });

    Promise.all(uploadPromises)
      .then((urls) => {
        resolve(urls);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  uploadSingleDisplayPicture,
  uploadMultipleDisplayPictures,
};
