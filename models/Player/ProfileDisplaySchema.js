const mongoose = require('mongoose');

const profileDisplaySchema = mongoose.Schema({
    //url: String,
    //linkTitle: String,
    //message: String,
    description: [mongoose.Schema.Types.Mixed],
    title: String,
    alts: {
        default: undefined,
        type: [String],
        index: true,
    }
}, { _id: false });

module.exports = profileDisplaySchema;

/*

description type information

{
    type: "text",
    content: string,
} | {
    type: "link",
    url: string,
    title?: string,
}

*/
