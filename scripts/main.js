class ImageNameResolver{

    constructor(datetime){
        this._pathToImages = 'Images/Weather/';
        this._suffixes = new Array('.jpg','.png');
        this._datetime = datetime;
        this._hour = this._datetime.getHours();
        this._partOfDay = this.getPartOfDay(this._hour)
    }
    getPartOfDay(){
        switch(true){
            case this._hour >= 5 && this._hour < 7: //sunrise
            {
                return 'sunrise';               
            }
            case this._hour >= 18 && this._hour <= 20:
            {
                return 'sunset';
            }
            case (this._hour > 20 && this._hour < 24 ) || (this._hour >= 0 && this._hour < 5 ):
            {
                return 'night';
            }
            default:
            {
                return 'day';
            }
        }
    }
    getFullPath(){
        return this._pathToImages + this._partOfDay + this._suffixes[0];
    }
}
$().ready(function(){

    console.log('Loaded');
    var datetime = new Date();
    var resolver = new ImageNameResolver(datetime);
    $('body').css({ 'background':'url(' + resolver.getFullPath() + ')  no-repeat', 'background-size':'100% auto', 'background-color':'green' });
});