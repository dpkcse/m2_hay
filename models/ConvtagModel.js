module.exports = {
	fields:{
        id: {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        tag_id: {type: "uuid"},
        conversation_id: {type: "uuid"},
    },
    key:["id"],
    indexes: ["conversation_id"]
}