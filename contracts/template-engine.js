// utils/template-engine.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { hostUrl } from './constants.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TemplateEngine {
  static cache = new Map();

  static async render(templateName, data = {}) {
    data['logoUrl'] = hostUrl + '/sync.svg';
    // Check cache first
    if (this.cache.has(templateName)) {
      return this.interpolate(this.cache.get(templateName), data);
    }

    // Load template file
    const templatePath = path.join(__dirname, `../templates/emails/${templateName}.html`);
    
    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      // Cache the template
      this.cache.set(templateName, template);
      return this.interpolate(template, data);
    } catch (error) {
      throw new Error(`Template not found: ${templateName}`);
    }
  }

  static interpolate(template, data) {
    return template.replace(/\${([^}]+)}/g, (_, key) => {
      // Handle nested properties with dot notation (e.g., user.name)
      return key.split('.').reduce((obj, prop) => obj?.[prop], data) || '';
    });
  }
}