// SVGEventListener.js
// Version - 0.1-pre
//
// by MAD - @madsgraphics - ecrire[at]madsgraphics.com
//
// https://github.com/madsgraphics/SVGEventListener.js/
//
// Version: 0.1-pre
//
// Tri-license - WTFPL | MIT | BSD
//
// Please minify before use.

// ##ISSUES##
//
// * FIXME: Chrome generate an error on launch :
//   Uncaught TypeError: Cannot read property 'classList' of null

( function ( window, doc, el ) {

  'use strict';

  var addEventListenerLegacy   = el.prototype.addEventListener,
      svg                      = doc.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ),
      // helper functions
      isString                  = function ( s ) {
        return typeof s == "string";
      },
      isArray                   = Array.isArray || function ( obj ) {
        return toString.call( obj ) == "[object Array]";
      },
      isUndefined               = function ( obj ) {
        return obj === undefined;
      },
      isFunction                = function ( fn ) {
        return toString.call( fn ) == "[object Function]";
      },
      // Inspired by: http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
      isEventSupported          = function ( eventName ) {
        eventName = 'on' + eventName;
        // Check if the event attribute exists on el
        var isSupported = ( eventName in svg );
        // if not, try to set an event attribute with a falsy method
        if ( !isSupported ) {
          svg.setAttribute( eventName, 'return;' );
          isSupported = isFunction( svg[eventName] );
        }

        return isSupported;
      };

  // Clocker.js
  // Convert a legal clock string value (in SMIL definition) to milliseconds
  //
  // Originaly released here:
  function clocker( time ) {
    var i,
        times = time.split( ':' );

    // Format without ':' ?
    if ( times.length == 1 ) {
      // Time already given in milliseconds (250ms)
      if ( ( i = times[0].lastIndexOf('ms') ) != -1 ) {
        return Number( times[0].substring(0, i) );
      }
      // Time given in seconds (2s)
      else if ( ( i = times[0].lastIndexOf('s') ) != -1 ) {
        return times[0].substring(0, i) * 1000;
      }
      // Time without unity. Assume in seconds,
      // with potentially decimals (2.05 == 2050ms)
      else {
        return times[0]*1000;
      }
    }
    // Legacy clock value with ':' separator
    else {
      // Reverse order to iterate from seconds to hours
      times.reverse();
      // Init time
      time = 0;
      for ( var t in times ) {
        // Value * 60^t (hours / minutes to seconds) * 1000 (s to ms)
        time += times[t]*Math.pow(60, t)*1000;
      }

      return time;
    }
  }

  /***
   * Event Listener
   ***/

  // Custom Event listener
  // Implements Observer pattern
  //
  // inspired by: http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/

  // Create custom listener object with private property to store listeners
  function EventListener() {
    this._listeners = {};
    this.autoFire   = {
      begin: false,
      end: false
    };
  }

  // Extends it to add and fire events
  EventListener.prototype = {
    constructor: EventListener,
    // add new event to listeners
    add: function addListener( type, listener ) {
      // if there is no triggers already defined for this events,
      // init an a-empty array
      if ( isUndefined( this._listeners[type] ) ) {
        this._listeners[type] = [];
      }
      // add trigger to the event
      this._listeners[type].push( listener );
    },
    // fire the event
    fire: function fireListeners( event ) {
      // if called only by event name (useful), build a correct object
      if ( isString( event ) ) {
        event = {type: event};
      }
      // set target if unavailable
      if ( !event.target ) {
        // FIXME: Fix correct target for event
        event.target = this;
      }
      // if there is no event given, throw an error
      if ( !event.type ) {
        throw new Error( "Event object missing 'type' property." );
      }
      // If the type has associated triggers, then launch them
      if ( isArray( this._listeners[event.type] ) ) {
        var listeners = this._listeners[event.type];
        for ( var l in listeners ) {
          listeners[l].call( this, event );
        }
      }
    }
  };

  // Overwrite Element.addEventListener method for transparency fallback
  //
  // Inpired by: http://stackoverflow.com/questions/7220515/extending-node-addeventlistener-method-with-the-same-name#7220628
  el.prototype.addEventListener = function ( type, listener, useCapture ) {
    var timeout,
        index,
        begin    = this.getAttribute('begin'),
        duration = this.getAttribute('dur'),
        that     = this;
    // ***
    // Attach a new event listeners stack if it doesn't exists
    if( isUndefined( this.listeners ) )
    {
      this.listeners = new EventListener();
    }
    // ***
    // check event name and support for endEvent
    if ( type == 'endEvent' && !isEventSupported( 'end' ) ) {
      // Add listener to the endEvent stack
      this.listeners.add( type, listener );
      // check if autofire is already enabled
      if ( !this.listeners.autoFire.end ) {
        // if not, add an autofired at the end of animation (=dur)
        this.addEventListener ( 'beginEvent' , function () {
          window.setTimeout( function () {
            that.listeners.fire( 'endEvent' );
          }, clocker( duration ) )
        });
        // and set the autofire flag at true to prevent multiple endfire
        // launch
        this.listeners.autoFire.end = true;
      }
    }
    // ***
    // check event name and suport for beginEvent
    if ( type == 'beginEvent' && !isEventSupported( 'begin' ) ) {
      // Add listener to the endEvent stack
      this.listeners.add( type, listener );
      // Check if begin is set to a duration
      if ( begin != 'indefinite' && begin.indexOf( '.end' ) == -1 ) {
        // true, so check the autofire begin event
        if ( !this.listeners.autoFire.begin ) {
          // not already activated, so activate it
          window.setTimeout( function () {
            that.listeners.fire( 'beginEvent' );
          }, clocker( begin ) );
          // set autofire to true to prevent multiple launch
          this.listeners.autoFire.begin = true;
        }
      }
      // if the lanch depends of the end of another animation
      else if ( (index = begin.indexOf( '.end' )) != -1 ) {
        var previousAnimate = doc.getElementById( begin.substr(0, index) );
        // Add an endEvent that launch the next animation
        previousAnimate.addEventListener( 'endEvent', function () {
          that.listeners.fire( 'beginEvent' );
        });
      }
      // if the launch depends of a manual action (=indefinite)
      else if ( begin == 'indefinite') {
        this.beginElement = function() {
          this.listeners.fire( 'beginEvent' );
          // ***
          // call the original method for fallback
          return this.__proto__.beginElement.call( this );
        }
      }
    }
    // ***
    // call the original method for fallback
    return addEventListenerLegacy.call( this, type, listener, useCapture );
  };

})( this, document, Element );
