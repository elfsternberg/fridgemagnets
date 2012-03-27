express = require 'express'
mysql = require('db-mysql')
OAuth = require('oauth').OAuth
util = require('util')
config = require('./config')
fs = require('fs')

wordlist = JSON.parse(fs.readFileSync('./wordlist.js', 'utf-8'))
wordstream = (i.w for i in wordlist).join(' ')

body_to_haiku = (lines) ->
    ret = (for words in lines
        line = words[0].w
        for word in words[1...words.length]
            line += if word.s == 1 then word.w else ' ' + word.w
        line).join(" / ")
    console.log(ret)
    ret


class AddressTracker

    constructor: (database, username, password) ->
        @db = new mysql.Database({
            "hostname": "localhost"
            "user": username
            "password": password
            "database": database})
        @db.on('ready', () -> @connection = this)
        @db.on('error', () -> console.log(arguments))

    connect: (cb) ->
        atrack = @
        @db.connect () ->
            atrack.connection = this
            cb.apply(this, arguments)

    validate: (ip_address, message, cb) ->
        yesterday = new Date((new Date()).valueOf() - 1000 * 86400)
        connection = @connection

        connection.query().
            select('*').
            from('tweets').
            where('address = ? and entered > ?', [ip_address, yesterday]).
            execute (err, rows, cols) ->

                return cb(err, null) if (err)
                return cb("You've used up your allotted number of tweets today", null) if rows.length > 10

                connection.query().
                    select('*').
                    from('tweets').
                    where('tweet = ?', [body_to_haiku(message.message)]).
                    execute (err, rows, cols) ->

                        return cb(err, null) if (err)
                        return cb("You've already sent that poem!", null) if rows.length > 0

                        connection.query().
                            insert('tweets', ['address', 'tweet', 'entered'], [ip_address, body_to_haiku(message.message), (new Date())]).
                            execute (err, result) ->
                                return cb(err, null) if err
                                cb(null, result)


class TwitterPoster
    constructor: ->
        @oauth = new OAuth(
            "https://api.twitter.com/oauth/request_token",
            "https://api.twitter.com/oauth/access_token",
            config.twitter.consumer_key,
            config.twitter.consumer_private_key,
            "1.0",
            null,
            "HMAC-SHA1"
        )

    post: (message, callback) ->
        @oauth.post(
            "http://api.twitter.com/1/statuses/update.json",
            config.twitter.access_token_key,
            config.twitter.access_token_secret,
            {"status": body_to_haiku(message.message) },
            "application/json",
            (error, data, response2) ->
                if error
                    console.log(error) if error
                    callback(error, null)
                    return
                callback(null, data)
        )


app = module.exports = express.createServer()

# Configuration
app.configure ->
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use express.logger()
    app.use app.router


app.configure 'development', ->
    app.use express.errorHandler
        dumpExceptions: true
        showStack: true

app.configure 'production', ->
    app.use express.errorHandler()

all_good_words = (lines) ->
    for words in lines
        for word in words
            if not (new RegExp('\\b' + word + '\\b')).test(wordstream)
                return false
    return true

address_tracker = new AddressTracker(config.tracker.database, config.tracker.username, config.tracker.password)
twitter_poster = new TwitterPoster()

# Our single route

app.post '/poems/', (req, res) ->
    if not req.body? or not req.body.message?
        res.send({error: true, code: -1, message: "We did not receive a poem."})
        return

    if not all_good_words(req.body.message)
        res.send({error: true, code: -1, message: "ERROR -5: HACKSTOP."})
        return

    address_tracker.validate req.headers['x-forwarded-for'], req.body, (err, result) ->
        if err != null
            console.log(err)
            res.send({error: true, code: 1, message: err})
            return

        twitter_poster.post req.body, (err, result) ->
            if err != null
                console.log(err)
                res.send({error: true, code: 2, message: err})
                return
            res.send({error: false, message: result})

address_tracker.connect () ->
    app.listen 8012
    console.log "Express server listening on port %d in %s mode", app.address().port, app.settings.env


