class Jeu {

    #appid;
    #name;
    #playtimeforever;
    #img_icon_url;


    constructor(appid, name, playtimeForever, img_icon_url) {
        this.appid = appid;
        this.name = name;
        this.playtimeForever = playtimeForever;
        this.img_icon_url = img_icon_url;
    }

    getAppid() {
        return this.#appid;
    }

    setAppid(appid) {
        this.#appid = appid;
    }

    getName() {
        return this.#name;
    }

    setName(name){
        this.#name = name;
    }

    getPlaytimeforever() {
        return this.#playtimeforever;
    }

    setPlaytimeforever(playtimeforever){
        this.#playtimeforever = playtimeforever;
    }

    getImgIconUrl() {
        return this.#img_icon_url;
    }

    setImgIconUrl(img_icon_url){
        this.#img_icon_url = img_icon_url;
    }
}