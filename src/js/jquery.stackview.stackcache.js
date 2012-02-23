window.stackCache = (function(window, undefined){
  
  var cache = {},
    
    // "Borrowed" from Modernizr
    use_localStorage = window.JSON && (function(){
      try {
        return ( 'localStorage' in window ) && window.localStorage !== null;
      } catch(e) {
        return false;
      }
    })();
  
  // Expose these methods.
  return {
    set: set,
    get: get,
    remove: remove
  };
  
  // Set a key-value pair with optional TTL.
  function set( key, value, ttl ) {
    var expires = ttl && new Date( +new Date() + ttl * 1000 ),
      obj = {
        expires: +expires,
        value: value
      };
    
    if ( use_localStorage ) {
      try {
        localStorage[ key ] = JSON.stringify( obj );
      } catch(e) {
        return e;
      }
    } else {
      cache[ key ] = obj;
    }
  };
  
  // Get a value if it exists and hasn't expired.
  function get( key ) {
    var obj,
      val;
    
    if ( use_localStorage ) {
      obj = localStorage[ key ];
      if ( obj ) {
        obj = JSON.parse( obj );
      }
    } else {
      obj = cache[ key ];
    }
    
    if ( obj ) {
      if ( obj.expires && obj.expires < +new Date() ) {
        remove( key );
      } else {
        val = obj.value;
      }
    }
    
    return val;
  };
  
  // Remove a key-value pair.
  function remove( key ) {
    if ( use_localStorage ) {
      localStorage.removeItem( key );
    } else {
      delete cache[ key ];
    }
  };
  
})(window);