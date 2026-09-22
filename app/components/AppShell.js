"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import ActivityView from "./ActivityView";
import AdminView from "./AdminView";
import AppNavigation from "./AppNavigation";
import AppSettingsDialog from "./AppSettingsDialog";
import BranchSheet from "./BranchSheet";
import EditProfileDialog from "./EditProfileDialog";
import EmptyTicket from "./EmptyTicket";
import FallbackDialog from "./FallbackDialog";
import HomeView from "./HomeView";
import JoinConfirmation from "./JoinConfirmation";
import LocationRecoveryDialog from "./LocationRecoveryDialog";
import LowDataAccessDialog from "./LowDataAccessDialog";
import NotificationsPanel from "./NotificationsPanel";
import ProfileView from "./ProfileView";
import QueueTicket from "./QueueTicket";
import SearchAreaDialog from "./SearchAreaDialog";
import StaffView from "./StaffView";
import TopBar from "./TopBar";

export default function AppShell() {
  const {
    view,
    sheet,
    setSheet,
    chosen,
    setChosen,
    ticket,
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    unreadCount,
    openNotifications,
    clearNotifications,
    soundEnabled,
    setSoundEnabled,
    queuePrefs,
    setQueuePrefs,
    logout,
    locationStatus,
    locationPermission,
    userLocation,
    locationHelpOpen,
    setLocationHelpOpen,
    locationRecoveryMessage,
    areaSearchOpen,
    setAreaSearchOpen,
    locationHistory,
    profile,
    profileEditorOpen,
    setProfileEditorOpen,
    appSettings,
    appSettingsOpen,
    setAppSettingsOpen,
    lowDataOpen,
    setLowDataOpen,
    appointment,
    completedVisits,
    totalSavedMinutes,
    demoMode,
    sidebarCollapsed,
    toggleSidebar,
    user,
    authLoading,
    stateLoading,
    operationalBranches,
    activeSearchArea,
    primeAudio,
    notify,
    selectSearchArea,
    useMyPositionForSearch,
    handleLocationControl,
    retryPreciseLocation,
    useDemoLocation,
    pauseLocationTracking,
    saveProfile,
    saveAppSettings,
    updatePreference,
    openVisit,
    openBranch,
    confirmQueue,
    advanceQueue,
    checkIn,
    completeQueue,
    cancelQueue,
    navigate,
    saveBranchSettings,
    staffTicketAction,
    resetDemo,
    adminCreateBranch,
    adminUpdateBranch,
    adminDeleteBranch,
    bookAppointment,
    chooseAlternative,
  } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || stateLoading || !user) {
    return <div className="app-loading"><span />Loading QueueLess…</div>;
  }

  const isStaffRole = user.role === "STAFF" || user.role === "ADMIN";

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${appSettings.largeText ? "large-text" : ""} ${appSettings.highContrast ? "high-contrast" : ""} ${appSettings.reducedMotion ? "reduced-motion" : ""} ${appSettings.lowDataMode ? "low-data-mode" : ""}`} onPointerDown={primeAudio} onClickCapture={primeAudio}>
      <AppNavigation view={view} onNavigate={navigate} hasTicket={Boolean(ticket)} profile={profile} collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} role={user.role} />
      <div className="app-stage">
        <TopBar
          onProfile={() => navigate("profile")}
          onNotifications={openNotifications}
          onRequestLocation={handleLocationControl}
          unreadCount={unreadCount}
          notificationsOpen={notificationsOpen}
          locationStatus={locationStatus}
          userLocation={userLocation}
          profile={profile}
        />
        {view === "home" && <HomeView branchList={operationalBranches} onChooseBranch={openBranch} ticket={ticket} appointment={appointment} onOpenTicket={() => navigate("ticket")} onRequestLocation={handleLocationControl} onPauseLocation={pauseLocationTracking} onOpenAreaSearch={() => setAreaSearchOpen(true)} onOpenLowData={() => setLowDataOpen(true)} onOpenStaff={isStaffRole ? () => navigate("staff") : undefined} locationStatus={locationStatus} userLocation={userLocation} searchArea={activeSearchArea} searchOrigin={activeSearchArea} profile={profile} savedMinutes={totalSavedMinutes} role={user.role} lowDataMode={appSettings.lowDataMode} />}
        {view === "ticket" && (ticket ? <QueueTicket ticket={ticket} branchList={operationalBranches} onAdvance={advanceQueue} onCancel={cancelQueue} onCheckedIn={checkIn} onComplete={completeQueue} userLocation={userLocation} demoMode={demoMode} /> : <EmptyTicket onExplore={() => navigate("home")} />)}
        {view === "activity" && <ActivityView onOpenVisit={openVisit} locationHistory={locationHistory} completedVisits={completedVisits} totalSavedMinutes={totalSavedMinutes} onSelectLocation={(area) => { selectSearchArea(area); navigate("home"); }} />}
        {view === "profile" && <ProfileView soundEnabled={soundEnabled} onSoundChange={setSoundEnabled} queuePrefs={queuePrefs} onQueuePrefsChange={setQueuePrefs} userLocation={userLocation} profile={profile} onEditProfile={() => setProfileEditorOpen(true)} onOpenSettings={() => setAppSettingsOpen(true)} onPreferenceChange={updatePreference} onLogout={logout} role={user.role} branchName={operationalBranches.find((branch) => branch.id === user.branchId)?.name} />}
        {view === "staff" && isStaffRole && <StaffView user={user} branchList={operationalBranches} demoMode={demoMode} notify={notify} onSaveSettings={saveBranchSettings} onTicketAction={staffTicketAction} onResetDemo={resetDemo} onCitizenView={() => navigate("home")} />}
        {view === "admin" && user.role === "ADMIN" && <AdminView branchList={operationalBranches} onCreateBranch={adminCreateBranch} onUpdateBranch={adminUpdateBranch} onDeleteBranch={adminDeleteBranch} onCitizenView={() => navigate("home")} />}
      </div>

      {notificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setNotificationsOpen(false)} onClear={clearNotifications} soundEnabled={soundEnabled} />}
      {locationHelpOpen && <LocationRecoveryDialog onClose={() => setLocationHelpOpen(false)} onRetry={retryPreciseLocation} onUseDemo={useDemoLocation} permissionState={locationPermission} recoveryMessage={locationRecoveryMessage} />}
      {areaSearchOpen && <SearchAreaDialog currentArea={activeSearchArea} recentLocations={locationHistory} userLocation={userLocation} locationStatus={locationStatus} branchList={operationalBranches} onClose={() => setAreaSearchOpen(false)} onSelect={selectSearchArea} onUseMyLocation={useMyPositionForSearch} />}
      {lowDataOpen && <LowDataAccessDialog profile={profile} onClose={() => setLowDataOpen(false)} onSend={notify} />}
      {profileEditorOpen && <EditProfileDialog profile={profile} onClose={() => setProfileEditorOpen(false)} onSave={saveProfile} />}
      {appSettingsOpen && <AppSettingsDialog settings={appSettings} onClose={() => setAppSettingsOpen(false)} onSave={saveAppSettings} />}
      {sheet === "branch" && chosen && <BranchSheet branch={chosen.branch} initialService={chosen.service} onClose={() => setSheet(null)} onContinue={(service) => { setChosen({ ...chosen, service }); setSheet("confirm"); }} onFallback={(service) => { setChosen({ ...chosen, service }); setSheet("fallback"); }} />}
      {sheet === "confirm" && chosen && <JoinConfirmation branch={chosen.branch} service={chosen.service} onBack={() => setSheet("branch")} onConfirm={confirmQueue} />}
      {sheet === "fallback" && chosen && <FallbackDialog branch={chosen.branch} service={chosen.service} branchList={operationalBranches} onClose={() => setSheet(null)} onBook={bookAppointment} onChooseAlternative={chooseAlternative} />}
    </div>
  );
}
