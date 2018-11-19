module.exports = {
    fields: {
        checklist_id: {
            type: "uuid",
            default: {
                "$db_function": "uuid()"
            }
        },
        checklist_activity_id: {
            type: "uuid"
        },
        checklist_by: {
            type: "uuid"
        },
        checklist_at: {
            type: "timestamp",
            default: {
                "$db_function": "toTimestamp(now())"
            }
        },
        checklist_status: {
            type: "tinyint",
            default: 0
        },
        checklist_title: {
            type: "text"
        },
    },
    key: ["checklist_activity_id", "checklist_id"],
    indexes: ["checklist_by"],
    clustering_order: {
        "checklist_id": "desc"
    }
}
