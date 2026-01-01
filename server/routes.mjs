import express from 'express';
import { getConfig, setConfig, deleteConfig } from './database.mjs';
import { getStates, getState, callService, verifyConnection } from './homeassistant.mjs';

const router = express.Router();

router.post('/config/token', async (req, res) => {
  try {
    const { token, url } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    await setConfig('ha_token', token);
    if (url) {
      await setConfig('ha_url', url);
    }

    const verification = await verifyConnection();

    if (verification.success) {
      res.json({ success: true, message: 'Token saved and verified' });
    } else {
      res.status(401).json({
        success: false,
        error: 'Token saved but connection failed: ' + verification.error
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/config/token', async (req, res) => {
  try {
    const token = await getConfig('ha_token');
    const url = await getConfig('ha_url');

    res.json({
      hasToken: !!token,
      url: url || 'http://localhost:8123'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/config/websocket', async (req, res) => {
  try {
    const token = await getConfig('ha_token');
    const url = await getConfig('ha_url') || 'http://localhost:8123';

    if (!token) {
      return res.status(401).json({ error: 'Token not configured' });
    }

    res.json({
      url,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/config/token', async (req, res) => {
  try {
    await deleteConfig('ha_token');
    await deleteConfig('ha_url');
    res.json({ success: true, message: 'Token deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const result = await verifyConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/states', async (req, res) => {
  try {
    const states = await getStates();
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/states/:entityId', async (req, res) => {
  try {
    const state = await getState(req.params.entityId);
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/services/:domain/:service', async (req, res) => {
  try {
    const { domain, service } = req.params;
    const result = await callService(domain, service, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
