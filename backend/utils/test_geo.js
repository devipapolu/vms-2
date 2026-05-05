const { calculateDistance } = require('./geo');

// Test Case 1: Same coordinates
const d1 = calculateDistance(17.3850, 78.4867, 17.3850, 78.4867);
console.log('Test 1 (Same):', d1, 'meters (Expected: 0)');

// Test Case 2: ~111m away (change in 0.001 degrees latitude)
const d2 = calculateDistance(17.3850, 78.4867, 17.3860, 78.4867);
console.log('Test 2 (~111m away):', d2, 'meters');

// Test Case 3: Hyderabad to Secunderabad (~7.5km)
const d3 = calculateDistance(17.3850, 78.4867, 17.4399, 78.4983);
console.log('Test 3 (HYD to SEC):', d3, 'meters');
