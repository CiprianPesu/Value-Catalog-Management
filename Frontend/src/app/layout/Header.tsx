'use client';

import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BookA, FileUp, LogIn, LogOut, Moon, Sun, UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import useKeycloak, { useIsUserInRole } from '@/features/Auth/hooks/useKeycloak';
import { useTheme } from '@/lib/theme-provider';
import { config } from '@/config';
import { Separator } from '@/components/ui/separator';
import PressButtonCustom from '@/shared/components/pressButtons/PressButtons';

const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <Button variant='outline' size='icon' aria-label='Toggle theme' onClick={toggleTheme}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
};

export const Header: FC = () => {
  const { keycloak, authenticated } = useKeycloak();
  const location = useLocation();
  const navigate = useNavigate();

  /* Robust tab detection (handles nested routes) */
  const currentTab = location.pathname.startsWith('/traduceri')
    ? '/traduceri'
    : location.pathname.startsWith('/incarcare')
      ? '/incarcare'
      : '';

  const handleAuthClick = () => {
    if (!keycloak) return;

    if (authenticated) {
      keycloak.logout();
    } else {
      keycloak.login();
    }
  };

  const username = keycloak?.tokenParsed?.name ?? keycloak?.tokenParsed?.preferred_username ?? 'User';
  const isAdmin = useIsUserInRole(config.ROLE_ADMINISTRATOR);
  return (
    <div className='h-full px-4 flex items-center justify-between'>
      {/* Navigation */}
      <div className='gap-4 flex items-center'>
        {isAdmin && (
          <PressButtonCustom
            onClick={() => navigate('/incarcare')}
            variant={currentTab === '/incarcare' ? 'blue' : 'orange'}
            className={`flex items-center gap-1`}
          >
            <FileUp size={16} />
            <Separator orientation='vertical' className='mx-1' />
            Încarcare MVC
          </PressButtonCustom>
        )}

        <PressButtonCustom
          onClick={() => navigate('/traduceri')}
          variant={currentTab === '/traduceri' ? 'blue' : 'orange'}
          className={`flex items-center gap-1`}
        >
          <BookA size={16} />
          <Separator orientation='vertical' className='mx-1' />
          Traduceri
        </PressButtonCustom>
      </div>

      <div className='flex items-center gap-2'>
        {authenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='flex items-center gap-2' aria-label='User menu'>
                <UserIcon size={16} />
                {username}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleAuthClick} className='flex items-center gap-2'>
                <LogOut size={14} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant='ghost' className='flex items-center gap-2' onClick={handleAuthClick} aria-label='Login'>
            <LogIn size={16} />
            Login
          </Button>
        )}

        <ThemeToggle />
      </div>
    </div>
  );
};
