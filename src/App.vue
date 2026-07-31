<script setup>
import SampleOne from "./components/practices/basic/SampleOne.vue";
import SampleTwo from "./components/practices/basic/SampleTwo.vue";
import ClassicBinding from "./components/practices/basic/ClassicBinding.vue";
import Vmemo from "./components/practices/basic/Vmemo.vue";
import EventHandler from "./components/practices/basic/EventHandler.vue";
import EventModifier from "./components/practices/basic/EventModifier.vue";
import EventObject from "./components/practices/basic/EventObject.vue";
import FormDataBinding from "./components/practices/basic/FormDataBinding.vue";
import ModelForm from "./components/practices/basic/ModelForm.vue";
import ModelModifier from "./components/practices/basic/ModelModifier.vue";
import StyleScoped from "./components/practices/basic/StyleScoped.vue";
import WeatherPractice from "./components/practices/basic/WeatherPractice.vue";
</script>

<template>
  <div style="padding: 20px">
    <SampleOne />
    <SampleTwo />
    <ClassicBinding />
    <Vmemo />
    <EventHandler />
    <EventObject />
    <EventModifier />
    <FormDataBinding />
    <ModelForm />
    <ModelModifier />
    <StyleScoped />
    <WeatherPractice />
  </div>
</template>
