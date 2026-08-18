const content = '<h2 id="core-difference">The Core Difference</h2>';
const htmlRegex = /<h([2-4])([^>]*)>(.*?)<\/h\1>/gi;
let match;
while ((match = htmlRegex.exec(content)) !== null) {
  console.log('level:', parseInt(match[1], 10));
}
