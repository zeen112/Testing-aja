
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-9xl font-bold text-primary animate-pulse">404</h1>
        <p className="text-xl mt-6 mb-8">The page you are looking for does not exist or has been moved.</p>
        <Button asChild size="lg">
          <Link to="/" className="group">
            <HomeIcon className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
