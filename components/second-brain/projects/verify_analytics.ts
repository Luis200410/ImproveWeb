
import { calculateVelocity, calculateStandardDeviation, calculateSPI, predictCompletion, calculateBiasFactor } from './project-analytics';

// Verification Script
// Simulating Project Data
const mockProject = {
    id: 'p1',
    data: {
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Started 10 days ago
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Due in 10 days
    }
};

// Simulating Task Data (Accelerating completion)
const mockTasks = [
    { id: '1', updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), data: { Status: 'Done' } },
    { id: '2', updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), data: { Status: 'Done' } },
    { id: '3', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), data: { Status: 'Done' } },
    { id: '4', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), data: { Status: 'Done' } },
    { id: '5', updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), data: { Status: 'Done' } },
    { id: '6', updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), data: { Status: 'Done' } },
    { id: '7', updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), data: { Status: 'Done' } }, // Big burst recently
    { id: '8', data: { Status: 'Backlog' } },
    { id: '9', data: { Status: 'Backlog' } },
    { id: '10', data: { Status: 'Backlog' } },
];

console.log("--- Analytics Verification ---");

// 1. Velocity
const v = calculateVelocity(mockTasks as any);
console.log(`Velocity (Avg): ${v} tasks/day`);

// 2. Volatility
const s = calculateStandardDeviation(mockTasks as any, v);
console.log(`Volatility (Sigma): ${s}`);

// 3. SPI
const spi = calculateSPI(mockProject as any, mockTasks as any);
console.log(`SPI: ${spi} (Target > 1.0)`);
// Expected: 10 days elapsed (50%), 7/10 tasks done (70%). SPI should be 1.4.

// 4. Forecast (Linear Regression)
const forecast = predictCompletion(mockProject as any, mockTasks as any);
console.log(`Forecast Date: ${forecast.date}`);
console.log(`Slope (Tasks/Day): ${forecast.slope}`);

// 5. Bias (Mocking timestamps)
const bias = calculateBiasFactor(mockTasks as any);
console.log(`Bias Factor: ${bias}`);

console.log("------------------------------");
