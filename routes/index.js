var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require("path")
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const fetch = require('node-fetch');
const request = require('request');

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
  url_t: String,
  height_t: Number,
  width_t: Number,
  url_l: String,
  height_l: Number,
  width_l: Number,
  describe: String,
  title: String,
  date: String
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/home', async function (req, res, next) {
  const Img = mongoose.model('Image', Image);

  const PAGE_SIZE = 5;
  var page = req.query.page;
  page = parseInt(page);
  if (page < 1) {
    page = 1;
  }
  var skip = (page - 1)*PAGE_SIZE;

  Img.find({}).skip(skip).limit(5).then(data => {
    res.render('lists', { title: 'Home', data: data });
  })
});

router.get('/api', async function(req, res, next) {
  const Img = mongoose.model('Image', Image);

  const PAGE_SIZE = 5;
  var page = req.query.page;
  page = parseInt(page);
  if (page < 1) {
    page = 1;
  }
  var skip = (page - 1)*PAGE_SIZE;

  await Img.find({}).skip(skip).limit(5).then(data => res.status(200).send(data))
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

router.get('/show', async function (req, res, next) {
  const Img = mongoose.model('Image', Image);

  const PAGE_SIZE = 5;
  var page = req.query.page;
  page = parseInt(page);
  if (page < 1) {
    page = 1;
  }
  var skip = (page - 1)*PAGE_SIZE;

  Img.find({}).skip(skip).limit(5).then(data => {
    res.render('delete', { title: 'Home', data: data });
  })
});

router.get('/delete/:id', async function (req, res) {
  const Img = mongoose.model('Image', Image);

  Img.deleteOne({_id: req.params.id}).then(data => {
    if (data != null) res.send("Delete th??nh c??ng~!!!!")
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
  console.log(req.file)
  const describe = req.body.describe;
  const title = req.body.title;
  const d = new Date();
  const date = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  const img = mongoose.model('Image', Image);
  const url_t = req.file.filename;
  const url_l = req.file.filename;
  const height_t = 100;
  const width_t = 100;
  const height_l = 300;
  const width_l = 300;

  const Img = new img({
    url_t: url_t,
    height_t: height_t,
    width_t: width_t,
    url_l: url_l,
    height_l: height_l,
    width_l: width_l,
    describe: describe,
    title: title,
    date: date
  });

  Img.save().then(data => {
    if (data != null) {
      res.render('upload', {title: 'Th??m th??nh c??ng'});
    } else {
      res.render('upload', {title: 'Th??m kh??ng th??nh c??ng'});
    }
  });
});

router.put('/update/:id', upload.single('avatar'), function (req, res, next) {
  const describe = req.body.describe;
  const title = req.body.title;
  const d = new Date();
  const date = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  const url_t = req.file.filename;
  const url_l = req.file.filename;
  const height_t = 100;
  const width_t = 100;
  const height_l = 300;
  const width_l = 300;
  const Img = mongoose.model('Image', Image);

  Img.updateOne({_id: req.params.id}, {
    url_t: url_t,
    height_t: height_t,
    width_t: width_t,
    url_l: url_l,
    height_l: height_l,
    width_l: width_l,
    describe: describe,
    title: title,
    date: date
  }).then(data => {
    if (data != null) res.send("Update th??nh c??ng~!!!!")
    console.log(data)
  });
});

module.exports = router;
