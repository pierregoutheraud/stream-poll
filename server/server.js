let express =    require('express'),
    mongoose =   require('mongoose'),
    path =       require('path'),
    os =         require('os'),
    bodyParser = require('body-parser')

let app = express(),
    router = express.Router();

// Models
let PollModel = require('./models/PollModel.js');
let OptionModel = require('./models/OptionModel.js');

const FILES_PATH = path.normalize(__dirname + '/files');
const TEMP_PATH = path.normalize(__dirname + '/temp');

let os_hostname = os.hostname();

const MONGOOSE_CONNECT = 'mongodb://pierre:microst7@apollo.modulusmongo.net:27017/iqYj5uto';
var connection = mongoose.connect(MONGOOSE_CONNECT);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  return next();
});

app.use(bodyParser.json())

router.route('/poll')

  .post(function(req,res) {

    let { question, options } = req.body;

    let poll = new PollModel({
      question: question
    });

    let savePoll = function() {
      console.log('saving poll...');
      poll.save(function(err, poll){
        PollModel.populate(poll, {path:"options"}, function(err, poll) {
          console.log('poll saved.');
          res.json(poll);
        });

      });
    };

    options.forEach((o, i) => {
      let option = new OptionModel({
        value: 'test',
        vote: 0
      });

      console.log('saving option '+i);

      option.save(function(err, option){
        if (err) console.error(err)
        console.log('option saved '+i, option._id);
        poll.options.push(option._id);
        console.log(poll.options.length+'/'+options.length);
        if (options.length === poll.options.length) savePoll();
      });
    });

  });

router.route('/poll/:id')

  .get(function(req, res, next) {

    let poll_id = req.params.id;
    let query = CommentModel.findOne().where('_id').equals(poll_id);

    // res.json({
    //   poll_id,
    //   comments
    // });

  })

app.use('/api', router);

let server = app.listen(10000, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log(`Listening at http://127.0.0.1:${port}/api`);
});
