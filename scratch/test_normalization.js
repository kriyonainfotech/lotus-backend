/**
 * TEST SCRATCH SCRIPT: Normalization Logic Verification
 * This script simulates a Fabric.js object and verifies that the 
 * normalization to a 0-1 range works as expected for the Flutter app.
 */

const canvasWidth = 1080;
const canvasHeight = 1080;

const mockFabricObject = {
  left: 540,
  top: 540,
  width: 100,
  height: 100,
  scaleX: 2,
  scaleY: 2,
  type: 'i-text',
  text: 'Hello World',
  fontFamily: 'Inter',
  fontSize: 40,
  fill: '#ff0000',
  fontWeight: 'bold'
};

const normalize = (obj) => {
  const x = obj.left / canvasWidth;
  const y = obj.top / canvasHeight;
  const width = (obj.width * obj.scaleX) / canvasWidth;
  const height = (obj.height * obj.scaleY) / canvasHeight;

  return {
    text: obj.text,
    font: obj.fontFamily,
    size: obj.fontSize,
    color: obj.fill,
    x, y,
    bold: obj.fontWeight === 'bold',
    width, height
  };
};

const result = normalize(mockFabricObject);

console.log('--- MOCK FABRIC OBJECT ---');
console.log(JSON.stringify(mockFabricObject, null, 2));
console.log('\n--- NORMALIZED FLUTTER SCHEMA ---');
console.log(JSON.stringify(result, null, 2));

if (result.x === 0.5 && result.y === 0.5) {
  console.log('\n✅ SUCCESS: Coordinates normalized to 0.5 for center (540/1080)');
} else {
  console.log('\n❌ FAILED: Normalization coordinate mismatch');
}
