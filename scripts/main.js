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
    $('body').css({ 'background': 'url(' + resolver.getFullPath() + ')  no-repeat', 'background-size': '100% auto', 'background-color': 'green' });

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
});