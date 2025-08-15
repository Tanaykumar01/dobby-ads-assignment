import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/temp');
//       console.log(file);
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5)
//       cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
//   })

// export const upload = multer({ storage: storage });

import os from "os";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir()); // Use system temp folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

export default storage;