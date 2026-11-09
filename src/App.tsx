import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { WhatsAppChatModal } from './components/common/WhatsAppChatModal';
import { WebAssistantFloatingButton } from './components/common/WebAssistantFloatingButton';
import { WebAssistantChatModal } from './components/common/WebAssistantChatModal';
import { RoleAccessModal } from './components/common/RoleAccessModal';
import { RoleSwitcherHub } from './components/common/RoleSwitcherHub';
import { ClientExplore } from './components/client/ClientExplore';
import { MapExplorerView } from './components/client/MapExplorerView';
import { BusinessDetailModal } from './components/client/BusinessDetailModal';
import { CartCheckoutDrawer } from './components/client/CartCheckoutDrawer';
import { MyOrdersView } from './components/client/MyOrdersView';
import { MyAccountView } from './components/client/MyAccountView';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { DriverDashboard } from './components/driver/DriverDashboard';
import { ClientAuthModal } from './components/common/ClientAuthModal';
import { CorporateAuthModal } from './components/common/CorporateAuthModal';
import { UserProfileModal } from './components/common/UserProfileModal';
import { RegisterBusinessModal } from './components/common/RegisterBusinessModal';
import { RegisterDriverModal } from './components/common/RegisterDriverModal';
import { CorporatePortalHome } from './components/corporate/CorporatePortalHome';
import { Business } from './types';

const PulsoAppContent: React.FC = () => {
  const {
    currentRole,
    currentUser,
    currentRoute,
    activeClientTab,
    selectedBusinessForDetail,
    setSelectedBusinessForDetail,
    setActiveClientTab
  } = useApp();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const handleSelectBusiness = (biz: Business) => {
    setSelectedBusinessForDetail(biz);
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveClientTab('orders');
  };

  // If visiting the corporate root route and not logged in as Admin or Seller, show Corporate Portal Home
  if (currentRoute === 'corporate' && (!currentUser || currentUser.role === 'client')) {
    return (
      <div className="min-h-screen w-full bg-white font-sans selection:bg-[#D4021D] selection:text-white overflow-y-auto overflow-x-hidden">
        <CorporatePortalHome />
        <RegisterBusinessModal />
        <CorporateAuthModal />
        <ClientAuthModal />
        <UserProfileModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-white text-slate-900 flex flex-col font-sans selection:bg-[#D4021D] selection:text-white">
      
      {/* Top PWA Install Banner */}
      <PWAInstallBanner />

      {/* Top Application Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Responsive Fullscreen Body Layout */}
      <div className="flex-1 flex w-full max-w-full overflow-x-hidden bg-white">
        {/* Left Sidebar on Desktop / Bottom Navigation on Mobile */}
        <Navigation
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Center Main View Area */}
        <main className="flex-1 w-full min-w-0 max-w-full overflow-y-auto overflow-x-hidden pt-2 bg-white">
          {/* CLIENT ROLE VIEWS */}
          {currentRole === 'client' && (
            <>
              {activeClientTab === 'explore' && (
                <ClientExplore
                  onSelectBusiness={handleSelectBusiness}
                  onOpenMapModule={() => setActiveClientTab('map')}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              )}
              {activeClientTab === 'map' && (
                <MapExplorerView
                  onSelectBusiness={handleSelectBusiness}
                  onBackToExplore={() => setActiveClientTab('explore')}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              )}
              {activeClientTab === 'orders' && <MyOrdersView />}
              {activeClientTab === 'account' && (
                <MyAccountView onOpenRoleModal={() => setIsRoleModalOpen(true)} />
              )}
              {activeClientTab === 'roles_hub' && <RoleSwitcherHub />}
            </>
          )}

          {/* SELLER ROLE VIEWS */}
          {currentRole === 'seller' && (
            <ErrorBoundary fallbackTitle="Panel de Negocio Protegido">
              <SellerDashboard />
            </ErrorBoundary>
          )}

          {/* SUPERADMIN ROLE VIEWS */}
          {currentRole === 'admin' && (
            <ErrorBoundary fallbackTitle="Panel de Superadministrador Protegido">
              <SuperAdminDashboard />
            </ErrorBoundary>
          )}

          {/* MOTORCYCLE COURIER / DRIVER ROLE VIEWS */}
          {currentRole === 'driver' && (
            <ErrorBoundary fallbackTitle="Panel de Mensajería en Moto">
              <DriverDashboard />
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* WhatsApp Floating Action Button & Simulator Modal */}
      <WhatsAppFloatingButton />
      <WhatsAppChatModal />

      {/* Web Assistant Floating Action Button & Interactive Chat Modal */}
      <WebAssistantFloatingButton />
      <WebAssistantChatModal />

      {/* Role Switcher Modal (2 columns on mobile) */}
      <RoleAccessModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Role-based Auth Modals & Registration Modals */}
      <ClientAuthModal />
      <CorporateAuthModal />
      <UserProfileModal />
      <RegisterBusinessModal />
      <RegisterDriverModal />

      {/* Business Catalog / Detail Modal */}
      {selectedBusinessForDetail && (
        <BusinessDetailModal
          business={selectedBusinessForDetail}
          onClose={() => setSelectedBusinessForDetail(null)}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Cart & Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Sistema ConForce Protegido">
      <AppProvider>
        <PulsoAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
