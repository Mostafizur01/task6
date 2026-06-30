import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.get('/history/:name', async (req, res) => {
    try {
        const userName = req.params.name;
        const user = await User.findOne({ name: userName });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            gamePlay: user.gamePlay,
            win: user.winNumber,
            lose: user.loseNumber,
        });
    } catch (error) {
        console.error('history route problem', error);
        res.status(500).json({ message: 'server error', error: error.message });
    }
});

export default router;