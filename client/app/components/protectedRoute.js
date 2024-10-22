import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    console.log("loading:", loading, "user:", user);
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

export default ProtectedRoute;
