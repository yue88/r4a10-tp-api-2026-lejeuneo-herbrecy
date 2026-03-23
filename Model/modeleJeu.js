export class Jeu {

    #appid;
    #name;
    #playtimeforever;


    constructor(appid, name, playtimeForever, img_icon_url) {
        this.#appid = appid;
        this.#name = name;
        this.#playtimeforever = playtimeForever;
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

}