(function() {

  var tmdb = require('tmdbv3').init(process.env.TMDB_API_KEY);
  var clj_fuzzy = require('clj-fuzzy');

  var stripArticlePrefix = function(phrase) {
    var articles = ['the', 'a', 'an'];
    for (var i = 0; i < articles.length; i++) {
      if (phrase.toLowerCase().startsWith(articles[i])) {
        return phrase.slice(articles[i].length).trim();
      }
    }
    return phrase;
  }

  module.exports = {
    aRandomMovie: function(callback) {
      var page = Math.floor(Math.random() * 5);
      tmdb.misc.popular(page + 1, function(err, res) {
        if (err || !res.results) {
          console.log(err);
          return
        }
        var index = Math.floor(Math.random() * res.results.length);
        var movie = res.results[index];
        callback({ title: movie.title });
      })
    },

    fuzzyMatch: function(movie, guess) {
      var guessPhrase = stripArticlePrefix(guess);
      var titles = movie.split(/\s*:\s*/);
      for (var i = 0; i < titles.length; i++) {
        var moviePhrase = stripArticlePrefix(titles[i]);
        if (clj_fuzzy.phonetics.metaphone(guessPhrase) == clj_fuzzy.phonetics.metaphone(moviePhrase)) {
          return true;
        }
      }
      return false;
    },
  }
}());
