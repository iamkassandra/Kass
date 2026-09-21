import { CommunicationMessage } from '@/types/agents';

export interface AgentConnection {
  agentId: string;
  isConnected: boolean;
  lastHeartbeat: Date;
  messageQueue: CommunicationMessage[];
  capabilities: string[];
  currentTask?: string;
}

export interface BroadcastMessage {
  id: string;
  type: 'agent_status' | 'task_update' | 'collaboration_request' | 'emergency' | 'system_alert';
  sender: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients?: string[]; // If undefined, broadcast to all
}

export interface CollaborationSession {
  id: string;
  participants: string[];
  topic: string;
  status: 'active' | 'paused' | 'completed';
  messages: CommunicationMessage[];
  createdAt: Date;
  lastActivity: Date;
}

export interface AgentMetrics {
  agentId: string;
  messagesReceived: number;
  messagesSent: number;
  collaborationSessions: number;
  averageResponseTime: number;
  lastActiveTime: Date;
}

export class CommunicationBus {
  private connections: Map<string, AgentConnection> = new Map();
  private collaborationSessions: Map<string, CollaborationSession> = new Map();
  private messageHistory: CommunicationMessage[] = [];
  private broadcastHistory: BroadcastMessage[] = [];
  private agentMetrics: Map<string, AgentMetrics> = new Map();
  private isRunning: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeBus();
  }

  private initializeBus(): void {
    console.log('[CommunicationBus] Initializing real-time communication bus...');

    this.isRunning = true;

    // Start heartbeat monitoring
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeats();
    }, 30000); // Check every 30 seconds

    console.log('[CommunicationBus] Communication bus initialized');
  }

  async registerAgent(agentId: string, capabilities: string[]): Promise<void> {
    const connection: AgentConnection = {
      agentId,
      isConnected: true,
      lastHeartbeat: new Date(),
      messageQueue: [],
      capabilities,
      currentTask: undefined
    };

    this.connections.set(agentId, connection);

    // Initialize metrics
    if (!this.agentMetrics.has(agentId)) {
      this.agentMetrics.set(agentId, {
        agentId,
        messagesReceived: 0,
        messagesSent: 0,
        collaborationSessions: 0,
        averageResponseTime: 0,
        lastActiveTime: new Date()
      });
    }

    // Announce agent joining
    await this.broadcast({
      id: `agent-join-${Date.now()}`,
      type: 'agent_status',
      sender: 'communication-bus',
      data: {
        event: 'agent_joined',
        agentId,
        capabilities,
        timestamp: new Date()
      },
      timestamp: new Date(),
      priority: 'low'
    });

    console.log(`[CommunicationBus] Registered agent: ${agentId}`);
  }

  async disconnectAgent(agentId: string): Promise<void> {
    const connection = this.connections.get(agentId);
    if (connection) {
      connection.isConnected = false;

      // Announce agent leaving
      await this.broadcast({
        id: `agent-leave-${Date.now()}`,
        type: 'agent_status',
        sender: 'communication-bus',
        data: {
          event: 'agent_left',
          agentId,
          timestamp: new Date()
        },
        timestamp: new Date(),
        priority: 'low'
      });

      console.log(`[CommunicationBus] Disconnected agent: ${agentId}`);
    }
  }

  async sendMessage(message: CommunicationMessage): Promise<boolean> {
    try {
      if (message.toAgent === 'broadcast') {
        return await this.broadcastMessage(message);
      }

      const targetConnection = this.connections.get(message.toAgent);
      if (!targetConnection || !targetConnection.isConnected) {
        console.warn(`[CommunicationBus] Target agent ${message.toAgent} not connected`);
        return false;
      }

      // Add to target's queue
      targetConnection.messageQueue.push(message);

      // Store in history
      this.messageHistory.push(message);

      // Update metrics
      this.updateMetrics(message.fromAgent, 'sent');
      this.updateMetrics(message.toAgent, 'received');

      // Trim history if too large
      if (this.messageHistory.length > 10000) {
        this.messageHistory = this.messageHistory.slice(-5000);
      }

      console.log(`[CommunicationBus] Message sent from ${message.fromAgent} to ${message.toAgent}`);
      return true;
    } catch (error) {
      console.error('[CommunicationBus] Error sending message:', error);
      return false;
    }
  }

  async getMessages(agentId: string): Promise<CommunicationMessage[]> {
    const connection = this.connections.get(agentId);
    if (!connection) return [];

    const messages = [...connection.messageQueue];
    connection.messageQueue = []; // Clear the queue
    return messages;
  }

  async broadcast(broadcastMessage: BroadcastMessage): Promise<void> {
    try {
      const recipients = broadcastMessage.recipients || Array.from(this.connections.keys());

      for (const agentId of recipients) {
        const connection = this.connections.get(agentId);
        if (connection && connection.isConnected) {
          const message: CommunicationMessage = {
            id: `broadcast-${broadcastMessage.id}`,
            fromAgent: broadcastMessage.sender,
            toAgent: agentId,
            type: 'status_update',
            content: broadcastMessage.data,
            timestamp: broadcastMessage.timestamp,
            priority: broadcastMessage.priority,
            requiresResponse: false
          };

          connection.messageQueue.push(message);
        }
      }

      this.broadcastHistory.push(broadcastMessage);

      console.log(`[CommunicationBus] Broadcast sent to ${recipients.length} agents`);
    } catch (error) {
      console.error('[CommunicationBus] Error broadcasting message:', error);
    }
  }

  async startCollaboration(topic: string, participants: string[]): Promise<string> {
    const sessionId = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: CollaborationSession = {
      id: sessionId,
      participants,
      topic,
      status: 'active',
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.collaborationSessions.set(sessionId, session);

    // Notify participants
    const collaborationMessage: BroadcastMessage = {
      id: `collab-start-${Date.now()}`,
      type: 'collaboration_request',
      sender: 'communication-bus',
      data: {
        sessionId,
        topic,
        participants,
        action: 'start'
      },
      timestamp: new Date(),
      priority: 'medium',
      recipients: participants
    };

    await this.broadcast(collaborationMessage);

    // Update metrics
    for (const participant of participants) {
      const metrics = this.agentMetrics.get(participant);
      if (metrics) {
        metrics.collaborationSessions++;
      }
    }

    console.log(`[CommunicationBus] Started collaboration session: ${sessionId}`);
    return sessionId;
  }

  async addToCollaboration(sessionId: string, message: CommunicationMessage): Promise<void> {
    const session = this.collaborationSessions.get(sessionId);
    if (!session || session.status !== 'active') return;

    session.messages.push(message);
    session.lastActivity = new Date();

    // Broadcast to other participants
    const otherParticipants = session.participants.filter(p => p !== message.fromAgent);

    const collaborationUpdate: BroadcastMessage = {
      id: `collab-message-${Date.now()}`,
      type: 'collaboration_request',
      sender: message.fromAgent,
      data: {
        sessionId,
        message,
        action: 'message'
      },
      timestamp: new Date(),
      priority: 'medium',
      recipients: otherParticipants
    };

    await this.broadcast(collaborationUpdate);
  }

  async endCollaboration(sessionId: string): Promise<CollaborationSession | null> {
    const session = this.collaborationSessions.get(sessionId);
    if (!session) return null;

    session.status = 'completed';
    session.lastActivity = new Date();

    // Notify participants
    const endMessage: BroadcastMessage = {
      id: `collab-end-${Date.now()}`,
      type: 'collaboration_request',
      sender: 'communication-bus',
      data: {
        sessionId,
        action: 'end',
        summary: {
          duration: session.lastActivity.getTime() - session.createdAt.getTime(),
          messageCount: session.messages.length,
          participants: session.participants
        }
      },
      timestamp: new Date(),
      priority: 'low',
      recipients: session.participants
    };

    await this.broadcast(endMessage);

    console.log(`[CommunicationBus] Ended collaboration session: ${sessionId}`);
    return session;
  }

  async requestCollaboration(requestingAgent: string, targetAgents: string[], topic: string, urgency: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
    const requestId = `collab-request-${Date.now()}`;

    const collaborationRequest: BroadcastMessage = {
      id: requestId,
      type: 'collaboration_request',
      sender: requestingAgent,
      data: {
        requestId,
        topic,
        urgency,
        action: 'request',
        message: `Agent ${requestingAgent} requests collaboration on: ${topic}`
      },
      timestamp: new Date(),
      priority: urgency === 'high' ? 'high' : 'medium',
      recipients: targetAgents
    };

    await this.broadcast(collaborationRequest);

    console.log(`[CommunicationBus] Collaboration request sent: ${requestId}`);
    return requestId;
  }

  async updateAgentStatus(agentId: string, status: { currentTask?: string; workload?: number; capabilities?: string[] }): Promise<void> {
    const connection = this.connections.get(agentId);
    if (!connection) return;

    if (status.currentTask) connection.currentTask = status.currentTask;
    if (status.capabilities) connection.capabilities = status.capabilities;

    connection.lastHeartbeat = new Date();

    const metrics = this.agentMetrics.get(agentId);
    if (metrics) {
      metrics.lastActiveTime = new Date();
    }

    // Broadcast status update
    await this.broadcast({
      id: `status-${Date.now()}`,
      type: 'agent_status',
      sender: agentId,
      data: {
        agentId,
        status,
        timestamp: new Date()
      },
      timestamp: new Date(),
      priority: 'low'
    });
  }

  async findAvailableAgents(capability?: string): Promise<AgentConnection[]> {
    const availableAgents: AgentConnection[] = [];

    for (const [_, connection] of this.connections) {
      if (!connection.isConnected) continue;

      if (capability && !connection.capabilities.includes(capability)) continue;

      availableAgents.push(connection);
    }

    return availableAgents;
  }

  async emergencyBroadcast(message: string, sender: string): Promise<void> {
    const emergencyMessage: BroadcastMessage = {
      id: `emergency-${Date.now()}`,
      type: 'emergency',
      sender,
      data: {
        message,
        timestamp: new Date(),
        severity: 'critical'
      },
      timestamp: new Date(),
      priority: 'urgent'
    };

    await this.broadcast(emergencyMessage);

    console.log(`[CommunicationBus] Emergency broadcast sent: ${message}`);
  }

  getSystemStatus(): any {
    const connectedAgents = Array.from(this.connections.values()).filter(c => c.isConnected);
    const activeCollaborations = Array.from(this.collaborationSessions.values()).filter(s => s.status === 'active');

    return {
      isRunning: this.isRunning,
      connectedAgents: connectedAgents.length,
      totalAgents: this.connections.size,
      activeCollaborations: activeCollaborations.length,
      totalCollaborations: this.collaborationSessions.size,
      messageHistory: this.messageHistory.length,
      broadcastHistory: this.broadcastHistory.length,
      agents: connectedAgents.map(c => ({
        agentId: c.agentId,
        capabilities: c.capabilities,
        currentTask: c.currentTask,
        lastHeartbeat: c.lastHeartbeat,
        queuedMessages: c.messageQueue.length
      })),
      metrics: Array.from(this.agentMetrics.values())
    };
  }

  getCollaborationSessions(): CollaborationSession[] {
    return Array.from(this.collaborationSessions.values());
  }

  private async broadcastMessage(message: CommunicationMessage): Promise<boolean> {
    const broadcastMessage: BroadcastMessage = {
      id: message.id,
      type: 'system_alert',
      sender: message.fromAgent,
      data: message.content,
      timestamp: message.timestamp,
      priority: message.priority
    };

    await this.broadcast(broadcastMessage);
    return true;
  }

  private checkHeartbeats(): void {
    const now = new Date();
    const timeoutThreshold = 60000; // 1 minute

    for (const [agentId, connection] of this.connections) {
      if (!connection.isConnected) continue;

      const timeSinceHeartbeat = now.getTime() - connection.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > timeoutThreshold) {
        console.warn(`[CommunicationBus] Agent ${agentId} appears disconnected (no heartbeat for ${timeSinceHeartbeat}ms)`);
        connection.isConnected = false;
      }
    }
  }

  private updateMetrics(agentId: string, action: 'sent' | 'received'): void {
    const metrics = this.agentMetrics.get(agentId);
    if (!metrics) return;

    if (action === 'sent') {
      metrics.messagesSent++;
    } else {
      metrics.messagesReceived++;
    }

    metrics.lastActiveTime = new Date();
  }

  async shutdown(): Promise<void> {
    console.log('[CommunicationBus] Shutting down communication bus...');

    this.isRunning = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // End all active collaborations
    for (const [sessionId, session] of this.collaborationSessions) {
      if (session.status === 'active') {
        await this.endCollaboration(sessionId);
      }
    }

    // Disconnect all agents
    for (const agentId of this.connections.keys()) {
      await this.disconnectAgent(agentId);
    }

    console.log('[CommunicationBus] Communication bus shutdown complete');
  }
}

// Singleton instance for system-wide communication
export const communicationBus = new CommunicationBus();
