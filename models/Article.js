const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Articleschema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        default: "Summary unavailable."
    },
    saved: {
        type: Boolean,
        default: false
    },
    buttonText: {
        type: String,
        default: "Save Article"
    },
    created: {
        type: Date,
        default: Date.now
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

const Article = mongoose.model("Article", Articleschema);
module.exports = Article;