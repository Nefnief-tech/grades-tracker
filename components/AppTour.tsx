"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, X, Check } from "lucide-react";
import Image from "next/image";

interface TourStep {
  title: string;
  description: string;
  image: string;
}

export function AppTour() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  const tourSteps: TourStep[] = [
    {
      title: "Welcome to Grades Tracker",
      description:
        "Track your academic performance with our powerful dashboard. Get an overview of all your subjects and grades at a glance.",
      image: "/images/tour/dashboard.svg",
    },
    {
      title: "Add Your Subjects",
      description:
        "Start by adding your subjects. Each subject will track its own grades and calculate averages automatically.",
      image: "/images/tour/add-subject.svg",
    },
    {
      title: "Record Your Grades",
      description:
        "Add grades to each subject. You can specify grade type, date, and weight for accurate calculations.",
      image: "/images/tour/add-grade.svg",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Visualize your progress with charts and analytics. See trends in your performance over time.",
      image: "/images/tour/analytics.svg",
    },
    {
      title: "Test Management",
      description:
        "Keep track of upcoming tests, exams, and assignments. Never miss an important deadline.",
      image: "/images/tour/tests.svg",
    },
    {
      title: "Study Session Tracker",
      description:
        "Record your study sessions and use the Pomodoro timer to improve your focus and productivity.",
      image: "/images/tour/study-tracker.svg",
    },
    {
      title: "Achievements",
      description:
        "Earn achievements as you improve your grades and maintain study streaks.",
      image: "/images/tour/achievements.svg",
    },
    {
      title: "You're All Set!",
      description:
        "You're ready to start tracking your academic journey. Good luck with your studies!",
      image: "/images/tour/ready.svg",
    },
  ];

  useEffect(() => {
    if (user) {
      // Check if the tour has been completed before
      const tourDone = localStorage.getItem("appTourCompleted");
      if (!tourDone && !tourCompleted) {
        // Delay tour start to ensure page is fully loaded
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, tourCompleted]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem("appTourCompleted", "true");
    setTourCompleted(true);
    setIsOpen(false);
  };

  const dismissTour = () => {
    localStorage.setItem("appTourCompleted", "true");
    setTourCompleted(true);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tourSteps[currentStep].title}</DialogTitle>
          <DialogDescription>
            {tourSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="relative w-full h-48 md:h-64 bg-muted rounded-md overflow-hidden">
            <Image
              src={tourSteps[currentStep].image}
              alt={tourSteps[currentStep].title}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        </div>

        <div className="flex justify-center gap-1 mb-4">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentStep ? "w-4 bg-primary" : "w-2 bg-muted"
              }`}
            ></div>
          ))}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={dismissTour}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Skip Tour
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              size="sm"
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <Check className="h-4 w-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
