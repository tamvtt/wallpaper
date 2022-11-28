var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require("path")
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const uri = "mongodb+srv://tamvt:CIg65aKTZxz4zsq4@cluster0.zkfrmhr.mongodb.net/?retryWrites=true&w=majority"
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.static(path.join(__dirname, 'public')));
router.use(methodOverride('_method'));

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connect to MongoDB");
  } catch (e) {
    console.error(e);
  }
}

connect();

const Image = new mongoose.Schema({
  url: String,
  describe: String,
  title: String,
  date: String
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  console.log(req.body)
});

router.get('/list', function(req, res, next) {
  const Img = mongoose.model('Image', Image);

  Img.find({}).then(data => {
    res.render('lists', { title: 'List', data: data });
  })
});

router.get('/upload', function(req, res, next) {
  res.render('upload', { title: 'Upload' });
});

router.get('/edit/:id', function(req, res, next) {
  const Img = mongoose.model('Image', Image);

  Img.findById(req.params.id).then(data => {
    res.render('edit', { title: 'Edit',data: data});
  })
});

router.get('/detail/:id', function(req, res, next) {
  const Img = mongoose.model('Image', Image);

  Img.findById(req.params.id).then(data => {
    res.render('detail', { title: 'Detail', data: data });
  })
});

router.get('/delete/:id', function (req, res) {
  const Img = mongoose.model('Image', Image);

  Img.deleteOne({_id: req.params.id}).then(data => {
    if (data != null) res.send("Delete thành công~!!!!")
  })
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(path.extname(
        file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File upload only supports the "
        + "following filetypes - " + filetypes);
  }
})

router.post('/insert', upload.single('avatar'), function (req, res, next) {
  const describe = req.body.describe;
  const title = req.body.title;
  const d = new Date();
  const date = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  const img = mongoose.model('Image', Image);
  const url = req.file.filename;

  const Img = new img({
    url: url,
    describe: describe,
    title: title,
    date: date
  });

  Img.save().then(data => {
    if (data != null) {
      res.render('upload', {title: 'Thêm thành công'});
    } else {
      res.render('upload', {title: 'Thêm không thành công'});
    }
  });
});

router.put('/update/:id', upload.single('avatar'), function (req, res, next) {
  const describe = req.body.describe;
  const title = req.body.title;
  const d = new Date();
  const date = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  const url = req.file.filename;
  const Img = mongoose.model('Image', Image);

  Img.updateOne({_id: req.params.id}, {
    url: url,
    describe: describe,
    title: title,
    date: date
  }).then(data => {
    if (data != null) res.send("Update thành công~!!!!")
    console.log(data)
  });
});

module.exports = router;
