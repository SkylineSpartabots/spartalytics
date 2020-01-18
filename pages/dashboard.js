import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Router from "next/router";
import { db } from "../firebase";
import { withStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import fetch from "isomorphic-unfetch";
import Copyright from "../components/copyright";
import convert from "convert-seconds";
import moment from "moment";

const styles = theme => ({
  nav: {
    top: 0,
    marginTop: 0,
    height: "60px",
    width: "100vw",
    backgroundColor: "#335A40",
    display: "flex",
    flexWrap: "wrap",
    paddingLeft: 0,
    marginBottom: 0,
    listStyle: "none",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: "20px",
    paddingRight: "20px",
    boxShadow: "0 3px 5px 2px rgba(0,0,0,.43)"
  },
  navBrand: {
    display: "inline-block",
    paddingTop: ".3125rem",
    paddingBottom: ".3125rem",
    marginRight: "1rem",
    fontSize: "1.25rem",
    lineHeight: "inherit",
    whiteSpace: "nowrap",
    color: "white"
  },
  gridContainerOveride: {
    flex: "1 0 auto"
  },
  gridItem: {
    display: "flex",
    flex: "1 0 auto",
    flexGrow: 1,
    flexDirection: "column",
    height: "100%",
    background: "#335A40!important",
    borderRadius: ".25rem",
    paddingRight: "15px",
    paddingLeft: "15px",
    margin: "1px"
  },
  Card: {
    padding: "1.5rem",
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    height: "100%"
  },
  cardHeader: {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-between",
    position: "relative",
    minHeight: "30px",
    color: "white"
  },
  cardContent: {
    fontSize: "2rem",
    paddingTop: "1.5rem!important",
    color: "white",
    overflow: "auto"
  }
});

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      competitions: null
    };
    this.logout = this.logout.bind(this);
    this.secToHr = this.secToHr.bind(this);
  }

  componentDidMount() {
    //console.log(this.props.competitions);
    const href = "/dashboard";
    const as = href;
    this.props.user ? (this.state = { user: this.props.user }) : null;
    const referrer = document.referrer;
    if (referrer.includes("callback")) {
      window.open("/dashboard", "_self");
    } else if (!this.props.user) {
      Router.push("/");
    }
    fetch("https://www.thebluealliance.com/api/v3/team/frc2976/events/2020", {
      headers: {
        "X-TBA-Auth-Key":
          ""
      }
    }).then(response =>
      response.json().then(callBackJson => {
        this.setState({ competitions: callBackJson.reverse() });
      })
    );
    let leaderboard = [];
    db.ref("log")
      .once("value")
      .then(membersSnap => {
        let current = 0;
        Object.values(membersSnap.val()).forEach(member => {
          let hourAmt = 0;
          Object.values(member.meetings).forEach(session => {
            let sessionSuffix = 0;
            while (session.hasOwnProperty(`end${sessionSuffix.toString()}`)) {
              //onsole.log(session[`start${sessionSuffix.toString()}`])
              var start = moment(session[`start${sessionSuffix.toString()}`], "HH:mm:ss");
              var end =  moment(session[`end${sessionSuffix.toString()}`], "HH:mm:ss")
              hourAmt = hourAmt + (end.diff(start, 'seconds'))
              sessionSuffix++;
            }
          });
          leaderboard.push([
            {
              name: Object.keys(membersSnap.val())[current],
              totalHours: hourAmt
            }
          ]);
          current = current + 1;
        });
        if (Object.keys(membersSnap.val())[current] === this.props.name) {
          this.setState({ leaderboardPosition: current });
        }
        this.setState({
          leaderboard: leaderboard
            .sort(function(a, b) {
              return a[0].totalHours - b[0].totalHours;
            })
            .reverse()
            .slice(0, 10)
        });
        current = 0;
        leaderboard
          .sort(function(a, b) {
            return a[0].totalHours - b[0].totalHours;
          })
          .reverse()
          .forEach(name => {
            //console.log(name[0].name)
            if (name[0].name == this.props.name) {
              this.setState({ leaderboardPosition: current + 1 });
            }
            current++;
          });
      });
  }

  secToHr(seconds) {
    const timeObject = convert(seconds);
    let minutes = timeObject.minutes.toString();
    if (minutes.length == 1) {
      minutes = "0" + timeObject.minutes;
    }
    return `${timeObject.hours}:${minutes}`;
  }

  logout() {
    fetch("/api/logout").then(res =>
      res.json().then(response => {
        if (response.success) {
          Router.push("/");
        }
      })
    );
  }
  render() {
    const { classes } = this.props;
    return (
      <div>
        <ul className={classes.nav}>
          <div className={classes.navBrand}>
            <strong>Spartabots</strong>
          </div>
          <div
            style={{
              marginLeft: "auto !important",
              color: "white",
              fontSize: "1rem"
            }}
          >
            <span className="noMobile">Hi, {this.props.name}</span>
            <Button
              style={{ marginLeft: "8px" }}
              variant="outlined"
              color="secondary"
              onClick={this.logout}
            >
              Logout
            </Button>
          </div>
        </ul>
        <br />
        <br />
        {this.props.user && (
          <div style={{ padding: "3%" }}>
            <Grid container className={classes.gridContainerOveride}>
              <Grid item sm={12} md={4} className={classes.gridItem}>
                <div className={classes.Card}>
                  <div className={classes.cardHeader}>Total Hours</div>
                  <div className={classes.cardContent}>
                    <strong>{Math.round(this.props.hours)}</strong>
                  </div>
                </div>
              </Grid>
              <Grid item sm={12} md={4} className={classes.gridItem}>
                <div className={classes.Card}>
                  <div className={classes.cardHeader}>
                    Total Meetings Attended
                  </div>
                  <div className={classes.cardContent}>
                    <strong>{Object.values(this.props.logs).length}</strong>
                  </div>
                </div>
              </Grid>
              <Grid item sm={12} md={4} className={classes.gridItem}>
                <div className={classes.Card}>
                  <div className={classes.cardHeader}>
                    Last Attended Meeting
                  </div>
                  <div className={classes.cardContent}>
                    <strong>
                      {
                        Object.keys(this.props.logs)[
                          Object.values(this.props.logs).length - 1
                        ]
                      }
                    </strong>
                  </div>
                </div>
              </Grid>
            </Grid>
            <Grid container className={classes.gridContainerOveride}>
              <Grid
                item
                sm={12}
                md={6}
                className={classes.gridItem}
                style={{ width: "100%" }}
              >
                <div className={classes.Card}>
                  <div className={classes.cardHeader}>Next Competition</div>
                  <div className={classes.cardContent}>
                    <strong>
                      {this.state.competitions ? (
                        this.state.competitions[0].name
                      ) : (
                        <CircularProgress color="secondary" />
                      )}
                    </strong>
                  </div>
                  <div className={classes.cardHeader}>
                    {this.state.competitions && (
                      <i>
                        {this.state.competitions[0].start_date}{" "}
                        <a
                          href="https://www.thebluealliance.com/team/2976"
                          target="_blank"
                        >
                          View All
                        </a>
                      </i>
                    )}
                  </div>
                </div>
              </Grid>
              <Grid item sm={12} md={6} className={classes.gridItem}>
                <div className={classes.Card}>
                  <div className={classes.cardHeader}>
                    Leaderboard | Position: #{this.state.leaderboardPosition}
                  </div>
                  <div
                    className={classes.cardContent}
                    style={{ overflow: "auto", height: "99px" }}
                  >
                    {this.state.leaderboard ? (
                      <>
                        {this.state.leaderboard.map((item, index) => {
                          return (
                            <p style={{ fontSize: "11px" }}>
                              {index + 1}) <strong>{item[0].name}</strong> |{" "}
                              {this.secToHr(item[0].totalHours)}
                            </p>
                          );
                        })}
                      </>
                    ) : (
                      <CircularProgress color="secondary" />
                    )}
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        )}
        <br />
        <Copyright />
      </div>
    );
  }
}

Dashboard.getInitialProps = async function(ctx, query) {
  const req = ctx.req;
  const user = req && req.session ? req.session.user : null;
  let name;
  let logs;
  let hours = 0;
  let subtract;
  let competitions;
  let leaderboard = [];
  if (user) {
    // Find Name from userid
    const members = db.ref("members");
    members
      .orderByChild("discordId")
      .equalTo(user.id)
      .on("child_added", snapshot => {
        name = snapshot.key;
        //Get logs
        const userLogs = db.ref(`log/${name}/meetings`);
        userLogs.on(
          "value",
          function(snapshot) {
            logs = snapshot.val();
            Object.values(logs).forEach(session => {
              let sessionSuffix = 0;
              while (session.hasOwnProperty(`end${sessionSuffix.toString()}`)) {
                //console.log(session[`start${sessionSuffix.toString()}`])
                var start = moment(session[`start${sessionSuffix.toString()}`], "HH:mm:ss");
                var end =  moment(session[`end${sessionSuffix.toString()}`], "HH:mm:ss")
                hours = hours + Math.round(end.diff(start, 'seconds') / 3600)
                sessionSuffix++;
              }
            });
          },
          function(errorObject) {
            //Error Code
          }
        );
        const userSubtract = db.ref(`log/${name}/subtract`);
        userSubtract.on("value", function(snapshot) {
          if (snapshot.val()) {
            Object.values(snapshot.val()).forEach(subtractHour => {
              var amt = subtractHour.split(":");
              hours = hours - amt;
            });
          }
        });
      });
  }
  //console.log(req.session)
  if (logs) {
    return {
      user: user.id,
      name: name,
      logs: logs,
      hours: hours,
      query: ctx.query.fromCallback
    };
  }
};

export default withStyles(styles)(Dashboard);
