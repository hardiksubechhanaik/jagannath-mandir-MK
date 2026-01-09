import HomeContent from "../models/HomeContent.js";

export const getHomeContent = async (req, res) => {
    try{
        const content = await HomeContent.findOne();

        if(!content) {
            return res.status(404).json({message: "Home content not found"});
        }

        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({message: "Failed to load home content"});
    }
};