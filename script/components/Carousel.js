export default class Carousel {
  constructor(element) {
    this.carousel = element;
    this.container = this.carousel.querySelector('[data-carousel-container]');

    this.container.scrollLeft = 0;

    this.prevButton = this.carousel.querySelector('[data-carousel-btn="prev"]');
    this.nextButton = this.carousel.querySelector('[data-carousel-btn="next"]');

    this.prevButton.addEventListener('click', () => this.navigateCarousel(-1));
    this.nextButton.addEventListener('click', () => this.navigateCarousel(1));

    this.currentPosition = 0;

    this.toggleButtons();
    this.container.addEventListener('scroll', () => {
      this.toggleButtons();
    });

    this._observeCarouselChanges();
  }

  toggleButtons() {
    const carouselItems = this.container.querySelectorAll('[data-carousel-item]');
    if (carouselItems.length === 0) {
      this.prevButton.style.display = 'none';
      this.nextButton.style.display = 'none';
    } else {
      this.togglePrevButton();
      this.toggleNextButton();
    }
  }

  togglePrevButton() {
    if (this.prevButton) {
      if (this.container.scrollLeft === 0) {
        this.prevButton.style.display = 'none';
      } else {
        this.prevButton.style.display = '';
      }
    }
  }

  toggleNextButton() {
    if (this.nextButton) {
      if (this.container.scrollLeft === (this.container.scrollWidth - this.container.clientWidth)) {
        this.nextButton.style.display = 'none';
      } else {
        this.nextButton.style.display = '';
      }
    }
  }

  navigateCarousel(direction) {
    const isPrevious = direction === -1;
    const isNext = direction === 1;

    this.prevButton.disabled = true;
    this.nextButton.disabled = true;

    const carouselItems = Array.from(this.container.querySelectorAll('[data-carousel-item]'));

    if (carouselItems.length > 0) {
      const isAtStart = this.container.scrollLeft === 0;
      const isAtEnd = this.container.scrollLeft === (this.container.scrollWidth - this.container.clientWidth);

      if ((isPrevious && !isAtStart) || (isNext && !isAtEnd)) {
        const itemRect = carouselItems[0].getBoundingClientRect();
        const itemWidth = itemRect.width;
        const dif = this._getDistanceBetweenElements(carouselItems[0], carouselItems[1]);

        this.currentPosition += direction * (itemWidth + dif);
        this._smoothScrollTo(this.currentPosition, 300, () => {
          this.prevButton.disabled = false;
          this.nextButton.disabled = false;
        });
      }
    }

  }

  _smoothScrollTo(to, duration, callback) {
    let element = this.container;
    let start = this.container.scrollLeft,
      change = to - start,
      currentTime = 0,
      increment = 10;

    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }

    const animateScroll = () => {
      currentTime += increment;
      let val = easeInOutQuad(currentTime, start, change, duration);
      element.scrollLeft = val;
      if (currentTime <= duration) {
        setTimeout(animateScroll, increment);
      } else {
        callback();
      }
    };

    animateScroll();
  }

  _getDistanceBetweenElements(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;

    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance;
  }

  _observeCarouselChanges() {
    const observer = new MutationObserver(() => {
      this.toggleButtons();
    });

    observer.observe(this.container, { childList: true, subtree: true });
  }
}
