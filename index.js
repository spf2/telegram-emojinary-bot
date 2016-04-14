var emojinary = require('./emojinary');

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {'polling': true});
bot.setWebHook();

var storage = require('node-persist');
storage.initSync();

bot.on('message', function (msg) {
  var games = storage.getItem(msg.chat.id) || [];
  var matches = games.filter(function(g) {
    return emojinary.fuzzyMatch(g.movie.title, msg.text);
  });
  if (matches.length == 1) {
    var match = matches[0];
    games = games.filter(function(g) { return g != match; });
    storage.setItem(msg.chat.id, games);
    var message = {
      'text': message.sender.name + " got it! (" + match.user.name + "'s movie was " + match.movie.title + ")"
    };
    bot.sendMessage(msg.chat.id, msg.from.first_name + " got it! (" + match.user.first_name + "'s movie was " + match.movie.title + ")");
  }
});

bot.onText(/\/start (.+)/, function (msg, match) {
  var search = match[1];
  pickMovie(msg, function(movie) {
    var text = 'Your movie is "' + movie.title + '". Type it in emoji and see if your friends can guess it, or type /skip for a different movie.'
    bot.sendMessage(msg.from.id, text);
  });
});

bot.onText(/\/skip/, function(msg) {
  pickMovie(msg, function(movie) {
    var text = 'Your movie is now "' + movie.title + '"';
    bot.sendMessage(msg.from.id, text);
  });
});

function pickMovie(msg, callback) {
  var games = storage.getItem(msg.chat.id) || [];
  games = games.filter(function(g) { return g.user.id != msg.from.id; });
  emojinary.aRandomMovie(function(movie) {
    games.push({
      'user': msg.from,
      'movie': movie,
    })
    storage.setItem(msg.chat.id, games);
    callback(movie);
  });
}
