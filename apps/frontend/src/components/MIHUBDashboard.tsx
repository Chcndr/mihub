/**
 * MIHUB Dashboard - Multi-Agent Control Center
 * 4 agenti che comunicano in real-time:
 * - MIO (GPT-5): Coordinatore principale
 * - Manus: Operatore esecutivo
 * - Abacus: Analisi dati e calcoli
 * - Zapier: Automazioni e integrazioni
 * 
 * Tutti vedono tutte le chat per auto-controllo e coordinamento
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Brain, 
  Wrench, 
  Calculator, 
  Zap,
  Send,
  Eye,
  EyeOff,
  Users,
  Activity
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  icon: typeof Brain;
  color: string;
  description: string;
}

const AGENTS: Agent[] = [
  {
    id: "mio",
    name: "MIO",
    icon: Brain,
    color: "text-purple-500",
    description: "GPT-5 Coordinatore"
  },
  {
    id: "manus",
    name: "Manus",
    icon: Wrench,
    color: "text-blue-500",
    description: "Operatore Esecutivo"
  },
  {
    id: "abacus",
    name: "Abacus",
    icon: Calculator,
    color: "text-green-500",
    description: "Analisi Dati"
  },
  {
    id: "zapier",
    name: "Zapier",
    icon: Zap,
    color: "text-orange-500",
    description: "Automazioni"
  }
];

export default function MIHUBDashboard() {
  const [conversationId] = useState(`conv_${Date.now()}`);
  const [activeAgent, setActiveAgent] = useState<string>("mio");
  const [messageInputs, setMessageInputs] = useState<Record<string, string>>({
    mio: "",
    manus: "",
    abacus: "",
    zapier: ""
  });
  const [sharedView, setSharedView] = useState(true);
  
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch messages
  const { data: messages = [], refetch } = trpc.mihub.getMessages.useQuery({
    conversationId,
    limit: 100,
  }, {
    refetchInterval: 2000, // Poll ogni 2 secondi per simulare real-time
  });

  // Send message mutation
  const sendMessage = trpc.mihub.sendMessage.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  // Mark message as read mutation
  const markAsRead = trpc.mihub.markMessageAsRead.useMutation();

  // Auto-scroll to bottom quando arrivano nuovi messaggi
  useEffect(() => {
    Object.values(scrollRefs.current).forEach(ref => {
      if (ref) {
        ref.scrollTop = ref.scrollHeight;
      }
    });
  }, [messages]);

  const handleSendMessage = (agentId: string) => {
    const content = messageInputs[agentId]?.trim();
    if (!content) return;

    sendMessage.mutate({
      conversationId,
      sender: agentId,
      content,
      messageType: "text",
      // Se shared view è attivo, tutti vedono il messaggio
      recipients: sharedView ? undefined : [agentId],
    });

    setMessageInputs(prev => ({
      ...prev,
      [agentId]: ""
    }));
  };

  const getMessagesForAgent = (agentId: string) => {
    if (sharedView) {
      // Tutti vedono tutti i messaggi
      return messages;
    } else {
      // Solo messaggi inviati/ricevuti da questo agente
      return messages.filter(m => 
        m.sender === agentId || 
        !m.recipients || 
        m.recipients.includes(agentId)
      );
    }
  };

  const renderAgentChat = (agent: Agent) => {
    const agentMessages = getMessagesForAgent(agent.id);
    const Icon = agent.icon;

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${agent.color}`} />
              <div>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{agent.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              {agentMessages.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-3 p-4 pt-0">
          {/* Messages Area */}
          <ScrollArea 
            className="flex-1 pr-4"
            ref={(el) => scrollRefs.current[agent.id] = el}
          >
            <div className="space-y-3">
              {agentMessages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Nessun messaggio
                </div>
              ) : (
                agentMessages.map((msg) => {
                  const isOwnMessage = msg.sender === agent.id;
                  const senderAgent = AGENTS.find(a => a.id === msg.sender);
                  const SenderIcon = senderAgent?.icon || Brain;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwnMessage && (
                        <div className={`flex-shrink-0 ${senderAgent?.color}`}>
                          <SenderIcon className="h-4 w-4 mt-1" />
                        </div>
                      )}
                      
                      <div className={`flex flex-col gap-1 max-w-[80%]`}>
                        {!isOwnMessage && (
                          <span className="text-xs font-medium text-muted-foreground">
                            {senderAgent?.name}
                          </span>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {isOwnMessage && (
                        <div className={`flex-shrink-0 ${agent.color}`}>
                          <Icon className="h-4 w-4 mt-1" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder={`Messaggio da ${agent.name}...`}
              value={messageInputs[agent.id] || ""}
              onChange={(e) => setMessageInputs(prev => ({
                ...prev,
                [agent.id]: e.target.value
              }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(agent.id);
                }
              }}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={() => handleSendMessage(agent.id)}
              disabled={!messageInputs[agent.id]?.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MIHUB Control Center</h1>
          <p className="text-muted-foreground">
            Multi-Agent Coordination System
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant={sharedView ? "default" : "outline"}
            size="sm"
            onClick={() => setSharedView(!sharedView)}
            className="gap-2"
          >
            {sharedView ? (
              <>
                <Eye className="h-4 w-4" />
                Vista Condivisa
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Vista Privata
              </>
            )}
          </Button>

          <Badge variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            {AGENTS.length} Agenti Attivi
          </Badge>
        </div>
      </div>

      {/* Tabs per Mobile */}
      <div className="lg:hidden">
        <Tabs value={activeAgent} onValueChange={setActiveAgent}>
          <TabsList className="grid w-full grid-cols-4">
            {AGENTS.map(agent => {
              const Icon = agent.icon;
              return (
                <TabsTrigger key={agent.id} value={agent.id} className="gap-2">
                  <Icon className={`h-4 w-4 ${agent.color}`} />
                  {agent.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {AGENTS.map(agent => (
            <TabsContent key={agent.id} value={agent.id} className="h-[calc(100vh-200px)]">
              {renderAgentChat(agent)}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Grid per Desktop */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-4 flex-1">
        {AGENTS.map(agent => (
          <div key={agent.id} className="h-[calc(100vh-200px)]">
            {renderAgentChat(agent)}
          </div>
        ))}
      </div>
    </div>
  );
}
