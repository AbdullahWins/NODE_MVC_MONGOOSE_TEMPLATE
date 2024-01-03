const { firebaseStorage } = require("../../../config/storages/firebase.config");
const { UniqueNaam } = require("uniquenaam");
const https = require("https");
const fs = require("fs");
const path = require("path");

const downloadImage = (imageUrl, index) => {
  return new Promise((resolve, reject) => {
    https
      .get(imageUrl, (response) => {
        const tempFilePath = path.join(__dirname, `temp_image_${index}.jpg`);
        const fileStream = fs.createWriteStream(tempFilePath);

        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close(() => {
            resolve(tempFilePath);
          });
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const uploadImageFromFile = async (filePath, folderName) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.FIRE_STORAGE_BUCKET_NAME;
    const bucket = firebaseStorage.bucket(bucketName);
    const uniqueFilename = UniqueNaam("image.jpg"); // Use a more descriptive filename if needed
    const options = {
      destination: `${folderName}/${uniqueFilename}`,
      public: true,
    };

    bucket.upload(filePath, options, (err, uploadedFile) => {
      if (err) {
        reject(err);
      } else {
        const fileUrl = uploadedFile.publicUrl();
        resolve(fileUrl);
      }
    });
  });
};

const uploadSingleFileUsingUrl = async (fileUrl, folderName) => {
  try {
    const filePath = await downloadImage(fileUrl, 0); // Use index 0 for a single file
    const uploadedUrl = await uploadImageFromFile(filePath, folderName);
    // Delete the temporary file after successful upload
    fs.unlinkSync(filePath);
    return uploadedUrl;
  } catch (error) {
    throw error;
  }
};

const uploadMultipleFilesUsingUrls = async (fileUrls, folderName) => {
  try {
    const uploadPromises = fileUrls.map(async (fileUrl, index) => {
      const filePath = await downloadImage(fileUrl, index);
      try {
        const uploadedUrl = await uploadImageFromFile(filePath, folderName);
        // Delete the temporary file after successful upload
        fs.unlinkSync(filePath);
        return uploadedUrl;
      } catch (uploadError) {
        // Handle upload error and delete the temporary file
        fs.unlinkSync(filePath);
        throw uploadError;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadSingleFileUsingUrl,
  uploadMultipleFilesUsingUrls,
};
