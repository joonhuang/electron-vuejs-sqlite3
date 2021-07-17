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
                        <label for="product_modal" class="form-label"
                          >Products:</label
                        >
                        <input
                          class="form-control"
                          list="datalistOptions"
                          id="product_modal"
                          placeholder="Type to search..."
                        />
                        <datalist id="datalistOptions">
                          <option
                            v-bind:key="index"
                            v-for="(product, index) in products"
                          >
                            {{ product.name }}
                          </option>
                        </datalist>
                      </div>
                      <div class="form-group mb-3">
                        <label for="quantity_modal" class="form-label"
                          >Quantity:</label
                        >
                        <input
                          id="quantity_modal"
                          type="number"
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
                    <th scope="col">Product Name</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Unit Price (RM)</th>
                    <th scope="col">Total Price (RM)</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="txn in transactions">
                    <tr :key="txn.productName">
                      <td>{{ txn.productName }}</td>
                      <td>{{ txn.quantity }}</td>
                      <td>{{ txn.unitPrice }}</td>
                      <td>{{ txn.totalPrice }}</td>
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
              <button
                class="btn btn-primary"
                v-on:click="displayAlert = !displayAlert"
              >
                Create Invoice
              </button>
              <div
                class="alert alert-success alert-dismissible fade show"
                role="alert"
                v-if="displayAlert"
              >
                <strong>Holy guacamole!</strong> Invoice Created Sucessfully
                <button
                  type="button"
                  class="close"
                  data-dismiss="alert"
                  aria-label="Close"
                  v-on:click="displayAlert = !displayAlert"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
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
      products: [],
      selectedProducts: {},
      displayAlert: false,
    };
  },
  mounted() {
    this.getProducts();
  },
  methods: {
    getProducts() {
      ipc.send("getProducts");
      ipc.once("getProductsResults", async (event, result) => {
        this.products = result;
      });
    },
    saveTransaction() {
      // append data to the arrays
      let product = document.getElementById("product_modal").value;
      let quantity = document.getElementById("quantity_modal").value;

      if (product.length != 0 && quantity > 0) {
        let totalPrice;
        let unitPrice;
        for (let availableProduct of this.products) {
          if (availableProduct.name === product) {
            unitPrice = availableProduct.price;
            totalPrice = availableProduct.price * quantity;
          }
        }
        this.transactions.push({
          productName: product,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
        });
        this.calcTotal();

        // clear their values
        document.getElementById("product_modal").value = "";
        document.getElementById("quantity_modal").value = "";
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
        total += parseInt(element.totalPrice, 10);
      });
      this.invoice.total_price = total;
    },
    onSubmit() {
      this.transactions.forEach((element) => {
        element.invoiceName = this.invoice.name;
      });
      ipc.send("createInvoice", {
        name: this.invoice.name,
        price: this.invoice.total_price,
      });
      ipc.send("createTrans", this.transactions);
    },
  },
};
</script>