const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  staticImage: true,
  
  
})

module.exports = withNextra({
  i18n: [
    { locale: 'en', name: 'English' },
    { locale: 'de', name: 'Deutsch' },
  ]
})