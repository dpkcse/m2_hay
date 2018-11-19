module.exports = {
    fields:{
        ta_id : {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        activity_id  : {type: "uuid"},
        tagged_ids   : {type: "set", typeDef:"<text>", default: null},
        tagged_by : {type: "uuid"},
        tagged_at : {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        },
    },
    key:["ta_id"],
    indexes: ["activity_id","tagged_by", "tagged_ids"]
}