import { Outlet } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <BottomNavBar />
    </div>
  );
}
