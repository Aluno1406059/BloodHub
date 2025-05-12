
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-6xl font-bold text-bloodred">404</h1>
      <p className="mt-4 text-xl">Page not found</p>
      <p className="mt-2 text-gray-500 dark:text-gray-400 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button className="mt-8" asChild>
        <Link to="/">Return to home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
