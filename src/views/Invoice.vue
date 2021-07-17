<template>
  <div class="invoice">
    <ViewInvoice />
  </div>
</template>

<script>
// @ is an alias to /src
import ViewInvoice from "@/components/ViewInvoice.vue";

export default {
  name: "View Invoice",
  components: {
    ViewInvoice,
  },
};
</script>
