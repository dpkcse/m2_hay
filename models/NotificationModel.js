module.exports = {
    fields: {
        user_id: { type: "uuid" },
        notification_id: {
            type: "timeuuid",
            default: { "$db_function": "now()" }
        },
        tagged_by: { type: "uuid" },
        type: {
            type: "text",
            default: null
        },
        type_id: { type: "uuid" },
        title: "text",
        body: "text",
        created_at: {
            type: "timestamp",
            default: { "$db_function": "toTimestamp(now())" }
        },
        created_by: { type: "uuid" },
        is_seen: { type: "tinyint", default: 0 }
    },
    key: ["notification_id", "user_id"],
    indexes: ["type", "type_id"],
    clustering_order: { "user_id": "desc" }
}