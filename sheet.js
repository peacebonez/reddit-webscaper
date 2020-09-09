const { GoogleSpreadsheet } = require("google-spreadsheet");

module.exports = class Sheet {
  constructor() {
    this.doc = new GoogleSpreadsheet(
      "1MjsK8EZbvNquLb0WMOJxTkBC5vxgrB_1Qo9lLM8_tqM"
    );
  }

  async load() {
    await this.doc.useServiceAccountAuth(require("./credentials.json"));
    await this.doc.loadInfo();
  }

  async addSheet(title, headerValues) {
    for (let i = 0; i < this.doc.sheetsByIndex.length; i++) {
      if (this.doc.sheetsByIndex[i].title === title) {
        let toDelete = this.doc.sheetsByIndex[i];
        await toDelete.delete();
      }
    }

    await this.doc.addSheet({ title, headerValues });
    //returns the newest sheet (last in the array)
    return this.doc.sheetsByIndex.length - 1;
  }

  async addRows(rows, i) {
    const sheet = this.doc.sheetsByIndex[i]; // or use this.doc.sheetsById[id]
    await sheet.addRows(rows);
  }

  async getRows() {
    const sheet = this.doc.sheetsByIndex[0]; // or use this.doc.sheetsById[id]
    return await sheet.getRows();
  }
};
