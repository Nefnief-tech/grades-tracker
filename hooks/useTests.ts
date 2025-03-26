import { useState, useEffect } from "react";
import { Test } from "@/types/grades";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  getTestsByUserId,
  saveTest,
  updateTest,
  deleteTest,
  markTestCompleted,
} from "@/utils/testUtils";

export const useTests = (subjectId?: string) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTests = async () => {
    if (!user?.id) {
      setTests([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let fetchedTests: Test[];
      if (subjectId) {
        // Get tests for a specific subject
        fetchedTests = await getTestsByUserId(user.id).then((tests) =>
          tests.filter((test) => test.subjectId === subjectId)
        );
      } else {
        // Get all tests for the user
        fetchedTests = await getTestsByUserId(user.id);
      }

      setTests(fetchedTests);
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch tests"));
      toast({
        title: "Failed to load tests",
        description:
          "There was an error loading your tests. Some data may be encrypted and inaccessible.",
        variant: "destructive",
      });
      // Set tests to empty array in case of error
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [user, subjectId]);

  const addTest = async (test: Omit<Test, "id">) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add a test",
        variant: "destructive",
      });
      return null;
    }

    try {
      const newTest = await saveTest(test, user.id);
      setTests((prevTests) => [...prevTests, newTest]);
      toast({
        title: "Test Added",
        description: "Your test has been successfully added",
      });
      return newTest;
    } catch (err) {
      console.error("Error adding test:", err);
      toast({
        title: "Failed to add test",
        description: "There was an error adding your test",
        variant: "destructive",
      });
      return null;
    }
  };

  const editTest = async (id: string, test: Partial<Omit<Test, "id">>) => {
    if (!user?.id) return null;

    try {
      const updatedTest = await updateTest(id, test, user.id);
      setTests((prevTests) =>
        prevTests.map((t) => (t.id === id ? { ...t, ...updatedTest } : t))
      );
      toast({
        title: "Test Updated",
        description: "Your test has been successfully updated",
      });
      return updatedTest;
    } catch (err) {
      console.error("Error updating test:", err);
      toast({
        title: "Failed to update test",
        description: "There was an error updating your test",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeTest = async (id: string) => {
    try {
      await deleteTest(id);
      setTests((prevTests) => prevTests.filter((t) => t.id !== id));
      toast({
        title: "Test Deleted",
        description: "Your test has been successfully deleted",
      });
      return true;
    } catch (err) {
      console.error("Error deleting test:", err);
      toast({
        title: "Failed to delete test",
        description: "There was an error deleting your test",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleTestCompleted = async (id: string, completed: boolean) => {
    try {
      await markTestCompleted(id, completed);
      setTests((prevTests) =>
        prevTests.map((t) => (t.id === id ? { ...t, completed } : t))
      );
      toast({
        title: completed ? "Test Completed" : "Test Reopened",
        description: completed
          ? "The test has been marked as completed"
          : "The test has been reopened",
      });
      return true;
    } catch (err) {
      console.error("Error toggling test completion:", err);
      toast({
        title: "Failed to update test",
        description: "There was an error updating the test status",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    tests,
    isLoading,
    error,
    addTest,
    editTest,
    removeTest,
    toggleTestCompleted,
    refetch: fetchTests,
  };
};
