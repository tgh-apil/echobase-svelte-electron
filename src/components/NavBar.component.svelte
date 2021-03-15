<script>
	import { currentPage } from '../stores.js';

    let currentButton = 'main';

    function changeView(pageView) {
        currentPage.update(src => src = pageView);
        console.log($currentPage);
        currentButton = pageView;
    }
</script>

<main class="nav-top">
    <div class="button-container">
        <button class = "{currentButton === 'main' ? 'selected' : 'not-selected'}" on:click={() => changeView('main')}>Main</button>
        <button class = "{currentButton === 'overview' ? 'selected' : 'not-selected'}" on:click={() => changeView('overview')}>Overview</button>
    </div>
    <div class="logo-container">
        <p class="nav-logo">Echobase</p>
    </div>
</main>

<style>
    .nav-top {
        display:grid;
        grid-template-columns: 3fr 1.5fr;
        align-items: center;
    }

    .nav-logo {
        color: #ff264e;
        font-family: 'Lobster', cursive;
        font-size: 70px;
        text-align: right;
        padding-right: 20px;
        margin: 0px;
    }

    .not-selected {
        font-size: 20px;
        border-color: transparent;
        color: #fff;
    }

    .not-selected:hover {
        color: #ff264e;
        border-radius: 2px;
        border-bottom: 2px solid #ff264e;
    }

    .selected {
        font-size: 20px;
        border-color: transparent;
        color: #ff264e;
        border-radius: 2px;
        border-bottom: 2px solid #ff264e;
    }
</style>