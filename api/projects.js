// api/projects.js
import {connectToDb} from '../config/db.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const db = await connectToDb();
            const projectsCollection = db.collection('projects');
            const projects = await projectsCollection.find().toArray();
            res.status(200).json(projects);
        } catch (error) {
            console.error('Error fetching projects', error);
            res.status(500).json({message: 'Server error'});
        }
    } else {
        res.status(405).json({message: 'Method Not Allowed'});
    }
}