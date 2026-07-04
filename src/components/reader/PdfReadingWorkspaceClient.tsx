"use client";

import dynamic from "next/dynamic";

export const PdfReadingWorkspaceClient = dynamic(
  () => import("./PdfReadingWorkspace").then((mod) => mod.PdfReadingWorkspace),
  { ssr: false }
);
