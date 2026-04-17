// utils/template-engine.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TemplateEngine {
  static cache = new Map();

  static async render(templateName, data = {}) {
    if (!templateName) {
      throw new Error("Template name is required");
    }

    const templatePath = path.join(
      __dirname,
      `../templates/${templateName}.html`
    );

    // Inject global values
    const context = {
      ...data,
      LOGO_URL: `${process.env.CLIENT_URL}/logo.png`,
      PLATFORM_NAME: data.PLATFORM_NAME || "Rowmart",
    };

    // Load from cache
    if (this.cache.has(templateName)) {
      return this.interpolate(this.cache.get(templateName), context);
    }

    try {
      const template = await fs.readFile(templatePath, "utf-8");
      this.cache.set(templateName, template);
      return this.interpolate(template, context);
    } catch {
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  static interpolate(template, data) {
    return template.replace(/{{\s*([^}\s]+)\s*}}/g, (_, key) => {
      return key
        .split(".")
        .reduce((obj, prop) => obj?.[prop], data) ?? "";
    });
  }
}
