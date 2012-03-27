SUFFIX = 1
PREFIX = 2


# Average number of words visible on any given iteration.
AVG_VISIBLE = 60

clone = (obj) ->
  return obj if not obj? or typeof obj isnt 'object'
  newInstance = new obj.constructor()
  for key of obj
    newInstance[key] = clone obj[key]
  newInstance


HEIGHT_FUZZ = 8
WIDTH_FUZZ = 6

# A dimensioned object is one that appears on the board: it has an X
# and Y coordinate, a width and a height.  From this, we can create a
# bounding box using the "shape" function.  Dimensioned objects can be
# compared to other dimensioned objects to assert whether or not
# they're in collision.  Some objects have bounding boxes that pull in
# or push out the borders abstractly, in order to provide for "fuzzy"
# collisions that correspond to drop shadows or similar visual effects.

shape = (x, y, w, h) -> [{x: x, y: y}, {x: x + w, y: y}, {x: x + w, y: y + h}, {x: x, y: y + h}]

class Dimensioned
    _width: null
    _height: null
    _left_p: null
    _top_p: null
    _left: null
    _top: null
    _pos: null

    constructor: (@el) ->

    unset_dims: ->
        @_left = @_top = @_width = @_height = @_pos = null

    reset_dims: ->
        @unset_dims()
        [@left(), @top(), @width(), @height()]

    positioned: -> return @_width? and @height?

    visibleReposition: ->
        @reposition()
        @el.css {top: @top(), left: @left()}
        @

    reposition: ->
        parent = @el.offsetParent()
        [@_top, @_left] = [parseInt(@_top_p * parent.height()), parseInt(@_left_p * parent.width())]
        @_pos = {left: @_left, top: @_top}
        @

    width:  -> @_width =  if @_width?  then @_width  else @el.outerWidth()
    height: -> @_height = if @_height? then @_height else @el.outerHeight()
    pos:    -> @_pos  = if @_pos?  then @_pos  else @el.position()

    left: -> @_left = if @_left?
        @_left
    else
        @_left = @pos().left
        @_left_p = @_left / @el.offsetParent().width()
        @_left

    top: -> @_top = if @_top?
        @_top
    else
        @_top = @pos().top
        @_top_p = @_top / @el.offsetParent().height()
        @_top

    dims: -> [@width(), @height()]
    shape: ->
        shape @left(), @top(), @width(), @height()


# I can't decide if this is the right way to go, with a two-pass "set
# it all up, then make it all blow up," but it works quite well, all
# things considered.  And after much consideration (like, one minute
# of realizing I never, ever used the features) it became obvious I
# didn't need Dimensioned.

class Heart

    constructor: (@parent, @top, @left, symbol) ->
        dv = '<div class="heart" style="display:none;top:' + parseInt(@top) + 'px;left:' + \
            parseInt(@left) + 'px' + '">' + symbol + '</div>'
        @el = $(dv)
        @el.css {'font-size': 'larger'} if Math.random() > 0.6
        @rot_dist = parseInt(90 * Math.random()) * (if Math.random() < 0.5 then 1 else -1)
        [@dir, @dst, @dur] = [Math.random() * 2 * Math.PI, Math.random() * 110, Math.random() * 1200 + 700]
        $(@parent).append(@el)

    explode: ->
        el = $(@el)
        el.show().animate({opacity: 0.0, top: parseInt(@top + (Math.sin(@dir) * @dst)), left: parseInt(@left + (Math.cos(@dir) * @dst)), rotate: @rot_dist}, @dur, "easeOutCubic", (() -> el.remove()))

explode_hearts = (@board, @el) ->
    randomsymbol = -> ['&#x0266A;','&#x02605;','&#x02736;'][parseInt(Math.random() * 3)]
    symbol = if Math.random() < 0.3 then randomsymbol() else '&#x02665;'
    parent = @board.el
    [top, left, height, width] = [@el.top(), @el.left(), @el.height(), @el.width()]
    hearts = for i in [0..(22 + (6 - Math.floor(Math.random() * 12)))]
        new Heart(parent, top + (0.5 * height), left + (0.5 * width), symbol)
    (h.explode() for h in hearts)


# The board is the principle object on which all other objects are
# dependent.  I decided to make it a 'Dimensioned' because I'm going
# to be constantly querying its height and width.

class Board extends Dimensioned

    append: (ob) -> @el.append(ob)

    css: (width, height) ->
        @el.css
            width: width
            height: height
        @reset_dims()



class Footer extends Dimensioned



# A Tile is a word tile.  It has a single word.

class Tile extends Dimensioned

    base_style:
        'font-size': "15px"

    drag_style:
        'font-size': "19px"

    visible: false

    # Initial tilt.
    rotation: (Math.random() * 30) - 15

    constructor: (@word, @board, @master) ->
        @el = $('<div class="word">' + @word.w + '</div>')
        @el.css @base_style
        @board.append(@el)
        @rotation = (Math.random() * 30) - 15

        @el.draggable
            helper: "original"
            refreshPositions: false
            revertDuration: 1

            start: (event) =>
                mod = (Math.random() * 16) - 8
                @rotation = if Math.abs(@rotation + mod) > 15 then @rotation - mod else @rotation + mod
                style = clone(@drag_style)
                style.rotate = @rotation
                @el.animate(style, 200, () => @new_width = @el.width())
                true

            stop: (event) =>
                # Drop the thing dead center, at least on the x-axis,
                # and animate its return to the new font size.
                mod = (Math.random() * 16) - 8
                @rotation = if Math.abs(@rotation + mod) > 15 then @rotation - mod else @rotation + mod
                style = clone(@base_style)
                style.rotate = @rotation
                style['left'] = parseInt(@el.position().left + (0.5 * (@new_width - @width())))
                @el.animate style, 200, 'easeOutQuad', () =>
                    @reset_dims()
                    explode_hearts(@board, @)
                    @master.poemed(@)
                true

    fadeOut: -> $.Deferred((d) => @el.fadeOut('fast', (() => @unset_dims(); @visible = false; d.resolve()))).promise()

    # Shape for deteriming poemed collision
    fuzzyshape: -> shape  @left() - WIDTH_FUZZ, @top() - HEIGHT_FUZZ, @width() + (2 * WIDTH_FUZZ), @height() + (2 * HEIGHT_FUZZ)

    get_new_pos: ->
        bh = => parseInt(Math.random() * (@board.height() - @height()) * 0.985)
        bw = => parseInt(Math.random() * (@board.width() - @width()) * 0.98)
        [top, left] = [bh(), bw()]
        [top, left] = [bh(), bw()] until @master.unoccupied(left, top, @width(), @height())
        [top, left]

    flyIn: ->
        fd = (mod) ->
            m = parseInt(40 * Math.random())
            if (Math.random() < 0.5) then mod + m else -1 * m
        @el.css
            left: fd(@board.width())
            top:  fd(@board.height())
        dfd = $.Deferred()
        x = Math.random()
        [top, left] = @get_new_pos()
        @el.fadeIn().animate {top: top, left: left, rotate: @rotation}, 1500, 'easeOutQuint', () =>
            @visible = true
            dfd.resolve()
        dfd.promise()



class PoemDisplay extends Dimensioned
    el: $('#results')
    _max_box: null
    dialog: $('#message')
    dtimer: null

    constructor: (@board) ->
        @el.css({top: @board.height()})

    sentSuccess: (data, textStatus) =>
        $('p', @dialog).html "Your poem has been immortalized! It can be seen on Twitter at <a href='https://twitter.com/#!/html5magnets'>@html5magnets</a>."
        if data.error
            $('p', @dialog).html data.message

        @dialog.dialog("open")
        if dtimer != null
            clearTimeout(dtimer)
            dtimer = null
        dtimer = setTimeout (() => @dialog.dialog("close")), 7500

    sentError: (query, textStatus) =>
        console.log(query, textStatus)

    sendToServer: (haiku) =>
        $.ajax 'http://html5magnets.elfsternberg.com/poems/',
            type: "POST"
            data: {"message": haiku}
            dataType: 'json'
            success: @sentSuccess
            error: @sentError

    update: (lines) ->
        lines = (l for l in lines when l.length > 0)
        if lines.length == 0
            @el.fadeOut()
            return

        @el.html('')
        @el.show()
        res = for words in lines
            line = words[0].w
            for word in words[1...words.length]
                line += if word.s == 1 then word.w else '&nbsp;' + word.w
            @el.append($('<p>' + line + '</p>'))

        sentence = for words in lines
            line = words[0].w
            for word in words[1...words.length]
                line += if word.s == 1 then word.w else ' ' + word.w
            line

        haiku_add = 0
        if sentence.length > 1
            haiku = sentence.join(" / ")
            if haiku.length < 140
                haiku_add = 38
                @el.append('<div id="tweetthis"><img src="tweetthis.png"></div>')
                $('#tweetthis').click(() => @sendToServer(lines))

        if lines.length != @lastlines
            lh = $('p', @el).height()
            setTimeout((() => @el.animate {top: @board.height() - ((lh * (lines.length + 1.7)) + haiku_add)}), 1)
        @

    max_box: =>
        return shape(@board.height() - (16 * 6.7), 0, 480, (16 * 6.7))


# A poem is three or more *moved* words in fuzzy collision.

class Poem
    words: []

    constructor: (@master) ->
        @poembox = new PoemDisplay(@master.board)

    real_poem: (poem = null) ->
        poem = @words if not poem?
        if poem.length > 1 then poem else []

    has: (word) ->
        return (w for w in @words when w == word).length > 0

    find_bbox: (words = null, sp = 0) ->
            words = @words if not words
            return null if words.length < 2
            [ul, ur, lr, ll] = words[0].shape()
            [mx, my, nx, ny] = [ul.x, ul.y, lr.x, lr.y]
            for i in [1...words.length]
                [ul1, ur1, lr1, ll1] = words[i].shape()
                mx = ul1.x if ul1.x < mx
                my = ul1.y if ul1.y < my
                nx = lr1.x if lr1.x > nx
                ny = lr1.y if lr1.y > ny
            return [{x: mx - sp, y: my - sp}, {x: nx + sp, y: my - sp}, {x: nx + sp, y: ny + sp}, {x: nx + sp, y: my - sp}]

    check_dismissal: (word) ->
        # If the word is colliding with another word in the poem, it
        # is not being dismissed.
        fuzzyshape = word.fuzzyshape()
        for w in @words
            if w != word and colliding(fuzzyshape, w.fuzzyshape())
                @inorder()
                return @words

        # Remove word from @words
        @words = @real_poem(w for w in @words when w != word)
        return @words if @words.length < 2

        # Reconstitute poem from what remains
        find_split_poem = (poem) =>
            # Why 2? Because a poem of length 1 is just a word!
            throw "Don't run on an empty poem!" if poem.length < 2

            # Transfer all words in *poem2* that are in collision with
            # words in poem1.  If the poems don't change, return them,
            # otherwise repeat the process.

            edgefollow = (poem1, poem2) =>
                to_xfr = (w2 for w2 in poem2 when \
                    ((w1 for w1 in poem1 when \
                        colliding(w1.fuzzyshape(), w2.fuzzyshape())).length > 0))

                # Words are not being shuffled around
                return [poem1, poem2] if to_xfr.length == 0

                # Else...
                poem1 = poem1.concat(to_xfr)
                poem2 = (w for w in poem2 when w not in poem1)
                edgefollow(poem1, poem2)

            wordlist = (i for i in poem)
            first_word = wordlist.pop()
            [lpoem, rpoem] = edgefollow([first_word], wordlist)
            return [] if lpoem.length < 2 and lpoem.length < 2
            return rpoem if lpoem.length < 2
            return lpoem if rpoem.length < 2
            return if Math.vector.magnitude(@find_bbox(lpoem)[0]) < Math.vector.magnitude(@find_bbox(rpoem)[0])
                lpoem
            else
                rpoem

        @words = @real_poem(find_split_poem(@words))
        if @words
            @inorder()
        @words

    # Looks at the bounding box for the current poem and adds any words
    # to it that are in collision with the existing poem.
    # :: [tiles] -> [tiles]

    research_poem: (poem) ->
        nbbox = @find_bbox(poem)
        newpoem = (i for i in poem)
        potentials = (w for w in @master.visible() when \
            (w not in newpoem) and colliding(w.fuzzyshape(), nbbox))

        # [word, poem] -> boolean
        collides_with_existing_poem = (nw1, poem1) ->
            fzs1 = nw1.fuzzyshape()
            acw1 = nw1.word
            ((nw2 for nw2 in poem1 when \
                acw1 != nw2.word and \
                colliding(nw2.fuzzyshape(), fzs1)).length > 0)

        addenda = (nw for nw in potentials when collides_with_existing_poem(nw, newpoem))
        if addenda.length == 0 then newpoem else @research_poem(newpoem.concat(addenda))


    # Looks to see if the word has come into collision with another
    # word, creating a new poem.
    # :: tile -> [tiles]

    maybe_new_poem: (word) ->
        throw "Do not call maybe_new_poem on a working poem." if @words.length > 0

        fuzzyshape = word.fuzzyshape()
        @words = @real_poem((w for w in @master.visible() when \
            colliding(w.fuzzyshape(), fuzzyshape)))

        if @words.length
            @words = @research_poem(@words)

        @inorder()
        @words


    check_for_addition: (word) ->
        # See if this word collides with any of the words in our poem:
        fuzzyshape = word.fuzzyshape()
        for w in @words
            if colliding(fuzzyshape, w.fuzzyshape()) and w != word
                @words.push(word)
                # One collision is all it takes.
                break

        @words = @research_poem(@words)
        @inorder()
        @words


    check: (word) ->
        return @words = @maybe_new_poem(word) if @words.length == 0

        if @has(word)
            @words = @check_dismissal(word)
            return @words = if @words.length == 0 then @maybe_new_poem(word) else @words

        # This word doesn't create a new poem, and it isn't present in
        # our existing poem.

        return @words = @check_for_addition(word)


    inorder: ->
        return @poembox.update([]) if @words.length < 2
        nbbox = @find_bbox(@words)
        avg_height = 0
        for w in @words
            avg_height = avg_height + w.height()
        avg_height = parseInt(avg_height / @words.length)
        ret = []
        for i in (i for i in [nbbox[0].y...nbbox[2].y] by avg_height)
            zbot = i + avg_height
            zone_words = (w for w in @words when w.top() >= i and w.top() < zbot)
            zone_words.sort (a, b) -> a.left() - b.left()
            ret.push((i.word for i in zone_words))
        @poembox.update(ret)



class Magnets extends Dimensioned

    constructor: (@wordlist) ->
        @el = $(window)
        @footer = new Footer($('#footer'))
        @board = new Board($('#board'))
        @recbox = $('#recbox')
        @results = $('#results')
        @words = (new Tile(word, @board, @) for word in @wordlist)
        @resize()
        @poem = new Poem(@)
        $('#shuffler').click(@reword)
        $(window).resize(@resize)

    resize: =>
        @unset_dims()
        @board.css('100%', @height() - @footer.height())
        (word.visibleReposition() for word in @words when word.visible)
        @

    unoccupied:(left, top, width, height) ->
        reserved = []
        if @poem.real_poem().length > 0
            reserved.push(@poem.find_bbox(null, 10))
        reserved.push(@poem.poembox.max_box())
        target = shape(left, top, width, height)
        for s in reserved
            if colliding(target, s)
                return false
        true

    visible: ->
        (w for w in @words when w.visible)

    poemed: (word) ->
        @poem.check(word)

    livewords: -> (w for w in @words when w.visible)

    reword: =>
        poemed = (w for w in @words when @poem.has(w))
        flyprob = AVG_VISIBLE / (@words.length - poemed.length)
        $.when.apply(null, (w.fadeOut() for w in @words when not @poem.has(w))).then () =>
            $.when.apply(null, (w.flyIn() for w in @words when not @poem.has(w) and Math.random() < flyprob)).then () =>
                (w.reset_dims() for w in @words when w.visible)
        @


class MusicPlayer
    constructor: (control, tunes) ->
        @control = $(control)
        @control.data('state', 'on')
        @active = true
        @music = new buzz.sound(tunes, {preload:true, autoload: true, loop: true})
        @music.setVolume(0)
        @music.bind 'canplaythrough', () =>
            @music.play()
            @music.fadeTo(60, 10000)

        @control.click (ev) =>
            @active = if @active then @fadeOut() else @fadeIn()

    fadeOut: ->
        @music.fadeOut(600, () => @music.pause())
        $('img', @control).attr('src', 'mute.png')
        false

    fadeIn: ->
        @music.play().fadeIn(1200)
        $('img', @control).attr('src', 'unmute.png')
        true


$ ->
    $.ajax
        url: 'js/wordlist.js'
        data: {}
        success: (data) -> (new Magnets(data)).resize().reword()
        error: -> console.log(arguments)
        dataType: 'json'

    v = new MusicPlayer('#muteunmute',
        ['media/snowflake_-_Ethereal_Space.mp3',
        'media/snowflake_-_Ethereal_Space.ogg'])

    $( "#message" ).dialog
        autoOpen: false
        show: "fadeIn"
        hide: "fadeOut"