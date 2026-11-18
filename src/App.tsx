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
import { LocationPickerModal } from './components/common/LocationPickerModal';
import { CorporatePortalHome } from './components/corporate/CorporatePortalHome';
import { Business } from './types';

const PulsoAppContent: React.FC = () => {
  const {
    currentRole,
    currentUser,
    activeClientTab,
    selectedBusinessForDetail,
    setSelectedBusinessForDetail,
    setActiveClientTab,
    pwaInstallHint,
    clearPwaInstallHint
  } = useApp();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const canAccessSeller = isAdmin || currentUser?.role === 'seller';
  const canAccessDriver = isAdmin || currentUser?.role === 'driver';

  const handleSelectBusiness = (biz: Business) => {
    setSelectedBusinessForDetail(biz);
  };

  const handleOrderSuccess = () => {
    setActiveClientTab('orders');
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-white text-slate-900 flex flex-col font-sans selection:bg-[#D4021D] selection:text-white">
      
      {/* Top PWA Install Banner */}
      <PWAInstallBanner />

      {/* Non-blocking PWA manual instructions toast */}
      {pwaInstallHint && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-zinc-950 text-white border border-zinc-800 rounded-2xl p-3.5 shadow-2xl flex items-start justify-between gap-3 text-xs">
          <p className="leading-relaxed">{pwaInstallHint}</p>
          <button
            type="button"
            onClick={clearPwaInstallHint}
            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold shrink-0 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

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
              {activeClientTab === 'roles_hub' && isAdmin && <RoleSwitcherHub />}
            </>
          )}

          {/* SELLER ROLE VIEWS (Strict RBAC: seller or admin only) */}
          {currentRole === 'seller' && canAccessSeller && (
            <ErrorBoundary fallbackTitle="Panel de Negocio Protegido">
              <SellerDashboard />
            </ErrorBoundary>
          )}

          {/* SUPERADMIN ROLE VIEWS (Strict RBAC: admin only) */}
          {currentRole === 'admin' && isAdmin && (
            <ErrorBoundary fallbackTitle="Panel de Superadministrador Protegido">
              <SuperAdminDashboard />
            </ErrorBoundary>
          )}

          {/* MOTORCYCLE COURIER / DRIVER ROLE VIEWS (Strict RBAC: driver or admin only) */}
          {currentRole === 'driver' && canAccessDriver && (
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

      {/* Role Switcher Modal (Admin only) */}
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
      <LocationPickerModal />

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
