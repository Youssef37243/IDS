fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;

    setTimeout(() => {
      const burger = document.getElementById('burger');
      const nav = document.getElementById('nav');

      if (burger && nav) {
        burger.addEventListener('click', () => {
          nav.classList.toggle('show');
        });

        const links = nav.querySelectorAll('a');
        links.forEach(link => {
          // Highlight the previously clicked link
          if (link.href === localStorage.getItem('activeHeaderLink')) {
            link.classList.add('clicked');
          }

          link.addEventListener('click', () => {
            localStorage.setItem('activeHeaderLink', link.href);
          });
        });
      }
    }, 100);
  });
