#SVGEventListener.js#

A script that let's you use animate events on SVG (beginEvent, endEvent, repeatEvent) in browsers that don't implements them.

By:

MAD - ecrire [at] madsgraphics [dot] com


Follow: [@madsgraphics](http://twitter.com/madsgraphics) on Twitter for more updates.

##Use##

Just use the normal `addEventListener` on your elements, and the script with automagically fallback to the correct event :]

    anim = document.getElementById('anim');
    anim.addEventListener('endEvent', function(event) {
        p = document.createElement('p');
        t = document.createTextNode('It works!');
        p.appendChild(t);
        document.body.appendChild(p);
    }, false);

Any forks and stuff are welcome.

##Changelog##

**0.2**

* More lightweight implementation.
* Use prototyped beginElement methods for SVGAnimateElement and SVGAnimateTransformElement.
* Move auto fire events (begin and end) directly in EventListener constructor method instead of determines it when trigger.


**0.1.2**

* Update the support of event's `animate` element : the implementation currently not support event detection using a simple `animate['endEvent']?` test. We need to create dummy svg element and inject temporarily them to the DOM to make the detection and update a map of supported events :).


**0.1.1**

* Update [Clocker.js](https://github.com/madsgraphics/clocker.js) with the last release


**0.1**

* First implementation. Do not support `repeatEvent` for the moment.


##Know issues##

None, for the moment \o/…


##License##

All of the SVGEventListener specific code is under the WTFPL license. Which means it's also MIT and BSD (or anything you want). However, the inspired works are subject to their own licenses.


##Thanks##

Nicolas Hoizey ([@nhoizey](http://twitter.com/nhoizey)) - For the initial challenge \o/

Christophe Porteneuve ([@porteneuve](http://twitter.com/porteneuve)) - For giving me his passion for javascript.

Jérémie Patonnier ([@JeremiePat](http://twitter.com/jeremiepat)) - For is indefectible support about SVG and others.
