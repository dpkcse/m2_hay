module.exports = {
    fields:{
        rep_id: {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        msg_id: {type: "timeuuid"},
        conversation_id: {type: "uuid"},
    },
    key:["msg_id", "conversation_id"],
    indexes: ["rep_id"]
}
