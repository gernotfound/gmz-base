import Peer, { type DataConnection } from 'peerjs';
import type { Forza4Player } from './gameLogic';
import {
  createHostCode,
  isPeerMessage,
  isValidCode,
  normalizeCode,
  type PeerMessage,
  type SyncPayload,
} from './protocol';

export const CONNECTION_TIMEOUT_MS = 8_000;
export const RECONNECT_GRACE_MS = 12_000;
export const RECONNECT_RETRY_MS = 1_400;

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'lost';
export type PlayerNumber = 0 | 1 | 2;

type Status = { text: string; error: boolean };

type ConnectedEvent = {
  reconnected: boolean;
  isHost: boolean;
};

export interface Forza4PeerSessionCallbacks {
  onConnectionState: (state: ConnectionState) => void;
  onStatus: (text: string, error: boolean) => void;
  onPeerReady: (ready: boolean) => void;
  onHostCode: (code: string) => void;
  onRemoteCode: (code: string) => void;
  onPrepareOnlineSession: (player: Exclude<PlayerNumber, 0>) => void;
  onConnected: (event: ConnectedEvent) => void;
  onSync: (payload: SyncPayload) => void;
  onMove: (col: number, player: Forza4Player) => void;
  onRestartRequest: () => void;
  onRestartAccept: () => void;
  onRestartDecline: () => void;
  buildSyncPayload: () => SyncPayload;
  isGameOver: () => boolean;
  getCurrentPlayer: () => Forza4Player;
}

export function getPeerErrorStatus(errorType: string): Status {
  if (errorType === 'unavailable-id') {
    return { text: 'Codice host già in uso. Ricarica la pagina per generarne uno nuovo.', error: true };
  }
  if (errorType === 'peer-unavailable') {
    return { text: 'Host non trovato. Controlla il codice e riprova.', error: true };
  }
  return { text: 'Errore di rete. Riprova tra qualche secondo.', error: true };
}

export function getReconnectStatus(isHost: boolean, manualRetry = false): Status {
  if (manualRetry) {
    return {
      text: isHost ? 'Attendo il rientro dell’avversario…' : 'Provo a riconnettermi…',
      error: false,
    };
  }
  return {
    text: isHost
      ? 'Connessione interrotta · attendo il rientro dell’avversario…'
      : 'Connessione interrotta · provo a rientrare…',
    error: false,
  };
}

export class Forza4PeerSession {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private peerReady = false;
  private connectionState: ConnectionState = 'idle';
  private remoteCode = '';
  private isHost = false;
  private sessionStarted = false;
  private intentionalDisconnect = false;
  private onlineEnabled = true;
  private assignedPlayer: PlayerNumber = 0;
  private connectionTimeout: number | null = null;
  private reconnectExpiry: number | null = null;
  private reconnectRetry: number | null = null;
  private reconnectDeadline = 0;
  private disposed = false;

  constructor(private readonly callbacks: Forza4PeerSessionCallbacks) {}

  start(initialJoinCode: string | null) {
    if (this.peer || this.disposed) return;

    const hostCode = createHostCode();
    const peer = new Peer(`F4-${hostCode}`);
    this.peer = peer;

    peer.on('open', () => {
      if (this.disposed || this.peer !== peer) return;
      this.peerReady = true;
      this.callbacks.onPeerReady(true);
      this.callbacks.onHostCode(hostCode);

      if (initialJoinCode) this.connect(initialJoinCode);
      else {
        this.setConnectionState('idle');
        this.setStatus('Scegli online o partita locale');
      }
    });

    peer.on('connection', connection => this.handleIncomingConnection(connection));
    peer.on('error', error => this.handlePeerError(error.type));
  }

  setOnlineEnabled(enabled: boolean) {
    this.onlineEnabled = enabled;
    if (enabled) {
      this.intentionalDisconnect = false;
      return;
    }

    this.intentionalDisconnect = true;
    this.sessionStarted = false;
    this.clearConnectionTimeout();
    this.clearReconnectTimers();
    const connection = this.connection;
    this.connection = null;
    connection?.close();
    this.setConnectionState('idle');
  }

  setRemoteCode(rawCode: string) {
    const code = normalizeCode(rawCode);
    this.remoteCode = code;
    this.callbacks.onRemoteCode(code);
    return code;
  }

  connect(rawCode: string) {
    if (!this.peer || !this.peerReady || this.connectionState === 'connecting') return false;
    this.onlineEnabled = true;
    this.startOutgoingConnection(this.peer, rawCode, false);
    return true;
  }

  isConnected() {
    return this.connectionState === 'connected' && Boolean(this.connection?.open);
  }

  sendMove(col: number, player: Forza4Player) {
    if (!this.connection?.open || this.connectionState !== 'connected') return false;
    this.connection.send({ type: 'move', col, playerNum: player } satisfies PeerMessage);
    return true;
  }

  requestRestart() {
    if (!this.connection?.open || this.connectionState !== 'connected') {
      this.setStatus('La connessione con l’avversario è interrotta', true);
      return false;
    }
    this.connection.send({ type: 'restart-request' } satisfies PeerMessage);
    this.setStatus('Richiesta di rivincita inviata…');
    return true;
  }

  acceptRestart() {
    if (!this.connection?.open) return false;
    this.connection.send({ type: 'restart-accept' } satisfies PeerMessage);
    return true;
  }

  declineRestart() {
    if (!this.connection?.open) return false;
    this.connection.send({ type: 'restart-decline' } satisfies PeerMessage);
    return true;
  }

  retryReconnect() {
    if (!this.onlineEnabled || !this.sessionStarted) return false;
    this.clearReconnectTimers();
    this.reconnectDeadline = Date.now() + RECONNECT_GRACE_MS;
    this.setConnectionState('reconnecting');
    const status = getReconnectStatus(this.isHost, true);
    this.setStatus(status.text, status.error);
    this.reconnectExpiry = window.setTimeout(() => this.expireReconnect(), RECONNECT_GRACE_MS);
    if (!this.isHost) this.scheduleGuestReconnect(100);
    return true;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.peerReady = false;
    this.callbacks.onPeerReady(false);
    this.intentionalDisconnect = true;
    this.sessionStarted = false;
    this.clearConnectionTimeout();
    this.clearReconnectTimers();
    const connection = this.connection;
    this.connection = null;
    connection?.close();
    this.peer?.destroy();
    this.peer = null;
  }

  private setStatus(text: string, error = false) {
    this.callbacks.onStatus(text, error);
  }

  private setConnectionState(state: ConnectionState) {
    this.connectionState = state;
    this.callbacks.onConnectionState(state);
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout !== null) window.clearTimeout(this.connectionTimeout);
    this.connectionTimeout = null;
  }

  private clearReconnectTimers() {
    if (this.reconnectExpiry !== null) window.clearTimeout(this.reconnectExpiry);
    if (this.reconnectRetry !== null) window.clearTimeout(this.reconnectRetry);
    this.reconnectExpiry = null;
    this.reconnectRetry = null;
    this.reconnectDeadline = 0;
  }

  private expireReconnect() {
    this.clearReconnectTimers();
    this.connection = null;
    this.setConnectionState('lost');
    this.setStatus('Connessione non ripristinata. La partita resta salvata su questo dispositivo.', true);
  }

  private scheduleGuestReconnect(delay = RECONNECT_RETRY_MS) {
    if (this.isHost || !this.onlineEnabled || this.connectionState !== 'reconnecting') return;
    if (Date.now() >= this.reconnectDeadline) {
      this.expireReconnect();
      return;
    }
    if (this.reconnectRetry !== null) window.clearTimeout(this.reconnectRetry);
    this.reconnectRetry = window.setTimeout(() => {
      this.reconnectRetry = null;
      const peer = this.peer;
      const code = this.remoteCode;
      if (!peer || !this.peerReady || !isValidCode(code) || this.connectionState !== 'reconnecting') return;
      const connection = peer.connect(`F4-${code}`, { reliable: true });
      this.bindConnectionEvents(connection, true);
    }, delay);
  }

  private beginReconnect() {
    if (this.intentionalDisconnect || !this.onlineEnabled || !this.sessionStarted) return;
    if (this.connectionState !== 'reconnecting') {
      this.reconnectDeadline = Date.now() + RECONNECT_GRACE_MS;
      this.setConnectionState('reconnecting');
      const status = getReconnectStatus(this.isHost);
      this.setStatus(status.text, status.error);
      this.reconnectExpiry = window.setTimeout(() => this.expireReconnect(), RECONNECT_GRACE_MS);
    }
    if (!this.isHost) this.scheduleGuestReconnect(200);
  }

  private handleConnectionFailure(connection: DataConnection, reconnectAttempt: boolean) {
    if (this.connection !== connection) return;
    this.connection = null;
    if (this.intentionalDisconnect) return;
    if (this.sessionStarted) {
      this.beginReconnect();
      if (reconnectAttempt && !this.isHost) this.scheduleGuestReconnect();
      return;
    }
    this.clearConnectionTimeout();
    this.setConnectionState('idle');
    this.setStatus('Impossibile aprire la connessione', true);
  }

  private bindConnectionEvents(connection: DataConnection, reconnectAttempt = false) {
    this.connection = connection;

    connection.on('open', () => {
      if (this.connection !== connection || this.disposed) return;
      this.clearConnectionTimeout();
      const reconnected = reconnectAttempt || this.sessionStarted || this.connectionState === 'reconnecting';
      this.clearReconnectTimers();
      this.sessionStarted = true;
      this.onlineEnabled = true;
      this.setConnectionState('connected');
      this.setStatus(reconnected ? 'Riconnesso · partita sincronizzata' : 'Partita online · parte Rosso');
      this.callbacks.onConnected({ reconnected, isHost: this.isHost });
      if (this.isHost) window.setTimeout(() => this.sendSync(), 80);
    });

    connection.on('data', data => {
      if (this.connection !== connection || !isPeerMessage(data)) return;

      if (data.type === 'sync') {
        if (!this.isHost) this.callbacks.onSync(data.payload);
        return;
      }
      if (data.type === 'restart-request') {
        if (this.callbacks.isGameOver()) this.callbacks.onRestartRequest();
        return;
      }
      if (data.type === 'restart-accept') {
        this.callbacks.onRestartAccept();
        return;
      }
      if (data.type === 'restart-decline') {
        this.callbacks.onRestartDecline();
        this.setStatus('L’avversario ha rifiutato la rivincita');
        return;
      }

      const expectedRemotePlayer = this.assignedPlayer === 1 ? 2 : 1;
      if (
        data.playerNum !== expectedRemotePlayer ||
        data.playerNum !== this.callbacks.getCurrentPlayer() ||
        this.callbacks.isGameOver()
      ) return;
      this.callbacks.onMove(data.col, data.playerNum);
    });

    connection.on('close', () => this.handleConnectionFailure(connection, reconnectAttempt));
    connection.on('error', () => this.handleConnectionFailure(connection, reconnectAttempt));
  }

  private startOutgoingConnection(peer: Peer, rawCode: string, reconnectAttempt: boolean) {
    const code = this.setRemoteCode(rawCode);
    if (!isValidCode(code)) {
      this.setStatus('Inserisci un codice valido di 4–6 caratteri', true);
      return;
    }

    this.clearConnectionTimeout();
    this.intentionalDisconnect = false;
    this.isHost = false;

    if (!reconnectAttempt) {
      this.clearReconnectTimers();
      this.sessionStarted = false;
      this.assignedPlayer = 2;
      this.callbacks.onPrepareOnlineSession(2);
      this.setConnectionState('connecting');
      this.setStatus('Connessione in corso…');
    }

    const previousConnection = this.connection;
    this.connection = null;
    previousConnection?.close();
    const connection = peer.connect(`F4-${code}`, { reliable: true });
    this.bindConnectionEvents(connection, reconnectAttempt);

    if (!reconnectAttempt) {
      this.connectionTimeout = window.setTimeout(() => {
        if (!this.sessionStarted && this.connection === connection) {
          this.connection = null;
          connection.close();
          this.setConnectionState('idle');
          this.setStatus('Host non trovato. Controlla il codice e riprova.', true);
        }
      }, CONNECTION_TIMEOUT_MS);
    }
  }

  private handleIncomingConnection(connection: DataConnection) {
    if (!this.onlineEnabled || (this.connection?.open && this.connectionState !== 'reconnecting')) {
      connection.close();
      return;
    }

    this.clearConnectionTimeout();
    const reconnecting = this.sessionStarted && (this.connectionState === 'reconnecting' || this.connectionState === 'lost');
    const previousConnection = this.connection;
    this.connection = null;
    previousConnection?.close();
    this.intentionalDisconnect = false;
    this.isHost = true;

    if (!reconnecting) {
      this.sessionStarted = false;
      this.assignedPlayer = 1;
      this.callbacks.onPrepareOnlineSession(1);
      this.setConnectionState('connecting');
      this.setStatus('Giocatore trovato · connessione…');
    } else {
      this.setConnectionState('reconnecting');
    }

    this.bindConnectionEvents(connection, reconnecting);
  }

  private handlePeerError(errorType: string) {
    if (!this.onlineEnabled || this.disposed) return;
    if (this.connectionState === 'reconnecting' && errorType === 'peer-unavailable') {
      this.scheduleGuestReconnect();
      return;
    }
    if (this.sessionStarted && !this.intentionalDisconnect) {
      this.beginReconnect();
      return;
    }
    this.clearConnectionTimeout();
    this.setConnectionState('idle');
    const status = getPeerErrorStatus(errorType);
    this.setStatus(status.text, status.error);
  }

  private sendSync() {
    if (this.isHost && this.connection?.open) {
      this.connection.send({ type: 'sync', payload: this.callbacks.buildSyncPayload() } satisfies PeerMessage);
    }
  }
}
