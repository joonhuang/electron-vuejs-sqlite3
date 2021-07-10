<template>
  <div class="container">
    <div class="tab-pane p-3 fade show active">
      <div class="row">
        <div class="col-md-12">
          <h3>Enter details below to create invoice</h3>
          <form @submit.prevent="onSubmit">
            <div class="form-group mb-3">
              <label for="create-invoice-name" class="form-label"
                >Invoice Name:</label
              >
              <input
                id="create-invoice-name"
                type="text"
                required
                class="form-control"
                placeholder="Invoice Name"
                v-model="invoice.name"
              />
            </div>

            <div class="form-group mb-3">
              Invoice Price: <span>${{ invoice.total_price }}</span>
            </div>

            <hr />
            <h3>Transactions</h3>
            <div class="form-group">
              <button
                type="button"
                class="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#transactionModal"
              >
                Add Transaction
              </button>

              <!-- Modal -->
              <div
                class="modal fade"
                id="transactionModal"
                tabindex="-1"
                aria-labelledby="transactionModalLabel"
                aria-hidden="true"
              >
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">
                        Add Transaction
                      </h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div class="modal-body">
                      <div class="form-group mb-3">
                        <label for="txn_name_modal" class="form-label"
                          >Transaction name:</label
                        >
                        <input
                          id="txn_name_modal"
                          type="text"
                          class="form-control"
                        />
                      </div>
                      <div class="form-group mb-3">
                        <label for="txn_price_modal" class="form-label"
                          >Price ($):</label
                        >
                        <input
                          id="txn_price_modal"
                          type="numeric"
                          class="form-control"
                        />
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button
                        type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Discard Transaction
                      </button>
                      <button
                        type="button"
                        class="btn btn-primary"
                        data-bs-dismiss="modal"
                        v-on:click="saveTransaction()"
                      >
                        Save Transaction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-12">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Transaction Name</th>
                    <th scope="col">Price ($)</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="txn in transactions">
                    <tr :key="txn.id">
                      <th>{{ txn.id }}</th>
                      <td>{{ txn.name }}</td>
                      <td>{{ txn.price }}</td>
                      <td>
                        <button
                          type="button"
                          class="btn btn-danger"
                          v-on:click="deleteTransaction(txn.id)"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <div class="form-group">
              <button class="btn btn-primary">Create Invoice</button>
              {{ loading }}
              {{ status }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const electron = window.require("electron");
let ipc = electron.ipcRenderer;

export default {
  name: "CreateInvoice",
  data() {
    return {
      invoice: {
        name: "",
        total_price: 0,
      },
      transactions: [],
      nextTxnId: 1,
      loading: "",
      status: "",
    };
  },
  methods: {
    saveTransaction() {
      // append data to the arrays
      let name = document.getElementById("txn_name_modal").value;
      let price = document.getElementById("txn_price_modal").value;

      if (name.length != 0 && price > 0) {
        this.transactions.push({
          id: this.nextTxnId,
          name: name,
          price: price,
        });

        this.nextTxnId++;
        this.calcTotal();

        // clear their values
        document.getElementById("txn_name_modal").value = "";
        document.getElementById("txn_price_modal").value = "";
        ipc.send("getUsers");
        ipc.once("getUsersResults", async (event, result) => {
          console.log(result);
        });
      }
    },
    deleteTransaction(id) {
      let newList = this.transactions.filter(function (el) {
        return el.id !== id;
      });

      this.nextTxnId--;
      this.transactions = newList;
      this.calcTotal();
    },

    calcTotal() {
      let total = 0;

      this.transactions.forEach((element) => {
        total += parseInt(element.price, 10);
      });
      this.invoice.total_price = total;
    },
    onSubmit() {
      const formData = new FormData();

      this.transactions.forEach((element) => {
        formData.append("txn_names[]", element.name);
        formData.append("txn_prices[]", element.price);
      });

      formData.append("name", this.invoice.name);
      //formData.append("user_id", this.$route.params.user.id);
      this.loading = "Creating Invoice, please wait ...";

      // Post to server
    },
  },
};
</script>