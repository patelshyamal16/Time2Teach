document.addEventListener('DOMContentLoaded', () => {
  const clock = document.getElementById('clock');
  const clockFace = document.getElementById('clockFace');
  const centerDot = document.getElementById('centerDot');
  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');
  const timeText = document.getElementById('timeText');
  const teachText = document.getElementById('teachText');

  const numberRefs = [];
  let number2 = null;

  // Create clock numbers
  for (let i = 0; i < 12; i++) {
    const angle = (i + 1) * 30;
    const radius = 145;
    const center = 150;
    const x = center + radius * Math.sin((angle * Math.PI) / 180);
    const y = center - radius * Math.cos((angle * Math.PI) / 180);

    const numberDiv = document.createElement('div');
    numberDiv.className = 'clock-number';
    numberDiv.textContent = i + 1;
    numberDiv.style.top = y + 'px';
    numberDiv.style.left = x + 'px';
    clockFace.appendChild(numberDiv);
    numberRefs.push(numberDiv);
    if (i === 1) number2 = numberDiv;
  }

  // Animation sequence
  anime({
    targets: clock,
    scale: 1,
    opacity: 1,
    duration: 1000,
    easing: 'easeOutElastic(1, .8)',
  });

  anime({
    targets: numberRefs,
    opacity: 1,
    scale: 1,
    delay: anime.stagger(100, { start: 500 }),
    easing: 'easeOutBack',
  });

  anime({
    targets: hourHand,
    rotate: '60deg',
    duration: 1000,
    delay: 1500,
    easing: 'easeInOutQuad',
    complete: () => {
      // Fade out all numbers except "2"
      numberRefs.forEach((ref, index) => {
        if (index !== 1 && ref) {
          anime({
            targets: ref,
            opacity: 0,
            scale: 0.5,
            duration: 500,
            easing: 'easeInOutQuad',
          });
        }
      });

      // Fade out minute and second hands, clock face and center dot
      anime({
        targets: [minuteHand, hourHand, secondHand, centerDot],
        opacity: 0,
        duration: 800,
        easing: 'easeInOutQuad',
      });

      clock.classList.add('no-background-border');

      if (number2) {
        anime({
          targets: number2,
          top: '59%',
          left: '50%',
          scale: 2.5,
          translateX: '-50%',
          translateY: '-50%',
          fontSize: '3rem',
          duration: 1000,
          easing: 'easeOutBack',
          complete: () => {
            // Show side texts
            anime({
              targets: timeText,
              opacity: 1,
              translateX: ['-100%', '0%'],
              duration: 1000,
              easing: 'easeOutBack',
            });

            anime({
              targets: teachText,
              opacity: 1,
              translateX: ['100%', '0%'],
              duration: 1000,
              easing: 'easeOutBack',
              complete: () => {
                // After animation completes, redirect to dashboard
                // Fade out the entire clock container before redirecting
                anime({
                  targets: ['.clock-container', 'body'],
                  opacity: 0,
                  duration: 1000,
                  easing: 'easeInOutQuad',
                  complete: () => {
                    window.location.href = '/';
                  }
                });
              },
            });
          },
        });
      }
    },
  });
});
