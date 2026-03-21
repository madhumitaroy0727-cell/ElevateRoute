import BottomNav from "@/components/BottomNav";
import { BookOpen } from "lucide-react";

const Resources = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Resources</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Courses, guides, and projects for your path.</p>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <BookOpen className="h-12 w-12 text-primary/30 mb-4" />
        <p className="font-semibold">Coming soon</p>
        <p className="text-sm text-muted-foreground mt-1">Your curated resource library will appear here.</p>
      </div>
      <BottomNav />
    </div>
  );
};

export default Resources;
