<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png" /> -->
    <CreateInvoice />
  </div>
</template>

<script>
// @ is an alias to /src
import CreateInvoice from "@/components/CreateInvoice.vue";

export default {
  name: "Home",
  components: {
    CreateInvoice,
  },
};
</script>
