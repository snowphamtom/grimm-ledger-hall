/* GRIMM hall client. Signs a designation. Does not send a transaction. Does not admit a ledger line. */
(function () {
  const $ = (id) => document.getElementById(id);
  const out = (id, text) => { const n = $(id); if (n) n.textContent = text; };
  async function sha256(text) {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async function connect() {
    if (!window.ethereum) { out('wallet', 'No injected wallet. Hash still works. Nothing is admitted.'); return null; }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    out('wallet', accounts[0] + ' · chain ' + chainId + ' · session only');
    return { address: accounts[0], chainId };
  }
  async function sign() {
    const session = await connect();
    if (!session) return;
    const raw = ($('line') && $('line').value) || '';
    const lineHash = raw ? await sha256(raw) : 'none';
    const msg = ['GRIMM hall designation','domain: grimm-ledger-hall','chain_head_seq: 182','prev_hash: sha256:259e15b770b7d2cc30a98638182ea2684ccd500271845f9ca5c34cbfcfd9da16','seals: VERIFIED | PARTIALLY_VERIFIED | UNVERIFIED','refused: FACT | TRL6','address: ' + session.address,'chain_id: ' + session.chainId,'line_sha256: ' + lineHash,'stamp: NOT ADMITTED','effect: no transfer, no ledger append, no forge edit'].join('\n');
    const signature = await window.ethereum.request({ method: 'personal_sign', params: [msg, session.address] });
    out('signed', 'NOT ADMITTED\n' + msg + '\n\nsignature ' + signature + '\nchain head remains seq182');
  }
  function boot() {
    const c = $('connect'); const s = $('sign'); const seal = $('seal');
    if (c) c.addEventListener('click', () => connect().catch(e => out('wallet', 'Wallet refused: ' + (e && e.message ? e.message : e))));
    if (s) s.addEventListener('click', () => sign().catch(e => out('signed', 'Sign refused: ' + (e && e.message ? e.message : e))));
    if (seal) seal.addEventListener('click', async () => { const raw = ($('line') && $('line').value) || ''; out('plate', 'NOT ADMITTED · sha256 ' + await sha256(raw) + ' · chain head remains seq182'); });
    const manifest = $('manifest');
    if (manifest) sha256(manifest.textContent).then(hex => out('door', 'door sha256 ' + hex));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
