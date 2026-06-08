import express from 'express';

const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
    res.send('404: Seite nicht gefunden');
})


export default router;