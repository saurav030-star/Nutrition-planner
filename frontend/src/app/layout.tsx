import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Enterprise-Grade AI Nutrition Planner | FoodTech Automation",
  description: "Autonomous Multi-Agent Nutrition Planning & Validation System using LangGraph and FastAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
      <body className="antialiased font-sans selection:bg-emerald-500 selection:text-white bg-[#fbfcfe]">
        <QueryProvider>
          <div className="min-h-screen flex flex-col bg-[#fbfcfe]">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
