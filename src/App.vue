<!-- <template>
  <div is-centered id="app">
    <h1>Upload any CSV file</h1>
    <div class="columns is-mobile is-centered">
      <label class="file-label">
        <input
          class="file-input"
          accept=".csv"
          @change="handleFileUpload($event)"
          type="file"
          name="resume"
        />
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-upload"></i>
          </span>
          <span class="file-label"> Choose a file… </span>
        </span>
      </label>
    </div>
    <div class="table-container">
      <table
        class="table is-centered is-bordered is-striped is-narrow is-hoverable"
        v-if="parsed"
        style="height: 10%"
      >
        <thead>
          <tr>
            <th
              v-for="(header, key) in content.meta.fields"
              v-bind:key="'header-' + key"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowKey) in content.data"
            v-bind:key="'row-' + rowKey"
          >
            <td
              v-for="(column, columnKey) in content.meta.fields"
              v-bind:key="'row-' + rowKey + '-column-' + columnKey"
            >
              <input disabled v-model="content.data[rowKey][column]" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="is-centered">
      <div
        class="is-centered is-mobile"
        style="width: 500px"
        v-if="parsed && data"
      >
        <multiselect
          v-model="value"
          :multiple="true"
          :options="populate(data)"
        ></multiselect>
        <button @click="appendFullAddress(value)">Submit</button>
      </div>
      <button v-if="finalFile" @click="downloadCSV">Download</button>
    </div>
  </div>
</template> -->

<template>
  <div class="container">
    <section class="is-centered section">
      <h1 class="title is-centered">Upload a CSV File</h1>
      <h2 class="subtitle">
        Upload a CSV file Select the Columns which contains values required for
        <strong>Full Address</strong>, in a sorted way which will create a new
        column from which Latitude and Longitude will be pulled.
      </h2>
      <div class="level-item">
        <div class="field has-addons">
          <p class="control">
            <label class="file-label">
              <input
                class="file-input"
                accept=".csv"
                @change="handleFileUpload($event)"
                type="file"
                name="resume"
              />
              <span class="file-cta">
                <span class="file-icon">
                  <i class="fas fa-upload"></i>
                </span>
                <span class="file-label"> Choose a file… </span>
              </span>
            </label>
          </p>
          <div
            style="
              overflow: auto !important;
              width: 40%;
              margin-left: auto;
              margin-right: auto;
            "
          >
            <table
              class="table is-centered is-bordered is-striped is-narrow"
              v-if="parsed"
              style="height: 10%"
            >
              <thead>
                <tr>
                  <th
                    v-for="(header, key) in content.meta.fields"
                    v-bind:key="'header-' + key"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowKey) in content.data"
                  v-bind:key="'row-' + rowKey"
                >
                  <td
                    v-for="(column, columnKey) in content.meta.fields"
                    v-bind:key="'row-' + rowKey + '-column-' + columnKey"
                  >
                    <input disabled v-model="content.data[rowKey][column]" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    <section class="is-centered section">
      <div class="is-centered" style="width: 400px" v-if="parsed && data">
        <multiselect
          v-model="value"
          :multiple="true"
          :options="populate(data)"
        ></multiselect>
        <br />

        <div class="buttons">
          <b-button
            @click="appendFullAddress(value)"
            v-if="!loading && !finalFile"
            type="is-primary"
            >Submit</b-button
          >
          <b-button v-if="loading" loading>Loading</b-button>
        </div>
      </div>
      <div class="buttons container">
        <b-button type="is-danger" v-if="finalFile" @click="downloadCSV"
          >Download</b-button
        >
      </div>
    </section>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import Papa from "papaparse";
import axios from "axios";
import { exportCsv } from "json2csv-export";
export default {
  name: "App",

  data() {
    return {
      file: "",
      content: [],
      data: null,
      parsed: false,
      value: "",
      finalFile: null,
      loading: false,
    };
  },

  components: { Multiselect },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.parseFile();
    },
    parseFile() {
      Papa.parse(this.file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          this.data = results;
          this.content = results;
          this.parsed = true;
        }.bind(this),
      });
    },
    populate(data) {
      return data.meta.fields;
    },
    async appendFullAddress(value) {
      this.loading = true;
      var values = this.data.data;
      let fullAdd = "";
      for (let i in values) {
        for (let j in value) {
          fullAdd += `${values[i][value[j]]},`;
        }
        values[i].fullAddress = fullAdd;
        fullAdd = "";
      }
      for (let i in values) {
        const response = await axios.get(
          `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?address=${values[i]["fullAddress"]},USA&outFields=spatialReference&f=json&token=AAPKdd84528b16704b289cf51c15139276e0HIfS3WpPA4JDFiF1n9JcmDh_QGIXsQWPbKLxYO2-AWsSR4mwkgWTOjDBBamSLqOP`
        );
        values[i]["latitude"] = response.data.candidates[0].location.y;
        values[i]["longitude"] = response.data.candidates[0].location.x;

        console.log(response.data.candidates[0].location.x);
        console.log(response.data.candidates[0].location.y);
      }
      console.log(values);

      this.finalFile = values;
      this.loading = false;
      return values;
    },
    downloadCSV() {
      var data = this.finalFile;
      exportCsv({ data, filename: "updated" });
    },
  },
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
