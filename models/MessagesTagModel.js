module.exports = {
    fields:{
        id: {
            type: "timeuuid",
            default: {"$db_function": "timeuuid()"}
        },
        tag_title:  {type: "set", typeDef:"<text>", default: null},
        tagged_by: {type: "uuid"},
        conversation_id: {type: "uuid"},
        message_id: {type: "uuid"}
    },
    key:["id"],
    indexes: ["conversation_id", "message_id", "tagged_by"]
}