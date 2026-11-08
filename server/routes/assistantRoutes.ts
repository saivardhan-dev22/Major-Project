import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { RAGService } from '../services/ragService.js';
import { dataStore } from '../db/dataStore.js';

const router = Router();

// Ask RAG Document Assistant
router.post('/query', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Question parameter is required' });
      return;
    }

    const answerResult = await RAGService.answerQuestion(userId, question.trim());

    await dataStore.auditLogs.log({
      userId,
      action: 'RAG_ASSISTANT_QUERY',
      resourceType: 'AI_ASSISTANT',
      details: { question: question.slice(0, 100), grounded: answerResult.grounded },
    });

    res.json({
      success: true,
      data: answerResult,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Assistant error: ' + err.message });
  }
});

// Semantic Document Search
router.get('/search', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, message: 'Search query required' });
      return;
    }

    const results = await RAGService.semanticSearch(
      userId, 
      q, 
      limit ? parseInt(limit as string, 10) : 5
    );

    res.json({ success: true, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
