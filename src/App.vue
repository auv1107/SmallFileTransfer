<template>
    <div id="app">
        <el-container>
            <el-header>
                <p>小文件中转</p>
            </el-header>

            <el-main id="main">
                <div v-if="showUpload">
                    <el-tabs class="tab-small" v-model="tabName" type="card" @tab-click="handleClickTab">
                        <br>
                        <el-tab-pane label="上传文件" name="first">
                            <el-upload
                                    class="upload-file"
                                    drag
                                    :http-request="handleUpload"
                                    action="">
                                <i class="el-icon-upload"></i>
                                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                                <div class="el-upload__tip" slot="tip">可上传任意文件，单文件不超过2000kb</div>
                                <div class="el-upload__tip" slot="tip">只作为小文件临时中转，不保证安全和隐私，请勿上传私密文件</div>
                            </el-upload>
                        </el-tab-pane>
                        <el-tab-pane label="提取文件" name="second">
                            <br>
                            <br>
                            <br>
                            <br>
                            <br>
                            <el-input
                                class="input-middle"
                                placeholder="输入提取码"
                                v-model="downloadCode"
                                clearable>
                            </el-input>
                            <el-button @click="handleDownload">提取</el-button>
                        </el-tab-pane>
                        <el-tab-pane label="历史记录" name="third">
                            <el-table
                                    :data="tableData"
                                    style="width: 100%">
                                <el-table-column
                                        prop="file"
                                        label="文件名"
                                        align="left"
                                        width="150">
                                </el-table-column>
                                <el-table-column
                                        align="right"
                                        prop="code"
                                        label="提取码">
                                </el-table-column>
                                <el-table-column
                                        align="right"
                                        label="">
                                    <template slot-scope="scope">
                                        <el-button
                                                size="mini"
                                                @click="handleDownloadRow(scope.row)">提取</el-button>
                                        <el-button
                                                size="mini"
                                                type="danger"
                                                @click="handleDeleteRow(scope.row)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>


                </div>
                <div v-else>
                    <p>
                        提取码
                    </p>
                    <p>{{ fileCode }}</p>
                    <br>
                    <br>
                    <br>
                    <el-button @click="handleShowUpload">返回</el-button>
                </div>

            </el-main>

            <el-footer>
                <p>感谢支持</p>
            </el-footer>
        </el-container>
    </div>
</template>

<script>
    var APP_ID = '1Gb9PlMTvFaBgP1AqSobiYuP-gzGzoHsz';
    var APP_KEY = 'CdNGIbaU4q1H6TVY4fq5ss3u';
    var AV = require('leancloud-storage');

    AV.init({
        appId: APP_ID,
        appKey: APP_KEY
    });


    export default {
        data() {
            return {
                showUpload: true,
                fileCode: '',
                tabName: 'first',
                downloadCode: '',
                tableData: []
            }
        },
        methods: {
            startHacking() {
                this.$notify({
                    title: 'It works!',
                    type: 'success',
                    message: 'We\'ve laid the ground work for you. It\'s time for you to build something epic!',
                    duration: 5000
                })
            },
            handleUpload(info) {
                var that = this;
                console.log(info.file);
                console.log(info.file.name);
                var f = new AV.File(new Date().getUTCMilliseconds() * Math.random(), info.file);
                f.metaData('fileName', info.file.name);
                f.save().then(function(f) {
                    // 文件保存成功
                    console.log(f);
                    that.showUpload = false;
                    that.fileCode = f._qiniu_key.substr(0,5);
                    saveFileCode(info.file, that.fileCode);
                    that.reloadTableData();
                }, function(error) {
                    // 异常处理
                    console.error(error);
                });
            },
            handleShowUpload() {
                this.showUpload = true
            },
            handleClickTab(tab, event) {

            },
            handleDownload() {
                download(this.downloadCode)
            },
            handleDownloadRow(row) {
                download(row.code);
            },
            handleDeleteRow(row) {
                removeCode(row.code);
                this.reloadTableData();
            },
            reloadTableData() {
                this.tableData = getFileInfoList().reverse();
            }
        },
        mounted() {
            this.reloadTableData();
        }
    }

    let KEY_FILE_INFO_LIST = "fileInfoList";

    function saveFileCode(file, code) {
        let fileInfo = {
            file: file.name,
            code: code
        };
        let fileInfoList = getFileInfoList() || [];
        fileInfoList.push(fileInfo);
        localStorage.setItem(KEY_FILE_INFO_LIST, JSON.stringify(fileInfoList));
    }

    function getFileInfoList() {
        return JSON.parse(localStorage.getItem(KEY_FILE_INFO_LIST));
    }

    /**
     * 获取 blob
     * @param  {String} url 目标文件地址
     * @return {Promise}
     */
    function getBlob(url) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                }
            };

            xhr.send();
        });
    }

    /**
     * 保存
     * @param  {Blob} blob
     * @param  {String} filename 想要保存的文件名称
     */
    function saveAs(blob, filename) {
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            const body = document.querySelector('body');

            link.href = window.URL.createObjectURL(blob);
            link.download = filename;

            // fix Firefox
            link.style.display = 'none';
            body.appendChild(link);

            link.click();
            body.removeChild(link);

            window.URL.revokeObjectURL(link.href);
        }
    }

    function download(code) {
        console.log('download ' + code);
        var query = new AV.Query('_File');
        query.startsWith('key', code);
        query.first().then(data => {
            let file = JSON.parse(JSON.stringify(data));
            console.log('got data ' + JSON.stringify(file));
            let url = file.url;
            // window.open(url)
            getBlob(url).then(blob => {
                saveAs(blob, file.metaData.fileName)
            })
        }, error => {
            console.log('error ' + error)
        })
    }

    function removeCode(code) {
        let list = getFileInfoList();
        list = list.filter((item, i) => {
            return item.code !== code;
        });
        localStorage.setItem(KEY_FILE_INFO_LIST, JSON.stringify(list));
    }
</script>

<style>
    #app {
        font-family: Helvetica, sans-serif;
        text-align: center;
    }
    #main {
        height: 400px;
    }
    .input-middle {
        width: 180px;
    }
    .tab-small {
        width: 360px;
        display: inline-block;
        text-align: center;
    }
</style>
