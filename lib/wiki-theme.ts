// Wiki-themed style configuration for the Grade Tracker app

export const wikiTheme = {
  colors: {
    background: "#f8f9fa",  // Wiki background color
    foreground: "#202122",  // Wiki text color
    card: "#ffffff",        // Wiki card/content background
    primary: "#3366cc",     // Wiki blue links/buttons
    primaryHover: "#2a4b8d", // Darker blue for hover states
    secondary: "#72777d",   // Wiki secondary text
    accent: "#eaecf0",      // Wiki light gray for sections
    border: "#c8ccd1",      // Wiki border color
    highlight: "#eaf3ff",   // Wiki light blue highlight
    error: "#d33",          // Wiki error/destructive red
    link: "#3366cc",        // Wiki link color
    linkVisited: "#6b4ba1", // Wiki visited link color
  },
  
  gradients: {
    blue: "linear-gradient(135deg, #3366cc 0%, #1a6aff 100%)",
    sidebar: "linear-gradient(to bottom, #f8f9fa 0%, #eaecf0 100%)",
    card: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)",
    header: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)"
  },
  
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
    md: "0 2px 4px rgba(0, 0, 0, 0.1)",
    lg: "0 4px 8px rgba(0, 0, 0, 0.1)"
  },
  
  typography: {
    fontSans: "'Helvetica Neue', Arial, sans-serif",
    fontSerif: "'Linux Libertine', 'Georgia', 'Times', serif",
    heading: {
      color: "#000000",
      fontWeight: "500",
      borderBottom: "1px solid #c8ccd1",
      paddingBottom: "0.25rem"
    }
  },
  
  // Wiki-style component variants
  components: {
    button: {
      primary: {
        background: "linear-gradient(135deg, #3366cc 0%, #1a6aff 100%)",
        color: "white",
        border: "none",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
      },
      secondary: {
        background: "#f8f9fa",
        color: "#202122",
        border: "1px solid #c8ccd1"
      }
    },
    card: {
      background: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)",
      border: "1px solid #c8ccd1",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
    },
    sidebar: {
      background: "linear-gradient(to bottom, #f8f9fa 0%, #eaecf0 100%)",
      borderRight: "1px solid #c8ccd1"
    },
    header: {
      background: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)",
      borderBottom: "1px solid #c8ccd1"
    }
  }
};