// file uploader
const { firebaseStorage } = require("../../../config/storages/firebase.config");
const { UniqueNaam } = require("uniquenaam");

//to upload single file (multer config set to single in index.js)
const uploadSingleFile = (file, folderName) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.FIRE_STORAGE_BUCKET_NAME;
    const bucket = firebaseStorage.bucket(bucketName);
    const uniqueFilename = UniqueNaam(file.originalname);
    const options = {
      destination: `${folderName}/${uniqueFilename}`,
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

//to upload multiple file (multer config set to multiple in index.js)
const uploadMultipleFiles = (files, folderName) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.FIRE_STORAGE_BUCKET_NAME;
    const bucket = firebaseStorage.bucket(bucketName);
    const uploadPromises = [];

    files.forEach((file) => {
      const uniqueFilename = UniqueNaam(file.originalname);
      const options = {
        destination: `${folderName}/${uniqueFilename}`,
        public: true,
      };

      const uploadPromise = new Promise((resolve, reject) => {
        bucket.upload(file.path, options, (err, uploadedFile) => {
          if (err) {
            reject(err);
          } else {
            const fileUrl = uploadedFile.publicUrl();
            resolve(fileUrl);
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
  uploadSingleFile,
  uploadMultipleFiles,
};
