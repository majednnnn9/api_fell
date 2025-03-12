const express = require('express');
const path = require('path');
require('dotenv').config();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
const pool = require('./config/database');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


async function uploadToImgBB(imageBuffer) {
    try {
        const formData = new FormData();
        formData.append('image', imageBuffer.toString('base64'));

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData);
        return response.data.data.url;
    } catch (error) {
        console.error('خطأ في رفع الصورة إلى ImgBB:', error);
        throw error;
    }
}

app.post('/upload-post', upload.single('image'), async (req, res) => {
    try {
        const { description } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم تحميل أي صورة'
            });
        }

        // رفع الصورة إلى ImgBB
        const imageUrl = await uploadToImgBB(file.buffer);

        // حفظ البيانات في قاعدة البيانات
        const result = await pool.execute(
            'INSERT INTO `posts`(`url`, `desc`) VALUES (? , ? )',
            [imageUrl, description]
        );

        res.json({
            success: true,
            message: 'تم رفع المنشور بنجاح',
            data: {
                id: result[0].insertId,
                image_url: imageUrl,
                description: description
            }
        });

    } catch (error) {
        console.error('خطأ:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء رفع المنشور'
        });
    }
});
app.get('/get-posts', async (req, res) => {
    try {
        const [posts] = await pool.execute(
            'SELECT * FROM posts'
        );
        // console.log(posts)
        // res.render('get-posts', { 'posts': posts })

        // console.log(posts)
        res.json({
            success: true,
            data: posts
        });

    } catch (error) {
        console.error('خطأ:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب المنشورات'
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
