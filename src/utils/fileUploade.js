import multer from "multer";
import path from "path";

const storage = (destination) =>
  multer.diskStorage({
    destination: destination,
    filename: (req, file, cb) => {
      return cb(
        null,
        `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

export const fileUpload = (destination, file) =>
  multer({
    storage: storage(destination),

    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(
          new Error("Only .png, .jpg .jpeg .mp4, .mpeg, .mov formats allowed!")
        );
      }
    },
  }).single(file);
