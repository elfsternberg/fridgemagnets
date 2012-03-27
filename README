# Fridgemagnets - A Nifty HTML5 Toy With Some Twitterable Features!

## Demo

Main website: [HTML5 Magnets!](http://html5magnets.elfsternberg.com)

Happy results: [@HTML5Magnets](https://twitter.com/#!/html5magnets)

## Main Idea

Fridgemagnets is a straightforward simulation of a relaxing
refrigerator poem tileset.  It was inspired by
[TwitterMagnets](http://twittermagnets.com/), a Flash app written by the
brilliant graphic designers at
[PlusGood](http://www.plusgood.co.uk/).  I have a bit of Flash envy,
since I'm not an Adobe developer, and the TwitterMagnets application
bugged me.  It didn't resize, it didn't do mobile very well, and
nobody has a space reserved on their fridge for the poem: a "poem" is
just a meaningful arrangement of words deliberately placed in close
proximity that seems to convey meaning.

Fridgemagnets has a lot of new and fun technologies: it uses the audio
API, it involves all manner of write-only-DOM tricks to make resizing
work well, and it's my first major piece of express.js software.  (I
originally thought of using Zappa, but decided against it; dispatch is
not the biggest thing Node has to deal with, and express by itself
works just fine in Coffee.)

I can now add the Twitter API, the HTML5 Audio API, and some basic
game mechanics ([Separate Axis
Theorem](http://www.metanetsoftware.com/technique/tutorialA.html) for
collision management, anyone?) to my resume.

This is known to work in later versions of Chrome, Firefox, and IE8+
under Windows XP.  No promise is implied of it working on your version
of those, or any other browser.  It's not (yet) phone-ready.

## Requirements

Node.js.  Most of the subsidiary requirements can be found in the two
package.json files.  For development purposes Coffeescript, LessCSS,
and HAML are in heavy use.

If you're running the server, you need MySQL.  The schema for the
MySQL database can be found in the server folder.

A config file.  There's an example in the server folder.

A twitter developer's account.  Get one at dev.twitter.com.

If you're going to be using the test/deploy routine, inotify-tools and
python's "fabric" program are very useful.

If you're going to make this publicly available, I strongly recommend
you run this as its own user in a low-permissions container, behind
Nginx and a lot of smarts.  Also, the Node.js program "forever" is
very useful in keeping the server up.

## Acknowledgements

[PlusGood](http://www.plusgood.co.uk/), for the inspiration.

[Emily Richards aka Snowflake](http://ccmixter.org/people/snowflake),
for her beautiful music.

The entire crew at [Nodejitsu](http://nodejitsu.com/), for all the
encouragement, even if I don't use their services.

## CREDITS

"Ethereal Space" is copyright (c) 2011 Snowflake, licensed under a
Creative Commons 3.0 Attribution-Required license.  

jQuery, jQuery UI and associated assets, Buzz.js, and jQuery CSS
Transform are copyright their respective owners, and available under
a permissive MIT license.

## LICENSE AND COPYRIGHT NOTICE: NO WARRANTY GRANTED OR IMPLIED

Copyright (c) 2012 Elf M. Sternberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

	- Elf M. Sternberg <elf@pendorwright.com>

