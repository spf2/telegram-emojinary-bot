var emojinary = require('./emojinary');

var storage = require('node-persist');
storage.initSync();

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
bot.getMe().then(function (me) {
  console.log('Hi my name is %s!', me.username);
});

bot.on('message', function (msg) {
  var command = msg.text.toLowerCase().match(/\/(\w+)/);
  if (command) {
    if (command[1] == 'play') {
      pickMovie(msg, function(movie) {
        var text = 'Your movie is "' + movie.title + '". Type it in emoji and see if your friends can guess it, or type skip for a different movie.'
        bot.sendMessage(msg.from.id, text);
      });
    } else if (command[1] == 'skip') {
      pickMovie(msg, function(movie) {
        var text = 'New movie is "' + movie.title + '"'
        bot.sendMessage(msg.from.id, text);
      });
    }
    return
  }
  var games = storage.getItem(storageKey(msg.chat)) || [];
  var matches = games.filter(function(g) {
    return emojinary.fuzzyMatch(g.movie.title, msg.text);
  });
  if (matches.length == 1) {
    var match = matches[0];
    games = games.filter(function(g) { return g != match; });
    storage.setItem(storageKey(msg.chat), games);
    var text = msg.from.first_name + " got it! (" + match.user.first_name + "'s movie was " + match.movie.title + ")";
    bot.sendMessage(msg.chat.id, text);
  }
});

function storageKey(chat) {
  return "chat." + chat.id;
}

function pickMovie(msg, callback) {
  var games = storage.getItem(storageKey(msg.chat)) || [];
  games = games.filter(function(g) { return g.user.id != msg.from.id; });
  emojinary.aRandomMovie(function(movie) {
    games.push({
      'user': msg.from,
      'movie': movie,
    })
    storage.setItem(storageKey(msg.chat), games);
    callback(movie);
  });
}
