import * as React from "react";
import PropTypes from "prop-types";
import Header from "./Header";
import HeroList from "./HeroList";
import TextInsertion from "./TextInsertion";
import { makeStyles } from "@fluentui/react-components";
import { Ribbon24Regular, LockOpen24Regular, DesignIdeas24Regular } from "@fluentui/react-icons";
import { insertText } from "../taskpane";
import ChatInterface from "./ChatInterface";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App = (props) => {
  const { title } = props;
  const styles = useStyles();
  


  return (
    <div className={styles.root}>
      {/*
      <Header logo="assets/logo-filled.png" title={title} message="Welcome" />
      <HeroList message="Discover what this add-in can do for you today!" items={listItems} />
      <TextInsertion insertText={insertText} />
      */}
      <Header logo="assets/chaticon-80.png" title={title} message="Hi! I'm Fintelligent." />
      <ChatInterface />
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
