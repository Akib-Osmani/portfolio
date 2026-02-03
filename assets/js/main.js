(function(){
  const USERNAME = 'Akib-Osmani';
  const API = 'https://api.github.com';
  const cacheKey = 'cs_portfolio_cache_v3';
  const cacheTTL = 1000 * 60 * 30; // 30 minutes

  const els = {
    avatar: document.getElementById('avatar'),
    brandAvatar: document.getElementById('brand-avatar'),
    fullName: document.getElementById('full-name'),
    tagline: document.getElementById('tagline'),
    name: document.getElementById('name'),
    bio: document.getElementById('bio'),
    followers: document.getElementById('followers'),
    publicRepos: document.getElementById('public-repos'),
    totalStars: document.getElementById('total-stars'),
    statsCounters: document.querySelectorAll('[data-counter]'),
    projectsGrid: document.getElementById('projects-grid'),
    highlights: document.getElementById('highlights'),
    social: document.getElementById('social-links'),
    contactGithub: document.getElementById('contact-github'),
    contactSocial: document.getElementById('contact-social'),
    footerLinks: document.getElementById('footer-links'),
    programmingLanguages: document.getElementById('programming-languages'),
    locationDetail: document.getElementById('location-detail'),
    locationText: document.getElementById('location-text'),
    emailDetail: document.getElementById('email-detail'),
    emailLink: document.getElementById('email-link'),
    emailMethod: document.getElementById('email-method'),
    contactEmailLink: document.getElementById('contact-email-link'),
    cvDownloadBtns: document.querySelectorAll('.cv-download')
  };

  // CV Download functionality
  function setupCVDownload() {
    const cvUrl = 'assets/cv/Akib_Osmani_CV.pdf'; // You'll need to add your CV file here
    
    els.cvDownloadBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if CV file exists, otherwise show message
        fetch(cvUrl, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              // Create download link
              const link = document.createElement('a');
              link.href = cvUrl;
              link.download = 'Akib_Osmani_CV.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              alert('CV file not found. Please add your CV to assets/cv/Akib_Osmani_CV.pdf');
            }
          })
          .catch(() => {
            alert('CV will be available soon. Please contact me directly for now.');
          });
      });
    });
  }

  function saveCache(data){
    try{ localStorage.setItem(cacheKey, JSON.stringify({ts: Date.now(), data})); }catch(e){}
  }
  
  function loadCache(){
    try{
      const raw = localStorage.getItem(cacheKey);
      if(!raw) return null;
      const {ts, data} = JSON.parse(raw);
      if(Date.now() - ts > cacheTTL) return null;
      return data;
    }catch(e){ return null }
  }

  async function gh(path){
    const res = await fetch(`${API}${path}`);
    if(!res.ok) throw new Error(`GitHub API error ${res.status}`);
    return res.json();
  }

  function formatNumber(n){
    return Intl.NumberFormat().format(n);
  }

  function languageColor(lang){
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C': '#555555',
      'C#': '#178600',
      'Go': '#00ADD8',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Shell': '#89e051',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Kotlin': '#A97BFF',
      'Dart': '#00B4AB',
      'Rust': '#dea584',
      'Swift': '#F05138',
      'React': '#61dafb',
      'Vue': '#4fc08d',
      'Node.js': '#339933'
    };
    return colors[lang] || '#34495e';
  }

  function escapeHTML(str){
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]));
  }

  function animateCounters(vals){
    els.statsCounters.forEach(el => {
      const key = el.getAttribute('data-counter');
      const target = +vals[key] || 0;
      const dur = 1200;
      const start = performance.now();
      function step(now){
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = formatNumber(Math.floor(target * eased));
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function extractSocials(profile){
    const socials = [];
    
    // Always include GitHub
    socials.push({
      network: 'GitHub',
      url: `https://github.com/${USERNAME}`,
      label: `@${profile.login}`,
      icon: 'fab fa-github'
    });

    // Email
    if(profile.email) {
      socials.push({
        network: 'Email',
        url: `mailto:${profile.email}`,
        label: profile.email,
        icon: 'fas fa-envelope'
      });
    }

    // Twitter/X
    if(profile.twitter_username){
      socials.push({
        network: 'Twitter',
        url: `https://twitter.com/${profile.twitter_username}`,
        label: `@${profile.twitter_username}`,
        icon: 'fab fa-twitter'
      });
    }

    // Parse blog field for additional links
    if(profile.blog){
      const urls = profile.blog.split(/[\s,;|]+/).filter(Boolean);
      urls.forEach(url => {
        const normalizedUrl = normalizeUrl(url);
        if(normalizedUrl) {
          const network = getNetworkFromUrl(normalizedUrl);
          socials.push({
            network: network.name,
            url: normalizedUrl,
            label: network.label,
            icon: network.icon
          });
        }
      });
    }

    return socials;
  }

  function normalizeUrl(url){
    if(!url) return '';
    let u = String(url).trim();
    if(!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try{ new URL(u); return u; }catch(e){ return ''; }
  }

  function getNetworkFromUrl(url){
    try{
      const {hostname} = new URL(url);
      const host = hostname.replace(/^www\./,'').toLowerCase();
      
      if(host.includes('linkedin.com')) return {name: 'LinkedIn', label: 'LinkedIn Profile', icon: 'fab fa-linkedin'};
      if(host.includes('twitter.com') || host === 'x.com') return {name: 'Twitter', label: 'Twitter Profile', icon: 'fab fa-twitter'};
      if(host.includes('instagram.com')) return {name: 'Instagram', label: 'Instagram', icon: 'fab fa-instagram'};
      if(host.includes('youtube.com')) return {name: 'YouTube', label: 'YouTube Channel', icon: 'fab fa-youtube'};
      if(host.includes('medium.com')) return {name: 'Medium', label: 'Medium Blog', icon: 'fab fa-medium'};
      if(host === 'dev.to') return {name: 'Dev.to', label: 'Dev.to Profile', icon: 'fab fa-dev'};
      if(host.includes('leetcode.com')) return {name: 'LeetCode', label: 'LeetCode Profile', icon: 'fas fa-code'};
      if(host.includes('stackoverflow.com')) return {name: 'Stack Overflow', label: 'Stack Overflow', icon: 'fab fa-stack-overflow'};
      
      return {name: 'Website', label: 'Personal Website', icon: 'fas fa-globe'};
    }catch(e){ 
      return {name: 'Website', label: 'Website', icon: 'fas fa-globe'}; 
    }
  }

  function updateProfile(profile){
    // Basic info
    els.avatar.src = profile.avatar_url;
    els.brandAvatar.src = profile.avatar_url;
    els.fullName.textContent = profile.name || profile.login;
    els.name.textContent = profile.name || profile.login;
    
    // Enhanced bio for CS students
    let bio = profile.bio || 'Computer Science student passionate about software development and technology.';
    if(!profile.bio) {
      bio += ' Always eager to learn new technologies and contribute to meaningful projects.';
    }
    els.bio.textContent = bio;

    // Location
    if(profile.location) {
      els.locationDetail.style.display = '';
      els.locationText.textContent = profile.location;
    }

    // Email
    if(profile.email) {
      els.emailDetail.style.display = '';
      els.emailLink.href = `mailto:${profile.email}`;
      els.emailLink.textContent = profile.email;
      
      els.emailMethod.style.display = '';
      els.contactEmailLink.href = `mailto:${profile.email}`;
      els.contactEmailLink.textContent = profile.email;
    }

    // Social links
    const socials = extractSocials(profile);
    
    // Hero social links
    // Don't update if socials are empty to preserve default links
    if(socials.length > 1) {
      els.social.innerHTML = socials.slice(0, 4).map(s => 
        `<a href="${s.url}" target="_blank" rel="noopener" title="${s.network}">
          <i class="${s.icon}"></i> ${s.network}
        </a>`
      ).join('');
    }

    // Contact social links
    els.contactSocial.innerHTML = socials.slice(1, 4).map(s => 
      `<a class="btn outline small" href="${s.url}" target="_blank" rel="noopener">
        <i class="${s.icon}"></i> ${s.network}
      </a>`
    ).join('');

    // Footer links
    els.footerLinks.innerHTML = socials.slice(0, 5).map(s => 
      `<a href="${s.url}" target="_blank" rel="noopener">${s.network}</a>`
    ).join('');

    // Update GitHub link
    els.contactGithub.href = `https://github.com/${USERNAME}`;
  }

  function updateStats(profile, repos){
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    
    const stats = {
      'followers': profile.followers,
      'public-repos': profile.public_repos,
      'total-stars': totalStars
    };

    animateCounters(stats);
  }

  function updateSkills(repos){
    // Extract languages from repositories
    const languages = {};
    repos.forEach(repo => {
      if(repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Sort by frequency and create skill tags
    const sortedLangs = Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    els.programmingLanguages.innerHTML = sortedLangs.map(([lang, count]) => 
      `<span class="skill-tag">
        <span class="dot" style="background-color:${languageColor(lang)}"></span>
        ${lang}
      </span>`
    ).join('');
  }

  function updateProjects(repos){
    // Filter and sort repositories
    const featured = repos
      .filter(repo => !repo.fork && !repo.archived)
      .sort((a, b) => {
        // Prioritize: stars, recent activity, then name
        const scoreA = a.stargazers_count * 10 + (new Date(a.updated_at).getTime() / 1000000000);
        const scoreB = b.stargazers_count * 10 + (new Date(b.updated_at).getTime() / 1000000000);
        return scoreB - scoreA;
      })
      .slice(0, 6);

    els.projectsGrid.innerHTML = featured.map(repo => {
      const tags = [];
      if(repo.language) {
        tags.push(`<span class="tag">
          <span class="dot" style="background-color:${languageColor(repo.language)}"></span>
          ${repo.language}
        </span>`);
      }
      if(repo.topics && repo.topics.length > 0) {
        repo.topics.slice(0, 2).forEach(topic => {
          tags.push(`<span class="tag">${topic}</span>`);
        });
      }

      return `
        <div class="card repo">
          <div class="repo-top">
            <h3>${escapeHTML(repo.name)}</h3>
            <div style="display:flex;gap:.5rem;align-items:center;color:var(--muted);font-size:.9rem">
              <span title="Stars">⭐ ${repo.stargazers_count}</span>
              <span title="Forks">🍴 ${repo.forks_count}</span>
            </div>
          </div>
          <p class="desc">${escapeHTML(repo.description || 'A project showcasing programming skills and creativity.')}</p>
          <div class="tags">${tags.join('')}</div>
          <div class="actions">
            <a class="btn small" href="${repo.html_url}" target="_blank" rel="noopener">
              <i class="fab fa-github"></i> View Code
            </a>
            ${repo.homepage ? `<a class="btn outline small" href="${repo.homepage}" target="_blank" rel="noopener">
              <i class="fas fa-external-link-alt"></i> Live Demo
            </a>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function updateHighlights(profile, repos){
    const highlights = [];
    
    if(repos.length > 5) highlights.push(`${repos.length}+ repositories created`);
    if(profile.followers > 10) highlights.push(`${profile.followers} GitHub followers`);
    
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    if(totalStars > 0) highlights.push(`${totalStars} total stars earned`);
    
    const languages = new Set(repos.filter(r => r.language).map(r => r.language));
    if(languages.size > 3) highlights.push(`${languages.size} programming languages used`);
    
    // Add some default CS student highlights
    highlights.push('Active in open source community');
    highlights.push('Continuous learner in computer science');
    
    els.highlights.innerHTML = highlights.slice(0, 4).map(h => `<li>${h}</li>`).join('');
  }

  async function loadData(){
    try {
      const cached = loadCache();
      if(cached) {
        updateProfile(cached.profile);
        updateStats(cached.profile, cached.repos);
        updateSkills(cached.repos);
        updateProjects(cached.repos);
        updateHighlights(cached.profile, cached.repos);
        return;
      }

      // Fetch fresh data
      const [profile, repos] = await Promise.all([
        gh(`/users/${USERNAME}`),
        gh(`/users/${USERNAME}/repos?per_page=100&sort=updated`)
      ]);

      const data = { profile, repos };
      saveCache(data);

      updateProfile(profile);
      updateStats(profile, repos);
      updateSkills(repos);
      updateProjects(repos);
      updateHighlights(profile, repos);

    } catch(error) {
      console.error('Failed to load GitHub data:', error);
      
      // Fallback content for CS student
      els.bio.textContent = 'Computer Science student passionate about software development, algorithms, and creating innovative solutions through code.';
      els.highlights.innerHTML = `
        <li>Computer Science student</li>
        <li>Passionate about software development</li>
        <li>Always learning new technologies</li>
        <li>Open to collaboration opportunities</li>
      `;
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupCVDownload();
    loadData();
  });

})();