import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { useState } from "react";
var format = require("xml-formatter");
import copy from "copy-to-clipboard";

export default function Home() {
  const [text, setText] = useState("first name\nlast name\naddress 1\n");
  const [result, setResult] = useState("");
  const [type, setType] = useState("DT");
  const [template, setTemplate] = useState("ccw");
  const [header, setHeader] = useState("header");
  const [file, setFile] = useState("separator");
  const [separator, setSeparator] = useState(",");
  const [focus, setFocus] = useState(false);
  const [report_uri, setReportUri] = useState("");

  function handleChange(event) {
    setText(event.target.value);
  }

  function handleReportUri(event) {
    setReportUri(event.target.value);
  }

  function handleTypeChange(event) {
    setType(event.target.value);
  }

  function handleHeaderChange(event) {
    setHeader(event.target.value);
  }

  function handleTemplateChange(event) {
    setTemplate(event.target.value);
  }

  function handleFileChange(event) {
    setFile(event.target.value);
  }

  function handleFocus() {
    setFocus(!focus);
  }

  function handleSeparator(event) {
    setSeparator(
      event.target.value[0] == undefined || event.target.value[0] == '"'
        ? ""
        : event.target.value[0]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    var stringArray = text.replace(/["']/g, "_").split("\n");

    var xml = "";
    var xmlBody = "";

    if (type == "DT" || type == "CR_DT") {
      stringArray
        .filter((x) => x != "")
        .forEach(
          (element) =>
            (xml =
              xml +
              `<${element.replace(/[^a-zA-Z0-9]/g, "_")} ${
                file == "fixed" ? 'xtt:fixedLength="10"' : ""
              }><xsl:value-of select="'${element}'"/></${element.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              )}>`)
        );
      stringArray
        .filter((x) => x != "")
        .forEach(
          (element) =>
            (xmlBody =
              xmlBody +
              `<${element.replace(/[^a-zA-Z0-9]/g, "_")} ${
                file == "fixed" ? 'xtt:fixedLength="10"' : ""
              }><xsl:value-of select=""/></${element.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              )}>`)
        );

      setResult(
        format(`
      <?xml version="1.0" encoding="UTF-8"?>
  <xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" ${
      type == "CR_DT"
        ? 'xmlns:wd="urn:com.workday.report/' +
          (report_uri != "" ? report_uri : "YOUR_REPORT_NAME_HERE") +
          '"'
        : template == "ccw"
        ? 'xmlns:ws="urn:com.workday/workersync"'
        : 'xmlns:bc="urn:com.workday/bc"'
    }
    xmlns:xtt="urn:com.workday/xtt" xmlns:etv="urn:com.workday/etv">
    <xsl:output method="xml" indent="yes"/>
    <xsl:template match="/">

      <File xtt:separator="&#xD;&#xA;" ${
        file == "fixed" ? 'xtt:align="left" xtt:paddingCharacter=" "' : ""
      }>
        
        ${
          header == "header"
            ? `<!-- HEADER -->
        <Header ${file == "separator" ? `xtt:separator="${separator}"` : ""}>
          ${xml}
        </Header>`
            : ""
        } 
        <!-- RECORDS -->
        <xsl:for-each select="${
          type == "CR_DT"
            ? "wd:Report_Data/wd:Report_Entry"
            : template == "ccw"
            ? "ws:Worker_Sync/ws:Worker"
            : "bc:Benefits_Extract_Employees/bc:Employee"
        }">
          <Record ${file == "separator" ? `xtt:separator="${separator}"` : ""}>
          ${xmlBody}
    
          </Record>
        </xsl:for-each>
      </File>


    </xsl:template>
  </xsl:stylesheet>`)
      );
    } else {
      stringArray
        .filter((x) => x != "")
        .forEach(
          (element, idx, array) =>
            (xml =
              xml +
              `<${element.replace(/[^a-zA-Z0-9]/g, "_")}>${
                file == "fixed"
                  ? `<xsl:value-of select="substring(concat('${element}',$spaces),1,10)"/>`
                  : `<xsl:value-of select="'${element}'"/>`
              }</${element.replace(/[^a-zA-Z0-9]/g, "_")}>${
                idx === array.length - 1 || file == "fixed"
                  ? ""
                  : '<xsl:value-of select="$separator"/>'
              }`)
        );

      // xml = file == 'separator' ? stringArray.filter(x => x != '').join(separator) : stringArray.filter(x => x != '').join()
      stringArray
        .filter((x) => x != "")
        .forEach(
          (element, idx, array) =>
            (xmlBody =
              xmlBody +
              `<${element.replace(/[^a-zA-Z0-9]/g, "_")}>${
                file == "fixed"
                  ? '<xsl:value-of select="substring(concat(wd:field,$spaces),1,10)"/>'
                  : '<xsl:value-of select=""/>'
              }</${element.replace(/[^a-zA-Z0-9]/g, "_")}>${
                idx === array.length - 1 || file == "fixed"
                  ? ""
                  : '<xsl:value-of select="$separator"/>'
              }`)
        );

      setResult(
        format(`
      <?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="xsl" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    version="2.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:wd="urn:com.workday.report/${
      report_uri != "" ? report_uri : "YOUR_REPORT_NAME_HERE"
    }"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:saxon="http://saxon.sf.net/"
    extension-element-prefixes="saxon">
    <xsl:output method="text"/>
    <xsl:variable name="linefeed" select="'&#xA;'"/>

    ${
      file == "separator"
        ? `<xsl:variable name="separator" select="'${separator}'"/>`
        : ""
    }
    

    ${
      file == "fixed"
        ? `<!-- filler of 100 spaces -->
    <xsl:variable name="spaces" select="'                                                                                                    '"/>
    
    <!-- Use the following to have a right or left justified fixed width file:
    
    Left justified: <xsl:value-of select="substring(concat(wd:field,$spaces),1,10)"/>

    Right justified: <xsl:value-of select="concat(substring($spaces,1,10 - string-length(wd:field)),wd:field)"/>

    -->
    `
        : ""
    }


    
    <xsl:template match="/">
    ${
      header == "header"
        ? `<!-- HEADER -->
        <Header>
        ${xml}
        </Header>  
        
       
        <xsl:value-of select="$linefeed"/>`
        : ""
    } 
        <!-- RECORDS -->
        <xsl:for-each select="wd:Report_Data/wd:Report_Entry">
          
          <Record>
            ${xmlBody}
          </Record>

          <xsl:value-of select="$linefeed"/>

        </xsl:for-each>
    </xsl:template>

    

   
      `)
      );
    }
  }
  var buttonStyle;
  if (focus) {
    buttonStyle = {
      cursor: "pointer",
      border: "1px",
      padding: "10px",
      backgroundColor: "#166534",
      borderRadius: "6px",
      width: "50%",
      margin: "50px 0",
      color: "white",
      maxWidth: "250px",
    };
  } else {
    buttonStyle = {
      cursor: "pointer",
      border: "1px",
      padding: "10px",
      backgroundColor: "#22c55e",
      borderRadius: "6px",
      width: "50%",
      margin: "50px 0",
      color: "white",
      maxWidth: "250px",
    };
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Workday XSLT Starter File Generator</title>
        <meta name="description" content="XSLT Generator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h2 className={styles.title}>Workday XSLT Starter File Generator</h2>

      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            width: "50%",
            fontSize: "x-small",
            fontStyle: "italic",
            backgroundColor: "black",
            color: "white",
            padding: "5px",
            border: "1px solid",
            marginBottom: "5px",
            minWidth: "250px",
            maxWidth: "500px",
          }}
        >
          <p style={{ margin: 0 }}>
            Enter your headers as a list. This generator will create a field for
            each line. You can enter words separated by a space and the program
            will join them with a "_" for XML nodes. All non-alphanumeric
            characters except for single and double quotes will be replaced by
            underscores for XML nodes but will be left the same for header
            titles. Single and double quotes will be replaced by underscores for
            both, XML nodes and header titles.
          </p>
        </div>

        <textarea
          style={{ minHeight: "100px" }}
          value={text}
          onChange={handleChange}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            rowGap: "10px",
            columnGap: "2em",
          }}
        >
          <div>
            <h4>Type of Transformation</h4>
            <form>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="DT"
                    checked={type == "DT"}
                    onChange={handleTypeChange}
                  />
                  Connector + Document Transformation
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="CR_DT"
                    checked={type == "CR_DT"}
                    onChange={handleTypeChange}
                  />
                  Custom Report + Document Transformation
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="EIB"
                    checked={type == "EIB"}
                    onChange={handleTypeChange}
                  />
                  Custom Report + EIB (no xtt or etv)
                </label>
              </div>
            </form>
          </div>

          <div>
            <h4>Include Header</h4>
            <form>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="header"
                    checked={header == "header"}
                    onChange={handleHeaderChange}
                  />
                  Yes
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="no-header"
                    checked={header == "no-header"}
                    onChange={handleHeaderChange}
                  />
                  No
                </label>
              </div>
            </form>
          </div>

          <div>
            <h4>Type of File</h4>
            <form>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="separator"
                    checked={file == "separator"}
                    onChange={handleFileChange}
                  />
                  Separator
                </label>

                <input
                  style={{
                    width: "20px",
                    textAlign: "center",
                    marginLeft: "10px",
                  }}
                  type="text"
                  value={separator}
                  onChange={handleSeparator}
                  disabled={file == "fixed" ? true : ""}
                />
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="fixed"
                    checked={file == "fixed"}
                    onChange={handleFileChange}
                  />
                  Fixed Length
                </label>
              </div>
            </form>
          </div>
        </div>
        {type == "EIB" || type == "CR_DT" ? (
          <div>
            <h4>Report URI</h4>
            <form>
              <div>
                <label>
                  urn:com.workday.report/
                  <input
                    style={{
                      width: "200px",
                    }}
                    placeholder="YOUR_REPORT_NAME_HERE"
                    type="text"
                    value={report_uri.replace(/[^a-zA-Z0-9_-]/g, "")}
                    onChange={handleReportUri}
                    disabled={type == "DT" ? true : ""}
                  />
                </label>
              </div>
            </form>
          </div>
        ) : (
          ""
        )}
        {type == "DT" ? (
          <div style={{ marginBottom: "20px" }}>
            <h4>Template</h4>
            <form>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="ccw"
                    checked={template == "ccw"}
                    onChange={handleTemplateChange}
                  />
                  Core Connector Worker
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="bc"
                    checked={template == "bc"}
                    onChange={handleTemplateChange}
                  />
                  Benefits Connector
                </label>
              </div>
            </form>

            <div style={{ marginTop: "10px" }}>
              <a
                style={{ borderBottom: "1px solid" }}
                href="https://rpaulin.notion.site/Element-Transformation-Validation-ETV-XTT-c1a29619a836415ca6624c9043ce883e"
                alt="alt text"
                target="_blank"
                rel="noopener noreferrer"
              >{`--> ETV and XTT docs <--`}</a>
            </div>
          </div>
        ) : (
          ""
        )}

        <button
          style={buttonStyle}
          onClick={handleSubmit}
          onMouseDown={handleFocus}
          onMouseUp={handleFocus}
        >
          Generate XSLT
        </button>
      </div>

      <hr style={{ marginBottom: "50px" }} />

      {result == "" ? (
        ""
      ) : (
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "right",
            }}
          >
            <button style={{}} onClick={() => copy(result)}>
              Copy to clipboard
            </button>
          </div>
          <pre
            style={{
              border: "1px dashed green",
              padding: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              color: "green",

              wordWrap: "break-word",
            }}
          >
            {result}
          </pre>

          {/* <div style={{ minWidth: '80%' }}>
            <textarea style={{backgroundColor:'black',color: 'green',border: '1px dashed green', padding: '5px', width: '100%', minHeight: '500px' }} readOnly value={result} />
          </div> */}
        </div>
      )}
      <div style={{ textAlign: "center" }}>
        <h5>
          Made by{" "}
          <a
            style={{ borderBottom: "1px solid" }}
            href="https://www.linkedin.com/in/rpaulin90/"
            alt="Ricardo Paulin"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ricardo Paulin
          </a>
        </h5>
      </div>
    </div>
  );
}
