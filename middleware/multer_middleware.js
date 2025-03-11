const multer = require('multer');
const path = require('path');

// تكوين مكان تخزين الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/'); // مجلد التخزين
  },
  filename: (req, file, cb) => {
    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// تحديد أنواع الملفات المسموحة
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('يسمح فقط بملفات الصور!'), false);
  }
};

// إنشاء middleware الخاص بـ multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // الحد الأقصى 5 ميجابايت
  },
  fileFilter: fileFilter
});

module.exports = upload;