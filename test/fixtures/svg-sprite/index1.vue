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
    svg-sprite: url('./twitter.svg');
}
.svg {
    width: 50px;
    height: 50px;
    svg-sprite: url('./react.svg');
}
</style>
