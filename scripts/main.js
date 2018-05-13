function ImageNameResolver(datetime) { //class definition with constructor
    this._pathToImages = 'https://raw.githubusercontent.com/soucik/ChatkaKatka/dev/images/weather/';
    this._suffixes = new Array('.jpg', '.png');
    this._datetime = datetime;
    this._hour = this._datetime.getHours();
    this._partOfDay = this.getPartOfDay(this._hour);
}

ImageNameResolver.prototype.getPartOfDay = function () {
    switch (true) {
        case this._hour >= 5 && this._hour < 7: //sunrise <5,7)
            {
                return 'sunrise';
            }
        case this._hour >= 18 && this._hour <= 20: //sunset <18,20>
            {
                return 'sunset';
            }
        case (this._hour > 20 && this._hour <= 24) || (this._hour >= 0 && this._hour < 5): // (20,24> U <0,5)
            {
                return 'night';
            }
        default: // <7,18) U all others
            {
                return 'day';
            }
    }
}
ImageNameResolver.prototype.getFullPath = function () {
    return this._pathToImages + this._partOfDay + this._suffixes[0];
}

function Chat(server) {

    self = this;
    this._server = server;
    this._connection = null;
    this._name = null;
}

Chat.prototype.connect = function () {

    self._socket = io.connect(this._server);
}
Chat.prototype.handlers = function () {

    self._socket.on('updatechat', function (username, data) {
        $('#chatContent').append('<b>' + username + ':</b> ' + data + '<br>');
    });
}
Chat.prototype.sendMessage = function (message) {
    console.log('SEND MESSAGE');
    self._socket.emit('sendchat', message);
};

Chat.prototype.connectUser = function (username) {
    console.log('SET NAME');
    self._socket.emit('adduser', username, 'AF313C6D972BB5D01908CB9DA8EB1CB8A64FCCEFF96773BF0BC7275E21079B5D321A264E7B0DB0643C5C5D199FD19A1190EA984A78384FDE3B2BB31902A809B6');
    self._name = username;
};

$().ready(function () {
    count = 0;
    function looping() {
        $('.glyphicon-menu-down').animate({ top: "+=20px" }, 1000);
        $('.glyphicon-menu-down').animate({ top: "-=20px" }, 500);
        count = count + 1;
        if (count <= 3) {
            looping()
        }
    }
    $('[data-target="#peopleCount"]').waypoint(function () {
        looping();
    }, {
            offset: '100%'
        });


    $("form input").keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $('#datasend').click();
            return false;
        } else {
            return true;
        }
    });
    var datetime = new Date();
    var resolver = new ImageNameResolver(datetime);
    $('body').css({ 'background': 'url(' + resolver.getFullPath() + ')  no-repeat', 'background-size': '100% auto', 'background-color': '#738535' });

    var questionButton = $('#questionButton');
    questionButton.one('click', function () {
        chat = new Chat('ws://services-2320.rostiapp.cz');

    });
    $('#datasend').on('click', function () {

        var userInput = $('#chatInput').val();
        if (!chat._name) {
            chat.connect();
            chat.handlers();
            chat.connectUser(userInput);

            $('.control-label').text('Správa: ');
            $('#datasend').val('Poslať');
        }
        else {
            chat.sendMessage(userInput);
        }
        $('#chatInput').val('');
    });

var initPhotoSwipeFromDOM = function(gallerySelector) {

    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};

// execute above function
initPhotoSwipeFromDOM('.my-gallery');

});