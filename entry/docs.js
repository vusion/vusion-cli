import Vue from 'vue';
import * as Components from 'library';
import { installComponents } from 'vusion-utils';

installComponents(Components, Vue);
window.Vue = Vue;
