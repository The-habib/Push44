# Security Boundary & Isolation Map

## Trust Boundary Architecture

```
                    External Internet
                            |
                 [Network Egress Boundary]
                            |
              Replit Container Environment
                 /                            Application Code            Replit Shell (Runner)
                                       |
                           Replit Local Unix IPC
                                       |
                         PID1 / PID2 / PortAuthority
```

## Security Constraints Enforced
1. **Container Isolation**: Unprivileged non-root user execution (`runner`, UID 1000).
2. **Read-Only System Mounts**: `/nix/store`, `/usr`, `/etc` are protected overlay mounts.
3. **No Unauthenticated External Access**: Cloud SDKs require user authorization.
