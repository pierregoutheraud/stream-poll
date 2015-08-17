let express =   require('express'),
    mongoose =  require('mongoose'),
    path =      require('path'),
    os =        require('os');

let app = express(),
    router = express.Router();

// Models
let CommentModel = require('./models/CommentModel.js');

const FILES_PATH = path.normalize(__dirname + '/files');
const TEMP_PATH = path.normalize(__dirname + '/temp');

let os_hostname = os.hostname();

const MONGOOSE_CONNECT = 'mongodb://pierre:microst7@waffle.modulusmongo.net:27017/a8gyNeqy';

global.connection = mongoose.createConnection(MONGOOSE_CONNECT);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  return next();
});

router.route('/comments/:id')
  .get(function(req, res, next) {

    let video_id = req.params.id;
    let query = CommentModel.findOne().where('video_id').equals(video_id);

    console.log('GET comments id:' + video_id);

    // query.exec().addBack((err, comment) => {
    //   console.log('LEL');
    //   res.json(comment);
    // });

    let comments = [], at = 0;

    for(let i=0,l=30;i< l;i++) {
      let up = Math.floor(Math.random()*100),
          down = Math.floor(Math.random()*80),
          score = up - down;
      comments.push({
        id: i,
        message: 'Commentaire '+i,
        username: 'user'+i,
        at: at,
        time: 1437142535824,
        up: up,
        down: down,
        score: score
      });
      at += Math.floor(Math.random()*5);
    }

    res.json({
      video_id,
      comments
    });

  })

app.use('/api', router);

let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Listening at http://%s:%s/api', host, port);
});
