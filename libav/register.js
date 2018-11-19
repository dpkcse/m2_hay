module.exports = class Register {
    constructor() {
        this.usersByName = {};
        this.userSessionIds = {};
    }
    //@param {object} user 
    register(user) {
        this.usersByName[user.name] = user;
        this.userSessionIds[user.id] = user;
    }
    // @param {string} name
    unregister(name) {
        let user = this.getByName(name);
        if (user) {
            delete this.usersByName[user.name];
            delete this.userSessionIds[user.id];
        }
    }
    getById(id) {
        return this.userSessionIds[id];
    }
    // @param {*} name
    removeByName(name) {
        let user = this.getByName(name);
        if (user) {
            delete this.usersByName[user.name];
            delete this.userSessionIds[user.id];
        }
    }

    //@param {string} name 
    getByName(name) {
        return this.usersByName[name];
    }

    
}
