import Timing from "../models/Timing.js";

//geting all active timings (by season)
export const getTimings = async (req, res) => {
    try {
        const season = req.query.season || "winter";

        const timings = await Timing.find({
            season,
            isActive: true
        }).sort({ order: 1 });

        res.status(200).json(timings)
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch timings" });
    }
};