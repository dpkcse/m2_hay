module.exports = {
    fields:{
        tag_id : {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        tagged_by : {type: "uuid"},
        tag_title : {type: "text", default: null},
    },
    key:["tag_id"],
    indexes: ["tagged_by"]
}