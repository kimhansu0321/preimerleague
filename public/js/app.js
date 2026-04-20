document.addEventListener('DOMContentLoaded', () => {
    const playersGrid = document.getElementById('playersGrid');
    const nationSelect = document.getElementById('nationSelect');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    const modal = document.getElementById('playerModal');
    const closeBtn = document.querySelector('.close-btn');
    const modalBody = document.getElementById('modalBody');

    // Fetch nations for dropdown
    fetchNations();
    // Fetch initial players list
    fetchPlayers();

    // Event Listeners
    nationSelect.addEventListener('change', () => fetchPlayers());
    searchBtn.addEventListener('click', () => fetchPlayers());
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchPlayers();
    });

    closeBtn.onclick = function() {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = "none", 300);
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = "none", 300);
        }
    }

    async function fetchNations() {
        try {
            const res = await fetch('/api/nations');
            const data = await res.json();
            
            data.nations.forEach(nation => {
                const option = document.createElement('option');
                option.value = nation.id;
                option.textContent = nation.name;
                nationSelect.appendChild(option);
            });
        } catch (error) {
            console.error('국가 데이터를 불러오는데 실패했습니다:', error);
        }
    }

    async function fetchPlayers() {
        playersGrid.innerHTML = `<div style="text-align:center; grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
        try {
            const nationId = nationSelect.value;
            const search = searchInput.value;
            let query = `/api/players?`;
            if (nationId) query += `nation_id=${nationId}&`;
            if (search) query += `search=${search}`;

            const res = await fetch(query);
            const data = await res.json();
            
            playersGrid.innerHTML = '';
            
            if (data.players.length === 0) {
                playersGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#94a3b8;">해당 조건을 만족하는 선수가 없습니다.</p>`;
                return;
            }

            data.players.forEach(player => {
                const card = document.createElement('div');
                card.className = 'player-card';
                card.onclick = () => openPlayerModal(player);
                
                const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff&size=250`;
                const imgUrl = player.image_url || fallbackImg;

                card.innerHTML = `
                    <div class="player-image-wrapper">
                        <span class="player-nation">${player.nation_code}</span>
                        <img src="${imgUrl}" alt="${player.name}" onerror="this.onerror=null; this.src='${fallbackImg}';">
                    </div>
                    <div class="player-info">
                        <h3>${player.name}</h3>
                        <div class="player-position">${player.position}</div>
                        <div class="player-stats-mini">
                            <div class="stat-box">
                                <div class="stat-val">${player.appearances}</div>
                                <div class="stat-label">출전</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-val">${player.goals}</div>
                                <div class="stat-label">골</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-val">${player.assists}</div>
                                <div class="stat-label">도움</div>
                            </div>
                        </div>
                    </div>
                `;
                playersGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching players:', error);
            playersGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#ef4444;">데이터를 불러오는 중 오류가 발생했습니다.</p>`;
        }
    }

    function openPlayerModal(player) {
        const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff&size=250`;
        const imgUrl = player.image_url || fallbackImg;

        modalBody.innerHTML = `
            <div class="modal-body-content">
                <div class="modal-img">
                    <img src="${imgUrl}" alt="${player.name}" onerror="this.onerror=null; this.src='${fallbackImg}';">
                </div>
                <div class="modal-details">
                    <h2>${player.name}</h2>
                    <div class="modal-nation-badge"><i class="fa-solid fa-flag"></i> ${player.nation_name}</div>
                    <div class="player-position" style="margin-bottom: 25px;">${player.position}</div>
                    
                    <div class="stats-grid">
                        <div class="detailed-stat-box">
                            <div class="val">${player.appearances}</div>
                            <div class="lbl">출전 경기 수</div>
                        </div>
                        <div class="detailed-stat-box">
                            <div class="val">${player.goals}</div>
                            <div class="lbl">골</div>
                        </div>
                        <div class="detailed-stat-box">
                            <div class="val">${player.assists}</div>
                            <div class="lbl">도움</div>
                        </div>
                        <div class="detailed-stat-box">
                            <div class="val">${player.clean_sheets}</div>
                            <div class="lbl">클린 시트 (무실점)</div>
                        </div>
                        <div class="detailed-stat-box" style="grid-column: 1 / -1;">
                            <div class="val">${player.win_rate}%</div>
                            <div class="lbl">평균 승률</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = "flex";
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }
});
