import mongoose from 'mongoose';

const technologySchema = new mongoose.Schema({
    name: {type: String, required: true},
    image: {type: String},
});

const imageSchema = new mongoose.Schema({
    id: {type: String, required: true},
    image: {type: String, required: true},
});

const projectSchema = new mongoose.Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    descriptions: [{type: String}],
    responsibilities: [{type: String}],
    technologies: [technologySchema],
    images: [imageSchema],
    videoUrl: {type: String},
    link: {type: String},
});

export default mongoose.model('Project', projectSchema);