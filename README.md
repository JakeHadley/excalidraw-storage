# excalidraw-storage

Patched build of `kiliandeca/excalidraw-storage-backend` for use with a Redis
Keyv backend (fixes `ERR_INVALID_ARG_TYPE` crash on GET by emitting stored
values as strings/Buffers instead of raw JSON-parsed objects).

Used as the self-hosted Excalidraw storage backend (scenes, rooms, files).