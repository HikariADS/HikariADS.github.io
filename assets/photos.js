/**
 * Loads photo gallery from assets/content/photos.json
 *
 * To add a photo:
 * 1. Put the image file in assets/photos/  (e.g. sunset.jpg)
 * 2. Add an entry below in assets/content/photos.json
 * 3. Commit and push to GitHub — the site will update automatically
 */
async function loadPhotoGallery() {
    const grid = document.getElementById('photo-grid');
    const empty = document.getElementById('photo-empty');
    if (!grid) return;

    try {
        const res = await fetch('/assets/content/photos.json');
        const data = await res.json();
        const photos = data.photos || [];

        if (photos.length === 0) {
            if (empty) empty.style.display = 'block';
            return;
        }

        if (empty) empty.style.display = 'none';

        grid.innerHTML = photos.map(photo => `
            <figure class="photo-card">
                <img src="${photo.src}" alt="${photo.caption || 'Photo'}" loading="lazy">
                ${photo.caption ? `<figcaption>${photo.caption}</figcaption>` : ''}
            </figure>
        `).join('');
    } catch (err) {
        console.error('Failed to load photos:', err);
        if (empty) {
            empty.style.display = 'block';
            empty.textContent = 'Không tải được gallery. Thử lại sau nhé!';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadPhotoGallery);
