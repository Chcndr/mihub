/**
 * Response Generator - Generazione risposta finale
 *
 * Sintetizza le risposte degli agenti in una risposta finale per l'utente.
 *
 * Modalità:
 * - auto: Sintetizza risposte multiple agenti
 * - manual: Restituisce direttamente risposta agente target
 */
/**
 * Genera risposta finale per l'utente
 */
export async function generateFinalResponse(userMessage, agentResponses, mode) {
    // Modalità manuale: restituisci direttamente risposta agente
    if (mode === 'manual') {
        if (agentResponses.length === 0) {
            return 'Nessuna risposta dall\'agente.';
        }
        const response = agentResponses[0];
        if (response.error) {
            return `❌ **Errore:** ${response.error}`;
        }
        return response.content;
    }
    // Modalità auto: sintetizza risposte multiple agenti
    if (agentResponses.length === 0) {
        return 'Nessun agente ha risposto alla richiesta.';
    }
    // Se un solo agente ha risposto, restituisci direttamente
    if (agentResponses.length === 1) {
        const response = agentResponses[0];
        if (response.error) {
            return `❌ **Errore da ${response.agentId}:** ${response.error}`;
        }
        return `**${getAgentName(response.agentId)}** ha elaborato la richiesta:\n\n${response.content}`;
    }
    // Multiple agenti: sintetizza risposte
    let finalResponse = `Ho coordinato **${agentResponses.length} agenti** per elaborare la tua richiesta:\n\n`;
    for (const response of agentResponses) {
        const agentName = getAgentName(response.agentId);
        if (response.error) {
            finalResponse += `### ❌ ${agentName}\n\n`;
            finalResponse += `Errore: ${response.error}\n\n`;
        }
        else {
            finalResponse += `### ✅ ${agentName}\n\n`;
            finalResponse += `${response.content}\n\n`;
        }
        finalResponse += '---\n\n';
    }
    // Aggiungi riepilogo
    const successfulAgents = agentResponses.filter(r => !r.error);
    const failedAgents = agentResponses.filter(r => r.error);
    finalResponse += '## 📊 Riepilogo\n\n';
    finalResponse += `- ✅ Agenti completati: ${successfulAgents.length}\n`;
    if (failedAgents.length > 0) {
        finalResponse += `- ❌ Agenti con errori: ${failedAgents.length}\n`;
    }
    return finalResponse;
}
/**
 * Ottieni nome leggibile agente
 */
function getAgentName(agentId) {
    const names = {
        mio_dev: 'MIO Dev (GitHub & Sviluppo)',
        abacus: 'Abacus (Analisi & Metriche)',
        zapier: 'Zapier (Automazioni)',
        manus_worker: 'Manus Worker (Task Operativi)'
    };
    return names[agentId] || agentId;
}
/**
 * Formatta risposta con emoji e stile
 */
export function formatResponse(content, agentId) {
    const emojis = {
        mio_dev: '💻',
        abacus: '📊',
        zapier: '⚡',
        manus_worker: '🎫'
    };
    const emoji = emojis[agentId] || '🤖';
    return `${emoji} **${getAgentName(agentId)}**\n\n${content}`;
}
/**
 * Genera riepilogo conversazione
 */
export function generateConversationSummary(messages) {
    if (messages.length === 0) {
        return 'Nessun messaggio nella conversazione.';
    }
    const userMessages = messages.filter(m => m.sender === 'user').length;
    const agentMessages = messages.filter(m => m.sender !== 'user').length;
    return `**Conversazione:** ${messages.length} messaggi totali (${userMessages} utente, ${agentMessages} agenti)`;
}
/**
 * Estrai azioni da risposta agente
 * (per future integrazioni con task engine)
 */
export function extractActions(content) {
    const actions = [];
    // Pattern per identificare azioni
    const actionPatterns = [
        /\[ \] (.+)/g, // Checklist
        /TODO: (.+)/gi,
        /Action: (.+)/gi,
        /Next step: (.+)/gi
    ];
    for (const pattern of actionPatterns) {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            actions.push(match[1].trim());
        }
    }
    return actions;
}
