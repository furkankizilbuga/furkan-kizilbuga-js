(() => {

    const init = async () => {
        await buildHTML();
        buildCSS();
        setEvents();
    };

    const buildHTML = async () => {
        const products = await fetchProducts();
        const html = `
            <div class="carousel-container">
                <div class="carousel-wrapper">
                    <button class="carousel-prev carousel-button"><</button>
                    <div class="carousel-content">
                        <p class="carousel-title">You Might Also Like</p>                     
                        <div class="product-carousel">
                        ${products.map(({ id, name, url, img, price }) => {
                            return `
                                <div id=${id} class="product-card">
                                    <div class="product-favorite">
                                        <svg class="heart-icon" xmlns="http://www.w3.org/2000/svg" width="20.576" height="19.483" viewBox="0 0 20.576 19.483">
                                            <path fill="none" stroke="#555" stroke-width="1.5px" d="M19.032 7.111c-.278-3.063-2.446-5.285-5.159-5.285a5.128 5.128 0 0 0-4.394 2.532 4.942 4.942 0 0 0-4.288-2.532C2.478 1.826.31 4.048.032 7.111a5.449 5.449 0 0 0 .162 2.008 8.614 8.614 0 0 0 2.639 4.4l6.642 6.031 6.755-6.027a8.615 8.615 0 0 0 2.639-4.4 5.461 5.461 0 0 0 .163-2.012z" transform="translate(.756 -1.076)">
                                            </path>
                                        </svg>
                                    </div> 
                                    <a target=_blank href=${url}>
                                        <img class="product-img" src=${img} alt="Product image" />
                                    </a>
                                    <div class="product-info">
                                        <a class="product-name" target=_blank href=${url}>${name}</a>   
                                        <p class="product-price">${price}</p>
                                    </div>
                                </div>
                            `
                        }).join('')} 
                        </div>                   
                    </div>
                    <button class="carousel-next carousel-button">></button>
                </div>
            </div>
        `;

        $('.product-detail').append(html);
    };

    const buildCSS = () => {
        const css = `
            .carousel-container {
                display: flex;
                width: 100%;
                overflow: hidden;
                font-family: "Open Sans", sans-serif;
                align-items: center;
                justify-content: center;
                padding: 60px 0;
            }

            .carousel-wrapper {
                display: flex;
                width: 80vw;
                align-items: center;
                position: relative;
                overflow: hidden;
                padding: 0 50px;
            }

            .carousel-content {
                width: 100%;
            }

            .carousel-title {
                font-size: 32px;
                color: rgb(41, 50, 59);
                padding: 15px 0;
                font-weight: 100;
            }

            .product-carousel {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                overflow: hidden;
                transition: transform 0.3s ease-in-out;
                scroll-behavior: smooth;
            }

            .carousel-button {
                position: absolute;
                background: white;
                font-size: 24px;
                color: rgba(16, 16, 16, 0.3);
                border: 1px solid rgba(16, 16, 16, 0.1);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .carousel-prev {
                left: 0;
            }

            .carousel-next {
                right: 0;
            }

            .product-card {
                display: flex;
                flex-direction: column;
                min-width: 210px;
                min-height: 380px;
                width: 210px;
                height: 380px;
                position: relative;
            }

            .product-favorite {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                top: 10px;
                right: 10px;
                font-size: 24px;
                color: red;
                cursor: pointer;
                z-index: 10;
                background: white;
                width: 34px;
                height: 34px;
                border-radius: 10%;
                border: 1px solid rgba(41, 38, 38, 0.23);
            }

            .product-img {
                width: 100%;
                height: auto;
            }

            .product-info {
                display: flex;
                flex-direction: column;
                padding: 5px 10px;
                background: white;
                height: 100%;
                overflow: hidden;
            }

            .product-name {
                font-size: 14px;
                padding: 0;
                margin: 0 0 10px;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                text-overflow: ellipsis;
            }

            .product-name,
            .product-name:hover {
                text-decoration: none;
                color: rgb(48, 46, 43);
            }

            .product-price {
                color: rgb(25, 61, 176);
                font-weight: 700;
                font-size: 18px;
                margin: 0;
            }
        `;

        $('<style>').addClass('carousel-style').html(css).appendTo('head');
    };

    const fetchProducts = async () => {
        const baseURL = "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json";

        //If there are already fetched products, check if they are outdated. If not, use them.
        if(localStorage.getItem('products')) {
            const productsFetchTime = JSON.parse(localStorage.getItem('productsFetchTime'));

            //If it has been less than an hour since last fetch, use them.
            if(Date.now() - productsFetchTime < 1000 * 60 * 60) {
                return JSON.parse(localStorage.getItem('products'));
            }

        }
        
        try {
            const response = await fetch(baseURL);
            if(response.ok) {
                const data = await response.json();
                localStorage.setItem('products', JSON.stringify(data));
                localStorage.setItem('productsFetchTime', Date.now());
                return data;
            } else {
                console.error('An error occured while fetching: ' + err.message);
                throw new Error('Fetch failed with status: ' + response.status);
            }

        } catch (err) {
            console.error('An error occured while fetching: ' + err.message);
            throw new Error(err);
        }
    }

    const setEvents = () => {
        //Elements Needed
        const carousel = document.querySelector('.product-carousel');
        let position = 0; //Current position.
        let limit = carousel.scrollWidth - carousel.clientWidth; //Limit of the position.

        //A helper function maintaining that position stays within the limits.
        const updatePosition = (num) => {
            if(num < 0) return 0;
            else if(num > limit) return limit;
            else return num;
        }

        //Scroll handler for buttons and keys.
        const scroll = (direction) => {
            //Width of every element in carousel.
            const productCardWidth = 222;

            if(direction === 'right') {
                position += productCardWidth;   
            } else {
                position -= productCardWidth;
            }   

            position = updatePosition(position);

            carousel.scrollTo({
                left: position,
                behavior: 'smooth'
            })

            
        }

        //Button Event Arrangements
        const buttonHandler = () => {

            const prevButton = document.querySelector('.carousel-prev');
            const nextButton = document.querySelector('.carousel-next');

            prevButton.addEventListener('click', () => scroll('left'));
            nextButton.addEventListener('click', () => scroll('right'));
        }

        //Mouse Event Arrangements
        const mouseEventHandler = () => {
            let mousePosition;
            const handleMouseDown = (e) => {
                mousePosition = e.clientX;
                e.preventDefault();

                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
            }

            const handleMouseMove = (e) => {
                
                const currentMousePosition = e.clientX;
                const diff = mousePosition - currentMousePosition;

                position = updatePosition(position + diff);
                mousePosition = currentMousePosition;

                carousel.scrollTo({
                    left: position,
                })
            }

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }

            carousel.addEventListener('mousedown', handleMouseDown)
        }

        //Touch Event Arrangements
        const touchEventHandler = () => {
            let touchPosition;
            const handleTouchStart = (e) => {
                touchPosition = e.touches[0].clientX;
                e.preventDefault();

                document.addEventListener('touchmove', handleTouchMove)
                document.addEventListener('touchend', handleTouchEnd)
            }

            const handleTouchMove = (e) => {
                
                const currentTouchPosition = e.touches[0].clientX;
                const diff = touchPosition - currentTouchPosition;

                position = updatePosition(position + diff);
                touchPosition = currentTouchPosition;

                carousel.scrollTo({
                    left: position,
                })
            }

            const handleTouchEnd = () => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            }

            carousel.addEventListener('touchstart', handleTouchStart)
        }

        //Keyboard Event Arrangements
        const keyboardEventHandler = () => {
            
            const handleKeyboardScroll = (e) => {
                switch(e.key) {
                    case 'ArrowLeft':
                        scroll('left');
                        break;
                    case 'ArrowRight':
                        scroll('right');
                        break;
                }
            }

            const checkCarouselView = () => {
                const carouselViewInfo = carousel.getBoundingClientRect();

                if (carouselViewInfo.top >= 0 && carouselViewInfo.bottom <= window.innerHeight) {
                    document.addEventListener('keydown', handleKeyboardScroll);
                } else {
                    document.removeEventListener('keydown', handleKeyboardScroll);
                }
            }

            checkCarouselView();
            window.addEventListener('scroll', checkCarouselView);
            window.addEventListener('resize', checkCarouselView);
        }

        //Favorite Button Arrangements
        const handleFavorite = () => {
            const productCards = document.querySelectorAll('.product-card');
            let favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
            const products = JSON.parse(localStorage.getItem('products'));

            if(!productCards) return;

            //Fill the heart if the product is a favorite on initial load.
            const updateOnInitial = () => {
                if(!favoriteProducts) return;

                for(let product of productCards) {
                    if(favoriteProducts && favoriteProducts.some(favorite => favorite.id == product.getAttribute('id'))) {
                        product.querySelector('.heart-icon path').setAttribute('fill', 'blue');
                    }
                }
            }

            //Click handling works for adding and removing favorites.
            const handleFavoriteClick = (e) => {
                e.stopPropagation()

                const product = e.target.closest('.product-card');
            
                //If the product is already in favorites, remove it.
                if(favoriteProducts.some(favorite => favorite.id == product.id)) {
                    favoriteProducts = favoriteProducts.filter(favorite => favorite.id != product.id);
                    localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
                    product.querySelector('.heart-icon path').setAttribute('fill', 'none');
                    return;
                }

                //If the product is not in favorites, add it.
                const productToAdd = products.find(item => item.id == product.id);
                favoriteProducts.push(productToAdd);
                localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
                product.querySelector('.heart-icon path').setAttribute('fill', 'blue');
                
            }

            //Add event listeners to all heart icons.
            const favoriteIcons = document.querySelectorAll('.product-favorite');
            favoriteIcons.forEach(heartIcon => {
                heartIcon.addEventListener('click', handleFavoriteClick);
            });

            updateOnInitial();
        }

        buttonHandler();
        mouseEventHandler();
        touchEventHandler();
        keyboardEventHandler();
        handleFavorite();

    }

    init();

})();