import * as React from "react";
import PropTypes from "prop-types";
import { Image, tokens, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  welcome__header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: "10px",
    paddingTop: "10px",
    backgroundColor: tokens.colorNeutralBackground3,
  },
  roundedBox: {
    display: "flex",
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between", 
    padding: "20px", 
    borderRadius: "25px",
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "80%",
    maxWidth: "400px", 
    gap: "20px", 
  },
  logo: {
    flex: "0 0 auto", 
    height: "45px",
  },
  message: {
    fontSize: tokens.fontSizeHero600,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground1,
    textAlign: "left", 
    flex: "1", 
  },
});

const Header = (props) => {
  const { title, logo, message } = props;
  const styles = useStyles();

  return (
    <section className={styles.welcome__header}>
      <div className={styles.roundedBox}>
        <Image className={styles.logo} src={logo} alt={title} />
        <h1 className={styles.message}>{message}</h1>
      </div>
    </section>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  logo: PropTypes.string,
  message: PropTypes.string,
};

export default Header;
