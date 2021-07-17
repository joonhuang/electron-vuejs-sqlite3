<template>
  <div>
    <div class="tab-pane p-3 fade show active">
      <div class="row">
        <div class="col-md-12" id="transactions">
          <h3>Here is a list of your invoices</h3>
          <table class="table table-hover" id="invoicesTable">
            <thead>
              <tr>
                <th scope="col">Invoice #</th>
                <th scope="col">Invoice Name</th>
                <th scope="col">Total Price</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr :key="invoice.id" v-for="invoice in invoices">
                <td>{{ invoice.id }}</td>
                <td>{{ invoice.name }}</td>
                <td>{{ invoice.price }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#viewtransactionModal"
                    v-on:click="getTransactionByInvoiceName(invoice.name)"
                  >
                    View Transactions
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      id="viewtransactionModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="viewTransactionModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewTransactionModalLabel">
              Transactions
            </h5>
            <button
              type="button"
              class="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
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
                <tr :key="txn.productName" v-for="txn in transactions">
                  <td>{{ txn.productName }}</td>
                  <td>{{ txn.quantity }}</td>
                  <td>{{ txn.unitPrice }}</td>
                  <td>{{ txn.totalPrice }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const electron = window.require("electron");
let ipc = electron.ipcRenderer;

import "bootstrap/dist/css/bootstrap.min.css";
import "jquery/dist/jquery.min.js";
//Datatable Modules
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import $ from "jquery";

export default {
  name: "ViewInvoices",
  data() {
    return {
      invoices: [],
      transactions: [],
    };
  },
  mounted() {
    this.getInvoices();
  },
  methods: {
    getInvoices() {
      ipc.send("getInvoice");
      ipc.once("getInvoiceResults", async (event, result) => {
        this.invoices = result;
        setTimeout(function () {
          $("#invoicesTable").DataTable();
        }, 3000);
      });
    },
    getTransactionByInvoiceName(invoiceName) {
      ipc.send("getTransactionsByInvoiceName", invoiceName);
      ipc.once("getTransactionsByInvoiceNameResults", async (event, result) => {
        this.transactions = result;
      });
    },
  },
};
</script>