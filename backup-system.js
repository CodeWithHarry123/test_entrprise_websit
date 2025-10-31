'''// backup-system.js (for Admin panel)
class BackupSystem {
    async exportAllData() {
        showToast('Starting data export... This may take a moment.', 'info');
        try {
            const collections = ['bookings', 'users', 'settings', 'reports'];
            const exportData = {};

            for (const collectionName of collections) {
                const snapshot = await db.collection(collectionName).get();
                exportData[collectionName] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }

            // Convert to JSON and trigger download
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `khatu_shyam_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link);

            showToast('Data exported successfully!', 'success');

        } catch (error) {
            console.error('Export failed:', error);
            showToast('Data export failed. See console for details.', 'error');
        }
    }

    async importData(file) {
        if (!file) {
            showToast('Please select a file to import.', 'warning');
            return;
        }

        showToast('Starting data import... Do not close this page.', 'info');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Basic validation
                if (typeof data !== 'object' || data === null) {
                    throw new Error('Invalid backup file format.');
                }

                for (const [collectionName, documents] of Object.entries(data)) {
                    if (!Array.isArray(documents)) continue;

                    // Firestore batch writes are limited to 500 operations.
                    // We need to process the import in chunks.
                    const chunks = [];
                    for (let i = 0; i < documents.length; i += 400) {
                        chunks.push(documents.slice(i, i + 400));
                    }

                    for (const chunk of chunks) {
                        const batch = db.batch();
                        chunk.forEach(doc => {
                            if (doc.id) {
                                const docRef = db.collection(collectionName).doc(doc.id);
                                // Remove id from the data object before setting
                                const { id, ...docData } = doc;
                                batch.set(docRef, docData);
                            }
                        });
                        await batch.commit();
                    }
                    console.log(`Imported ${documents.length} documents into ${collectionName}`);
                }
                
                showToast('Data imported successfully! The page will now reload.', 'success');
                setTimeout(() => window.location.reload(), 2000);

            } catch (error) {
                console.error('Import failed:', error);
                showToast(`Import failed: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }
}
'''