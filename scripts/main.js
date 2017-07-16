function ImageNameResolver(datetime) { //class definition with constructor
    this._pathToImages = 'Images/Weather/';
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

function Chat(chatWindow, chatContent, chatInput, chatStatus) {

    self = this;
    this._chatWindow = $(chatWindow);
    this._chatContent = $(chatContent);
    this._chatInput = $(chatInput);
    this._chatStatus = $(chatStatus);

    this._myColor = false;
    this._myName = false;
    this._connection = null;

}

Chat.prototype.InitiateConnection = (function () {

    var newWebSocket = false;
    return function () {
        // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        // if browser doesn't support WebSocket, just show some notification and exit
        if (!window.WebSocket) {
            self._chatContent.html($('<p>', {
                text: 'Sorry, but your browser doesn\'t '
                + 'support WebSockets.'
            }));
            this._chatInput.hide();
            $('span').hide();
            return;
        }
        if (!newWebSocket) {
            // open connection
            self._connection = new WebSocket('ws://services-2320.rostiapp.cz');
            newWebSocket = true;
        }
    }
})();

Chat.prototype.AddMessage = function (author, message, color, dt) {
    this._chatContent.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
        + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
        + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
        + ': ' + message + '</p>');
}

Chat.prototype.InitiateHandlers = function () {

    self._connection.onopen = function () {
        // first we want users to enter their names
        // this._chatInput.removeAttr('disabled');
        // this._chatStatus.text('Choose name:');
    };

    self._connection.onerror = function (error) {
        // just in there were some problems with conenction...
        self._chatContent.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your '
            + 'connection or the server is down.'
        }));
    };

    // most important part - incoming messages
    self._connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            self._chatStatus.text(self._myName + ': ').css('color', myColor);
            self._chatInput.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i = 0; i < json.data.length; i++) {
                self.AddMessage(json.data[i].author, json.data[i].text,
                    json.data[i].color, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { // it's a single message
            self._chatInput.removeAttr('disabled'); // let the user write another message
            self.AddMessage(json.data.author, json.data.text,
                json.data.color, new Date(json.data.time));
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    self._chatInput.keydown(function (e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            self._connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            self._chatInput.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (self._myName === false) {
                self._mmyName = msg;
            }
        }
    });
}

Chat.prototype.OptionalInterval = function () {
    setInterval(function () {
        if (self._connection.readyState !== 1) {
            self._chatStatus.text('Error');
            self._chatInput.attr('disabled', 'disabled').val('Unable to comminucate '
                + 'with the WebSocket server.');
        }
    }, 3000);
}

$().ready(function () {
    console.log('Loaded');
    var datetime = new Date();
    var resolver = new ImageNameResolver(datetime);
    $('body').css({ 'background': 'url(' + resolver.getFullPath() + ')  no-repeat', 'background-size': '100% auto', 'background-color': 'green' });

    var questionButton = $('#questionButton');
    questionButton.one('click',function () {
        $('#chatContent').empty();
        var chat = new Chat('#chatWindow', '#chatContent', '#chatInput', '#chatStatus');
        chat.InitiateConnection();
        chat.InitiateHandlers();
        chat.OptionalInterval();
    }).click(function(){console.log('click other than first')});
});