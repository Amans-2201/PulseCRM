import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ContactsView from './components/ContactsView';
import ContactDetailModal from './components/ContactDetailModal';
import ContactFormModal from './components/ContactFormModal';
import DealsView from './components/DealsView';
import DealFormModal from './components/DealFormModal';
import CompaniesView from './components/CompaniesView';
import CompanyFormModal from './components/CompanyFormModal';
import ActivitiesView from './components/ActivitiesView';
import ActivityFormModal from './components/ActivityFormModal';
import SettingsView from './components/SettingsView';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data state
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sqliteInfo, setSqliteInfo] = useState(null);

  // Filters & Search
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');

  // Loading states
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Modals state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContactForEdit, setSelectedContactForEdit] = useState(null);
  const [contactDetailId, setContactDetailId] = useState(null);

  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [selectedDealForEdit, setSelectedDealForEdit] = useState(null);

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [selectedCompanyForEdit, setSelectedCompanyForEdit] = useState(null);

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedActivityForEdit, setSelectedActivityForEdit] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Data fetching functions
  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadSqliteInfo = async () => {
    try {
      const data = await api.getSystemInfo();
      setSqliteInfo(data);
    } catch (err) {
      console.error('Failed to load SQLite info:', err);
    }
  };

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const data = await api.getContacts({
        search: contactSearch,
        status: contactStatusFilter,
      });
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadDeals = async () => {
    setLoadingDeals(true);
    try {
      const data = await api.getDeals();
      setDeals(data);
    } catch (err) {
      console.error('Failed to load deals:', err);
    } finally {
      setLoadingDeals(false);
    }
  };

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const data = await api.getActivities({
        status: activityStatusFilter,
        type: activityTypeFilter,
      });
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const refreshAll = () => {
    loadStats();
    loadSqliteInfo();
    loadContacts();
    loadCompanies();
    loadDeals();
    loadActivities();
  };

  // Initial load
  useEffect(() => {
    refreshAll();
  }, []);

  // Reload when tab or search filter changes
  useEffect(() => {
    if (activeTab === 'contacts') {
      const timer = setTimeout(() => {
        loadContacts();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [contactSearch, contactStatusFilter, activeTab]);

  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities();
    }
  }, [activityStatusFilter, activityTypeFilter, activeTab]);

  useEffect(() => {
    if (activeTab === 'deals') {
      loadDeals();
    }
    if (activeTab === 'companies') {
      loadCompanies();
    }
    if (activeTab === 'dashboard') {
      loadStats();
    }
    if (activeTab === 'settings') {
      loadSqliteInfo();
    }
  }, [activeTab]);

  // ==========================================
  // CONTACT ACTIONS
  // ==========================================
  const handleSaveContact = async (formData) => {
    try {
      if (selectedContactForEdit) {
        await api.updateContact(selectedContactForEdit.id, formData);
        showToast('Contact updated successfully');
      } else {
        await api.createContact(formData);
        showToast('New contact added successfully');
      }
      setContactModalOpen(false);
      setSelectedContactForEdit(null);
      loadContacts();
      loadStats();
    } catch (err) {
      alert('Error saving contact: ' + err.message);
    }
  };

  const handleDeleteContact = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove related notes and activities.`)) return;
    try {
      await api.deleteContact(id);
      showToast(`Contact "${name}" deleted`);
      loadContacts();
      loadStats();
    } catch (err) {
      alert('Error deleting contact: ' + err.message);
    }
  };

  // ==========================================
  // DEAL ACTIONS
  // ==========================================
  const handleSaveDeal = async (formData) => {
    try {
      if (selectedDealForEdit) {
        await api.updateDeal(selectedDealForEdit.id, formData);
        showToast('Deal updated successfully');
      } else {
        await api.createDeal(formData);
        showToast('New deal added to pipeline');
      }
      setDealModalOpen(false);
      setSelectedDealForEdit(null);
      loadDeals();
      loadStats();
    } catch (err) {
      alert('Error saving deal: ' + err.message);
    }
  };

  const handleUpdateDealStage = async (id, stage) => {
    try {
      await api.updateDealStage(id, stage);
      showToast(`Deal moved to ${stage.toUpperCase()}`);
      loadDeals();
      loadStats();
    } catch (err) {
      alert('Error updating stage: ' + err.message);
    }
  };

  const handleDeleteDeal = async (id, title) => {
    if (!confirm(`Delete deal "${title}"?`)) return;
    try {
      await api.deleteDeal(id);
      showToast(`Deal "${title}" removed`);
      loadDeals();
      loadStats();
    } catch (err) {
      alert('Error deleting deal: ' + err.message);
    }
  };

  // ==========================================
  // COMPANY ACTIONS
  // ==========================================
  const handleSaveCompany = async (formData) => {
    try {
      if (selectedCompanyForEdit) {
        await api.updateCompany(selectedCompanyForEdit.id, formData);
        showToast('Company details updated');
      } else {
        await api.createCompany(formData);
        showToast('New company registered');
      }
      setCompanyModalOpen(false);
      setSelectedCompanyForEdit(null);
      loadCompanies();
      loadStats();
    } catch (err) {
      alert('Error saving company: ' + err.message);
    }
  };

  const handleDeleteCompany = async (id, name) => {
    if (!confirm(`Delete company "${name}"?`)) return;
    try {
      await api.deleteCompany(id);
      showToast(`Company "${name}" deleted`);
      loadCompanies();
      loadStats();
    } catch (err) {
      alert('Error deleting company: ' + err.message);
    }
  };

  // ==========================================
  // ACTIVITY ACTIONS
  // ==========================================
  const handleSaveActivity = async (formData) => {
    try {
      if (selectedActivityForEdit) {
        await api.updateActivity(selectedActivityForEdit.id, formData);
        showToast('Activity updated');
      } else {
        await api.createActivity(formData);
        showToast('Activity scheduled');
      }
      setActivityModalOpen(false);
      setSelectedActivityForEdit(null);
      loadActivities();
      loadStats();
    } catch (err) {
      alert('Error saving activity: ' + err.message);
    }
  };

  const handleToggleActivity = async (activity) => {
    const nextStatus = activity.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.updateActivity(activity.id, { status: nextStatus });
      showToast(nextStatus === 'Completed' ? 'Task marked complete' : 'Task marked pending');
      loadActivities();
      loadStats();
    } catch (err) {
      alert('Error updating activity: ' + err.message);
    }
  };

  const handleDeleteActivity = async (id, subject) => {
    if (!confirm(`Delete activity "${subject}"?`)) return;
    try {
      await api.deleteActivity(id);
      showToast('Activity deleted');
      loadActivities();
      loadStats();
    } catch (err) {
      alert('Error deleting activity: ' + err.message);
    }
  };

  const pageHeaders = {
    dashboard: {
      title: 'Sales Dashboard',
      subtitle: 'Real-time overview of your pipeline, revenue, and tasks',
    },
    contacts: {
      title: 'Contacts Directory',
      subtitle: 'Manage client relationships, leads, and decision makers',
    },
    deals: {
      title: 'Deals & Pipeline',
      subtitle: 'Visual Kanban pipeline with sales stages and values',
    },
    companies: {
      title: 'Companies & Organizations',
      subtitle: 'Client accounts, enterprise details, and revenue tracking',
    },
    activities: {
      title: 'Tasks & Activities',
      subtitle: 'Daily agenda, follow-up calls, meetings, and deadlines',
    },
    settings: {
      title: 'Database & System Settings',
      subtitle: 'Local SQLite file management, backups, and app status',
    },
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-4 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          contacts: stats?.totalContacts,
          deals: stats?.activeDeals,
          companies: stats?.totalCompanies,
          pendingActivities: stats?.pendingActivities,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={pageHeaders[activeTab]?.title}
          subtitle={pageHeaders[activeTab]?.subtitle}
          onNewContact={() => {
            setSelectedContactForEdit(null);
            setContactModalOpen(true);
          }}
          onNewDeal={() => {
            setSelectedDealForEdit(null);
            setDealModalOpen(true);
          }}
          onNewActivity={() => {
            setSelectedActivityForEdit(null);
            setActivityModalOpen(true);
          }}
          sqliteInfo={sqliteInfo}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              onNavigate={(tab) => setActiveTab(tab)}
              onToggleActivity={handleToggleActivity}
              onNewDeal={() => {
                setSelectedDealForEdit(null);
                setDealModalOpen(true);
              }}
              onNewContact={() => {
                setSelectedContactForEdit(null);
                setContactModalOpen(true);
              }}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              loading={loadingContacts}
              searchTerm={contactSearch}
              setSearchTerm={setContactSearch}
              statusFilter={contactStatusFilter}
              setStatusFilter={setContactStatusFilter}
              onSelectContact={(id) => setContactDetailId(id)}
              onEditContact={(contact) => {
                setSelectedContactForEdit(contact);
                setContactModalOpen(true);
              }}
              onDeleteContact={handleDeleteContact}
              onNewContact={() => {
                setSelectedContactForEdit(null);
                setContactModalOpen(true);
              }}
            />
          )}

          {activeTab === 'deals' && (
            <DealsView
              deals={deals}
              loading={loadingDeals}
              onNewDeal={() => {
                setSelectedDealForEdit(null);
                setDealModalOpen(true);
              }}
              onEditDeal={(deal) => {
                setSelectedDealForEdit(deal);
                setDealModalOpen(true);
              }}
              onDeleteDeal={handleDeleteDeal}
              onUpdateStage={handleUpdateDealStage}
            />
          )}

          {activeTab === 'companies' && (
            <CompaniesView
              companies={companies}
              loading={loadingCompanies}
              onNewCompany={() => {
                setSelectedCompanyForEdit(null);
                setCompanyModalOpen(true);
              }}
              onEditCompany={(company) => {
                setSelectedCompanyForEdit(company);
                setCompanyModalOpen(true);
              }}
              onDeleteCompany={handleDeleteCompany}
            />
          )}

          {activeTab === 'activities' && (
            <ActivitiesView
              activities={activities}
              loading={loadingActivities}
              statusFilter={activityStatusFilter}
              setStatusFilter={setActivityStatusFilter}
              typeFilter={activityTypeFilter}
              setTypeFilter={setActivityTypeFilter}
              onToggleActivity={handleToggleActivity}
              onNewActivity={() => {
                setSelectedActivityForEdit(null);
                setActivityModalOpen(true);
              }}
              onEditActivity={(act) => {
                setSelectedActivityForEdit(act);
                setActivityModalOpen(true);
              }}
              onDeleteActivity={handleDeleteActivity}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              sqliteInfo={sqliteInfo}
              onRefreshInfo={loadSqliteInfo}
              onResetData={refreshAll}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ContactFormModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedContactForEdit(null);
        }}
        onSave={handleSaveContact}
        contact={selectedContactForEdit}
        companies={companies}
      />

      <ContactDetailModal
        contactId={contactDetailId}
        isOpen={Boolean(contactDetailId)}
        onClose={() => setContactDetailId(null)}
        onEdit={(contact) => {
          setSelectedContactForEdit(contact);
          setContactModalOpen(true);
        }}
        onDataChanged={refreshAll}
      />

      <DealFormModal
        isOpen={dealModalOpen}
        onClose={() => {
          setDealModalOpen(false);
          setSelectedDealForEdit(null);
        }}
        onSave={handleSaveDeal}
        deal={selectedDealForEdit}
        contacts={contacts}
        companies={companies}
      />

      <CompanyFormModal
        isOpen={companyModalOpen}
        onClose={() => {
          setCompanyModalOpen(false);
          setSelectedCompanyForEdit(null);
        }}
        onSave={handleSaveCompany}
        company={selectedCompanyForEdit}
      />

      <ActivityFormModal
        isOpen={activityModalOpen}
        onClose={() => {
          setActivityModalOpen(false);
          setSelectedActivityForEdit(null);
        }}
        onSave={handleSaveActivity}
        activity={selectedActivityForEdit}
        contacts={contacts}
        deals={deals}
      />
    </div>
  );
}
