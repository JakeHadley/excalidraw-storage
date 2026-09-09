FROM kiliandeca/excalidraw-storage-backend:latest
USER root
COPY patch.js /patch.js
RUN node /patch.js && rm -f /patch.js
USER node
ENTRYPOINT ["npm", "run", "start:prod"]