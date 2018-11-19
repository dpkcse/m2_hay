module.exports = {
	fields:{
        tag_id: {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        tagged_by: {type: "uuid"},
        title: "text",
        type: {
            type: "text",
            default: null
        },
        created_at: {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        }
    },
    key:["tag_id"],
    indexes: ["tagged_by"]
}