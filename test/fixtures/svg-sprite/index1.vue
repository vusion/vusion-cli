<template>
    <div>
        <div :class="$style.root"></div>
        <div :class="$style.svg"></div>
    </div>
</template>

<style module>
.root {
    width: 50px;
    height: 50px;
    background: url('./twitter.svg?sprite=logo');
}
.svg {
    width: 50px;
    height: 50px;
    background: url('./react.svg?sprite=logo');
}
</style>
