import { NavLink } from 'react-router-dom';

interface BottomNavProps {
  user: any;
}

const BottomNav = ({ user }: BottomNavProps) => {

  // SVG
  const IconMap = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7" /></svg>
  const IconDash = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  const IconUser = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>

  const NavItem = ({ to, label, icon: Icon }: { to: string, label: string, icon: any }) => (
    <NavLink
      to={to}
      className={({ isActive }: { isActive: boolean }) =>
        `flex-1 flex flex-col items-center justify-center py-2 transition-all duration-200 ${
          isActive ? 'text-black' : 'text-gray-500 hover:text-black'
        } no-underline`
      }
    >
      {({ isActive } : { isActive: boolean }) => (
        <>
          <div className={`p-1.5 rounded-full transition-transform duration-200 ${isActive ? '-translate-y-1 shadow-[0_6px_12px_rgba(0,0,0,0.12)] text-black' : ''}`}>
            <Icon />
          </div>
          <span className={`mb-2 font-medium text-[15px] ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav className="py-2 fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[70%] max-w-[520px] bg-white border border-black/10 rounded-full shadow-[0_10px_24px_rgba(0,0,0,0.08)] z-[2000] flex justify-around items-center h-16 px-3">
      <NavItem to="/map" label="Carte" icon={IconMap} />
      <NavItem to="/dashboard" label="Tableau" icon={IconDash} />
      <NavItem to="/profile" label="Connexion" icon={IconUser} />
    </nav>
  );
};

export default BottomNav;