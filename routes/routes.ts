import { Router } from 'express';
import { carController } from '../controllers/carController';

const router = Router();

// Recommendation endpoint
router.post('/recommend', (req, res) => carController.recommendCars(req, res));

// Utility/Debug cars endpoint
router.get('/cars', (req, res) => carController.getAllCars(req, res));

// System Health/Debug endpoint
router.get('/health', (req, res) => carController.getHealth(req, res));

// Concierge: Bank Rates API
router.get('/bank-rates', (req, res) => carController.getBankRates(req, res));

// Concierge: Negotiation Kit API
router.get('/negotiation-kit', (req, res) => carController.getNegotiationKit(req, res));

export default router;
