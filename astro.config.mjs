import { defineConfig } from 'astro/config';
export default defineConfig({output:'static',build:{format:'file'},trailingSlash:'never',devToolbar:{enabled:false}});
