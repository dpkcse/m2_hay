module.exports = {
    fields:{
        activity_id: {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        activity_type: {type: "text", default: null},
        activity_title: {type: "text", default: null},
        activity_description: {type: "text", default: null},
        activity_created_by: {type: "uuid"},
        activity_created_at: {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        },
        activity_is_active: {type: "tinyint", default: 0},
        activity_start_time:  {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        },
        activity_end_time:  {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        },
        activity_from: {type: "text", default: null},
        activity_to: {type: "text", default: null},
        activity_has_reminder: {type: "text", default: null},
        activity_has_flagged: {type: "set", typeDef:"<text>", default: null},
        activity_workspace: {type: "text", default: null},
        activity_participants: {type: "set", typeDef:"<text>", default: null},
        activity_accepted: {type: "set", typeDef:"<text>", default: null},
        activity_pinned: {type: "set", typeDef:"<text>", default: null},
        activity_parent: {type: "uuid", default: null},
    },
    key:["activity_id", "activity_created_at"],
    indexes: ["activity_end_time", "activity_created_by", "activity_is_active", "activity_participants","activity_has_flagged"],
    clustering_order: {"activity_created_at": "desc"}
}
