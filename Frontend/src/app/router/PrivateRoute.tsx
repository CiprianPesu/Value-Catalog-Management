import { type ReactNode } from 'react';
import useKeycloak from '../../features/Auth/hooks/useKeycloak';
import UnauthenificatedPage from '@/shared/page/Error/UnauthenificatedPage';
import UnathorizedPage from '@/shared/page/Error/UnauthorizedPage';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRoles }) => {
  const { authenticated, keycloak } = useKeycloak();

  if (!authenticated) {
    return <UnauthenificatedPage />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = keycloak?.realmAccess?.roles ?? [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return <UnathorizedPage />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
