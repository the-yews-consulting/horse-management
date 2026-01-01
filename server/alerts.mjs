import { getAllAlerts, recordAlertTrigger } from './database.mjs';

const alertStates = new Map();

export function evaluateCondition(condition, currentValue, threshold) {
  const numericValue = parseFloat(currentValue);
  const numericThreshold = parseFloat(threshold);

  if (isNaN(numericValue) || isNaN(numericThreshold)) {
    if (condition === 'equals') return currentValue === threshold;
    if (condition === 'not_equals') return currentValue !== threshold;
    return false;
  }

  switch (condition) {
    case 'above':
      return numericValue > numericThreshold;
    case 'below':
      return numericValue < numericThreshold;
    case 'equals':
      return numericValue === numericThreshold;
    case 'not_equals':
      return numericValue !== numericThreshold;
    default:
      return false;
  }
}

export async function checkAlerts(entities) {
  try {
    const alerts = await getAllAlerts();
    const triggeredAlerts = [];

    for (const alert of alerts) {
      if (!alert.enabled) continue;

      const entity = entities[alert.entity_id];
      if (!entity) continue;

      const currentState = entity.state;
      const isTriggered = evaluateCondition(alert.condition, currentState, alert.threshold);

      const previousState = alertStates.get(alert.id);

      if (isTriggered && previousState !== true) {
        await recordAlertTrigger(alert.id, alert.entity_id, currentState);

        triggeredAlerts.push({
          id: alert.id,
          name: alert.name,
          entity_id: alert.entity_id,
          current_value: currentState,
          threshold: alert.threshold,
          condition: alert.condition,
          triggered_at: new Date().toISOString()
        });
      }

      alertStates.set(alert.id, isTriggered);
    }

    return triggeredAlerts;
  } catch (error) {
    console.error('Error checking alerts:', error);
    return [];
  }
}

export function clearAlertStates() {
  alertStates.clear();
}
