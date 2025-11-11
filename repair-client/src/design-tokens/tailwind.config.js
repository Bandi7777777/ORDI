// فقط به عنوان helper برای extend
module.exports = {
  theme: {
    extend: {
      colors: {
        'fg-1': 'var(--fg-1)',
        'fg-2': 'var(--fg-2)',
        border: 'var(--color-border)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)'
      },
      borderRadius: {
        md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)', full: 'var(--radius-full)'
      }
    }
  }
};
