# Network Capability & Boundary Map

## Empirical Network Test Results

| Destination Target | Protocol | Expected Host | Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| `api.github.com` | HTTPS | `20.207.73.85` | **Reachable** | HTTP 200 OK |
| `registry.npmjs.org` | HTTPS | `registry.npmjs.org` | **Reachable** | HTTP 200 OK |
| `pypi.org` | HTTPS | `pypi.org` | **Reachable** | HTTP 200 OK |
| `package-firewall.replit.local` | HTTP | Internal Mirror | **Reachable** | HTTP 200 OK |
| DNS Resolution | UDP 53 | Hostname lookup | **Functional** | Resolved `api.github.com` |

---

## Proxy Environment Variables
- `YARN_NPM_REGISTRY_SERVER`: `http://package-firewall.replit.local/npm/`
- `YARN_REGISTRY`: `http://package-firewall.replit.local/npm/`
