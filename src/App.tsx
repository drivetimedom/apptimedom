import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { seedData } from "@/lib/seedData";

// Layout
import MainLayout from "@/components/layout/MainLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import MyCoursesPage from "@/pages/MyCoursesPage";
import CoursePage from "@/pages/CoursePage";
import LessonPage from "@/pages/LessonPage";
import SwipeFilePage from "@/pages/SwipeFilePage";
import AdminPage from "@/pages/AdminPage";
import HoffCirclePage from "@/pages/HoffCirclePage";
import FinancialSystemPage from "@/pages/FinancialSystemPage";
import HomeBuilderPage from "@/pages/HomeBuilderPage";
import NotFound from "@/pages/NotFound";

// Initialize seed data
seedData();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/course/:courseId" element={<CoursePage />} />
              <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/swipe-file" element={<SwipeFilePage />} />
              <Route path="/hoff-circle" element={<HoffCirclePage />} />
              <Route path="/financial-system" element={<FinancialSystemPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/home-builder" element={<HomeBuilderPage />} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
