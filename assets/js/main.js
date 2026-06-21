/**
* Template Name: Craftivo
* Template URL: https://bootstrapmade.com/craftivo-bootstrap-portfolio-template/
* Updated: Oct 04 2025 with Bootstrap v5.3.8
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {

  const body = document.body;

  if (!body.classList.contains('mobile-nav-active')) {

    body.classList.add('mobile-nav-active');

    mobileNavToggleBtn.classList.remove('bi-list');
    mobileNavToggleBtn.classList.add('bi-x');

  } else {

    body.classList.add('mobile-nav-closing');

    mobileNavToggleBtn.classList.remove('bi-x');
    mobileNavToggleBtn.classList.add('bi-list');

    setTimeout(() => {

      body.classList.remove('mobile-nav-active');
      body.classList.remove('mobile-nav-closing');

    }, 450);

  }
}
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();



let scrollTimer;

window.addEventListener('scroll', () => {

  document.body.classList.add('show-scrollbar');
  document.body.classList.remove('hide-scrollbar');

  clearTimeout(scrollTimer);

  scrollTimer = setTimeout(() => {
    document.body.classList.remove('show-scrollbar');
    document.body.classList.add('hide-scrollbar');
  }, 1000);

});



const progressBar =
  document.querySelector('.scroll-progress');

let scrollTimeout;

window.addEventListener('scroll', () => {

  const scrollTop =
    document.documentElement.scrollTop;

  const scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const progress =
    (scrollTop / scrollHeight) * 100;

  progressBar.style.width = progress + '%';

  progressBar.style.opacity = '1';

  clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    progressBar.style.opacity = '0';
  }, 1000);

});

/* ==========================
   AI Assistant
========================== */

window.addEventListener('load', function(){

  const aiBtn = document.getElementById('ai-assistant-btn');
  const aiChat = document.getElementById('ai-chat');
  const closeAi = document.getElementById('close-ai');

  if(!aiBtn || !aiChat || !closeAi){
    console.log('AI elements not found');
    return;
  }

  aiBtn.addEventListener('click', function(){

    aiChat.style.display = 'block';

    aiChat.classList.add('open');

    setTimeout(() => {

      document.getElementById('ai-input').focus();

    }, 200);

  });

  closeAi.addEventListener('click', function(){

    aiChat.classList.remove('open');

    setTimeout(() => {
      aiChat.style.display = 'none';
    }, 350);

  });





const sendBtn = document.getElementById('send-ai');
const input = document.getElementById('ai-input');
const messages = document.getElementById('ai-messages');

let isThinking = false;

async function typeMessage(text){

  const msg = document.createElement('div');

  msg.className = 'ai-message';

  messages.appendChild(msg);

  let current = '';

  const words = text.split(' ');

  for(let i = 0; i < words.length; i++){

    current += words[i] + ' ';

    msg.innerHTML = marked.parse(current);

    messages.scrollTop = messages.scrollHeight;

    await new Promise(resolve =>
      setTimeout(resolve, 25)
    );

  }

}
async function sendMessage() {

  

  const text = input.value.trim();

  if (!text || isThinking) return;
  const suggestions = document.querySelector('.ai-quick-actions');

  if(suggestions){

    suggestions.style.opacity = '0';

    setTimeout(() => {

      suggestions.remove();

    },300);

  }

  const welcomeCard = document.querySelector('.welcome-card');

  if(welcomeCard){

    welcomeCard.remove();

  }

  isThinking = true;

  messages.innerHTML += `
    <div class="user-message">
      ${text}
    </div>
  `;

  messages.scrollTop = messages.scrollHeight;

  input.value = '';

  sendBtn.disabled = true;

  messages.innerHTML += `
  <div id="thinking-message" class="thinking-container">

    <div class="thinking-avatar">
      Z
    </div>

    <div class="thinking-content">

      <div class="thinking-text">
        Zakrom is thinking...
      </div>

      <div class="thinking-bar">
        <div class="thinking-line"></div>
      </div>

    </div>

  </div>
  `;

  messages.scrollTop = messages.scrollHeight;

  try {

    const response = await fetch('chat.php', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        message: text
      })

    });

    const data = await response.json();

    console.log(data);

    document.getElementById('thinking-message')?.remove();

    let reply =
    data.choices?.[0]?.message?.content ||
    data.error?.message ||
    'Unknown error';

    reply = reply
      .replace(/\*\*/g, '')
      .replace(/#+\s/g, '');

      await typeMessage(reply);

  

  } catch (error) {

    console.error(error);

    document.getElementById('thinking-message')?.remove();

    messages.innerHTML += `
      <div class="ai-message">
        Connection error. Please try again.
      </div>
    `;

  } finally {

    isThinking = false;

    sendBtn.disabled = false;

    input.focus();

    messages.scrollTop = messages.scrollHeight;

  }

}

sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keydown', function (e) {

  if (e.key === 'Enter') {

    e.preventDefault();

    sendMessage();

  }

  });
    document.addEventListener('click', function(e){

      const aiChat = document.getElementById('ai-chat');
      const aiBtn = document.getElementById('ai-assistant-btn');

      if(
        aiChat.classList.contains('open') &&
        !aiChat.contains(e.target) &&
        !aiBtn.contains(e.target)
      ){

        aiChat.classList.remove('open');

        setTimeout(() => {

          aiChat.style.display = 'none';

        },350);

      }

    });
  document.addEventListener('keydown', function(e){

    const aiChat = document.getElementById('ai-chat');

    if(
      e.key === 'Escape' &&
      aiChat.classList.contains('open')
    ){

      aiChat.classList.remove('open');

      setTimeout(() => {

        aiChat.style.display = 'none';

      },350);

    }

  });
  
  window.quickAsk = function(text,event){

  if(event){

    event.stopPropagation();

  }

  document.getElementById('ai-input').value = text;

  sendMessage();

}
});
