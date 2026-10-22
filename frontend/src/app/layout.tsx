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
      <body className="antialiased font-sans selection:bg-emerald-500 selection:text-white">
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-6 px-4 text-center text-xs">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <span className="font-semibold text-slate-200">Enterprise AI Nutrition Planner</span> &copy; 2025. FoodTech Sector Automation.
                </div>
                <div className="text-slate-500">
                  Autonomous Multi-Agent Nutrition Platform
                </div>
              </div>
            </footer>

          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
