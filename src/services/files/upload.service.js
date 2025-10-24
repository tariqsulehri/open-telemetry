
const multer = require('multer');
const path = require('path');

exports.getStorage = (destinationPath) => {
    const storage = multer.diskStorage({
        limits: {
            fileSize: 5 * 1024 * 1024, // Limit file size to 5 MB
          },
        destination: destinationPath,
        filename: function (req, file, cb) {
            cb(null, `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`);
        }
    });

    return storage;
}
