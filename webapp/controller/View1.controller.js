sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/m/Label",
    "sap/m/Text",
    "sap/ui/table/Column",
    "sap/m/ColumnListItem",
    "sap/m/Column"
], (Controller, JSONModel, ValueHelpDialog, Label, Text, UIColumn, ColumnListItem, MColumn) => {
    "use strict";

    return Controller.extend("mutlivaluefield.controller.View1", {
        onInit() {
            this._loadProductModel();
            var oModel = new sap.ui.model.json.JSONModel({
                SelectedItems: []
            });
            this.getView().setModel(oModel, "viewModel");
        },

        /** Load JSON Model Directly in onInit */
        _loadProductModel: function () {
            var oData = {
                ZSALESREPORT: [
                    { ProductCode: "P001", ProductName: "Laptop" },
                    { ProductCode: "P002", ProductName: "Smartphone" },
                    { ProductCode: "P003", ProductName: "Tablet" },
                    { ProductCode: "P004", ProductName: "Monitor" },
                    { ProductCode: "P005", ProductName: "Keyboard" }
                ]
            };

            // Create JSON model and set it to the view
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "productModel");
        },

        /** Open Value Help Dialog */
        onValueHelp: function () {
            var oView = this.getView();

            if (!this._oValueHelpDialog) {
                this._oValueHelpDialog = new ValueHelpDialog({
                    title: "Select Product",
                    supportMultiselect: true,
                    supportRanges: true,
                    key: "ProductCode",
                    descriptionKey: "ProductName",
                    ok: this.onValueHelpOk.bind(this),
                    cancel: this.onValueHelpCancel.bind(this)
                });

                oView.addDependent(this._oValueHelpDialog);
            }

            // Set Model to Dialog
            var oModel = this.getView().getModel("productModel");
            this._oValueHelpDialog.setModel(oModel, "productModel");

            // Get Table and Bind Data
            this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(oModel, "productModel");

                // For Desktop: sap.ui.table.Table
                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", {
                        path: "productModel>/ZSALESREPORT"
                    });

                    // Add Columns
                    oTable.addColumn(new UIColumn({
                        label: new Label({ text: "Product Code" }),
                        template: new Text({ text: "{productModel>ProductCode}" })
                    }));

                    oTable.addColumn(new UIColumn({
                        label: new Label({ text: "Product Name" }),
                        template: new Text({ text: "{productModel>ProductName}" })
                    }));
                }

                // For Mobile: sap.m.Table
                if (oTable.bindItems) {
                    oTable.bindAggregation("items", {
                        path: "productModel>/ZSALESREPORT",
                        template: new ColumnListItem({
                            cells: [
                                new Text({ text: "{productModel>ProductCode}" }),
                                new Text({ text: "{productModel>ProductName}" })
                            ]
                        })
                    });

                    oTable.addColumn(new MColumn({ header: new Label({ text: "Product Code" }) }));
                    oTable.addColumn(new MColumn({ header: new Label({ text: "Product Name" }) }));
                }

                this._oValueHelpDialog.update();
            }.bind(this));

            // Open Dialog
            this._oValueHelpDialog.open();
        },

        /** Handle OK Button */
        onValueHelpOk: function (oEvent) {
            var aTokens = oEvent.getParameter("tokens");
            var oMultiInput = this.getView().byId("multiInput");
            
            // Clear previous tokens
            oMultiInput.removeAllTokens();
        
            // Store selected items in model
            var aSelectedItems = aTokens.map((oToken) => ({
                ID: oToken.getKey(),
                Name: oToken.getText(),
            }));
        
            var oModel = this.getView().getModel("viewModel");
            oModel.setProperty("/SelectedItems", aSelectedItems);
        
            // Add tokens to MultiInput manually
            aTokens.forEach((oToken) => {
                oMultiInput.addToken(new sap.m.Token({
                    key: oToken.getKey(),
                    text: oToken.getText()
                }));
            });
        
            this._oValueHelpDialog.close();
        },

        /** Handle Cancel Button */
        onValueHelpCancel: function () {
            this._oValueHelpDialog.close();
        }
    });
});
