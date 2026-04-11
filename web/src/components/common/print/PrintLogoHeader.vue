<template>
  <div
    style="
      display: flex;
      align-items: center;
      background: #fff;
      height: 70px;
      border-bottom: 3px #f3b228 solid;
    "
  >
    <img
      src="/yukon.svg"
      style="margin: 0 2rem 0 0"
      height="44"
    />
    <h1 style="margin: 0 auto !important; font-size: 14pt !important; font-weight: bold">
      <slot></slot>
    </h1>
  </div>
</template>
