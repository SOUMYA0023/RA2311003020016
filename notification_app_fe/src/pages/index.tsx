/**
 * src/pages/index.tsx
 * Root route — redirects to /notifications
 */
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Box, CircularProgress } from "@mui/material";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/notifications");
  }, [router]);

  return (
    <>
      <Head>
        <title>Campus Notification System</title>
      </Head>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    </>
  );
}
