export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // 1. Check if the request is for a decentralized domain
    // Example: vitalik.eth.smech.xyz
    const isDecentralized = hostname.includes('.eth.') || 
                            hostname.includes('.hns.') || 
                            hostname.includes('.crypto.');

    if (isDecentralized) {
      // Extract the target (e.g., "vitalik.eth")
      const targetDomain = hostname.replace('.smech.xyz', '');

      // 2. The SDS Bridge Logic:
      // We use your NextDNS DoH to resolve the blockchain domain.
      // Since standard browsers can't see .eth, we bridge to a gateway 
      // based on the TLD.
      let gateway = '';
      if (targetDomain.endsWith('.eth')) {
        gateway = 'eth.limo';
      } else if (targetDomain.endsWith('.hns')) {
        gateway = 'hns.is';
      } else {
        gateway = 'unstoppable.link'; // For .crypto, .nft, etc.
      }

      // 3. Perform the Bridge
      const bridgeUrl = `https://${targetDomain}.${gateway}${url.pathname}${url.search}`;
      
      try {
        const response = await fetch(bridgeUrl, {
          headers: {
            'X-SDS-Bridge-ID': '1d46d8', // Your NextDNS ID for tracking
            'User-Agent': request.headers.get('User-Agent')
          }
        });

        // Return the content from the decentralized web to the user
        return response;
      } catch (e) {
        return new Response(`SDS Bridge Error: Could not resolve ${targetDomain}`, { status: 500 });
      }
    }

    // 4. Default landing page for smech.xyz
    return new Response(`
      <style>body{font-family:sans-serif; background:#111; color:#eee; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0;}</style>
      <h1>SDS Bridge</h1>
      <p>Status: <span style="color:#0f0">Operational</span></p>
      <p>Resolver: NextDNS (1d46d8)</p>
      <hr style="width:200px; border:0.5px solid #333">
      <p>Try: <a href="http://vitalik.eth.smech.xyz" style="color:#4af">vitalik.eth.smech.xyz</a></p>
    `, {
      headers: { 'content-type': 'text/html' },
    });
  }
};