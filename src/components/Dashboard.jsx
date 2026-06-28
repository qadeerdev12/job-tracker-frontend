import { lazy, Suspense } from "react";
import useDashboardData from "./dashboard/useDashboardData";
import Navbar from "./dashboard/Navbar";
import SummaryHeader from "./dashboard/SummaryHeader";
import DashboardTab from "./dashboard/DashboardTab";
import ActivityTab from "./dashboard/ActivityTab";
import AddJobForm from "./dashboard/AddJobForm";
import ApplicationsTab from "./dashboard/ApplicationsTab";
import InterviewsTab from "./dashboard/InterviewsTab";
import ArchivedTab from "./dashboard/ArchivedTab";
import ProfileTab from "./dashboard/ProfileTab";
import EditJobModal from "./dashboard/EditJobModal";
import DeleteConfirmModal from "./dashboard/DeleteConfirmModal";
import InterviewModal from "./dashboard/InterviewModal";
import DeleteAccountModal from "./dashboard/DeleteAccountModal";
import MobileBottomNav from "./dashboard/MobileBottomNav";
import { ToastContainer } from "./Toast";
import OnboardingTour from "./OnboardingTour";

const AITailorTab = lazy(() => import("./AITailorTab"));
const DocumentsTab = lazy(() => import("./DocumentsTab"));

export default function Dashboard() {
  const d = useDashboardData();

  const chartData = [
    { name: "Applied", value: d.stats.Applied },
    { name: "Interview", value: d.stats.Interview },
    { name: "Offer", value: d.stats.Offer },
    { name: "Rejected", value: d.stats.Rejected },
  ];

  return (
    <div className="min-h-screen bg-page">
      <Navbar
        activeTab={d.activeTab} setActiveTab={d.setActiveTab}
        navItems={d.navItems} mobileMenuOpen={d.mobileMenuOpen}
        setMobileMenuOpen={d.setMobileMenuOpen} initials={d.initials}
        handleLogout={d.handleLogout}
      />

      <SummaryHeader
        loading={d.loading} stats={d.stats} totalApps={d.totalApps}
        firstName={d.firstName} weeklyApps={d.weeklyApps} weeklyGoal={d.weeklyGoal}
        setWeeklyGoal={d.setWeeklyGoal} goalPct={d.goalPct} editingGoal={d.editingGoal}
        setEditingGoal={d.setEditingGoal} goalInput={d.goalInput}
        setGoalInput={d.setGoalInput} authHeader={d.authHeader}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {d.activeTab === "dashboard" && (
          <DashboardTab
            loading={d.loading} stats={d.stats} totalApps={d.totalApps}
            weeklyData={d.weeklyData} chartData={chartData}
            responseRate={d.responseRate} successRate={d.successRate}
            avgDaysToInterview={d.avgDaysToInterview} stageMetrics={d.stageMetrics}
            monthlyData={d.monthlyData} funnelData={d.funnelData}
            reminders={d.reminders} recentActivity={d.recentActivity}
            setActiveTab={d.setActiveTab}
          />
        )}

        {d.activeTab === "activity" && (
          <ActivityTab activities={d.activities} />
        )}

        {d.activeTab === "add" && (
          <AddJobForm
            company={d.company} setCompany={d.setCompany}
            role={d.role} setRole={d.setRole}
            status={d.status} setStatus={d.setStatus}
            link={d.link} setLink={d.setLink}
            notes={d.notes} setNotes={d.setNotes}
            followUpDate={d.followUpDate} setFollowUpDate={d.setFollowUpDate}
            formTags={d.formTags} setFormTags={d.setFormTags}
            allTags={d.allTags} formContacts={d.formContacts}
            setFormContacts={d.setFormContacts} showContactForm={d.showContactForm}
            setShowContactForm={d.setShowContactForm} contactInput={d.contactInput}
            setContactInput={d.setContactInput} createJob={d.createJob}
          />
        )}

        {d.activeTab === "applications" && (
          <ApplicationsTab
            loading={d.loading} filteredJobs={d.filteredJobs} jobs={d.jobs}
            search={d.search} setSearch={d.setSearch}
            filterStatus={d.filterStatus} setFilterStatus={d.setFilterStatus}
            filterTag={d.filterTag} setFilterTag={d.setFilterTag}
            sortBy={d.sortBy} setSortBy={d.setSortBy}
            allTags={d.allTags} setActiveTab={d.setActiveTab}
            setEditJob={d.setEditJob} archiveJob={d.archiveJob}
            setDeleteTarget={d.setDeleteTarget} updateJob={d.updateJob}
            authHeader={d.authHeader} toast={d.toast}
          />
        )}

        {d.activeTab === "interviews" && (
          <InterviewsTab
            upcomingInterviews={d.upcomingInterviews} jobs={d.jobs}
            setInterviewModal={d.setInterviewModal}
            setIntDate={d.setIntDate} setIntTime={d.setIntTime}
            setIntType={d.setIntType} setIntLocation={d.setIntLocation}
            setIntNotes={d.setIntNotes} authHeader={d.authHeader}
            fetchJobs={d.fetchJobs} fetchInterviews={d.fetchInterviews}
          />
        )}

        {d.activeTab === "archived" && (
          <ArchivedTab
            archivedJobs={d.archivedJobs} archiveJob={d.archiveJob}
            setDeleteTarget={d.setDeleteTarget}
          />
        )}

        {d.activeTab === "ai" && (
          <Suspense fallback={<div className="text-center py-12 text-muted">Loading AI Tailor...</div>}>
            <AITailorTab authHeader={d.authHeader} />
          </Suspense>
        )}

        {d.activeTab === "documents" && (
          <Suspense fallback={<div className="text-center py-12 text-muted">Loading Documents...</div>}>
            <DocumentsTab authHeader={d.authHeader} jobs={d.jobs} />
          </Suspense>
        )}

        {d.activeTab === "profile" && (
          <ProfileTab
            session={d.session} userName={d.userName} initials={d.initials}
            totalApps={d.totalApps} archivedJobs={d.archivedJobs}
            weeklyGoal={d.weeklyGoal} setWeeklyGoal={d.setWeeklyGoal}
            editingGoal={d.editingGoal} setEditingGoal={d.setEditingGoal}
            goalInput={d.goalInput} setGoalInput={d.setGoalInput}
            emailNotifications={d.emailNotifications} setEmailNotifications={d.setEmailNotifications}
            sendingTestEmail={d.sendingTestEmail} setSendingTestEmail={d.setSendingTestEmail}
            testEmailMsg={d.testEmailMsg} setTestEmailMsg={d.setTestEmailMsg}
            setDeleteAccountModal={d.setDeleteAccountModal} authHeader={d.authHeader}
          />
        )}
      </main>

      <EditJobModal
        editJob={d.editJob} setEditJob={d.setEditJob}
        updateJob={d.updateJob} allTags={d.allTags}
      />

      <DeleteConfirmModal
        deleteTarget={d.deleteTarget} setDeleteTarget={d.setDeleteTarget}
        deleteJob={d.deleteJob}
      />

      <InterviewModal
        interviewModal={d.interviewModal} setInterviewModal={d.setInterviewModal}
        jobs={d.jobs} intDate={d.intDate} setIntDate={d.setIntDate}
        intTime={d.intTime} setIntTime={d.setIntTime}
        intType={d.intType} setIntType={d.setIntType}
        intLocation={d.intLocation} setIntLocation={d.setIntLocation}
        intNotes={d.intNotes} setIntNotes={d.setIntNotes}
        authHeader={d.authHeader} fetchJobs={d.fetchJobs}
        fetchStats={d.fetchStats} fetchInterviews={d.fetchInterviews}
        fetchActivities={d.fetchActivities}
      />

      <DeleteAccountModal
        deleteAccountModal={d.deleteAccountModal} setDeleteAccountModal={d.setDeleteAccountModal}
        totalApps={d.totalApps} archivedJobs={d.archivedJobs}
        deleteConfirmText={d.deleteConfirmText} setDeleteConfirmText={d.setDeleteConfirmText}
        deletingAccount={d.deletingAccount} setDeletingAccount={d.setDeletingAccount}
        authHeader={d.authHeader}
      />

      <ToastContainer toasts={d.toasts} />
      <OnboardingTour loading={d.loading} />
      <MobileBottomNav activeTab={d.activeTab} setActiveTab={d.setActiveTab} />
    </div>
  );
}
