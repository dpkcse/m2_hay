module.exports = {
    fields:{
        pin_id : {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        activity_id: {type: "uuid"},
        pinned_by : {type: "uuid"},
        pinned_at : {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        },
    },
    key:["pin_id", "pinned_at"],
    indexes: ["activity_id", "pinned_by"],
    clustering_order: {"pinned_at": "desc"}
}
