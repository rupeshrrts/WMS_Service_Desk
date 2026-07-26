import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  KBArticle,
  Notification,
  Announcement,
  Message,
  ActivityLog,
  INITIAL_TICKETS,
  INITIAL_KB_ARTICLES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
  Attachment,
} from './mock-data';

interface WMSState {
  // Authentication / Role state
  userRole: 'customer' | 'engineer';
  currentUser: {
    name: string;
    company: string;
    email: string;
    plant: string;
    warehouse: string;
  };
  
  // Data lists
  tickets: Ticket[];
  articles: KBArticle[];
  notifications: Notification[];
  announcements: Announcement[];
  
  // Actions
  setUserRole: (role: 'customer' | 'engineer') => void;
  setCurrentUser: (user: { name: string; company: string; email: string; plant: string; warehouse: string }) => void;
  
  // Ticket Actions
  addTicket: (ticketData: {
    subject: string;
    description: string;
    plant: string;
    warehouse: string;
    module: string;
    priority: TicketPriority;
    category: TicketCategory;
    attachments?: Attachment[];
  }) => Ticket;
  addMessage: (
    ticketId: string,
    content: string,
    isInternal?: boolean,
    attachments?: Attachment[]
  ) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  escalateTicket: (ticketId: string) => void;
  assignTicket: (ticketId: string, engineerName: string) => void;
  closeTicket: (ticketId: string) => void;
  reopenTicket: (ticketId: string) => void;
  
  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type: Notification['type'], ticketId?: string) => void;
}

export const useWMSStore = create<WMSState>()(
  persist(
    (set, get) => ({
      userRole: 'customer',
      currentUser: {
        name: 'Marcus Aurelius',
        company: 'Apex Logistics LLC',
        email: 'm.aurelius@apexlogistics.com',
        plant: 'Plant A (Chicago)',
        warehouse: 'WH-East-1',
      },
      
      tickets: INITIAL_TICKETS,
      articles: INITIAL_KB_ARTICLES,
      notifications: INITIAL_NOTIFICATIONS,
      announcements: INITIAL_ANNOUNCEMENTS,
      
      setUserRole: (role) => {
        set({ userRole: role });
        // Adjust current user details based on role to make the simulation immersive
        if (role === 'engineer') {
          set({
            currentUser: {
              name: 'Sarah Jenkins',
              company: 'Logistics WMS Support Team',
              email: 's.jenkins@enterprise-wms.com',
              plant: 'Plant A (Chicago)', // primary base
              warehouse: 'WH-All',
            }
          });
        } else {
          set({
            currentUser: {
              name: 'Marcus Aurelius',
              company: 'Apex Logistics LLC',
              email: 'm.aurelius@apexlogistics.com',
              plant: 'Plant A (Chicago)',
              warehouse: 'WH-East-1',
            }
          });
        }
      },
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      addTicket: (ticketData) => {
        const { currentUser, tickets, addNotification } = get();
        const ticketId = `WMS-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Define SLA logic (SLA deadline helper)
        let hoursToSLA = 72; // default Low
        if (ticketData.priority === 'Critical') hoursToSLA = 4;
        else if (ticketData.priority === 'High') hoursToSLA = 12;
        else if (ticketData.priority === 'Medium') hoursToSLA = 24;
        
        const now = new Date();
        const slaTime = new Date(now.getTime() + hoursToSLA * 60 * 60 * 1000);
        
        // Auto-assignment rules
        let assignedEngineer: string | undefined = undefined;
        let status: TicketStatus = 'New';
        const autoActivities: ActivityLog[] = [
          {
            id: `act-${Date.now()}-created`,
            actor: currentUser.name,
            action: 'Created new support ticket',
            timestamp: now.toISOString()
          }
        ];

        if (ticketData.priority === 'Critical') {
          assignedEngineer = 'Aisha Rahman (WMS Lead)';
          status = 'Assigned';
          autoActivities.push({
            id: `act-${Date.now()}-autoassign`,
            actor: 'System Auto-Assigner',
            action: 'Automatically assigned to WMS Lead Aisha Rahman due to Critical severity',
            timestamp: now.toISOString()
          });
        } else if (ticketData.priority === 'High') {
          assignedEngineer = 'Sarah Jenkins (Senior Support)';
          status = 'Assigned';
          autoActivities.push({
            id: `act-${Date.now()}-autoassign`,
            actor: 'System Auto-Assigner',
            action: 'Automatically assigned to Senior Support Sarah Jenkins due to High severity',
            timestamp: now.toISOString()
          });
        }
        
        const newTicket: Ticket = {
          id: ticketId,
          subject: ticketData.subject,
          description: ticketData.description,
          customerName: currentUser.name,
          company: currentUser.company,
          email: currentUser.email,
          plant: ticketData.plant,
          warehouse: ticketData.warehouse,
          module: ticketData.module,
          priority: ticketData.priority,
          category: ticketData.category,
          status,
          assignedEngineer,
          createdDate: now.toISOString(),
          updatedDate: now.toISOString(),
          slaDeadline: slaTime.toISOString(),
          attachments: ticketData.attachments || [],
          messages: [
            {
              id: `msg-${Date.now()}-initial`,
              author: currentUser.name,
              role: 'customer',
              content: ticketData.description,
              timestamp: now.toISOString(),
              attachments: ticketData.attachments || [],
            }
          ],
          activities: autoActivities
        };
        
        set({ tickets: [newTicket, ...tickets] });
        
        // Add a notification for engineer queue simulation
        addNotification(
          'New Ticket Created',
          `Ticket ${ticketId} - ${ticketData.subject} has been raised.`,
          ticketData.priority === 'Critical' ? 'danger' : 'info',
          ticketId
        );
        
        return newTicket;
      },
      
      addMessage: (ticketId, content, isInternal = false, attachments = []) => {
        const { currentUser, tickets, addNotification, userRole } = get();
        const now = new Date().toISOString();
        
        const updatedTickets = tickets.map((t) => {
          if (t.id !== ticketId) return t;
          
          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            author: currentUser.name,
            role: userRole === 'engineer' ? 'engineer' : 'customer',
            content,
            timestamp: now,
            isInternal,
            attachments,
          };
          
          const newActivity: ActivityLog = {
            id: `act-${Date.now()}`,
            actor: currentUser.name,
            action: isInternal ? 'Added internal comment' : 'Replied to conversation',
            timestamp: now
          };
          
          // Determine status progression based on who replied
          let newStatus = t.status;
          if (userRole === 'engineer' && !isInternal) {
            // Engineer replied, status flips to Waiting for Customer
            newStatus = 'Waiting for Customer';
          } else if (userRole === 'customer') {
            // Customer replied, status goes to In Progress (or Assigned/New depending on state)
            newStatus = t.assignedEngineer ? 'In Progress' : 'Assigned';
          }
          
          return {
            ...t,
            status: newStatus,
            updatedDate: now,
            messages: [...t.messages, newMessage],
            activities: [...t.activities, newActivity]
          };
        });
        
        set({ tickets: updatedTickets });
        
        // Notification logic
        const targetTicket = tickets.find(t => t.id === ticketId);
        if (targetTicket) {
          if (userRole === 'customer') {
            addNotification(
              'Customer Reply Received',
              `${currentUser.name} replied on ${ticketId}.`,
              'info',
              ticketId
            );
          } else if (!isInternal) {
            addNotification(
              'Support Engineer Replied',
              `Engineer ${currentUser.name} updated your ticket ${ticketId}.`,
              'success',
              ticketId
            );
          }
        }
      },
      
      updateTicketStatus: (ticketId, status) => {
        const { currentUser, tickets, addNotification } = get();
        const now = new Date().toISOString();
        
        const updatedTickets = tickets.map((t) => {
          if (t.id !== ticketId) return t;
          
          return {
            ...t,
            status,
            updatedDate: now,
            activities: [
              ...t.activities,
              {
                id: `act-${Date.now()}`,
                actor: currentUser.name,
                action: `Updated status to ${status}`,
                timestamp: now
              }
            ]
          };
        });
        
        set({ tickets: updatedTickets });
        
        addNotification(
          'Ticket Status Updated',
          `Ticket ${ticketId} status changed to ${status}.`,
          'info',
          ticketId
        );
      },
      
      escalateTicket: (ticketId) => {
        const { currentUser, tickets, addNotification } = get();
        const now = new Date().toISOString();
        
        const updatedTickets = tickets.map((t) => {
          if (t.id !== ticketId) return t;
          
          return {
            ...t,
            status: 'Escalated' as TicketStatus,
            priority: 'Critical' as TicketPriority,
            assignedEngineer: 'Aisha Rahman (WMS Lead)', // assign to Lead upon escalation
            updatedDate: now,
            activities: [
              ...t.activities,
              {
                id: `act-${Date.now()}`,
                actor: currentUser.name,
                action: 'Escalated ticket to WMS Lead',
                timestamp: now
              }
            ]
          };
        });
        
        set({ tickets: updatedTickets });
        
        addNotification(
          'Ticket Escalated',
          `Ticket ${ticketId} was escalated to WMS Lead Aisha Rahman.`,
          'danger',
          ticketId
        );
      },
      
      assignTicket: (ticketId, engineerName) => {
        const { currentUser, tickets } = get();
        const now = new Date().toISOString();
        
        const updatedTickets = tickets.map((t) => {
          if (t.id !== ticketId) return t;
          
          return {
            ...t,
            status: 'Assigned' as TicketStatus,
            assignedEngineer: engineerName,
            updatedDate: now,
            activities: [
              ...t.activities,
              {
                id: `act-${Date.now()}`,
                actor: currentUser.name,
                action: `Assigned ticket to ${engineerName}`,
                timestamp: now
              }
            ]
          };
        });
        
        set({ tickets: updatedTickets });
      },
      
      closeTicket: (ticketId) => {
        const { currentUser, tickets, addNotification } = get();
        const now = new Date().toISOString();
        
        const updatedTickets = tickets.map((t) => {
          if (t.id !== ticketId) return t;
          
          return {
            ...t,
            status: 'Closed' as TicketStatus,
            updatedDate: now,
            activities: [
              ...t.activities,
              {
                id: `act-${Date.now()}`,
                actor: currentUser.name,
                action: 'Closed the ticket',
                timestamp: now
              }
            ]
          };
        });
        
        set({ tickets: updatedTickets });
        
        addNotification(
          'Ticket Closed',
          `Ticket ${ticketId} has been successfully closed.`,
          'success',
          ticketId
        );
      },
      
      reopenTicket: (ticketId) => {
        const { currentUser, tickets, addNotification } = get();
        const now = new Date().toISOString();
        
        const updatedTickets = tickets.map((t) => {
          if (t.id !== ticketId) return t;
          
          return {
            ...t,
            status: 'In Progress' as TicketStatus,
            updatedDate: now,
            activities: [
              ...t.activities,
              {
                id: `act-${Date.now()}`,
                actor: currentUser.name,
                action: 'Reopened the ticket',
                timestamp: now
              }
            ]
          };
        });
        
        set({ tickets: updatedTickets });
        
        addNotification(
          'Ticket Reopened',
          `Ticket ${ticketId} was reopened and set to In Progress.`,
          'warning',
          ticketId
        );
      },
      
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },
      
      addNotification: (title, message, type, ticketId) => {
        const newNotif: Notification = {
          id: `notif-${Date.now()}`,
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false,
          ticketId,
          type,
        };
        
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },
    }),
    {
      name: 'wms-portal-state', // localStorage key
      partialize: (state) => ({
        userRole: state.userRole,
        currentUser: state.currentUser,
        tickets: state.tickets,
        notifications: state.notifications,
      }),
    }
  )
);
