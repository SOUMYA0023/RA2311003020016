/**
 * src/pages/_app.tsx
 * Next.js custom App — wraps all pages with MUI ThemeProvider and ViewedProvider.
 */

import type { AppProps } from "next/app";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ViewedProvider } from "../state/ViewedContext";
import NavBar from "../components/NavBar";
import "../styles/globals.css";

// MUI dark-accented theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a237e" },
    secondary: { main: "#f50057" },
    background: { default: "#f5f6fa", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ViewedProvider>
        <NavBar />
        <Component {...pageProps} />
      </ViewedProvider>
    </ThemeProvider>
  );
}
