module.exports = {
    fields:{
        msg_id: {
            type: "timeuuid",
            default: {"$db_function": "now()"}
        },
        created_at: {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        },
        activity_id: {type: "uuid"},
        sender: {type: "uuid", default: "NOT NULL"},
        sender_name: {type: "text", default: "NOT NULL"},
        sender_img: {type: "text", default: "NOT NULL"},
        msg_body: {type: "text", default: "NOT NULL"},
        call_duration: "text",
        has_flagged: { type: "set", typeDef: "<text>"},
        msg_type: { type: "text", default: "text" },
        msg_status: {type: "set", typeDef: "<text>"},
        attch_imgfile: { type: "set", typeDef: "<text>" },
        attch_audiofile: { type: "set", typeDef: "<text>" },
        attch_videofile: { type: "set", typeDef: "<text>" },
        attch_otherfile: { type: "set", typeDef: "<text>" },
        has_delete: { type: "set", typeDef: "<text>" },
        has_hide: { type: "set", typeDef: "<text>" },
        has_emoji: { type: "map", typeDef: "<text, int>", default: {"grinning": 0,
                                                                  "joy": 0,
                                                                  "open_mouth": 0,
                                                                  "disappointed_relieved": 0,
                                                                  "rage": 0,
                                                                  "thumbsup": 0,
                                                                  "thumbsdown": 0,
                                                                  "heart": 0}},
        has_tag_text: { type: "set", typeDef: "<text>" },
        has_delivered: {type: "int", default: 0},
        has_reply: {type: "int", default: 0},
        last_reply_name: {type: "text", default: ""},
        last_reply_time: {type: "timestamp"},
        url_favicon: {type: "text", default: null},
        url_base_title: {type: "text", default: null},
        url_title: {type: "text", default: null},
        url_body: {type: "text", default: null},
        url_image: {type: "text", default: null}
    },
    // key:["msg_id"],
    // indexes: ["conversation_id", "sender", "msg_status"]
    key:["activity_id", "msg_id"],
    clustering_order: {"msg_id": "desc"}
}
